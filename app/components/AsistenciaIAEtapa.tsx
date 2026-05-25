"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Props = {
  etapa: number;
  contexto?: string;
};

export default function AsistenciaIAEtapa({ etapa, contexto = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [modo, setModo] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function mostrarSugerencia() {
    setLoading(true);
    setError("");
    setResultado(null);
    setModo(null);

    try {
      const res = await fetch(`${API_URL}/ia/sugerir-proximos-pasos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etapa,
          contexto,
          datos_etapa: {},
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setResultado(json.resultado);
      setModo(json.modo);
    } catch {
      setError("No se pudo obtener la sugerencia. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 p-5 shadow-sm ring-1 ring-violet-100/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 shadow-sm ring-1 ring-violet-200/50">
            <Sparkles className="h-4 w-4 text-violet-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Asistencia metodológica
            </p>
            <p className="text-[11px] text-violet-500">UXLab AI</p>
          </div>
        </div>
        <button
          type="button"
          onClick={mostrarSugerencia}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:from-violet-700 hover:to-purple-800 hover:shadow-md active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Mostrar sugerencia"}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Recibe sugerencias metodológicas basadas en la etapa actual del propósito.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {resultado && (
        <div className="mt-4 rounded-xl border border-violet-200/50 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
              Sugerencia
            </span>
            {modo === "demo" && (
              <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Demo
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {resultado}
          </p>
        </div>
      )}
    </div>
  );
}
