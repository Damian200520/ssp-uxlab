"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  FileText,
  Link,
  Loader2,
  RefreshCw,
  Search,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

type RutaEtapa = {
  numero: number;
  clave: string;
  nombre: string;
  completada: boolean;
  estado_ruta: string;
};

type RegistroBasico = {
  id?: string;
  created_at?: string | null;
  [key: string]: unknown;
};

type ResultadosResponse = {
  proyecto: {
    id: string;
    nombre_proyecto?: string;
    etapa_actual?: number;
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

type EstadoResultado = "validado" | "con_registros" | "pendiente";

type AccionPendiente = {
  texto: string;
  accion: "etapa" | "evidencias" | "validar";
};

type ResultadoEtapa = {
  numero: number;
  clave: string;
  nombre: string;
  icono: ReactNode;
  estado: EstadoResultado;
  resultadoEsperado: string;
  sintesis: string;
  registros: number;
  evidencias: number;
  actividades: number;
  accionesPendientes: AccionPendiente[];
};

type Props = {
  apiUrl: string;
  proyectoId: string;
  ruta: RutaEtapa[];
  onAbrirEtapa: (numeroEtapa: number) => void;
  onAbrirEvidencias: () => void;
};

const etapasBase = [
  {
    numero: 1,
    clave: "investigacion",
    nombre: "Investigacion",
    icono: <Search className="h-5 w-5" />,
    resultadoEsperado: "Plan de investigacion y levantamiento inicial documentado.",
  },
  {
    numero: 2,
    clave: "personas",
    nombre: "Personas usuarias",
    icono: <Users className="h-5 w-5" />,
    resultadoEsperado: "Perfiles o arquetipos de personas usuarias caracterizados.",
  },
  {
    numero: 3,
    clave: "habilitacion",
    nombre: "Habilitacion y expectativas",
    icono: <Zap className="h-5 w-5" />,
    resultadoEsperado: "Niveles de habilitacion y expectativas consensuadas.",
  },
  {
    numero: 4,
    clave: "necesidades",
    nombre: "Necesidades",
    icono: <ClipboardList className="h-5 w-5" />,
    resultadoEsperado: "Necesidades de personas usuarias identificadas y priorizadas.",
  },
  {
    numero: 5,
    clave: "vinculacion",
    nombre: "Vinculacion",
    icono: <Link className="h-5 w-5" />,
    resultadoEsperado: "Necesidades alineadas con respuestas, canales y actores del servicio.",
  },
  {
    numero: 6,
    clave: "medicion",
    nombre: "Medicion",
    icono: <BarChart3 className="h-5 w-5" />,
    resultadoEsperado: "Indicadores, linea base, meta y evidencia de medicion definidos.",
  },
  {
    numero: 7,
    clave: "momentos",
    nombre: "Momentos criticos",
    icono: <Target className="h-5 w-5" />,
    resultadoEsperado: "Fricciones, causas raiz y oportunidades de mejora identificadas.",
  },
];

function texto(value: unknown, fallback = "Sin informacion registrada") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function countByEtapa(items: RegistroBasico[] | undefined, etapa: number) {
  return (items || []).filter((item) => Number(item.etapa) === etapa).length;
}

function estadoClass(estado: EstadoResultado) {
  if (estado === "validado") return "border-teal-200 bg-teal-50 text-teal-700";
  if (estado === "con_registros") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function estadoLabel(estado: EstadoResultado) {
  if (estado === "validado") return "Validado";
  if (estado === "con_registros") return "Con registros";
  return "Pendiente";
}

function resumenEtapa(etapa: number, data: ResultadosResponse | null) {
  if (!data) return "Aun no se cargan resultados del proyecto.";

  const etapas = data.etapas;

  if (etapa === 1) {
    const investigacion = etapas.investigacion;
    return investigacion
      ? `Servicio: ${texto(investigacion.nombre_servicio, "servicio registrado")}. Objetivo: ${texto(investigacion.objetivo_investigacion)}.`
      : "No hay investigacion registrada para esta etapa.";
  }

  if (etapa === 2) {
    const total = etapas.personas_usuarias?.length || 0;
    return total > 0
      ? `${total} perfil(es) de personas usuarias registrados para comprender roles, barreras y motivaciones.`
      : "No hay perfiles de personas usuarias registrados.";
  }

  if (etapa === 3) {
    const totalExpectativas = etapas.expectativas?.length || 0;
    return etapas.habilitacion || totalExpectativas > 0
      ? `Habilitacion registrada y ${totalExpectativas} expectativa(s) documentadas para orientar el servicio.`
      : "No hay habilitacion ni expectativas registradas.";
  }

  if (etapa === 4) {
    const necesidades = etapas.necesidades || [];
    const totalAlto = necesidades.filter((item) => String(item.impacto || "").toLowerCase() === "alto").length;
    return necesidades.length > 0
      ? `${necesidades.length} necesidad(es) registradas; ${totalAlto} con impacto alto.`
      : "No hay necesidades registradas.";
  }

  if (etapa === 5) {
    const total = etapas.vinculaciones?.length || 0;
    return total > 0
      ? `${total} vinculacion(es) entre necesidades, actores, canales y respuesta institucional.`
      : "No hay vinculaciones registradas.";
  }

  if (etapa === 6) {
    const total = etapas.indicadores?.length || 0;
    return total > 0
      ? `${total} indicador(es) definidos para observar y medir la experiencia del servicio.`
      : "No hay indicadores de medicion registrados.";
  }

  const total = etapas.momentos_criticos?.length || 0;
  return total > 0
    ? `${total} momento(s) critico(s) identificados con causa raiz y oportunidad de mejora.`
    : "No hay momentos criticos registrados.";
}

function registrosPorEtapa(etapa: number, data: ResultadosResponse | null) {
  if (!data) return 0;
  const etapas = data.etapas;

  if (etapa === 1) return etapas.investigacion ? 1 : 0;
  if (etapa === 2) return etapas.personas_usuarias?.length || 0;
  if (etapa === 3) return (etapas.habilitacion ? 1 : 0) + (etapas.expectativas?.length || 0);
  if (etapa === 4) return etapas.necesidades?.length || 0;
  if (etapa === 5) return etapas.vinculaciones?.length || 0;
  if (etapa === 6) return etapas.indicadores?.length || 0;
  return etapas.momentos_criticos?.length || 0;
}

function pendientesEtapa(resultado: ResultadoEtapa): AccionPendiente[] {
  const pendientes: AccionPendiente[] = [];

  if (resultado.registros === 0) pendientes.push({ texto: "Registrar informacion metodologica de la etapa.", accion: "etapa" });
  if (resultado.evidencias === 0) pendientes.push({ texto: "Agregar al menos una evidencia asociada.", accion: "evidencias" });
  if (resultado.estado !== "validado") pendientes.push({ texto: "Validar el resultado antes del cierre del recorrido.", accion: "validar" });

  return pendientes;
}

export default function ResultadosActividadProp1({
  apiUrl,
  proyectoId,
  ruta,
  onAbrirEtapa,
  onAbrirEvidencias,
}: Props) {
  const [data, setData] = useState<ResultadosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoResultado | "todos">("todos");
  const [selectedEtapa, setSelectedEtapa] = useState(1);

  async function cargarResultados() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/proyectos/${proyectoId}/resultados`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.data as ResultadosResponse);
    } catch (err) {
      console.error("Error al cargar resultados:", err);
      setError("No se pudieron cargar los resultados consolidados del proyecto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarResultados();
  }, []);

  const resultados = useMemo<ResultadoEtapa[]>(() => {
    return etapasBase.map((etapa) => {
      const rutaEtapa = ruta.find((item) => item.numero === etapa.numero);
      const registros = registrosPorEtapa(etapa.numero, data);
      const evidencias = countByEtapa(data?.etapas.evidencias, etapa.numero);
      const actividades = countByEtapa(data?.etapas.calendarizacion, etapa.numero);
      const estado: EstadoResultado = rutaEtapa?.completada
        ? "validado"
        : registros > 0
          ? "con_registros"
          : "pendiente";

      const resultado: ResultadoEtapa = {
        ...etapa,
        estado,
        registros,
        evidencias,
        actividades,
        sintesis: resumenEtapa(etapa.numero, data),
        accionesPendientes: [],
      };

      return {
        ...resultado,
        accionesPendientes: pendientesEtapa(resultado),
      };
    });
  }, [data, ruta]);

  const resultadosFiltrados = useMemo(() => {
    if (filtroEstado === "todos") return resultados;
    return resultados.filter((item) => item.estado === filtroEstado);
  }, [resultados, filtroEstado]);

  const detalle = resultados.find((item) => item.numero === selectedEtapa) || resultados[0];
  const totalRegistros = resultados.reduce((total, item) => total + item.registros, 0);
  const totalEvidencias = resultados.reduce((total, item) => total + item.evidencias, 0);
  const totalValidados = resultados.filter((item) => item.estado === "validado").length;
  const totalPendientes = resultados.filter((item) => item.estado === "pendiente").length;

  return (
    <main className="min-h-0 bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Síntesis Propósito 1
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Resultados por etapa
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Consolida los resultados metodologicos generados en cada etapa del Proposito 1,
                vinculando insumos, actividades calendarizadas y evidencias disponibles.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarResultados}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar resultados
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi label="Etapas validadas" value={`${totalValidados}/7`} tone="teal" />
          <Kpi label="Registros metodologicos" value={String(totalRegistros)} tone="slate" />
          <Kpi label="Evidencias asociadas" value={String(totalEvidencias)} tone="violet" />
          <Kpi label="Etapas pendientes" value={String(totalPendientes)} tone="amber" />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Matriz de resultados metodologicos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Revisa el estado de cada resultado esperado por la guia antes de cerrar el recorrido.
              </p>
            </div>

            <select
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value as EstadoResultado | "todos")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
            >
              <option value="todos">Todos los estados</option>
              <option value="validado">Validados</option>
              <option value="con_registros">Con registros</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>

          {loading && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">
              Cargando resultados consolidados...
            </div>
          )}

          {!loading && resultadosFiltrados.length === 0 && (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
              No hay etapas para el filtro seleccionado.
            </div>
          )}

          {!loading && resultadosFiltrados.length > 0 && (
            <div className="mt-8 flex flex-col gap-6 relative">
              {resultadosFiltrados.map((resultado, index) => (
                <div key={resultado.numero} className="flex gap-4 lg:gap-6 relative">
                  {/* Columna izquierda: Stepper visual */}
                  <div className="relative flex flex-col items-center">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm font-bold z-10 ${
                      detalle?.numero === resultado.numero ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {resultado.numero}
                    </div>
                    {index !== resultadosFiltrados.length - 1 && (
                      <div className="absolute top-10 w-[2px] bg-slate-200 h-[calc(100%+1.5rem)]" />
                    )}
                  </div>
                  
                  {/* Columna derecha: Tarjeta de la etapa */}
                  <article
                    className={`flex-1 rounded-lg border p-4 transition hover:border-teal-200 hover:shadow-sm ${
                      detalle?.numero === resultado.numero ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-white"
                    }`}
                  >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                        {resultado.icono}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Etapa {resultado.numero}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-950">{resultado.nombre}</h3>
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoClass(resultado.estado)}`}>
                      {estadoLabel(resultado.estado)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                    {resultado.resultadoEsperado}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{resultado.sintesis}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <MiniStat label="Registros" value={resultado.registros} />
                    <MiniStat label="Evidencias" value={resultado.evidencias} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEtapa(resultado.numero)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => onAbrirEtapa(resultado.numero)}
                      className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300"
                    >
                      Abrir etapa
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
          )}
        </section>

        {detalle && (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Detalle de resultado
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {detalle.numero}. {detalle.nombre}
                  </h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estadoClass(detalle.estado)}`}>
                  {estadoLabel(detalle.estado)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetalleBloque
                  icon={<CheckCircle className="h-5 w-5" />}
                  titulo="Resultado esperado"
                  texto={detalle.resultadoEsperado}
                />
                <DetalleBloque
                  icon={<FileText className="h-5 w-5" />}
                  titulo="Resultado observado"
                  texto={detalle.sintesis}
                />
                <DetalleBloque
                  icon={<CalendarDays className="h-5 w-5" />}
                  titulo="Actividades calendarizadas"
                  texto={`${detalle.actividades} actividad(es) asociadas a esta etapa.`}
                />
                <DetalleBloque
                  icon={<FileText className="h-5 w-5" />}
                  titulo="Evidencias disponibles"
                  texto={`${detalle.evidencias} evidencia(s) registradas para respaldar el resultado.`}
                />
              </div>
            </article>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-950">Pendientes controlados</h3>
              </div>

              <div className="mt-4 space-y-3">
                {detalle.accionesPendientes.length === 0 ? (
                  <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm font-semibold text-teal-700">
                    Esta etapa cuenta con registros, evidencias y validacion de avance.
                  </div>
                ) : (
                  detalle.accionesPendientes.map((pendiente, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-amber-100 bg-amber-50 p-4"
                    >
                      <p className="text-sm leading-6 text-amber-800 font-medium mb-3">{pendiente.texto}</p>
                      {pendiente.accion === "etapa" && (
                        <button
                          type="button"
                          onClick={() => onAbrirEtapa(detalle.numero)}
                          className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold w-full"
                        >
                          Ir a llenar registros
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {pendiente.accion === "evidencias" && (
                        <button
                          type="button"
                          onClick={onAbrirEvidencias}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition w-full"
                        >
                          Subir evidencia
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {pendiente.accion === "validar" && (
                        <button
                          type="button"
                          onClick={() => onAbrirEtapa(detalle.numero)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-200 transition w-full"
                        >
                          Ir a validar la etapa
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </aside>
          </section>
        )}
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
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-base font-bold text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function DetalleBloque({
  icon,
  titulo,
  texto,
}: {
  icon: ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        <span className="text-teal-700">{icon}</span>
        {titulo}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{texto}</p>
    </div>
  );
}
