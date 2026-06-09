"use client";

import { ExternalLink } from "lucide-react";
import { recursosDisponibles, recursosPorActividad, type RecursoExterno } from "@/app/data/recursosComplementarios";

type Props = {
  actividad: string;
};

function RecursoCard({ recurso }: { recurso: RecursoExterno }) {
  return (
    <a
      href={recurso.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/20"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 shadow-sm transition-colors group-hover:border-teal-200 group-hover:from-teal-100 group-hover:to-emerald-100 group-hover:text-teal-700">
        <ExternalLink className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
          {recurso.nombre}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {recurso.descripcion}
        </p>
        <p className="mt-2 text-xs font-medium text-slate-400">
          {recurso.fuente}
        </p>
      </div>
    </a>
  );
}

export default function RecursosComplementarios({ actividad }: Props) {
  const ids = recursosPorActividad[actividad] ?? [];
  const recursos = recursosDisponibles.filter((r) => ids.includes(r.id));

  if (recursos.length === 0) return null;

  return (
    <div className="space-y-5">
      {recursos.map((r) => (
        <RecursoCard key={r.id} recurso={r} />
      ))}
    </div>
  );
}
