"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, X, Check, Link as LinkIcon } from "lucide-react";
import type { DashboardData, Settings } from "@/lib/types";
import {
  saveBusiness,
  saveZone,
  deleteZone,
  saveSettings,
} from "@/lib/actions";
import { useTask, SaveButton } from "./ui";
import { unwrap, friendlyMessage } from "@/lib/action-result";
import {
  LAYOUT_OPTIONS,
  PALETTES,
  baseLayout,
  storefrontLayout,
  type StorefrontLayout,
} from "@/lib/storefront";
import { Store } from "./store";
import { uploadImage } from "@/lib/upload";
import { money } from "@/lib/utils";
export function BusinessSettings({ data }: { data: DashboardData }) {
  const task = useTask();
  const zoneTask = useTask();
  const router = useRouter();
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");
  const [copied, setCopied] = useState(false);
  const storePath = "/loja/" + data.business.slug;
  async function copyLink() {
    const url = location.origin + storePath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie o endereço:", url);
    }
  }
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
      unwrap(
        await saveZone(null, {
          name,
          fee: Number(newZoneFee || 0),
          active: true,
          sort_order: data.zones.length,
        }),
      );
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
      <div className="link-bar">
        <div>
          <small className="muted">Link da sua loja</small>
          <b>{storePath}</b>
        </div>
        <button type="button" className="btn secondary small" onClick={copyLink}>
          {copied ? <Check size={14} /> : <LinkIcon size={14} />}
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>
      <form
        className="settings-grid"
        onSubmit={handleSubmit((v) =>
          task.run(async () => {
            unwrap(await saveBusiness(v));
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
                <input required {...register("slug")} />
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
                                    unwrap(await deleteZone(z.id));
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
            <hr />
            {task.feedback}
            <SaveButton busy={task.busy} />
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
  const [layoutNote, setLayoutNote] = useState("");
  const previewRef = useRef<HTMLElement>(null);
  const { register, watch, setValue, handleSubmit } = useForm<
    Settings & { variant: StorefrontLayout }
  >({
    defaultValues: {
      ...data.settings,
      variant: storefrontLayout(data.settings),
    },
  });
  const current = watch();
  const variant = current.variant;
  const previewSettings: Settings = {
    ...current,
    layout: baseLayout(variant),
    storefront: { ...(current.storefront || {}), layout: variant },
  };
  const activePalette = PALETTES.find(
    (p) =>
      p.accent.toLowerCase() === (current.accent_color || "").toLowerCase() &&
      p.theme === current.theme,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UMA VITRINE COM A SUA CARA</span>
          <h1>Minha Loja</h1>
          <p>Escolha o layout e as cores. A prévia muda na hora.</p>
        </div>
      </div>
      <div className="designer">
        <form
          id="store-designer"
          className="panel padded designer-controls"
          onSubmit={handleSubmit(({ variant: chosen, ...v }) =>
            task.run(async () => {
              const result = unwrap(
                await saveSettings({
                  ...v,
                  layout: baseLayout(chosen),
                  storefront: { ...(v.storefront || {}), layout: chosen },
                }),
              );
              setLayoutNote(
                result.storefrontSaved ||
                  chosen === "grid2" ||
                  chosen === "list" ||
                  chosen === "showcase"
                  ? ""
                  : "Cores salvas. O layout escolhido ainda depende de uma atualização do banco; até lá a loja usa a grade de 2 colunas.",
              );
              router.refresh();
            }),
          )}
        >
          <input type="hidden" {...register("variant")} />
          <input type="hidden" {...register("theme")} />
          <section className="designer-section">
            <h2>Layout da vitrine</h2>
            <p className="muted">Como os produtos aparecem para o cliente.</p>
            <div
              className="layout-options"
              role="radiogroup"
              aria-label="Layout da vitrine"
            >
              {LAYOUT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={variant === o.value}
                  className={
                    "layout-option" + (variant === o.value ? " active" : "")
                  }
                  onClick={() => setValue("variant", o.value)}
                >
                  <span className={"layout-thumb thumb-" + o.value}>
                    {Array.from({
                      length:
                        o.value === "grid3"
                          ? 6
                          : o.value === "cards"
                            ? 2
                            : o.value === "list"
                              ? 3
                              : o.value === "showcase"
                                ? 3
                                : 4,
                    }).map((_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                  <b>{o.label}</b>
                  <small>{o.hint}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="designer-section">
            <h2>Cores</h2>
            <p className="muted">Comece por uma paleta pronta e ajuste se quiser.</p>
            <div
              className="palette-options"
              role="radiogroup"
              aria-label="Paletas prontas"
            >
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={activePalette?.id === p.id}
                  className={
                    "palette-option" +
                    (activePalette?.id === p.id ? " active" : "")
                  }
                  onClick={() => {
                    setValue("accent_color", p.accent);
                    setValue("theme", p.theme);
                  }}
                >
                  <span className={"palette-swatch bg-" + p.theme}>
                    <i style={{ background: p.accent }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="color-row">
              <label className="color-field">
                Cor de destaque
                <span>
                  <input type="color" {...register("accent_color")} />
                  <code>{(current.accent_color || "").toUpperCase()}</code>
                </span>
              </label>
              <div className="field">
                <span>Fundo</span>
                <div
                  className="segmented bg-choice"
                  role="radiogroup"
                  aria-label="Fundo da loja"
                >
                  {(
                    [
                      ["light", "Claro"],
                      ["soft", "Suave"],
                      ["dark", "Escuro"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={current.theme === value}
                      className={current.theme === value ? "active" : ""}
                      onClick={() => setValue("theme", value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="designer-section">
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
                    setUploadError(friendlyMessage(e, "Falha no upload."));
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
              Fonte
              <select {...register("font")}>
                <option value="inter">Inter (padrão)</option>
                <option value="poppins">Poppins</option>
                <option value="playfair">Playfair Display</option>
                <option value="dm_sans">DM Sans</option>
              </select>
            </label>
          </section>
          <section className="designer-section">
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
          </section>
          <details className="designer-section designer-more">
            <summary>Ajustes finos (cards, fotos e botões)</summary>
            <div className="form-grid">
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
              <label>
                Botões
                <select {...register("button_style")}>
                  <option value="rounded">Arredondados</option>
                  <option value="pill">Pílula</option>
                  <option value="square">Retos</option>
                </select>
              </label>
            </div>
          </details>
          <section className="designer-section">
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
          </section>
          {task.feedback}
          {layoutNote && <p className="notice">{layoutNote}</p>}
          <div className="designer-save">
            <button
              type="button"
              className="btn secondary preview-jump"
              onClick={() =>
                previewRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              Ver prévia
            </button>
            <SaveButton busy={task.busy || uploading} />
          </div>
        </form>
        <section className="designer-preview" ref={previewRef}>
          <div className="preview-toolbar">
            <b>Prévia ao vivo</b>
            <div className="segmented">
              <button
                type="button"
                aria-label="Prévia no computador"
                className={!mobile ? "active" : ""}
                onClick={() => setMobile(false)}
              >
                <Monitor size={16} />
              </button>
              <button
                type="button"
                aria-label="Prévia no celular"
                className={mobile ? "active" : ""}
                onClick={() => setMobile(true)}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>
          {mobile ? (
            <div className="phone-mockup">
              <span className="phone-notch" aria-hidden="true" />
              <div className="phone-screen">
                <Store data={{ ...data, settings: previewSettings }} preview />
              </div>
            </div>
          ) : (
            <div className="preview-frame desktop">
              <Store data={{ ...data, settings: previewSettings }} preview />
            </div>
          )}
          <p className="muted preview-caption">
            Prévia visual. Salve para atualizar sua loja pública.
          </p>
        </section>
      </div>
    </>
  );
}
