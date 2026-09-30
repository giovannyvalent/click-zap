import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222";
test("Migrations, RLS, checkout transaction and business invariants", async (t) => {
  const db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role bypassrls; alter default privileges in schema public grant execute on functions to anon,authenticated,service_role; create schema auth; create schema storage; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$; grant usage on schema public,auth,storage to authenticated,anon,service_role;`,
  );
  const migration = (name: string) =>
    readFileSync(
      new URL("../supabase/migrations/" + name, import.meta.url),
      "utf8",
    ).replace("create extension if not exists pgcrypto;", "");
  await db.exec(migration("001_init.sql"));
  // Supabase default grants: policies and revocations must remain secure under these grants.
  await db.exec(
    "grant all on all tables in schema public to anon,authenticated,service_role; grant all on all sequences in schema public to anon,authenticated,service_role;",
  );
  await db.exec(migration("002_rls.sql"));
  await db.exec(migration("003_security_and_transactions.sql"));
  await db.exec(migration("004_storage_and_events.sql"));
  await db.exec(migration("005_updated_start_plan.sql"));
  await db.exec(`insert into auth.users(id) values('${A}'),('${B}');`);
  const asUser = async (user: string) => {
    await db.exec(
      `reset role;select set_config('request.jwt.claim.sub','${user}',false);set role authenticated;`,
    );
  };
  const root = () => db.exec("reset role;");
  await asUser(A);
  const ra = await db.query<{ id: string }>(
    `select create_business('Loja A','loja-a','5591999999999') as id`,
  );
  const a = ra.rows[0].id;
  await asUser(B);
  const rb = await db.query<{ id: string }>(
    `select create_business('Loja B','loja-b','5591888888888') as id`,
  );
  const b = rb.rows[0].id;
  await t.test(
    "User cannot join another business or grant own plan",
    async () => {
      await assert.rejects(
        db.query(
          `insert into business_members(business_id,user_id,role) values($1,$2,'owner')`,
          [a, B],
        ),
      );
      await assert.rejects(
        db.query(`update businesses set plan_key='pro' where id=$1`, [b]),
      );
      assert.equal(
        (await db.query("select * from businesses where id=$1", [a])).rows
          .length,
        0,
      );
    },
  );
  await asUser(A);
  const c = (
    await db.query<{ id: string }>(
      `insert into categories(business_id,name,slug) values($1,'Presentes','presentes') returning id`,
      [a],
    )
  ).rows[0].id;
  const p = (
    await db.query<{ id: string }>(
      `insert into products(business_id,category_id,name,price) values($1,$2,'Caneca',100) returning id`,
      [a, c],
    )
  ).rows[0].id;
  await t.test("Cross-tenant product/category binding blocked", async () => {
    await asUser(B);
    await assert.rejects(
      db.query(
        `insert into products(business_id,category_id,name,price) values($1,$2,'Outro',1)`,
        [b, c],
      ),
    );
    await asUser(A);
  });
  await t.test("Cannot publish an empty business", async () => {
    await asUser(B);
    await assert.rejects(
      db.query(`update businesses set published=true where id=$1`, [b]),
    );
    await asUser(A);
  });
  await db.query(
    `update businesses set published=true,allow_delivery=true,global_shipping_fee=10 where id=$1`,
    [a],
  );
  const payload = {
    slug: "loja-a",
    request_key: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    items: [{ product_id: p, quantity: 1 }],
    customer_name: "Cliente teste",
    customer_phone: "5591988888888",
    fulfillment: "delivery",
    delivery_address: "Rua Teste, 100",
    notes: "Teste",
  };
  let orderId = "";
  async function place(o: object) {
    await root();
    return (
      await db.query<{ v: any }>("select place_order($1::jsonb) as v", [
        JSON.stringify(o),
      ])
    ).rows[0].v;
  }
  await t.test(
    "Current DB price + global freight override browser totals",
    async () => {
      const out = await place({
        ...payload,
        total: 1,
        shipping_fee: 0,
        items: [{ product_id: p, quantity: 1, price: 0.01 }],
      });
      assert.equal(Number(out.order.total), 110);
      assert.equal(Number(out.items[0].unit_price_snapshot), 100);
      orderId = out.order.id;
      assert.equal(
        (
          await db.query("select * from order_items where order_id=$1", [
            orderId,
          ])
        ).rows.length,
        1,
      );
    },
  );
  await t.test(
    "Idempotent retries create one order; altered retries rejected",
    async () => {
      const same = {
        ...payload,
        total: 1,
        shipping_fee: 0,
        items: [{ product_id: p, quantity: 1, price: 0.01 }],
      };
      const out = await place(same);
      assert.equal(out.order.id, orderId);
      assert.equal((await db.query("select * from orders")).rows.length, 1);
      await assert.rejects(place({ ...payload, customer_name: "Alterado" }));
    },
  );
  await t.test(
    "Private orders cannot be read by anon or tenant B",
    async () => {
      await db.exec("set role anon");
      assert.equal((await db.query("select * from orders")).rows.length, 0);
      await assert.rejects(
        db.query("select place_order($1::jsonb)", [JSON.stringify(payload)]),
      );
      await asUser(B);
      assert.equal((await db.query("select * from orders")).rows.length, 0);
      await asUser(A);
      assert.equal((await db.query("select * from orders")).rows.length, 1);
      await assert.rejects(
        db.query("update orders set total=0 where id=$1", [orderId]),
      );
    },
  );
  await t.test(
    "Completed requires outcome; reopening clears outcome",
    async () => {
      await assert.rejects(
        db.query(`update orders set status='completed' where id=$1`, [orderId]),
      );
      await db.query(
        `update orders set status='completed',outcome='sold' where id=$1`,
        [orderId],
      );
      await db.query(`update orders set status='conversation' where id=$1`, [
        orderId,
      ]);
      const o = (
        await db.query<{ outcome: string | null; completed_at: string | null }>(
          "select outcome,completed_at from orders where id=$1",
          [orderId],
        )
      ).rows[0];
      assert.equal(o.outcome, null);
      assert.equal(o.completed_at, null);
    },
  );
  await t.test(
    "Inactive products fail atomically without orphan orders",
    async () => {
      await db.query("update products set active=false where id=$1", [p]);
      await assert.rejects(
        place({ ...payload, request_key: crypto.randomUUID() }),
      );
      assert.equal((await db.query("select * from orders")).rows.length, 1);
      await db.query("update products set active=true where id=$1", [p]);
    },
  );
  await t.test("Inactive categories hide and reject products", async () => {
    await db.query("update categories set active=false where id=$1", [c]);
    await db.exec("set role anon");
    assert.equal((await db.query("select * from products")).rows.length, 0);
    await root();
    await assert.rejects(
      place({ ...payload, request_key: crypto.randomUUID() }),
    );
    await db.query("update categories set active=true where id=$1", [c]);
  });
  await t.test("Neighborhood freight and pickup", async () => {
    const zone = (
      await db.query<{ id: string }>(
        `insert into shipping_zones(business_id,name,fee) values($1,'Marco',15) returning id`,
        [a],
      )
    ).rows[0].id;
    await db.query(
      `update businesses set shipping_mode='neighborhood' where id=$1`,
      [a],
    );
    const out = await place({
      ...payload,
      request_key: crypto.randomUUID(),
      shipping_zone_id: zone,
    });
    assert.equal(Number(out.order.total), 115);
    const pickup = await place({
      ...payload,
      request_key: crypto.randomUUID(),
      fulfillment: "pickup",
      shipping_zone_id: zone,
    });
    assert.equal(Number(pickup.order.total), 100);
    await assert.rejects(
      place({
        ...payload,
        request_key: crypto.randomUUID(),
        shipping_zone_id: crypto.randomUUID(),
      }),
    );
  });
  await t.test(
    "10-product limit applies in DB and archive frees a slot",
    async () => {
      await asUser(A);
      for (let i = 0; i < 9; i++)
        await db.query(
          `insert into products(business_id,category_id,name,price) values($1,$2,$3,1)`,
          [a, c, "Item " + i],
        );
      await assert.rejects(
        db.query(
          `insert into products(business_id,category_id,name,price) values($1,$2,'Item 11',1)`,
          [a, c],
        ),
      );
      await db.query(
        "update products set archived_at=now(),active=false where id=$1",
        [p],
      );
      await db.query(
        `insert into products(business_id,category_id,name,price) values($1,$2,'Replacement',1)`,
        [a, c],
      );
    },
  );
  await t.test(
    "Existing above-limit stores keep products editable after plan change",
    async () => {
      await root();
      await db.query("update businesses set plan_key='pro' where id=$1", [a]);
      for (let i = 0; i < 2; i++)
        await db.query(
          "insert into products(business_id,category_id,name,price) values($1,$2,'Extra',1)",
          [a, c],
        );
      await db.query("update businesses set plan_key='start' where id=$1", [a]);
      await asUser(A);
      await db.query(
        "update products set name='Produto editado' where business_id=$1 and archived_at is null",
        [a],
      );
      assert.equal(
        (
          await db.query(
            "select id from products where business_id=$1 and archived_at is null",
            [a],
          )
        ).rows.length,
        12,
      );
      await assert.rejects(
        db.query(
          "insert into products(business_id,category_id,name,price) values($1,$2,'Mais um',1)",
          [a, c],
        ),
      );
    },
  );
  await t.test("Rate limit persists across calls", async () => {
    await root();
    for (let i = 0; i < 2; i++)
      assert.equal(
        (await db.query<{ v: boolean }>(`select consume_limit('test',2,600) v`))
          .rows[0].v,
        true,
      );
    assert.equal(
      (await db.query<{ v: boolean }>(`select consume_limit('test',2,600) v`))
        .rows[0].v,
      false,
    );
  });
  await t.test(
    "Photo count, paths and cross-tenant images validated",
    async () => {
      await asUser(B);
      await assert.rejects(
        db.query(`select replace_product_images($1,'[]')`, [p]),
      );
      await asUser(A);
      await assert.rejects(
        db.query(`select replace_product_images($1,$2)`, [
          p,
          JSON.stringify(
            Array(6).fill({ storage_path: a + "/" + p + "/x.webp" }),
          ),
        ]),
      );
      await assert.rejects(
        db.query(`select replace_product_images($1,$2)`, [
          p,
          JSON.stringify([{ storage_path: b + "/" + p + "/x.webp" }]),
        ]),
      );
    },
  );
  await db.close();
});
