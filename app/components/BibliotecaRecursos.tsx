"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { recursosDisponibles } from "../data/recursosComplementarios";

export default function BibliotecaRecursos() {
  return (
    <section className="px-6 py-8 ux-reveal">
      <div className="mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
          <BookOpen className="h-4 w-4" />
          Apoyo metodológico
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
          Recursos complementarios
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Documentos y materiales de consulta para apoyar las actividades del Propósito 1.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {recursosDisponibles.map((recurso) => (
            <a
              key={recurso.id}
              href={recurso.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ux-card-interactive group rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold leading-6 text-slate-900 group-hover:text-teal-700">
                    {recurso.nombre}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{recurso.descripcion}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-400">{recurso.fuente}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-teal-600" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
