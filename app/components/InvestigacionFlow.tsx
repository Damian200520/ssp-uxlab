"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, Square } from "lucide-react";
import AsistenciaIAEtapa from "./AsistenciaIAEtapa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID || "31576cfb-4c12-4080-a8c3-1f422b4830de";

type Investigacion = {
  id: string;
  proyecto_id: string;
  nombre_servicio: string;
  contexto_servicio?: string;
  objetivo_investigacion?: string;
  metodologia?: string;
  documentos_consultados?: string[];
  aspectos_servicio?: string[];
  personas_a_comprender?: string[];
  informacion_recolectar?: string[];
  tecnicas_investigacion?: string[];
  preparativos_logistica?: string[];
  preguntas_clave?: string[];
  etapa_servicio?: string;
  estado_plan?: string;
  completado?: boolean;
  created_at?: string;
  updated_at?: string;
};

type InvestigacionForm = {
  nombre_servicio: string;
  contexto_servicio: string;
  objetivo_investigacion: string;
  metodologia: string;
  documentos_consultados: string[];
  aspectos_servicio: string[];
  personas_a_comprender: string[];
  informacion_recolectar: string[];
  tecnicas_investigacion: string[];
  preparativos_logistica: string[];
  preguntas_clave: string[];
  etapa_servicio: string;
  estado_plan: string;
};

function createInitialForm(): InvestigacionForm {
  return {
    nombre_servicio: "",
    contexto_servicio: "",
    objetivo_investigacion: "",
    metodologia:
      "Investigación cualitativa mediante entrevistas semiestructuradas, observación en terreno y revisión documental.",
    documentos_consultados: ["Guía UXLab págs. 110-111"],
    aspectos_servicio: ["Motivaciones", "Barreras", "Experiencias", "Expectativas"],
    personas_a_comprender: [
      "Personas mayores",
      "Usuarios con baja alfabetización digital",
    ],
    informacion_recolectar: [
      "Motivaciones",
      "Barreras",
      "Experiencias",
      "Expectativas",
    ],
    tecnicas_investigacion: [
      "Entrevistas semiestructuradas",
      "Observación en terreno",
    ],
    preparativos_logistica: [
      "Definir preguntas guía",
      "Identificar participantes",
      "Definir logística de lugar, fecha y duración",
      "Gestionar autorizaciones y consentimientos",
      "Preparar materiales",
      "Contactar personas usuarias",
      "Revisar información secundaria",
    ],
    preguntas_clave: [
      "¿Qué les funciona bien del servicio?",
      "¿Qué les resulta difícil o confuso?",
      "¿Qué necesidades no están siendo cubiertas?",
    ],
    etapa_servicio: "Descubrimiento",
    estado_plan: "borrador",
  };
}

function normalizarInvestigacion(item: Investigacion): Investigacion {
  return {
    ...item,
    documentos_consultados: item.documentos_consultados || [],
    aspectos_servicio: item.aspectos_servicio || [],
    personas_a_comprender: item.personas_a_comprender || [],
    informacion_recolectar: item.informacion_recolectar || [],
    tecnicas_investigacion: item.tecnicas_investigacion || [],
    preparativos_logistica: item.preparativos_logistica || [],
    preguntas_clave: item.preguntas_clave || [],
  };
}

function estadoLabel(estado?: string) {
  if (estado === "listo_revision") return "Listo para revisión";
  if (estado === "en_revision") return "En revisión";
  if (estado === "validado") return "Validado";
  return "Borrador";
}

function estadoClass(estado?: string) {
  if (estado === "listo_revision") return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50";
  if (estado === "en_revision") return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50";
  if (estado === "validado") return "bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/50";
  return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50";
}

function escapeHtml(value?: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ArrayEditor({
  title,
  description,
  values,
  placeholder,
  onChange,
}: {
  title: string;
  description?: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const value = draft.trim();
    if (!value) return;

    onChange([...values, value]);
    setDraft("");
  }

  function removeValue(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-3 shadow-sm shadow-slate-100/50 hover:shadow-md hover:shadow-slate-100/50 transition-all duration-200">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-2.5 py-1 text-xs font-medium text-teal-800 shadow-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="opacity-50 hover:opacity-100 hover:text-red-600 transition-all"
                aria-label="Eliminar elemento"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Sin elementos aún.</p>
      )}

      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addValue(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
        />
        <button
          type="button"
          onClick={addValue}
          className="rounded-xl border border-teal-300/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-all duration-150 hover:from-teal-100 hover:to-emerald-100 hover:shadow-sm shadow-sm"
        >
          + Agregar
        </button>
      </div>
    </div>
  );
}

export default function InvestigacionFlow({
  onNavigate
}: {
  onNavigate?: (flujo: string | null) => void;
}) {
  const [tab, setTab] = useState<"formulario" | "registros" | "lienzo">(
    "formulario"
  );

  const [form, setForm] = useState<InvestigacionForm>(createInitialForm());
  const [investigaciones, setInvestigaciones] = useState<Investigacion[]>([]);
  const [selected, setSelected] = useState<Investigacion | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const lienzo = useMemo(() => {
  if (tab === "lienzo" && editingId === null && form.nombre_servicio.trim()) {
    return {
      id: "vista-previa",
      proyecto_id: PROYECTO_ID,
      nombre_servicio: form.nombre_servicio,
      contexto_servicio: form.contexto_servicio,
      objetivo_investigacion: form.objetivo_investigacion,
      metodologia: form.metodologia,
      documentos_consultados: form.documentos_consultados,
      aspectos_servicio: form.aspectos_servicio,
      personas_a_comprender: form.personas_a_comprender,
      informacion_recolectar: form.informacion_recolectar,
      tecnicas_investigacion: form.tecnicas_investigacion,
      preparativos_logistica: form.preparativos_logistica,
      preguntas_clave: form.preguntas_clave,
      etapa_servicio: form.etapa_servicio,
      estado_plan: form.estado_plan,
      completado: false,
    } as Investigacion;
  }

  return selected || investigaciones[0] || null;
}, [tab, editingId, form, selected, investigaciones]);

  async function leerErrorBackend(res: Response) {
    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return JSON.stringify(json);
    } catch {
      return text;
    }
  }

  async function listarInvestigaciones() {
    try {
      const res = await fetch(
        `${API_URL}/proyectos/${PROYECTO_ID}/investigaciones`
      );

      if (!res.ok) {
        const errorText = await leerErrorBackend(res);
        throw new Error(errorText);
      }

      const json = await res.json();
      const data = (json.data || []).map(normalizarInvestigacion);

      setInvestigaciones(data);

      if (data.length === 0) {
        setSelected(null);
        return;
      }

      setSelected((prev) => {
        if (!prev) return data[0];

        const actualizado = data.find((item: Investigacion) => item.id === prev.id);
        return actualizado || data[0];
      });
    } catch (error) {
      console.error("Error al listar investigaciones:", error);
      setMessage("No se pudieron cargar las investigaciones.");
    }
  }

  async function obtenerInvestigacionPorId(id: string) {
    const res = await fetch(`${API_URL}/investigaciones/${id}`);

    if (!res.ok) {
      const errorText = await leerErrorBackend(res);
      throw new Error(errorText);
    }

    const json = await res.json();
    return normalizarInvestigacion(json.data as Investigacion);
  }

  async function seleccionarInvestigacion(id: string, irALienzo = false) {
    try {
      const investigacion = await obtenerInvestigacionPorId(id);
      setSelected(investigacion);
      setMessage(`Plan seleccionado: ${investigacion.nombre_servicio}`);

      if (irALienzo) {
        setTab("lienzo");
      }
    } catch (error) {
      console.error("Error al seleccionar investigación:", error);
      setMessage("No se pudo seleccionar el plan de investigación.");
    }
  }

  async function editarInvestigacion(id: string) {
    try {
      const investigacion = await obtenerInvestigacionPorId(id);
      cargarParaEditar(investigacion);
    } catch (error) {
      console.error("Error al cargar investigación para editar:", error);
      setMessage("No se pudo cargar el plan para editar.");
    }
  }

  useEffect(() => {
    listarInvestigaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof InvestigacionForm>(
    field: K,
    value: InvestigacionForm[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function cargarParaEditar(item: Investigacion) {
    const normalizada = normalizarInvestigacion(item);

    setEditingId(normalizada.id);
    setSelected(normalizada);

    setForm({
      nombre_servicio: normalizada.nombre_servicio || "",
      contexto_servicio: normalizada.contexto_servicio || "",
      objetivo_investigacion: normalizada.objetivo_investigacion || "",
      metodologia: normalizada.metodologia || "",
      documentos_consultados: normalizada.documentos_consultados || [],
      aspectos_servicio: normalizada.aspectos_servicio || [],
      personas_a_comprender: normalizada.personas_a_comprender || [],
      informacion_recolectar: normalizada.informacion_recolectar || [],
      tecnicas_investigacion: normalizada.tecnicas_investigacion || [],
      preparativos_logistica: normalizada.preparativos_logistica || [],
      preguntas_clave: normalizada.preguntas_clave || [],
      etapa_servicio: normalizada.etapa_servicio || "Descubrimiento",
      estado_plan: normalizada.estado_plan || "borrador",
    });

    setTab("formulario");
    setMessage(`Editando plan: ${normalizada.nombre_servicio}`);
  }

  async function guardarInvestigacion() {
    if (!form.nombre_servicio.trim()) {
      setMessage("Debes ingresar el nombre del servicio.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/investigaciones/${editingId}`
        : `${API_URL}/investigaciones`;

      const payload = editingId
        ? form
        : {
            proyecto_id: PROYECTO_ID,
            ...form,
          };

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await leerErrorBackend(res);
        throw new Error(errorText);
      }

      const json = await res.json();
      const investigacionGuardada = normalizarInvestigacion(json.data);

      setSelected(investigacionGuardada);
      setEditingId(null);
      setForm(createInitialForm());

      await listarInvestigaciones();

      setTab("registros");
      setMessage("Plan de investigación guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar investigación:", error);
      setMessage(
        error instanceof Error
          ? `No se pudo guardar el plan de investigación. ${error.message}`
          : "No se pudo guardar el plan de investigación."
      );
    } finally {
      setLoading(false);
    }
  }

  async function eliminarInvestigacion(id: string) {
    const ok = window.confirm(
      "¿Seguro que deseas eliminar este plan de investigación?"
    );

    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/investigaciones/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await leerErrorBackend(res);
        throw new Error(errorText);
      }

      const nuevasInvestigaciones = investigaciones.filter(
        (item) => item.id !== id
      );

      setInvestigaciones(nuevasInvestigaciones);

      if (selected?.id === id) {
        setSelected(nuevasInvestigaciones[0] || null);
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(createInitialForm());
      }

      setMessage("Plan eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar investigación:", error);
      setMessage("No se pudo eliminar el plan.");
    }
  }
  
  async function validarInvestigacion(id: string) {
  try {
    const res = await fetch(`${API_URL}/investigaciones/${id}/validar`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const errorText = await leerErrorBackend(res);
      throw new Error(errorText);
    }

    const json = await res.json();
    const investigacionValidada = normalizarInvestigacion(json.data);

    setSelected(investigacionValidada);

    setInvestigaciones((prev) =>
      prev.map((item) =>
        item.id === investigacionValidada.id ? investigacionValidada : item
      )
    );

    setTab("lienzo");
    setMessage("Plan validado correctamente.");

    window.dispatchEvent(
      new CustomEvent("actualizar-ruta-proposito", {
        detail: { siguienteEtapa: 2 },
      })
    );
  } catch (error) {
    console.error("Error al validar investigación:", error);
    setMessage("No se pudo validar el plan.");
  }
}

  

  function descargarLienzoPDF() {
    if (!lienzo) {
      setMessage("Selecciona un plan antes de descargar el PDF.");
      return;
    }

    const ventana = window.open("", "_blank");

    if (!ventana) {
      setMessage("No se pudo abrir la ventana de impresión.");
      return;
    }

    const lista = (items?: string[]) =>
      items && items.length > 0
        ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
        : "<li>Sin información registrada</li>";

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Plan de investigación</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              padding: 40px;
              line-height: 1.5;
            }

            h1 {
              color: #0f766e;
              margin-bottom: 4px;
            }

            h2 {
              color: #0f766e;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 6px;
              margin-top: 28px;
            }

            .badge {
              display: inline-block;
              background: #ccfbf1;
              color: #0f766e;
              padding: 6px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 20px;
            }

            .section {
              margin-bottom: 18px;
            }

            ul {
              margin-top: 8px;
            }

            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>

        <body>
          <h1>Plan de investigación de experiencia usuaria</h1>
          <div class="badge">${escapeHtml(estadoLabel(lienzo.estado_plan))}</div>

          <div class="section">
            <h2>1. Servicio</h2>
            <p><strong>Nombre del servicio:</strong> ${escapeHtml(
              lienzo.nombre_servicio
            )}</p>
            <p><strong>Contexto:</strong> ${escapeHtml(
              lienzo.contexto_servicio || "Sin información"
            )}</p>
            <p><strong>Etapa del servicio:</strong> ${escapeHtml(
              lienzo.etapa_servicio || "Descubrimiento"
            )}</p>
          </div>

          <div class="section">
            <h2>2. Foco / objetivo de investigación</h2>
            <p>${escapeHtml(
              lienzo.objetivo_investigacion || "Sin información registrada"
            )}</p>
          </div>

          <div class="section">
            <h2>3. Preguntas clave</h2>
            <ul>${lista(lienzo.preguntas_clave)}</ul>
          </div>

          <div class="section">
            <h2>4. Personas usuarias a comprender</h2>
            <ul>${lista(lienzo.personas_a_comprender)}</ul>
          </div>

          <div class="section">
            <h2>5. Aspectos del servicio a investigar</h2>
            <ul>${lista(lienzo.aspectos_servicio)}</ul>
          </div>

          <div class="section">
            <h2>6. Información a recolectar</h2>
            <ul>${lista(lienzo.informacion_recolectar)}</ul>
          </div>

          <div class="section">
            <h2>7. Técnicas de investigación</h2>
            <ul>${lista(lienzo.tecnicas_investigacion)}</ul>
          </div>

          <div class="section">
            <h2>8. Preparativos y logística</h2>
            <ul>${lista(lienzo.preparativos_logistica)}</ul>
          </div>

          <div class="footer">
            Generado desde Plataforma SSP-UXLab · Propósito 1 · Investigación
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 lg:block">
          <div className="text-2xl font-bold bg-gradient-to-br from-teal-700 to-emerald-700 bg-clip-text text-transparent">SSP·UXLab</div>

          <nav className="mt-10 space-y-1 text-sm flex flex-col items-start">
            {(
                [
                    ["← Volver al Catálogo", null, false],
                    ["Investigar", "investigacion", true],
                    ["Definir Personas", "personas", false],
                    ["Habilitación y Expectativas", "habilitacion", false],
                    ["Definir Necesidades", "necesidades", false],
                    ["Idear", "idear", false],
                    ["Prototipar", "prototipar", false],
                    ["Evaluar", "evaluar", false],
                    ["Implementar", "implementar", false],
                ] as [string, string | null, boolean][]
            ).map(([label, route, active]) => (
                <button
                    key={label}
                    onClick={() => onNavigate && onNavigate(route)}
                    className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 ${
                        active ? "bg-gradient-to-r from-teal-50 to-emerald-50 font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                    {label}
                </button>
            ))}
          </nav>
        </aside>

        <section className="w-full">
          <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-teal-100/50">
                  Propósito 1 · Diseñar servicios centrados en las personas
                </div>

                <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Investigación</h1>

                <p className="mt-1 text-slate-500 leading-relaxed">
                  Diseñar y ejecutar investigación de las personas usuarias del
                  servicio para planificar decisiones basadas en evidencia
                  directa.
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="mb-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Objetivo</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Levantar el contexto del servicio, definir el objetivo de investigación y planificar las
                técnicas para comprender la experiencia de las personas usuarias.
              </p>
            </div>

            <AsistenciaIAEtapa etapa={1} contexto="Investigación" />

            <div className="mb-6 flex gap-6 border-b border-slate-200/80">
              {[
                ["formulario", "Formulario"],
                ["registros", "Registros guardados"],
                ["lienzo", "Vista de lienzo"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key as typeof tab)}
                  className={`border-b-2 px-2 pb-3 text-sm font-semibold transition-all duration-150 ${
                    tab === key
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3 text-sm text-teal-800 shadow-sm">
                {message}
              </div>
            )}

            {tab === "formulario" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Herramienta principal</p>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                    <h2 className="text-xl font-bold tracking-tight">
                      Herramienta: Plan de investigación de experiencia usuaria
                    </h2>

                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                      Planifica tu investigación de experiencia usuaria de forma
                      ordenada y realista, definiendo qué necesitas comprender,
                      a quiénes, cómo y con qué recursos. Genera evidencia
                      directa desde las personas usuarias para tomar decisiones
                      informadas y mejorar el servicio.
                    </p>

                    <span className="mt-4 inline-flex rounded-xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm">
                      Guía UXLab · págs. 110–111
                    </span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                      <label className="font-semibold text-slate-700">Nombre del servicio</label>

                      <input
                        value={form.nombre_servicio}
                        onChange={(e) =>
                          updateField("nombre_servicio", e.target.value)
                        }
                        placeholder="Escribe el nombre del servicio"
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                      />

                      <label className="mt-5 block font-semibold text-slate-700">
                        Contexto del servicio
                      </label>

                      <textarea
                        value={form.contexto_servicio}
                        onChange={(e) =>
                          updateField("contexto_servicio", e.target.value)
                        }
                        placeholder="Describe brevemente el contexto del servicio"
                        className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                      <label className="font-semibold text-slate-700">
                        Objetivo de investigación
                      </label>

                      <p className="mt-1 text-sm text-slate-500">
                        Define el foco de la investigación.
                      </p>

                      <textarea
                        value={form.objetivo_investigacion}
                        onChange={(e) =>
                          updateField("objetivo_investigacion", e.target.value)
                        }
                        placeholder="Ej.: Comprender cómo las personas mayores utilizan el servicio para identificar barreras y oportunidades de mejora."
                        className="mt-3 min-h-36 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <ArrayEditor
                      title="Aspectos del servicio a investigar"
                      description="Incluye motivaciones, barreras, experiencias y expectativas que deseas comprender."
                      values={form.aspectos_servicio}
                      placeholder="Agregar aspecto"
                      onChange={(v) => updateField("aspectos_servicio", v)}
                    />

                    <ArrayEditor
                      title="Personas usuarias a comprender"
                      description="Defínelas en función de su relación con el servicio o perfiles específicos."
                      values={form.personas_a_comprender}
                      placeholder="Agregar grupo o perfil"
                      onChange={(v) => updateField("personas_a_comprender", v)}
                    />

                    <ArrayEditor
                      title="Información a recolectar"
                      description="Define qué información es clave para responder las preguntas de investigación."
                      values={form.informacion_recolectar}
                      placeholder="Agregar información"
                      onChange={(v) => updateField("informacion_recolectar", v)}
                    />

                    <ArrayEditor
                      title="Preguntas clave"
                      description="Preguntas que orientarán la investigación."
                      values={form.preguntas_clave}
                      placeholder="Agregar pregunta"
                      onChange={(v) => updateField("preguntas_clave", v)}
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <ArrayEditor
                      title="Técnicas de investigación"
                      description="Selecciona las técnicas que utilizarás para recolectar evidencia."
                      values={form.tecnicas_investigacion}
                      placeholder="Agregar técnica"
                      onChange={(v) => updateField("tecnicas_investigacion", v)}
                    />

                    <ArrayEditor
                      title="Preparativos y logística"
                      description="Revisa y prepara los aspectos clave antes de salir a terreno."
                      values={form.preparativos_logistica}
                      placeholder="Agregar preparativo"
                      onChange={(v) => updateField("preparativos_logistica", v)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">
                      Este plan puede ser revisado y validado más adelante con el
                      equipo antes de su ejecución.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={guardarInvestigacion}
                        disabled={loading}
                        className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
                      >
                        {loading
                          ? "Guardando..."
                          : editingId
                          ? "Guardar cambios"
                          : "Guardar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm(createInitialForm());
                          setEditingId(null);
                        }}
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                      >
                        Limpiar
                      </button>

                      <button
                        type="button"
                        onClick={() => setTab("lienzo")}
                        className="rounded-xl border border-teal-300/60 px-5 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                      >
                        Vista previa del plan
                      </button>
                    </div>
                  </div>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                    <h3 className="font-bold text-slate-800">
                      Lista de verificación de cambios implementados
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                      {[
                        "Hallazgos y descriptores incorporados",
                        "Personas usuarias por relación/perfiles",
                        "Campo múltiple para motivaciones y barreras",
                        "Objetivo reubicado correctamente",
                        "Técnicas y preparativos separados",
                        "Acciones guardar / editar / eliminar",
                      ].map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="font-bold text-teal-700">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
            )}

            {tab === "registros" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Registros guardados</p>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold tracking-tight">
                      Planes de investigación guardados
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(createInitialForm());
                        setTab("formulario");
                      }}
                      className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                    >
                      + Nuevo plan de investigación
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {investigaciones.length === 0 && (
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50">
                          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Aún no hay planes de investigación guardados</p>
                          <p className="mt-1 text-xs text-slate-400">Completa el formulario y guarda tu primer plan para comenzar.</p>
                        </div>
                      </div>
                    )}

                    {investigaciones.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-5 transition-all duration-200 ${
                          selected?.id === item.id
                            ? "border-teal-400/60 bg-gradient-to-r from-teal-50/60 to-emerald-50/60 shadow-md shadow-teal-100/30"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800">{item.nombre_servicio}</h3>

                            <p className="text-sm text-slate-500">
                              {item.contexto_servicio ||
                                "Sin contexto registrado"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {(item.personas_a_comprender || [])
                                .slice(0, 3)
                                .map((persona) => (
                                  <span
                                    key={persona}
                                    className="rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 shadow-sm"
                                  >
                                    {persona}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${estadoClass(
                              item.estado_plan
                            )}`}
                          >
                            {estadoLabel(item.estado_plan)}
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-4 text-sm">
                          <button
                            type="button"
                            onClick={() =>
                              seleccionarInvestigacion(item.id, false)
                            }
                            className="font-semibold text-teal-700 transition-all duration-150 hover:text-teal-800 hover:underline underline-offset-2"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() => editarInvestigacion(item.id)}
                            className="font-semibold text-teal-700 transition-all duration-150 hover:text-teal-800 hover:underline underline-offset-2"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarInvestigacion(item.id)}
                            className="font-semibold text-red-600 transition-all duration-150 hover:text-red-700 hover:underline underline-offset-2"
                          >
                            Eliminar
                          </button>

                          <button
                            type="button"
                            onClick={() => validarInvestigacion(item.id)}
                            className="font-semibold text-teal-700 transition-all duration-150 hover:text-teal-800 hover:underline underline-offset-2"
                          >
                            Validar plan
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              seleccionarInvestigacion(item.id, true)
                            }
                            className="font-semibold text-teal-700 transition-all duration-150 hover:text-teal-800 hover:underline underline-offset-2"
                          >
                            Ver lienzo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                    <h2 className="text-lg font-bold tracking-tight">
                      Detalle del plan seleccionado
                    </h2>

                    {!selected ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Selecciona un plan para ver su detalle.
                      </p>
                    ) : (
                      <div className="mt-5 space-y-5">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {selected.nombre_servicio}
                          </h3>

                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${estadoClass(
                              selected.estado_plan
                            )}`}
                          >
                            {estadoLabel(selected.estado_plan)}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Objetivo de investigación
                          </p>

                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                            {selected.objetivo_investigacion ||
                              "Sin objetivo registrado."}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Personas a comprender
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {(selected.personas_a_comprender || []).map(
                              (item) => (
                                <span
                                  key={item}
                                  className="rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 shadow-sm"
                                >
                                  {item}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Técnicas de investigación
                          </p>

                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                            {(selected.tecnicas_investigacion || []).join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => editarInvestigacion(selected.id)}
                            className="rounded-xl border border-teal-300/60 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                          >
                            Editar registro
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarInvestigacion(selected.id)}
                            className="rounded-xl border border-red-300/60 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-150 hover:border-red-400 hover:bg-red-50 hover:shadow-sm"
                          >
                            Eliminar
                          </button>

                          <button
                            type="button"
                            onClick={() => validarInvestigacion(selected.id)}
                            className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                          >
                            Aceptar y validar plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                    <h3 className="font-bold text-slate-800">
                      Lista de verificación de cambios implementados
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                      {[
                        "Listado de registros cargados",
                        "Acciones ver / editar / eliminar",
                        "Revisión y validación del plan",
                        "Resumen de la información ingresada",
                        "Diseño pensado para vista adaptable",
                      ].map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="font-bold text-teal-700">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
            )}

            {tab === "lienzo" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Vista de lienzo</p>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                    {!lienzo ? (
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50">
                          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">No hay datos para generar el lienzo</p>
                          <p className="mt-1 text-xs text-slate-400">Completa el formulario y guarda los datos para visualizar el resumen.</p>
                        </div>
                      </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight">
                            Lienzo final del plan de investigación
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            Revisa, valida y edita tu plan antes de continuar.
                          </p>
                        </div>

                        <span className="rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 text-sm font-bold text-green-700 border border-green-200/50 shadow-sm">
                          Listo para revisión y validación
                        </span>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            1. Servicio
                          </h3>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Nombre del servicio
                          </p>

                          <p className="text-sm text-slate-600">
                            {lienzo.nombre_servicio}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Descripción breve
                          </p>

                          <p className="text-sm text-slate-600">
                            {lienzo.contexto_servicio ||
                              "Sin contexto registrado."}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Etapa del servicio
                          </p>

                          <span className="mt-2 inline-flex rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 shadow-sm">
                            {lienzo.etapa_servicio || "Descubrimiento"}
                          </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            2. Foco / objetivo
                          </h3>

                          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            {lienzo.objetivo_investigacion ||
                              "Sin objetivo registrado."}
                          </p>

                          <p className="mt-4 text-sm font-semibold text-slate-700">
                            Preguntas clave
                          </p>

                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                            {(lienzo.preguntas_clave || []).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            3. Personas usuarias
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(lienzo.personas_a_comprender || []).map(
                              (item) => (
                                <span
                                  key={item}
                                  className="rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200/50 shadow-sm"
                                >
                                  {item}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            4. Aspectos a investigar
                          </h3>

                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {(lienzo.aspectos_servicio || []).map((item) => (
                              <li key={item}><Check className="h-4 w-4 shrink-0 inline mr-1.5 text-teal-700" aria-hidden="true" />{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            5. Información a recolectar
                          </h3>

                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {(lienzo.informacion_recolectar || []).map(
                              (item) => (
                                <li key={item}><Check className="h-4 w-4 shrink-0 inline mr-1.5 text-teal-700" aria-hidden="true" />{item}</li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="font-bold text-teal-700">
                            6. Técnicas
                          </h3>

                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {(lienzo.tecnicas_investigacion || []).map(
                              (item) => (
                                <li key={item}><Check className="h-4 w-4 shrink-0 inline mr-1.5 text-teal-700" aria-hidden="true" />{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                        <h3 className="font-bold text-teal-700">
                          7. Preparativos y logística
                        </h3>

                        <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                          {(lienzo.preparativos_logistica || []).map((item) => (
                            <li key={item}><Square className="h-4 w-4 shrink-0 inline mr-1.5 text-slate-400" aria-hidden="true" />{item}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                    <h3 className="font-bold text-slate-800">Acciones</h3>

                    <div className="mt-4 space-y-3">
                      {lienzo && (
                        <>
                          <button
                            type="button"
                            onClick={() => editarInvestigacion(lienzo.id)}
                            className="w-full rounded-xl border border-teal-300/60 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                          >
                            Editar plan
                          </button>

                          <button
                            type="button"
                            onClick={descargarLienzoPDF}
                            className="w-full rounded-xl border border-teal-300/60 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                          >
                            Descargar PDF
                          </button>

                          <button
                            type="button"
                            onClick={() => validarInvestigacion(lienzo.id)}
                            className="w-full rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                          >
                            Validar plan
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                    <h3 className="font-bold text-slate-800">
                      Lista de verificación de cambios implementados
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                      {[
                        "Visualización en lienzo del resultado",
                        "Posibilidad de revisar y validar",
                        "Edición posterior del plan",
                        "Resumen visual de datos cargados",
                        "Acciones rápidas disponibles",
                        "Enfoque alineado con la guía UXLab",
                      ].map((item) => (
                        <li key={item} className="flex gap-3">
                          <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-700" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>

              </div>
            </>
            )}

            <div className="mt-8 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shadow-sm">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Evidencias</p>
                  <p className="text-xs text-slate-400">Los respaldos de esta etapa se gestionan desde la pestaña Evidencias.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}