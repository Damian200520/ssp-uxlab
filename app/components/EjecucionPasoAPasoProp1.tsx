"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Circle,
  ClipboardCheck,
  Clock,
  FileText,
  Lock,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

type RutaEtapa = {
  numero: number;
  clave: string;
  nombre: string;
  descripcion: string;
  estado_ruta: string;
  completada: boolean;
  es_actual: boolean;
  conteos: Record<string, number>;
  requisito?: string;
  puede_abrirse?: boolean;
};

type ResumenRuta = {
  etapa_actual: number;
  total_etapas: number;
  total_etapas_completadas: number;
  porcentaje_completitud: number;
  siguiente_etapa_sugerida?: RutaEtapa | null;
  puede_avanzar?: boolean;
  bloqueo_avance?: string | null;
  requisito_etapa_actual?: string | null;
  hito_actual?: string;
};

type Props = {
  ruta: RutaEtapa[];
  resumenRuta?: ResumenRuta | null;
  onAbrirEtapa: (numeroEtapa: number) => void;
  onAbrirCalendarizacion: () => void;
  onAbrirEvidencias: () => void;
  onActualizarRuta: () => void;
};

const estadoConfig: Record<
  string,
  { label: string; className: string; icon: ReactNode }
> = {
  actual: {
    label: "Activa",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <PlayCircle className="h-4 w-4" />,
  },
  completada: {
    label: "Completada",
    className: "border-teal-200 bg-teal-50 text-teal-700",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  disponible: {
    label: "Disponible",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <Circle className="h-4 w-4" />,
  },
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Clock className="h-4 w-4" />,
  },
  incompleta: {
    label: "Incompleta",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  bloqueada: {
    label: "Bloqueada",
    className: "border-slate-200 bg-slate-100 text-slate-500",
    icon: <Lock className="h-4 w-4" />,
  },
};

function getEstado(etapa: RutaEtapa) {
  if (etapa.completada) return estadoConfig.completada;
  return estadoConfig[etapa.estado_ruta] ?? estadoConfig.pendiente;
}

function totalRegistros(etapa: RutaEtapa) {
  return Object.values(etapa.conteos || {}).reduce((total, valor) => total + Number(valor || 0), 0);
}

function nombreAccion(etapa: RutaEtapa) {
  if (etapa.completada) return "Revisar etapa";
  if (etapa.es_actual) return "Ejecutar etapa";
  if (etapa.estado_ruta === "disponible") return "Abrir etapa";
  return "Ver detalle";
}

export default function EjecucionPasoAPasoProp1({
  ruta,
  resumenRuta,
  onAbrirEtapa,
  onAbrirCalendarizacion,
  onAbrirEvidencias,
  onActualizarRuta,
}: Props) {
  const etapaActual = ruta.find((etapa) => etapa.es_actual) || ruta[0];
  const siguiente = resumenRuta?.siguiente_etapa_sugerida || ruta.find((etapa) => !etapa.completada);
  const totalEtapas = resumenRuta?.total_etapas || ruta.length || 7;
  const totalCompletadas = resumenRuta?.total_etapas_completadas || ruta.filter((etapa) => etapa.completada).length;
  const progreso = resumenRuta?.porcentaje_completitud ?? Math.round((totalCompletadas / totalEtapas) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md shadow-slate-100/70">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Actividad 80
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Ejecucion paso a paso
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Guia operativa para ejecutar el Proposito 1 sin perder contexto: planificar la actividad,
                abrir la etapa metodologica, registrar respaldo y revisar el avance de la ruta.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ResumenCard label="Etapa activa" value={etapaActual?.nombre || "Investigacion"} />
                <ResumenCard label="Avance" value={`${totalCompletadas}/${totalEtapas} etapas`} />
                <ResumenCard label="Progreso" value={`${Math.round(progreso)}%`} />
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 p-6 lg:border-l lg:border-t-0 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Accion recomendada
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {resumenRuta?.puede_avanzar
                  ? `Continuar con ${siguiente?.nombre || "la siguiente etapa"}`
                  : etapaActual?.nombre || "Completar etapa actual"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {resumenRuta?.puede_avanzar
                  ? "La ruta indica que puedes avanzar. Revisa la siguiente etapa y registra la evidencia correspondiente."
                  : resumenRuta?.bloqueo_avance ||
                    resumenRuta?.requisito_etapa_actual ||
                    etapaActual?.requisito ||
                    "Completa los registros requeridos para habilitar el avance."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => etapaActual && onAbrirEtapa(etapaActual.numero)}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-teal-800 hover:shadow-md"
                >
                  <PlayCircle className="h-4 w-4" />
                  Abrir etapa activa
                </button>
                <button
                  type="button"
                  onClick={onActualizarRuta}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar ruta
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <OperacionCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="1. Planificar"
            description="Define responsable, fecha y estado esperado antes de ejecutar."
            action="Abrir calendarizacion"
            onClick={onAbrirCalendarizacion}
          />
          <OperacionCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="2. Ejecutar"
            description="Trabaja la herramienta metodologica de la etapa activa."
            action="Abrir etapa"
            onClick={() => etapaActual && onAbrirEtapa(etapaActual.numero)}
          />
          <OperacionCard
            icon={<FileText className="h-5 w-5" />}
            title="3. Respaldar"
            description="Registra evidencia, enlace o resultado de la actividad."
            action="Abrir evidencias"
            onClick={onAbrirEvidencias}
          />
          <OperacionCard
            icon={<CheckCircle className="h-5 w-5" />}
            title="4. Revisar"
            description="Actualiza la ruta para confirmar estado y siguiente paso."
            action="Actualizar ruta"
            onClick={onActualizarRuta}
          />
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/60">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Recorrido metodologico
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                Ejecuta cada etapa con estado visible y accion directa
              </h2>
            </div>
            <div className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700">
              {Math.round(progreso)}% completado
            </div>
          </div>

          <div className="grid gap-3">
            {ruta.map((etapa) => {
              const estado = getEstado(etapa);
              const registros = totalRegistros(etapa);

              return (
                <article
                  key={`${etapa.numero}-${etapa.clave}`}
                  className={`grid gap-4 rounded-2xl border p-4 transition-all duration-150 lg:grid-cols-[72px_1fr_auto] lg:items-center ${
                    etapa.es_actual
                      ? "border-blue-200 bg-blue-50/40 shadow-sm"
                      : etapa.completada
                      ? "border-teal-200/80 bg-teal-50/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm">
                    {etapa.numero}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{etapa.nombre}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${estado.className}`}>
                        {estado.icon}
                        {estado.label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {registros} registro(s)
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{etapa.descripcion}</p>
                    {!etapa.completada && etapa.requisito && (
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        Requisito: {etapa.requisito}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onAbrirEtapa(etapa.numero)}
                    disabled={etapa.estado_ruta === "bloqueada" && !etapa.puede_abrirse}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {nombreAccion(etapa)}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function ResumenCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OperacionCard({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70 transition-all duration-150 hover:border-teal-200 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </article>
  );
}
