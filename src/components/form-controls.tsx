"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, ImagePlus, UploadCloud, X } from "lucide-react";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function MoneyInput({
  value,
  onChange,
  max = 9999999,
  ...rest
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const cents = Math.round((Number(value) || 0) * 100);
  return (
    <input
      {...rest}
      className="money-input"
      inputMode="numeric"
      autoComplete="off"
      placeholder="R$ 0,00"
      value={brl.format(cents / 100).replace(/ /g, " ")}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
        const next = Math.min(Number(digits || 0) / 100, max);
        onChange(next);
      }}
    />
  );
}

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label: string;
  disabled?: boolean;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const [active, setActive] = useState(Math.max(selectedIndex, 0));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open)
      list.current
        ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function choose(i: number) {
    const option = options[i];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    root.current?.querySelector("button")?.focus();
  }

  function move(step: number) {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + step + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList();
      move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Home" || e.key === "End") {
      if (!open) return;
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) choose(active);
      else openList();
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const q = e.key.toLowerCase();
      const next = options.findIndex(
        (o, i) =>
          i > active && !o.disabled && o.label.toLowerCase().startsWith(q),
      );
      const first = options.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(q),
      );
      const found = next >= 0 ? next : first;
      if (found >= 0) {
        if (!open) setOpen(true);
        setActive(found);
      }
    }
  }

  return (
    <div className={"select" + (open ? " open" : "")} ref={root}>
      <button
        type="button"
        className="select-trigger"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? "" : "placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={18} aria-hidden />
      </button>
      {open && (
        <ul
          id={listId}
          ref={list}
          role="listbox"
          aria-label={label}
          className="select-list"
        >
          {options.length === 0 && (
            <li className="select-empty">Nenhuma opção</li>
          )}
          {options.map((o, i) => (
            <li
              key={o.value}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={
                (i === active ? "active " : "") +
                (o.value === value ? "selected " : "") +
                (o.disabled ? "disabled" : "")
              }
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span>
                {o.label}
                {o.hint && <small>{o.hint}</small>}
              </span>
              {o.value === value && <Check size={16} aria-hidden />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PendingThumb({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="pending-photo">
      <img src={url} alt={file.name} />
      <small title={file.name}>{file.name}</small>
      <button
        type="button"
        className="thumb-remove"
        aria-label={`Remover ${file.name}`}
        onClick={onRemove}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function PhotoDropzone({
  files,
  remaining,
  total,
  limit,
  disabled,
  error,
  onAdd,
  onRemove,
}: {
  files: File[];
  remaining: number;
  total: number;
  limit: number;
  disabled?: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const full = remaining <= 0;

  function drop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    if (disabled || full) return;
    onAdd(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="dropzone-wrap">
      <div
        className={"dropzone" + (over ? " over" : "") + (full ? " full" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !full) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
      >
        <button
          type="button"
          className="dropzone-btn"
          disabled={disabled || full}
          onClick={() => input.current?.click()}
        >
          {full ? <ImagePlus size={26} /> : <UploadCloud size={26} />}
          <b>
            {full
              ? "Limite de fotos atingido"
              : over
                ? "Solte para adicionar"
                : "Arraste as fotos aqui ou clique para escolher"}
          </b>
          <small>
            {total}/{limit} fotos · JPG, PNG ou WEBP · até 5 MB cada
          </small>
        </button>
        <input
          ref={input}
          type="file"
          hidden
          aria-label="Adicionar fotos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled || full}
          onChange={(e) => {
            onAdd(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="pending-grid">
          {files.map((f, i) => (
            <PendingThumb
              key={`${f.name}-${f.size}-${f.lastModified}`}
              file={f}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
