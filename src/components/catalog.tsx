"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Package,
  Star,
} from "lucide-react";
import type {
  DashboardData,
  Category,
  Product,
  Photo,
  PlanKey,
} from "@/lib/types";
import { PLANS } from "@/lib/types";
import {
  saveCategory,
  deleteCategory,
  saveProduct,
  archiveProduct,
  savePhotos,
} from "@/lib/actions";
import { money, slugify } from "@/lib/utils";
import { Modal, Empty, useTask, SaveButton } from "./ui";
import { uploadImage } from "@/lib/upload";
import { MoneyInput, Select, PhotoDropzone } from "./form-controls";
export function Categories({ data }: { data: DashboardData }) {
  const [edit, setEdit] = useState<Category | null | undefined>();
  const [search, setSearch] = useState("");
  const task = useTask();
  const router = useRouter();
  const cats = data.categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UM CATÁLOGO ORGANIZADO</span>
          <h1>Categorias</h1>
          <p>Ajude seus clientes a encontrar o que procuram.</p>
        </div>
        <button className="btn primary" onClick={() => setEdit(null)}>
          <Plus size={16} />
          Nova categoria
        </button>
      </div>
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Buscar categorias"
            placeholder="Buscar categoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {task.feedback}
      <section className="panel">
        {cats.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Produtos</th>
                  <th>Status</th>
                  <th>Ordem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.name}</b>
                      <small>/{c.slug}</small>
                    </td>
                    <td>
                      {
                        data.products.filter((p) => p.category_id === c.id)
                          .length
                      }
                    </td>
                    <td>
                      <button
                        className={"badge " + (c.active ? "green" : "")}
                        disabled={task.busy}
                        onClick={() =>
                          task.run(async () => {
                            await saveCategory(c.id, {
                              ...c,
                              active: !c.active,
                            });
                            router.refresh();
                          })
                        }
                      >
                        {c.active ? "Ativa" : "Inativa"}
                      </button>
                    </td>
                    <td>{c.sort_order}</td>
                    <td>
                      <div className="row">
                        <button
                          className="iconbtn"
                          aria-label={"Editar " + c.name}
                          onClick={() => setEdit(c)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="iconbtn danger"
                          aria-label={"Excluir " + c.name}
                          onClick={() => {
                            if (
                              confirm(
                                "Excluir esta categoria? Produtos vinculados impedirão a exclusão.",
                              )
                            )
                              task.run(async () => {
                                await deleteCategory(c.id);
                                router.refresh();
                              });
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Suas categorias começam aqui"
            description="Crie a primeira categoria para cadastrar seus produtos."
          >
            <button className="btn primary" onClick={() => setEdit(null)}>
              Criar categoria
            </button>
          </Empty>
        )}
      </section>
      {edit !== undefined && (
        <CategoryEditor value={edit} onClose={() => setEdit(undefined)} />
      )}
    </>
  );
}
function CategoryEditor({
  value,
  onClose,
}: {
  value: Category | null;
  onClose: () => void;
}) {
  const task = useTask();
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: value?.name || "",
      slug: value?.slug || "",
      active: value?.active ?? true,
      sort_order: value?.sort_order || 0,
    },
  });
  return (
    <Modal
      title={value ? "Editar categoria" : "Nova categoria"}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit((v) =>
          task.run(async () => {
            await saveCategory(value?.id || null, v);
            router.refresh();
            onClose();
          }),
        )}
      >
        <label>
          Nome
          <input
            required
            {...register("name", {
              onChange: (e) => {
                if (!value) setValue("slug", slugify(e.target.value));
              },
            })}
          />
        </label>
        <label>
          Slug
          <input required {...register("slug")} />
        </label>
        <label>
          Ordem de exibição
          <input
            type="number"
            min="0"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </label>
        <label className="check">
          <input type="checkbox" {...register("active")} />
          Categoria ativa
        </label>
        {task.feedback}
        <SaveButton busy={task.busy} />
      </form>
    </Modal>
  );
}
export function Products({ data }: { data: DashboardData }) {
  const [edit, setEdit] = useState<Product | null | undefined>();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState(false);
  const task = useTask();
  const router = useRouter();
  const products = data.products.filter(
    (p) =>
      (!category || p.category_id === category) &&
      (!status || p.active === (status === "active")) &&
      (!featured || p.featured) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const limit =
    PLANS[data.business.plan_key as PlanKey]?.productLimit ??
    PLANS.start.productLimit;
  const atLimit = data.products.length >= limit;
  function openNewProduct() {
    if (atLimit) {
      router.push("/app/planos");
      return;
    }
    setEdit(null);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEUS PRODUTOS, BEM APRESENTADOS</span>
          <h1>
            Produtos{" "}
            <small>
              {data.products.length}/
              {PLANS[data.business.plan_key as PlanKey]?.productLimit ??
                PLANS.start.productLimit}
            </small>
          </h1>
          <p>Monte uma vitrine que dá vontade de explorar.</p>
        </div>
        <button
          className="btn primary"
          onClick={openNewProduct}
          disabled={!data.categories.length}
        >
          <Plus size={16} />
          {atLimit ? "Fazer upgrade" : "Novo produto"}
        </button>
      </div>
      <div className="toolbar wrap">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Buscar produtos"
            placeholder="Buscar produto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <label className="check">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Destaques
        </label>
      </div>
      {task.feedback}
      {products.length ? (
        <div className="product-grid">
          {products.map((p) => (
            <article className="product-admin" key={p.id}>
              <div className="product-photo">
                {p.product_images.length ? (
                  <img
                    src={
                      [...p.product_images].sort(
                        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
                      )[0].public_url
                    }
                    alt={p.name}
                    loading="lazy"
                  />
                ) : (
                  <Package size={40} />
                )}
                <span className={"badge " + (p.active ? "green" : "")}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
                {p.featured && <Star size={18} className="product-star" />}
              </div>
              <div className="product-body">
                <small className="muted">
                  {data.categories.find((c) => c.id === p.category_id)?.name}
                </small>
                <h3>{p.name}</h3>
                <div className="row between">
                  <b>{money(p.price)}</b>
                  <div className="row">
                    <button
                      className="iconbtn"
                      aria-label={"Editar " + p.name}
                      onClick={() => setEdit(p)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="iconbtn"
                      aria-label={"Arquivar " + p.name}
                      onClick={() => {
                        if (
                          confirm(
                            "Arquivar produto? O histórico dos pedidos será preservado.",
                          )
                        )
                          task.run(async () => {
                            await archiveProduct(p.id);
                            router.refresh();
                          });
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title={
              data.categories.length
                ? "Sua vitrine está esperando"
                : "Primeiro, crie uma categoria"
            }
            description={
              data.categories.length
                ? "Cadastre seus produtos com fotos, descrição e preço."
                : "As categorias organizam seus produtos na loja."
            }
          >
            {data.categories.length ? (
              <button className="btn primary" onClick={openNewProduct}>
                {atLimit ? "Fazer upgrade" : "Cadastrar produto"}
              </button>
            ) : (
              <a className="btn primary" href="/app/categorias">
                Criar categoria
              </a>
            )}
          </Empty>
        </section>
      )}
      {edit !== undefined && (
        <ProductEditor
          value={edit}
          data={data}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
function ProductEditor({
  value,
  data,
  onClose,
}: {
  value: Product | null;
  data: DashboardData;
  onClose: () => void;
}) {
  const task = useTask();
  const router = useRouter();
  const id = useRef(value?.id || null);
  const [photos, setPhotos] = useState<Photo[]>(
    [...(value?.product_images || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    ),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: value?.name || "",
      category_id: value?.category_id || data.categories[0]?.id || "",
      internal_code: value?.internal_code || "",
      description: value?.description || "",
      price: Number(value?.price || 0),
      tags: value?.tags.join(", ") || "",
      featured: value?.featured || false,
      active: value?.active ?? true,
    },
  });
  const PHOTO_LIMIT = 5;
  function addFiles(added: File[]) {
    if (!added.length) return;
    if (added.length + files.length + photos.length > PHOTO_LIMIT) {
      setFileError(`O limite é de ${PHOTO_LIMIT} fotos por produto.`);
      return;
    }
    if (
      added.some(
        (f) =>
          f.size > 5242880 ||
          !["image/jpeg", "image/png", "image/webp"].includes(f.type),
      )
    ) {
      setFileError("Use JPG, PNG ou WEBP, com até 5 MB por foto.");
      return;
    }
    setFileError("");
    setFiles([...files, ...added]);
  }
  function reorder(i: number, d: number) {
    const copy = [...photos];
    if (i + d < 0 || i + d >= copy.length) return;
    [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
    setPhotos(copy);
  }
  return (
    <Modal
      wide
      title={value ? "Editar produto" : "Novo produto"}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit((v) =>
          task.run(async () => {
            id.current = await saveProduct(id.current, {
              ...v,
              tags: v.tags
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
            let updated = [...photos];
            for (const file of files) {
              const photo = await uploadImage(
                file,
                "product-images",
                `${data.business.id}/${id.current}`,
              );
              updated.push(photo);
              setPhotos([...updated]);
              setFiles((prev) => prev.filter((f) => f !== file));
              await savePhotos(id.current!, updated);
            }
            await savePhotos(id.current!, updated);
            router.refresh();
            onClose();
          }),
        )}
      >
        <div className="photo-editor">
          <label>Fotos do produto</label>
          {photos.length > 0 && (
            <div className="photo-strip">
              {photos.map((p, i) => (
                <div key={p.storage_path}>
                  <img src={p.public_url} alt={"Foto " + (i + 1)} />
                  <small>{i === 0 ? "Capa" : `Foto ${i + 1}`}</small>
                  <div className="row">
                    <button
                      type="button"
                      className="iconbtn"
                      aria-label="Mover foto para esquerda"
                      onClick={() => reorder(i, -1)}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      className="iconbtn"
                      aria-label="Mover foto para direita"
                      onClick={() => reorder(i, 1)}
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      className="iconbtn"
                      aria-label="Remover foto"
                      onClick={() =>
                        setPhotos(photos.filter((_, n) => n !== i))
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PhotoDropzone
            files={files}
            remaining={PHOTO_LIMIT - photos.length - files.length}
            total={photos.length + files.length}
            limit={PHOTO_LIMIT}
            disabled={task.busy}
            error={fileError}
            onAdd={addFiles}
            onRemove={(i) => setFiles(files.filter((_, j) => j !== i))}
          />
        </div>
        <div className="form-grid">
          <label className="span2">
            Nome
            <input required maxLength={150} {...register("name")} />
          </label>
          <div className="field">
            <span>Categoria</span>
            <Controller
              control={control}
              name="category_id"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  label="Categoria"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione uma categoria"
                  options={data.categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                    hint: c.active ? undefined : "inativa",
                  }))}
                />
              )}
            />
          </div>
          <div className="field">
            <label htmlFor="product-price">Preço</label>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <MoneyInput
                  id="product-price"
                  required
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <label>
            Código interno
            <input maxLength={60} {...register("internal_code")} />
          </label>
          <label>
            Tags, separadas por vírgula
            <input {...register("tags")} />
          </label>
          <label className="span2">
            Descrição
            <textarea rows={4} maxLength={4000} {...register("description")} />
          </label>
          <label className="check">
            <input type="checkbox" {...register("active")} />
            Produto ativo
          </label>
          <label className="check">
            <input type="checkbox" {...register("featured")} />
            Produto em destaque
          </label>
        </div>
        {task.feedback}
        <SaveButton busy={task.busy} />
      </form>
    </Modal>
  );
}
