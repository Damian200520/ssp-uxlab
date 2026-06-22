"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch as fetch } from "../../lib/api";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  FileText,
  GitBranch,
  Link,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";

type RutaEtapa = {
  numero: number;
  clave: string;
  nombre: string;
  completada: boolean;
  estado_ruta: string;
  requisito?: string;
};

type RegistroBasico = {
  id?: string;
  etapa?: number;
  estado?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

type ResultadosResponse = {
  proyecto: {
    id: string;
    nombre_proyecto?: string;
    etapa_actual?: number;
    updated_at?: string | null;
  };
  resumen: {
    total_personas_usuarias?: number;
    total_expectativas?: number;
    total_necesidades?: number;
    total_vinculaciones?: number;
    total_indicadores?: number;
    total_actividades_calendarizadas?: number;
    total_evidencias?: number;
    total_momentos_criticos?: number;
    porcentaje_avance?: number;
  };
  etapas: {
    investigacion?: RegistroBasico | null;
    personas_usuarias?: RegistroBasico[];
    habilitacion?: RegistroBasico | null;
    expectativas?: RegistroBasico[];
    necesidades?: RegistroBasico[];
    vinculaciones?: RegistroBasico[];
    indicadores?: RegistroBasico[];
    calendarizacion?: RegistroBasico[];
    evidencias?: RegistroBasico[];
    momentos_criticos?: RegistroBasico[];
  };
};

type HitoTrazabilidad = {
  numero: number;
  nombre: string;
  icono: ReactNode;
  estado: "validado" | "con_registros" | "pendiente";
  registros: number;
  evidencias: number;
  actividades: number;
  ultimoMovimiento: string;
  trazas: string[];
  riesgo: string;
};

type Props = {
  apiUrl: string;
  proyectoId: string;
  ruta: RutaEtapa[];
  onAbrirEtapa: (numeroEtapa: number) => void;
  onAbrirEvidencias: () => void;
};

const etapas = [
  { numero: 1, nombre: "Investigacion", icono: <Search className="h-5 w-5" /> },
  { numero: 2, nombre: "Personas usuarias", icono: <Users className="h-5 w-5" /> },
  { numero: 3, nombre: "Habilitacion y expectativas", icono: <Zap className="h-5 w-5" /> },
  { numero: 4, nombre: "Necesidades", icono: <ClipboardList className="h-5 w-5" /> },
  { numero: 5, nombre: "Vinculacion", icono: <Link className="h-5 w-5" /> },
  { numero: 6, nombre: "Medicion", icono: <ShieldCheck className="h-5 w-5" /> },
  { numero: 7, nombre: "Momentos criticos", icono: <Target className="h-5 w-5" /> },
];

function fechaCorta(fecha?: string | null) {
  if (!fecha) return "Sin movimiento registrado";

  try {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(fecha));
  } catch {
    return fecha;
  }
}

function registrosPorEtapa(data: ResultadosResponse | null, etapa: number) {
  if (!data) return 0;
  const e = data.etapas;
  if (etapa === 1) return e.investigacion ? 1 : 0;
  if (etapa === 2) return e.personas_usuarias?.length || 0;
  if (etapa === 3) return (e.habilitacion ? 1 : 0) + (e.expectativas?.length || 0);
  if (etapa === 4) return e.necesidades?.length || 0;
  if (etapa === 5) return e.vinculaciones?.length || 0;
  if (etapa === 6) return e.indicadores?.length || 0;
  return e.momentos_criticos?.length || 0;
}

function registrosEtapa(data: ResultadosResponse | null, etapa: number): RegistroBasico[] {
  if (!data) return [];
  const e = data.etapas;
  if (etapa === 1) return e.investigacion ? [e.investigacion] : [];
  if (etapa === 2) return e.personas_usuarias || [];
  if (etapa === 3) return [...(e.habilitacion ? [e.habilitacion] : []), ...(e.expectativas || [])];
  if (etapa === 4) return e.necesidades || [];
  if (etapa === 5) return e.vinculaciones || [];
  if (etapa === 6) return e.indicadores || [];
  return e.momentos_criticos || [];
}

function countByEtapa(items: RegistroBasico[] | undefined, etapa: number) {
  return (items || []).filter((item) => Number(item.etapa) === etapa).length;
}

function ultimoMovimiento(data: ResultadosResponse | null, etapa: number) {
  const fechas = [
    ...registrosEtapa(data, etapa).map((item) => item.updated_at || item.created_at),
    ...(data?.etapas.evidencias || [])
      .filter((item) => Number(item.etapa) === etapa)
      .map((item) => item.updated_at || item.created_at),
    ...(data?.etapas.calendarizacion || [])
      .filter((item) => Number(item.etapa) === etapa)
      .map((item) => item.updated_at || item.created_at),
  ].filter(Boolean) as string[];

  if (fechas.length === 0) return "Sin movimiento registrado";
  fechas.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return fechaCorta(fechas[0]);
}

function estadoClass(estado: HitoTrazabilidad["estado"]) {
  if (estado === "validado") return "border-teal-200 bg-teal-50 text-teal-700";
  if (estado === "con_registros") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function estadoLabel(estado: HitoTrazabilidad["estado"]) {
  if (estado === "validado") return "Validado";
  if (estado === "con_registros") return "Con registros";
  return "Pendiente";
}

function generarTrazas(etapa: HitoTrazabilidad) {
  const trazas = [
    `${etapa.registros} registro(s) metodologico(s)`,
    `${etapa.actividades} actividad(es) calendarizada(s)`,
    `${etapa.evidencias} evidencia(s) asociada(s)`,
  ];

  if (etapa.estado === "validado") trazas.push("Validacion de avance registrada");
  return trazas;
}

function riesgoEtapa(etapa: HitoTrazabilidad) {
  if (etapa.estado === "pendiente") return "Sin registros suficientes para auditar esta etapa.";
  if (etapa.evidencias === 0) return "Tiene registros, pero falta respaldo documental.";
  if (etapa.estado !== "validado") return "Tiene actividad registrada, pero falta validacion metodologica.";
  return "Trazabilidad consistente para revision.";
}

export default function TrazabilidadProcesoProp1({
  apiUrl,
  proyectoId,
  ruta,
  onAbrirEtapa,
  onAbrirEvidencias,
}: Props) {
  const [data, setData] = useState<ResultadosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEtapa, setSelectedEtapa] = useState(1);

  async function cargarTrazabilidad() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/proyectos/${proyectoId}/resultados`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.data as ResultadosResponse);
    } catch (err) {
      console.error("Error al cargar trazabilidad:", err);
      setError("No se pudo cargar la trazabilidad del proceso.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTrazabilidad();
  }, []);

  const hitos = useMemo<HitoTrazabilidad[]>(() => {
    return etapas.map((etapa) => {
      const rutaEtapa = ruta.find((item) => item.numero === etapa.numero);
      const registros = registrosPorEtapa(data, etapa.numero);
      const evidencias = countByEtapa(data?.etapas.evidencias, etapa.numero);
      const actividades = countByEtapa(data?.etapas.calendarizacion, etapa.numero);
      const estado: HitoTrazabilidad["estado"] = rutaEtapa?.completada
        ? "validado"
        : registros > 0
          ? "con_registros"
          : "pendiente";

      const hito: HitoTrazabilidad = {
        ...etapa,
        estado,
        registros,
        evidencias,
        actividades,
        ultimoMovimiento: ultimoMovimiento(data, etapa.numero),
        trazas: [],
        riesgo: "",
      };

      return {
        ...hito,
        trazas: generarTrazas(hito),
        riesgo: riesgoEtapa(hito),
      };
    });
  }, [data, ruta]);

  const detalle = hitos.find((item) => item.numero === selectedEtapa) || hitos[0];
  const totalRegistros = hitos.reduce((total, item) => total + item.registros, 0);
  const totalEvidencias = hitos.reduce((total, item) => total + item.evidencias, 0);
  const etapasConRespaldo = hitos.filter((item) => item.evidencias > 0).length;
  const etapasAuditables = hitos.filter((item) => item.registros > 0 && item.evidencias > 0).length;

  return (
    <main className="min-h-0 bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Actividad 85
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Trazabilidad del proceso
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Visualiza como cada etapa del Proposito 1 deja rastro metodologico:
                registros, calendarizacion, evidencias, validaciones y pendientes de auditoria.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarTrazabilidad}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar trazabilidad
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi label="Registros trazables" value={String(totalRegistros)} tone="slate" />
          <Kpi label="Evidencias" value={String(totalEvidencias)} tone="violet" />
          <Kpi label="Etapas con respaldo" value={`${etapasConRespaldo}/7`} tone="teal" />
          <Kpi label="Etapas auditables" value={`${etapasAuditables}/7`} tone="amber" />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Linea de trazabilidad</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Orden metodologico de las siete etapas del Proposito 1.
                </p>
              </div>
              <GitBranch className="h-5 w-5 text-teal-700" />
            </div>

            {loading ? (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">
                Cargando trazabilidad...
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {hitos.map((hito, index) => (
                  <article
                    key={hito.numero}
                    className={`relative rounded-lg border p-4 transition hover:border-teal-200 hover:shadow-sm ${
                      hito.numero === selectedEtapa ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-white"
                    }`}
                  >
                    {index < hitos.length - 1 && (
                      <div className="absolute left-9 top-16 h-8 w-px bg-slate-200" aria-hidden="true" />
                    )}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                          {hito.icono}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Etapa {hito.numero}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-slate-950">{hito.nombre}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Ultimo movimiento: {hito.ultimoMovimiento}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoClass(hito.estado)}`}>
                          {estadoLabel(hito.estado)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedEtapa(hito.numero)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Ver trazas
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      <MiniStat label="Registros" value={hito.registros} />
                      <MiniStat label="Actividades" value={hito.actividades} />
                      <MiniStat label="Evidencias" value={hito.evidencias} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {detalle && (
            <aside className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Detalle auditable
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {detalle.numero}. {detalle.nombre}
                    </h2>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoClass(detalle.estado)}`}>
                    {estadoLabel(detalle.estado)}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {detalle.trazas.map((traza) => (
                    <div key={traza} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <p className="text-sm leading-6 text-slate-700">{traza}</p>
                    </div>
                  ))}
                </div>

                <div className={`mt-5 rounded-lg border p-4 ${
                  detalle.riesgo.includes("consistente")
                    ? "border-teal-100 bg-teal-50 text-teal-800"
                    : "border-amber-100 bg-amber-50 text-amber-800"
                }`}>
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm font-semibold leading-6">{detalle.riesgo}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onAbrirEtapa(detalle.numero)}
                    className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
                  >
                    Abrir etapa
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onAbrirEvidencias}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Ver evidencias
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-slate-600" />
                  <h3 className="text-base font-bold text-slate-950">Lectura para informe</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Esta vista permite explicar que el avance no depende solo de pantallas,
                  sino de registros, evidencias y validaciones asociadas a cada etapa metodologica.
                </p>
              </section>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "teal" | "slate" | "violet" | "amber";
}) {
  const classes = {
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    slate: "border-slate-200 bg-white text-slate-800",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <article className={`rounded-lg border p-4 shadow-sm ${classes[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
      <p className="text-base font-bold text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
