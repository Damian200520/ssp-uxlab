"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch as fetch } from "../../lib/api";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  ClipboardList,
  FileText,
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

type ResumenRuta = {
  etapa_actual: number;
  total_etapas: number;
  total_etapas_completadas: number;
  porcentaje_completitud: number;
  porcentaje_avance_por_etapa_actual: number;
  puede_avanzar?: boolean;
  bloqueo_avance?: string | null;
  requisito_etapa_actual?: string | null;
  hito_actual?: string;
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

type EstadoResultado = "validado" | "con_insumos" | "pendiente";

type ResultadoGuia = {
  numero: number;
  nombre: string;
  pagina: string;
  icono: ReactNode;
  resultadoGuia: string;
  lectura: string;
  registros: number;
  evidencias: number;
  estado: EstadoResultado;
  foco: string;
};

type Props = {
  apiUrl: string;
  proyectoId: string;
  ruta: RutaEtapa[];
  resumenRuta?: ResumenRuta | null;
  onAbrirEtapa: (numeroEtapa: number) => void;
  onAbrirEvidencias: () => void;
  onAbrirTrazabilidad: () => void;
  onAbrirResultados: () => void;
};

const ETAPAS_GUIA = [
  {
    numero: 1,
    nombre: "Investigacion",
    pagina: "Guia UXLab pp. 110-111",
    icono: <Search className="h-5 w-5" />,
    resultadoGuia:
      "Plan de investigacion claro, con preguntas guia, participantes, metodos y logistica para levantar evidencia de la experiencia actual.",
  },
  {
    numero: 2,
    nombre: "Personas usuarias",
    pagina: "Guia UXLab pp. 148-149",
    icono: <Users className="h-5 w-5" />,
    resultadoGuia:
      "Perfiles de personas usuarias que sintetizan roles, atributos, necesidades, barreras, motivaciones e influencia en la experiencia.",
  },
  {
    numero: 3,
    nombre: "Habilitacion y expectativas",
    pagina: "Guia UXLab pp. 102-103",
    icono: <Zap className="h-5 w-5" />,
    resultadoGuia:
      "Mapa de expectativas y niveles de habilitacion para comprender brechas de informacion, acceso, conocimiento y comprension.",
  },
  {
    numero: 4,
    nombre: "Necesidades",
    pagina: "Guia UXLab pp. 134-135",
    icono: <ClipboardList className="h-5 w-5" />,
    resultadoGuia:
      "Mapa del problema completo, valor real del servicio y oportunidades de mejora desde la perspectiva de las personas.",
  },
  {
    numero: 5,
    nombre: "Vinculacion",
    pagina: "Guia UXLab pp. 156-157",
    icono: <Link className="h-5 w-5" />,
    resultadoGuia:
      "Matriz de vinculacion entre necesidades, oferta de servicio, actores, canales y brechas de coordinacion interna o externa.",
  },
  {
    numero: 6,
    nombre: "Medicion",
    pagina: "Guia UXLab pp. 118-119",
    icono: <BarChart3 className="h-5 w-5" />,
    resultadoGuia:
      "Plan de evaluacion de estandares de servicio con indicadores, criterios, evidencia, responsables y decisiones de gestion.",
  },
  {
    numero: 7,
    nombre: "Momentos criticos",
    pagina: "Guia UXLab pp. 128-129",
    icono: <Target className="h-5 w-5" />,
    resultadoGuia:
      "Mapa de interacciones criticas, fricciones, quiebres, personas afectadas, impacto y oportunidades prioritarias de mejora.",
  },
];

function texto(value: unknown, fallback = "Sin informacion registrada") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function countByEtapa(items: RegistroBasico[] | undefined, etapa: number) {
  return (items || []).filter((item) => Number(item.etapa) === etapa).length;
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

function lecturaEtapa(data: ResultadosResponse | null, etapa: number) {
  if (!data) return "Los resultados se cargaran cuando el backend responda.";
  const e = data.etapas;

  if (etapa === 1) {
    return e.investigacion
      ? `Servicio observado: ${texto(e.investigacion.nombre_servicio, "servicio registrado")}. Objetivo: ${texto(e.investigacion.objetivo_investigacion)}.`
      : "Aun falta documentar el plan de investigacion y sus preguntas guia.";
  }

  if (etapa === 2) {
    const total = e.personas_usuarias?.length || 0;
    return total > 0
      ? `${total} perfil(es) permiten describir roles, barreras, motivaciones y relacion con el servicio.`
      : "Aun falta construir perfiles de personas usuarias.";
  }

  if (etapa === 3) {
    const expectativas = e.expectativas?.length || 0;
    return e.habilitacion || expectativas > 0
      ? `${expectativas} expectativa(s) y niveles de habilitacion registrados para detectar brechas de acceso y comprension.`
      : "Aun falta levantar expectativas y niveles de habilitacion.";
  }

  if (etapa === 4) {
    const necesidades = e.necesidades || [];
    const alto = necesidades.filter((item) => String(item.impacto || "").toLowerCase() === "alto").length;
    return necesidades.length > 0
      ? `${necesidades.length} necesidad(es) documentadas; ${alto} con impacto alto para priorizar oportunidades de mejora.`
      : "Aun falta identificar necesidades y motivaciones de las personas.";
  }

  if (etapa === 5) {
    const total = e.vinculaciones?.length || 0;
    return total > 0
      ? `${total} vinculacion(es) relacionan necesidades con servicio, actores, canales y brechas de coordinacion.`
      : "Aun falta vincular necesidades con la oferta de servicio.";
  }

  if (etapa === 6) {
    const total = e.indicadores?.length || 0;
    return total > 0
      ? `${total} indicador(es) ayudan a observar y medir la experiencia real entregada.`
      : "Aun falta definir estandares, indicadores o evidencia de medicion.";
  }

  const total = e.momentos_criticos?.length || 0;
  return total > 0
    ? `${total} momento(s) critico(s) muestran fricciones, causas y oportunidades prioritarias.`
    : "Aun falta registrar interacciones criticas del recorrido.";
}

function estadoLabel(estado: EstadoResultado) {
  if (estado === "validado") return "Validado";
  if (estado === "con_insumos") return "Con insumos";
  return "Pendiente";
}

function estadoClass(estado: EstadoResultado) {
  if (estado === "validado") return "border-teal-200 bg-teal-50 text-teal-700";
  if (estado === "con_insumos") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function fechaCorta(fecha?: string | null) {
  if (!fecha) return "Sin actualizacion registrada";
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

export default function DashboardAvanceProp1({
  apiUrl,
  proyectoId,
  ruta,
  resumenRuta,
  onAbrirEtapa,
  onAbrirEvidencias,
  onAbrirTrazabilidad,
  onAbrirResultados,
}: Props) {
  const [data, setData] = useState<ResultadosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargarDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/proyectos/${proyectoId}/resultados`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.data as ResultadosResponse);
    } catch (err) {
      console.error("Error al cargar sintesis de resultados:", err);
      setError("No se pudo cargar la sintesis de resultados del Proposito 1.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, []);

  const resultados = useMemo<ResultadoGuia[]>(() => {
    return ETAPAS_GUIA.map((etapa) => {
      const rutaEtapa = ruta.find((item) => item.numero === etapa.numero);
      const registros = registrosPorEtapa(data, etapa.numero);
      const evidencias = countByEtapa(data?.etapas.evidencias, etapa.numero);
      const estado: EstadoResultado = rutaEtapa?.completada
        ? "validado"
        : registros > 0
          ? "con_insumos"
          : "pendiente";
      const foco = estado === "validado"
        ? "Mantener respaldo y revisar coherencia con evidencias."
        : registros === 0
          ? "Completar el insumo metodologico principal de la etapa."
          : evidencias === 0
            ? "Agregar evidencia que respalde el resultado generado."
            : "Revisar y validar el resultado con el equipo.";

      return {
        ...etapa,
        registros,
        evidencias,
        estado,
        foco,
        lectura: lecturaEtapa(data, etapa.numero),
      };
    });
  }, [data, ruta]);

  const totalRegistros = resultados.reduce((total, etapa) => total + etapa.registros, 0);
  const totalEvidencias = resultados.reduce((total, etapa) => total + etapa.evidencias, 0);
  const resultadosValidados = resultados.filter((etapa) => etapa.estado === "validado").length;
  const resultadosPendientes = resultados.filter((etapa) => etapa.estado === "pendiente").length;
  const diagnosticoCompletado = resultadosValidados === 7;
  const focoPrincipal = resultados.find((etapa) => etapa.estado !== "validado") || resultados[resultados.length - 1];
  const porcentajeCompletitud = resumenRuta?.porcentaje_completitud ?? 0;
  const nombreServicio = texto(data?.etapas.investigacion?.nombre_servicio, data?.proyecto.nombre_proyecto || "Servicio analizado");
  const objetivoInvestigacion = texto(data?.etapas.investigacion?.objetivo_investigacion, "Objetivo de investigacion registrado en la etapa inicial.");
  const totalPersonas = data?.etapas.personas_usuarias?.length || 0;
  const totalNecesidades = data?.etapas.necesidades?.length || 0;
  const totalVinculaciones = data?.etapas.vinculaciones?.length || 0;
  const totalIndicadores = data?.etapas.indicadores?.length || 0;
  const totalMomentos = data?.etapas.momentos_criticos?.length || 0;

  return (
    <main className="min-h-0 bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Proposito 1
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {diagnosticoCompletado
                  ? "Diagnostico de experiencia actual completado"
                  : "Sintesis de resultados metodologicos"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {diagnosticoCompletado
                  ? "Cierre metodologico del Proposito 1 con resultados, evidencias, hallazgos y proximos pasos para revisar con UXLab."
                  : "Consolida los resultados esperados por la guia UXLab para comprender la experiencia actual: plan de investigacion, perfiles, expectativas, necesidades, vinculaciones, mediciones y momentos criticos."}
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar sintesis
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {diagnosticoCompletado && (
          <section className="rounded-lg border border-teal-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                  <CheckCircle className="h-4 w-4" />
                  Cierre del diagnostico
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  Sintesis del diagnostico de experiencia actual
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  El recorrido del Proposito 1 esta validado. La plataforma deja listos los insumos
                  para comprender la experiencia actual del servicio, priorizar hallazgos y sostener
                  una conversacion de mejora con evidencia.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <FinalBlock
                    label="Servicio analizado"
                    value={nombreServicio}
                    icon={<Search className="h-5 w-5" />}
                  />
                  <FinalBlock
                    label="Objetivo de investigacion"
                    value={objetivoInvestigacion}
                    icon={<Target className="h-5 w-5" />}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-bold text-slate-950">Insumos consolidados</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label="Personas" value={totalPersonas} />
                  <MiniStat label="Necesidades" value={totalNecesidades} />
                  <MiniStat label="Vinculaciones" value={totalVinculaciones} />
                  <MiniStat label="Indicadores" value={totalIndicadores} />
                  <MiniStat label="Momentos criticos" value={totalMomentos} />
                  <MiniStat label="Evidencias" value={totalEvidencias} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <ConclusionCard
                title="Hallazgos principales"
                items={[
                  `${totalNecesidades} necesidad(es) documentadas para comprender motivaciones y brechas del servicio.`,
                  `${totalVinculaciones} vinculacion(es) muestran relacion entre necesidades, oferta, actores y canales.`,
                  `${totalMomentos} momento(s) critico(s) priorizan fricciones y oportunidades de mejora.`,
                ]}
              />
              <ConclusionCard
                title="Evidencia disponible"
                items={[
                  `${totalEvidencias} respaldo(s) asociados al recorrido metodologico.`,
                  "Los insumos quedan trazables por etapa para revision del equipo y UXLab.",
                  "La evidencia puede revisarse antes de cerrar o exportar el diagnostico.",
                ]}
              />
              <ConclusionCard
                title="Proximos pasos"
                items={[
                  "Revisar coherencia entre necesidades, indicadores y momentos criticos.",
                  "Priorizar oportunidades de mejora con el equipo institucional.",
                  "Preparar el informe o presentacion del diagnostico para UXLab.",
                ]}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAbrirEvidencias}
                className="ux-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
              >
                Ver evidencias
                <FileText className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onAbrirTrazabilidad}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ver trazabilidad
                <ShieldCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onAbrirResultados}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Revisar resultados por etapa
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Resultados validados" value={`${resultadosValidados}/7`} helper={`${porcentajeCompletitud}% de completitud`} tone="teal" icon={<CheckCircle className="h-5 w-5" />} />
          <Kpi label="Insumos metodologicos" value={String(totalRegistros)} helper="Registros creados por etapa" tone="slate" icon={<ClipboardList className="h-5 w-5" />} />
          <Kpi label="Evidencias" value={String(totalEvidencias)} helper="Respaldos asociados al recorrido" tone="violet" icon={<FileText className="h-5 w-5" />} />
          <Kpi label="Pendientes" value={String(resultadosPendientes)} helper="Etapas sin insumos principales" tone={resultadosPendientes > 0 ? "amber" : "teal"} icon={<AlertTriangle className="h-5 w-5" />} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Resultados segun guia UXLab</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cada tarjeta resume el resultado esperado por etapa y su estado dentro del recorrido.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                Actualizado: {fechaCorta(data?.proyecto.updated_at)}
              </span>
            </div>

            {loading ? (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">
                Cargando resultados metodologicos...
              </div>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {resultados.map((resultado) => (
                  <article key={resultado.numero} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                          {resultado.icono}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Etapa {resultado.numero} - {resultado.pagina}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-slate-950">{resultado.nombre}</h3>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${estadoClass(resultado.estado)}`}>
                        {estadoLabel(resultado.estado)}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                      {resultado.resultadoGuia}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{resultado.lectura}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MiniStat label="Insumos" value={resultado.registros} />
                      <MiniStat label="Evidencias" value={resultado.evidencias} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onAbrirEtapa(resultado.numero)}
                        className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300"
                      >
                        Abrir etapa
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onAbrirEvidencias}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Evidencias
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-950">Foco metodologico</h2>
              </div>
              <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                  Etapa {focoPrincipal?.numero}
                </p>
                <h3 className="mt-1 text-base font-bold text-slate-950">{focoPrincipal?.nombre}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{focoPrincipal?.foco}</p>
              </div>
              <button
                type="button"
                onClick={() => focoPrincipal && onAbrirEtapa(focoPrincipal.numero)}
                className="ux-button-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
              >
                Abrir foco
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-950">Lectura para UXLab</h2>
              </div>
              <div className="mt-4 space-y-3">
                <Observation text="El dashboard resume resultados de diagnostico, no tareas tecnicas internas." />
                <Observation text="La evidencia se revisa como respaldo del resultado generado por cada etapa." />
                <Observation text="La trazabilidad permite verificar como cada insumo sostiene el recorrido metodologico." />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Accesos rapidos</h2>
              <div className="mt-4 grid gap-2">
                <QuickAction label="Resultados detallados" onClick={onAbrirResultados} icon={<BarChart3 className="h-4 w-4" />} />
                <QuickAction label="Trazabilidad" onClick={onAbrirTrazabilidad} icon={<ShieldCheck className="h-4 w-4" />} />
                <QuickAction label="Evidencias" onClick={onAbrirEvidencias} icon={<FileText className="h-4 w-4" />} />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "teal" | "slate" | "violet" | "amber";
  icon: ReactNode;
}) {
  const classes = {
    teal: "border-teal-100 bg-teal-50 text-teal-800",
    slate: "border-slate-200 bg-white text-slate-800",
    violet: "border-violet-100 bg-violet-50 text-violet-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
  };

  return (
    <article className={`rounded-lg border p-4 shadow-sm ${classes[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-75">{label}</p>
        <span>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold leading-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-70">{helper}</p>
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

function FinalBlock({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        <span className="text-teal-700">{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </article>
  );
}

function ConclusionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <p className="text-sm leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Observation({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <CheckCircle className="mt-0.5 h-4 w-4 text-teal-700" />
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function QuickAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
