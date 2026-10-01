"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, X } from "lucide-react";
import type { DashboardData, Settings } from "@/lib/types";
import {
  saveBusiness,
  saveZone,
  deleteZone,
  saveSettings,
} from "@/lib/actions";
import { useTask, SaveButton } from "./ui";
import { Store } from "./store";
import { uploadImage } from "@/lib/upload";
import { money } from "@/lib/utils";
export function BusinessSettings({ data }: { data: DashboardData }) {
  const task = useTask();
  const zoneTask = useTask();
  const router = useRouter();
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      ...data.business,
      global_shipping_fee: Number(data.business.global_shipping_fee),
    },
  });
  const delivery = watch("allow_delivery");
  const shippingMode = watch("shipping_mode");
  async function addZone() {
    const name = newZoneName.trim();
    if (!name) return;
    await zoneTask.run(async () => {
      await saveZone(null, {
        name,
        fee: Number(newZoneFee || 0),
        active: true,
        sort_order: data.zones.length,
      });
      setNewZoneName("");
      setNewZoneFee("");
      router.refresh();
    }, "Bairro adicionado.");
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OPERAÇÃO</span>
          <h1>Configurações</h1>
          <p>
            Dados do negócio, WhatsApp e regras de entrega. A aparência da
            loja fica em <b>Minha Loja</b>.
          </p>
        </div>
      </div>
      <form
        className="settings-grid"
        onSubmit={handleSubmit((v) =>
          task.run(async () => {
            await saveBusiness(v);
            router.refresh();
          }),
        )}
      >
        <div className="panel padded">
          <h2>Informações do negócio</h2>
          <p className="muted">Identificação e contato principal.</p>
          <div className="stack" style={{ marginTop: 18 }}>
            <label>
              Nome do negócio
              <input required {...register("name")} />
            </label>
            <div className="form-grid">
              <label>
                Endereço do catálogo
                <input
                  required
                  pattern="[a-z0-9-]{3,60}"
                  {...register("slug")}
                />
              </label>
              <label>
                WhatsApp
                <input
                  required
                  placeholder="DDI + DDD + número"
                  {...register("whatsapp")}
                />
              </label>
            </div>
            <hr />
            <label className="switchrow">
              <div>
                <b>Publicar minha loja</b>
                <p className="muted">
                  Deixe o catálogo visível para os clientes.
                </p>
              </div>
              <input
                type="checkbox"
                className="switch-input"
                {...register("published")}
              />
            </label>
            {task.feedback}
            <SaveButton busy={task.busy} />
          </div>
        </div>
        <aside className="panel padded">
          <h2>Opções de pedido</h2>
          <p className="muted">
            Defina como seus clientes podem receber os produtos.
          </p>
          <div className="stack" style={{ marginTop: 18 }}>
            <label className="switchrow">
              <div>
                <b>Permitir entrega</b>
                <p className="muted">Cliente pode pedir entrega pelo WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                className="switch-input"
                {...register("allow_delivery")}
              />
            </label>
            <label className="switchrow">
              <div>
                <b>Permitir retirada</b>
                <p className="muted">
                  Cliente pode escolher retirada no local.
                </p>
              </div>
              <input
                type="checkbox"
                className="switch-input"
                {...register("allow_pickup")}
              />
            </label>
            {delivery && (
              <div className="shipping-box">
                <b>Configuração do frete</b>
                <input type="hidden" {...register("shipping_mode")} />
                <div className="shipping-modes">
                  <button
                    type="button"
                    className={
                      "choice-card" +
                      (shippingMode === "global" ? " active" : "")
                    }
                    onClick={() => setValue("shipping_mode", "global")}
                  >
                    <b>Frete único</b>
                    <small>Mesmo valor para qualquer entrega.</small>
                  </button>
                  <button
                    type="button"
                    className={
                      "choice-card" +
                      (shippingMode === "neighborhood" ? " active" : "")
                    }
                    onClick={() => setValue("shipping_mode", "neighborhood")}
                  >
                    <b>Por bairro</b>
                    <small>Valor diferente por região.</small>
                  </button>
                </div>
                {shippingMode === "global" ? (
                  <label>
                    Valor geral do frete (R$)
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
                  <>
                    <div className="neighborhood-list">
                      {data.zones.length ? (
                        data.zones.map((z) => (
                          <div className="neighborhood-row" key={z.id}>
                            <span>{z.name}</span>
                            <span className="fee">{money(z.fee)}</span>
                            <button
                              className="iconbtn"
                              type="button"
                              aria-label={"Remover " + z.name}
                              onClick={() => {
                                if (confirm("Excluir este bairro?"))
                                  zoneTask.run(async () => {
                                    await deleteZone(z.id);
                                    router.refresh();
                                  }, "Bairro removido.");
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="muted">Nenhum bairro cadastrado.</p>
                      )}
                    </div>
                    <div className="add-neighborhood">
                      <input
                        placeholder="Nome do bairro"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Frete R$"
                        value={newZoneFee}
                        onChange={(e) => setNewZoneFee(e.target.value)}
                      />
                      <button
                        className="btn secondary"
                        type="button"
                        disabled={zoneTask.busy || !newZoneName.trim()}
                        onClick={addZone}
                      >
                        Adicionar
                      </button>
                    </div>
                    {zoneTask.feedback}
                  </>
                )}
              </div>
            )}
            <hr />
            <p className="muted">
              O ClickZap não processa pagamento nesta versão. O fechamento
              acontece diretamente na conversa com o cliente.
            </p>
          </div>
        </aside>
      </form>
    </>
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
