"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  description?: string;
  tone?: "teal" | "amber" | "rose" | "sky";
};

const tones = {
  teal: "border-teal-200 bg-teal-50 text-teal-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
};

function parseItems(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TagInput({
  label,
  value,
  onChange,
  placeholder,
  description,
  tone = "teal",
}: Props) {
  const [draft, setDraft] = useState("");
  const items = parseItems(value);

  function addItem() {
    const next = draft.trim();
    if (!next || items.some((item) => item.toLowerCase() === next.toLowerCase())) return;
    onChange([...items, next].join("\n"));
    setDraft("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index).join("\n"));
  }

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded p-0.5 opacity-60 transition hover:bg-white/70 hover:opacity-100"
                aria-label={`Eliminar ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
    </div>
  );
}
