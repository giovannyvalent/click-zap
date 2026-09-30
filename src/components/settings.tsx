"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Smartphone,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { DashboardData, Zone, Settings } from "@/lib/types";
import {
  saveBusiness,
  saveZone,
  deleteZone,
  saveSettings,
} from "@/lib/actions";
import { Modal, useTask, SaveButton } from "./ui";
import { Store } from "./store";
import { uploadImage } from "@/lib/upload";
import { money } from "@/lib/utils";
export function BusinessSettings({ data }: { data: DashboardData }) {
  const task = useTask();
  const router = useRouter();
  const [zone, setZone] = useState<Zone | null | undefined>();
  const { register, watch, handleSubmit } = useForm({
    defaultValues: {
      ...data.business,
      global_shipping_fee: Number(data.business.global_shipping_fee),
    },
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DO SEU JEITO DE VENDER</span>
          <h1>Configurações</h1>
          <p>Dados do negócio, publicação e formas de receber.</p>
        </div>
      </div>
      <div className="settings-grid">
        <form
          className="panel padded"
          onSubmit={handleSubmit((v) =>
            task.run(async () => {
              await saveBusiness(v);
              router.refresh();
            }),
          )}
        >
          <h2>Seu negócio</h2>
          <div className="form-grid">
            <label className="span2">
              Nome do negócio
              <input required {...register("name")} />
            </label>
            <label>
              Endereço da loja
              <input required pattern="[a-z0-9-]{3,60}" {...register("slug")} />
            </label>
            <label>
              WhatsApp com DDI e DDD
              <input required {...register("whatsapp")} />
            </label>
          </div>
          <hr />
          <h2>Entrega e retirada</h2>
          <div className="row wrap">
            <label className="check">
              <input type="checkbox" {...register("allow_pickup")} />
              Permitir retirada
            </label>
            <label className="check">
              <input type="checkbox" {...register("allow_delivery")} />
              Permitir entrega
            </label>
          </div>
          {watch("allow_delivery") && (
            <>
              <label>
                Cálculo do frete
                <select {...register("shipping_mode")}>
                  <option value="global">Valor único para entregas</option>
                  <option value="neighborhood">Valor por bairro</option>
                </select>
              </label>
              {watch("shipping_mode") === "global" ? (
                <label>
                  Frete fixo (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("global_shipping_fee", {
                      valueAsNumber: true,
                    })}
                  />
                </label>
              ) : (
                <p className="notice">
                  Cadastre e ative os bairros no painel ao lado. Depois salve
                  estas configurações.
                </p>
              )}
            </>
          )}
          <hr />
          <h2>Publicação</h2>
          <label className="check">
            <input type="checkbox" {...register("published")} />
            Publicar minha loja
          </label>
          <p className="muted">
            Para publicar, tenha pelo menos uma categoria e um produto ativos,
            WhatsApp válido e uma forma de recebimento.
          </p>
          {task.feedback}
          <SaveButton busy={task.busy} />
        </form>
        <div className="stack">
          <section className="panel padded">
            <div className="row between">
              <h2>Frete por bairro</h2>
              <button
                className="btn secondary small"
                onClick={() => setZone(null)}
              >
                <Plus size={14} />
                Bairro
              </button>
            </div>
            <p className="muted">
              Usado quando o modo “Valor por bairro” estiver selecionado.
            </p>
            {data.zones.length ? (
              data.zones.map((z) => (
                <div className="zone-row" key={z.id}>
                  <div>
                    <b>{z.name}</b>
                    <small>
                      {money(z.fee)} · {z.active ? "Ativo" : "Inativo"} · ordem{" "}
                      {z.sort_order}
                    </small>
                  </div>
                  <div className="row">
                    <button
                      aria-label={"Editar " + z.name}
                      className="iconbtn"
                      onClick={() => setZone(z)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="iconbtn"
                      aria-label={"Excluir " + z.name}
                      onClick={() => {
                        if (confirm("Excluir este bairro?"))
                          task.run(async () => {
                            await deleteZone(z.id);
                            router.refresh();
                          });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-small">Nenhum bairro cadastrado.</p>
            )}
          </section>
          <section className="share-card">
            <h2>Próximos passos</h2>
            <p>
              Configure o frete, crie uma categoria, cadastre seu primeiro
              produto e volte para publicar.
            </p>
            <div className="stack">
              <a href="/app/categorias" className="btn secondary">
                2. Criar categorias
              </a>
              <a href="/app/produtos" className="btn secondary">
                3. Cadastrar produtos
              </a>
              <a href="/app/minha-loja" className="btn secondary">
                4. Personalizar Minha Loja
              </a>
              <a
                href={"/loja/" + data.business.slug}
                target="_blank"
                className="btn primary"
              >
                Ver loja <ExternalLink size={14} />
              </a>
            </div>
          </section>
        </div>
      </div>
      {zone !== undefined && (
        <ZoneEditor value={zone} onClose={() => setZone(undefined)} />
      )}
    </>
  );
}
function ZoneEditor({
  value,
  onClose,
}: {
  value: Zone | null;
  onClose: () => void;
}) {
  const task = useTask();
  const router = useRouter();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: value?.name || "",
      fee: Number(value?.fee || 0),
      active: value?.active ?? true,
      sort_order: value?.sort_order || 0,
    },
  });
  return (
    <Modal title={value ? "Editar bairro" : "Novo bairro"} onClose={onClose}>
      <form
        onSubmit={handleSubmit((v) =>
          task.run(async () => {
            await saveZone(value?.id || null, v);
            router.refresh();
            onClose();
          }),
        )}
      >
        <label>
          Bairro
          <input required {...register("name")} />
        </label>
        <label>
          Frete (R$)
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("fee", { valueAsNumber: true })}
          />
        </label>
        <label>
          Ordem
          <input
            type="number"
            min="0"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </label>
        <label className="check">
          <input type="checkbox" {...register("active")} />
          Bairro ativo
        </label>
        {task.feedback}
        <SaveButton busy={task.busy} />
      </form>
    </Modal>
  );
}
export function StoreDesigner({ data }: { data: DashboardData }) {
  const task = useTask();
  const router = useRouter();
  const [mobile, setMobile] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const { register, watch, setValue, handleSubmit } = useForm<Settings>({
    defaultValues: data.settings,
  });
  const current = watch();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UMA VITRINE COM A SUA CARA</span>
          <h1>Minha Loja</h1>
          <p>Personalize e veja o resultado antes de salvar.</p>
        </div>
      </div>
      <div className="designer">
        <form
          className="panel padded designer-controls"
          onSubmit={handleSubmit((v) =>
            task.run(async () => {
              await saveSettings(v);
              router.refresh();
            }),
          )}
        >
          <h2>Identidade</h2>
          <label>
            Logo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                setUploadError("");
                try {
                  const result = await uploadImage(
                    file,
                    "business-assets",
                    data.business.id + "/logo",
                  );
                  setValue("logo_url", result.public_url);
                  setValue("logo_path", result.storage_path);
                } catch (e) {
                  setUploadError(
                    e instanceof Error ? e.message : "Falha no upload.",
                  );
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          {current.logo_url && (
            <div className="row">
              <img className="logo-thumb" src={current.logo_url} alt="Logo" />
              <button
                className="btn secondary tiny"
                type="button"
                onClick={() => {
                  setValue("logo_url", null);
                  setValue("logo_path", null);
                }}
              >
                Remover
              </button>
            </div>
          )}
          {uploadError && <p className="error">{uploadError}</p>}
          <label>
            Cor principal
            <input type="color" {...register("accent_color")} />
          </label>
          <hr />
          <h2>Estilo da vitrine</h2>
          <div className="form-grid">
            <label>
              Estrutura
              <select {...register("layout")}>
                <option value="grid">Grade</option>
                <option value="list">Lista / Catálogo</option>
                <option value="showcase">Vitrine em destaque</option>
              </select>
            </label>
            <label>
              Tema
              <select {...register("theme")}>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="soft">Soft</option>
              </select>
            </label>
            <label>
              Cards
              <select {...register("card_style")}>
                <option value="soft">Soft</option>
                <option value="bordered">Contornado</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
            <label>
              Fotos
              <select {...register("image_ratio")}>
                <option value="landscape">Paisagem</option>
                <option value="square">Quadrado</option>
                <option value="portrait">Retrato</option>
              </select>
            </label>
            <label className="span2">
              Botões
              <select {...register("button_style")}>
                <option value="rounded">Arredondados</option>
                <option value="pill">Pílula</option>
                <option value="square">Retos</option>
              </select>
            </label>
          </div>
          <hr />
          <h2>Conteúdo</h2>
          <label>
            Chamada principal
            <input maxLength={160} {...register("headline")} />
          </label>
          <label>
            Descrição
            <textarea rows={3} maxLength={600} {...register("description")} />
          </label>
          <label>
            Texto promocional
            <input maxLength={160} {...register("promo_text")} />
          </label>
          <hr />
          <h2>Exibir na loja</h2>
          {(
            [
              ["show_search", "Busca"],
              ["show_categories", "Categorias"],
              ["show_descriptions", "Descrição dos produtos"],
              ["show_promo_bar", "Faixa promocional"],
            ] as const
          ).map(([key, label]) => (
            <label className="check" key={key}>
              <input type="checkbox" {...register(key)} />
              {label}
            </label>
          ))}
          {task.feedback}
          <SaveButton busy={task.busy || uploading} />
        </form>
        <section className="designer-preview">
          <div className="preview-toolbar">
            <b>Preview ao vivo</b>
            <div className="segmented">
              <button
                aria-label="Preview desktop"
                className={!mobile ? "active" : ""}
                onClick={() => setMobile(false)}
              >
                <Monitor size={16} />
              </button>
              <button
                aria-label="Preview mobile"
                className={mobile ? "active" : ""}
                onClick={() => setMobile(true)}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>
          <div className={"preview-frame " + (mobile ? "mobile" : "desktop")}>
            <Store data={{ ...data, settings: current }} preview />
          </div>
          <p className="muted preview-caption">
            Prévia visual. Salve para atualizar sua loja pública.
          </p>
        </section>
      </div>
    </>
  );
}
