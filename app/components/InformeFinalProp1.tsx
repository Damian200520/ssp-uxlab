"use client";

import { Bot, Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch as fetch } from "../../lib/api";

type Registro = Record<string, unknown>;

type Resultados = {
  proyecto?: { nombre_proyecto?: string };
  resumen?: {
    total_personas_usuarias?: number;
    total_expectativas?: number;
    total_necesidades?: number;
    total_vinculaciones?: number;
    total_indicadores?: number;
    total_evidencias?: number;
    total_momentos_criticos?: number;
    porcentaje_avance?: number;
  };
  etapas?: {
    investigacion?: Registro | null;
    personas_usuarias?: Registro[];
    habilitacion?: Registro | null;
    expectativas?: Registro[];
    necesidades?: Registro[];
    vinculaciones?: Registro[];
    indicadores?: Registro[];
    evidencias?: Registro[];
    momentos_criticos?: Registro[];
  };
};

type Props = {
  apiUrl: string;
  proyectoId: string;
  institucion?: string;
  onAbrirResultados: () => void;
};

function valor(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function crearInforme(data: Resultados, institucion?: string) {
  const resumen = data.resumen || {};
  const etapas = data.etapas || {};
  const investigacion = etapas.investigacion;
  const necesidades = etapas.necesidades || [];
  const momentos = etapas.momentos_criticos || [];
  const necesidadesAltas = necesidades.filter(
    (item) => String(item.impacto || "").toLowerCase() === "alto"
  ).length;
  const momentosAltos = momentos.filter(
    (item) => String(item.impacto || "").toLowerCase() === "alto"
  ).length;

  return [
    "INFORME DE SÍNTESIS - PROPÓSITO 1",
    "",
    `Proyecto: ${data.proyecto?.nombre_proyecto || "Diagnóstico de experiencia usuaria"}`,
    `Institución: ${institucion || "No informada"}`,
    "",
    "1. Objetivo del diagnóstico",
    valor(
      investigacion?.objetivo_investigacion,
      "Comprender la experiencia actual de las personas usuarias para identificar necesidades, brechas y oportunidades de mejora."
    ),
    "",
    "2. Alcance de la investigación",
    `El diagnóstico registra ${resumen.total_personas_usuarias || 0} perfil(es) de personas usuarias y ${resumen.total_expectativas || 0} expectativa(s). El servicio analizado corresponde a ${valor(investigacion?.nombre_servicio, "un servicio institucional aún no especificado")}.`,
    "",
    "3. Necesidades y vinculación institucional",
    `Se identificaron ${resumen.total_necesidades || 0} necesidad(es), de las cuales ${necesidadesAltas} presentan impacto alto. Además, se documentaron ${resumen.total_vinculaciones || 0} vínculo(s) entre las necesidades y la respuesta institucional.`,
    "",
    "4. Medición de la experiencia",
    `El equipo definió ${resumen.total_indicadores || 0} indicador(es) para observar estándares, resultados y cambios en la experiencia del servicio.`,
    "",
    "5. Momentos críticos",
    `Se registraron ${resumen.total_momentos_criticos || 0} momento(s) crítico(s); ${momentosAltos} fueron clasificados con impacto alto. Estos registros permiten reconocer fricciones, causas raíz y oportunidades de mejora en el recorrido.`,
    "",
    "6. Evidencias disponibles",
    `El diagnóstico cuenta con ${resumen.total_evidencias || 0} evidencia(s) asociada(s), utilizadas como respaldo de los hallazgos metodológicos.`,
    "",
    "7. Conclusión",
    "La información consolidada permite comprender la experiencia actual desde la perspectiva de las personas usuarias y orientar la priorización de mejoras. Se recomienda validar esta síntesis con el equipo institucional y con personas usuarias antes de convertir los hallazgos en decisiones de rediseño.",
    "",
    "Nota: síntesis automatizada en modalidad demostrativa. El contenido debe ser revisado por el equipo responsable antes de su uso institucional.",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", "<br>");
}

export default function InformeFinalProp1({
  apiUrl,
  proyectoId,
  institucion,
  onAbrirResultados,
}: Props) {
  const [informe, setInforme] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function analizarEtapas() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/proyectos/${proyectoId}/resultados`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.data) throw new Error("No se encontraron resultados para el proyecto.");
      setInforme(crearInforme(json.data as Resultados, institucion));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la síntesis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const task = window.setTimeout(() => {
      void analizarEtapas();
    }, 0);
    return () => window.clearTimeout(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  function descargarPdf() {
    const ventana = window.open("", "_blank");
    if (!ventana) {
      setError("El navegador bloqueó la ventana de descarga. Habilita las ventanas emergentes e intenta nuevamente.");
      return;
    }
    ventana.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Informe Propósito 1</title>
          <style>
            body { font-family: Arial, sans-serif; color: #172033; margin: 48px; line-height: 1.6; }
            h1 { color: #0f766e; }
            .contenido { white-space: normal; font-size: 14px; }
            .pie { margin-top: 36px; color: #64748b; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>SSP - UXLab</h1>
          <div class="contenido">${escapeHtml(informe)}</div>
          <div class="pie">Documento generado desde la síntesis del Propósito 1.</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    ventana.document.close();
  }

  return (
    <section className="px-6 py-8 ux-reveal">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
              <Bot className="h-4 w-4" />
              Síntesis automatizada · IA demo
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              Comprender la experiencia actual
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Consolida los datos registrados en las siete etapas en un informe editable para revisión institucional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onAbrirResultados} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
              Ver resultados por etapa
            </button>
            <button type="button" onClick={analizarEtapas} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Volver a analizar
            </button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div>}

        <div className="ux-card rounded-lg p-5">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-teal-50 p-2 text-teal-700"><FileText className="h-5 w-5" /></span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Informe de síntesis</h3>
                <p className="text-xs text-slate-500">Puedes corregir o complementar el texto antes de descargarlo.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={descargarPdf}
              disabled={loading || !informe}
              className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
          </div>
          {loading ? (
            <div className="flex min-h-80 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              Analizando las siete etapas...
            </div>
          ) : (
            <textarea
              value={informe}
              onChange={(event) => setInforme(event.target.value)}
              aria-label="Informe final editable"
              className="mt-5 min-h-[620px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          )}
        </div>
      </div>
    </section>
  );
}
