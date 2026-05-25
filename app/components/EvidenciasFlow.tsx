"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

const ETAPAS = [
  { id: 1, nombre: "Investigación" },
  { id: 2, nombre: "Personas" },
  { id: 3, nombre: "Habilitación y Expectativas" },
  { id: 4, nombre: "Necesidades" },
  { id: 5, nombre: "Vinculación" },
  { id: 6, nombre: "Medición" },
  { id: 7, nombre: "Momentos Críticos" },
];

const TIPOS_EVIDENCIA = [
  "Documento",
  "Imagen",
  "Video",
  "Enlace",
  "Nota interna",
  "Resultado de actividad",
];

type Evidencia = {
  id: string;
  proyecto_id: string;
  calendarizacion_id?: string | null;
  etapa: number;
  nombre_archivo: string;
  tipo_archivo: string;
  url_storage?: string | null;
  descripcion?: string | null;
  responsable?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormState = {
  etapa: number;
  nombre_archivo: string;
  tipo_archivo: string;
  url_storage: string;
  descripcion: string;
  responsable: string;
};

const initialForm: FormState = {
  etapa: 1,
  nombre_archivo: "",
  tipo_archivo: "Documento",
  url_storage: "",
  descripcion: "",
  responsable: "",
};

function nombreEtapa(etapa: number) {
  return ETAPAS.find((item) => item.id === etapa)?.nombre || `Etapa ${etapa}`;
}

function fechaCorta(fecha?: string | null) {
  if (!fecha) return "Sin fecha";

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

export default function EvidenciasFlow() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState<number | "todas">("todas");

  const [iaLoading, setIaLoading] = useState(false);
  const [iaResultado, setIaResultado] = useState<string | null>(null);
  const [iaModo, setIaModo] = useState<string | null>(null);
  const [iaError, setIaError] = useState("");

  async function generarSintesisIA() {
    setIaLoading(true);
    setIaError("");
    setIaResultado(null);
    setIaModo(null);

    const lista = filtroEtapa === "todas" ? evidencias : evidencias.filter((item) => item.etapa === filtroEtapa);

    try {
      const res = await fetch(`${API_URL}/ia/sintetizar-evidencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyecto_id: PROYECTO_ID,
          etapa: filtroEtapa === "todas" ? null : filtroEtapa,
          evidencias: lista.map((e) => ({
            nombre_archivo: e.nombre_archivo,
            tipo_archivo: e.tipo_archivo,
            descripcion: e.descripcion,
            etapa: e.etapa,
          })),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setIaResultado(json.resultado);
      setIaModo(json.modo);
    } catch (error) {
      console.error("Error al generar síntesis IA:", error);
      setIaError("No se pudo generar la síntesis. Intenta nuevamente.");
    } finally {
      setIaLoading(false);
    }
  }

  const evidenciasFiltradas = useMemo(() => {
    if (filtroEtapa === "todas") return evidencias;
    return evidencias.filter((item) => item.etapa === filtroEtapa);
  }, [evidencias, filtroEtapa]);

  const selected = useMemo(() => {
    return evidencias.find((item) => item.id === selectedId) || evidencias[0] || null;
  }, [evidencias, selectedId]);

  async function cargarEvidencias() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("evidencia")
        .select("*")
        .eq("proyecto_id", PROYECTO_ID)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      setEvidencias((data || []) as Evidencia[]);
    } catch (error) {
      console.error("Error al cargar evidencias:", error);
      setMessage("No se pudieron cargar las evidencias del proyecto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEvidencias();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function validarFormulario() {
    if (!form.nombre_archivo.trim()) {
      setMessage("Debes ingresar un nombre para la evidencia.");
      return false;
    }

    if (!form.tipo_archivo.trim()) {
      setMessage("Debes seleccionar un tipo de evidencia.");
      return false;
    }

    if (!form.descripcion.trim() && !form.url_storage.trim()) {
      setMessage("Agrega una descripción o un enlace para respaldar la evidencia.");
      return false;
    }

    return true;
  }

  async function guardarEvidencia() {
    if (!validarFormulario()) return;

    setLoading(true);
    setMessage("");

    const payload = {
      proyecto_id: PROYECTO_ID,
      calendarizacion_id: null,
      etapa: form.etapa,
      nombre_archivo: form.nombre_archivo.trim(),
      tipo_archivo: form.tipo_archivo,
      url_storage: form.url_storage.trim() || null,
      descripcion: form.descripcion.trim() || null,
      responsable: form.responsable.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("evidencia")
          .update(payload)
          .eq("id", editingId);

        if (error) throw new Error(error.message);
        setMessage("Evidencia actualizada correctamente.");
      } else {
        const { error } = await supabase.from("evidencia").insert(payload);

        if (error) throw new Error(error.message);
        setMessage("Evidencia guardada correctamente.");
      }

      resetForm();
      await cargarEvidencias();
    } catch (error) {
      console.error("Error al guardar evidencia:", error);
      setMessage("No se pudo guardar la evidencia. Revisa permisos RLS o columnas de la tabla.");
    } finally {
      setLoading(false);
    }
  }

  function editarEvidencia(item: Evidencia) {
    setEditingId(item.id);
    setSelectedId(item.id);
    setForm({
      etapa: item.etapa,
      nombre_archivo: item.nombre_archivo || "",
      tipo_archivo: item.tipo_archivo || "Documento",
      url_storage: item.url_storage || "",
      descripcion: item.descripcion || "",
      responsable: item.responsable || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminarEvidencia(id: string) {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta evidencia?");
    if (!confirmar) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("evidencia").delete().eq("id", id);

      if (error) throw new Error(error.message);

      if (selectedId === id) setSelectedId(null);
      setMessage("Evidencia eliminada correctamente.");
      await cargarEvidencias();
    } catch (error) {
      console.error("Error al eliminar evidencia:", error);
      setMessage("No se pudo eliminar la evidencia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-transparent bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text">
                Actividad transversal
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Carga básica de evidencias
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Esta sección permite registrar respaldos asociados a cada etapa del Propósito 1.
                Las evidencias pueden ser documentos, enlaces, videos, capturas, notas internas o
                resultados generados durante la ejecución de las herramientas digitalizadas.
              </p>
            </div>

            <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-4 text-sm text-teal-900 shadow-sm">
              <p className="font-bold">Objetivo</p>
              <p className="mt-1 leading-5">
                Asegurar trazabilidad: qué se hizo, en qué etapa, quién lo registró y qué respaldo
                queda disponible para revisión del equipo o UXLab.
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 text-sm font-semibold text-amber-800 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {editingId ? "Editar evidencia" : "Registrar evidencia"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Completa los datos mínimos para dejar respaldo de una actividad o resultado.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Etapa asociada</label>
                <select
                  value={form.etapa}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, etapa: Number(e.target.value) }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                >
                  {ETAPAS.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.id}. {etapa.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Tipo de evidencia</label>
                <select
                  value={form.tipo_archivo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tipo_archivo: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                >
                  {TIPOS_EVIDENCIA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Nombre de la evidencia</label>
                <input
                  value={form.nombre_archivo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre_archivo: e.target.value }))
                  }
                  placeholder="Ej.: Registro de entrevistas exploratorias"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">URL o enlace</label>
                <input
                  type="url"
                  value={form.url_storage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url_storage: e.target.value }))
                  }
                  placeholder="https://drive.google.com/..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Puede ser un enlace a Drive, Figma, Miro, video, documento o repositorio.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Responsable</label>
                <input
                  value={form.responsable}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, responsable: e.target.value }))
                  }
                  placeholder="Ej.: Damián Muñoz"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  rows={5}
                  placeholder="Describe brevemente qué respalda esta evidencia y cómo se relaciona con la etapa seleccionada."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={guardarEvidencia}
                disabled={loading}
                className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Guardando..." : editingId ? "Actualizar evidencia" : "Guardar evidencia"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
              >
                Limpiar formulario
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Evidencias cargadas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {evidencias.length} evidencia(s) registradas en el proyecto.
                </p>
              </div>

              <select
                value={filtroEtapa}
                onChange={(e) =>
                  setFiltroEtapa(e.target.value === "todas" ? "todas" : Number(e.target.value))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
              >
                <option value="todas">Todas las etapas</option>
                {ETAPAS.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    {etapa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {evidenciasFiltradas.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-6 text-center text-sm text-slate-500">
                  Aún no hay evidencias registradas para este filtro.
                </div>
              )}

              {evidenciasFiltradas.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    selected?.id === item.id
                      ? "border-teal-400/60 bg-gradient-to-r from-teal-50/60 to-emerald-50/60 shadow-md shadow-teal-100/30"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200/60 shadow-sm">
                        {nombreEtapa(item.etapa)}
                      </span>
                      <h3 className="mt-3 text-base font-bold text-slate-900">
                        {item.nombre_archivo}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.tipo_archivo} · {item.responsable || "Sin responsable"} · {fechaCorta(item.created_at)}
                      </p>
                    </div>
                  </div>

                  {item.descripcion && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {item.descripcion}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                    >
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      onClick={() => editarEvidencia(item)}
                      className="rounded-xl border border-blue-200/60 px-3 py-2 text-xs font-semibold text-blue-700 transition-all duration-150 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarEvidencia(item.id)}
                      className="rounded-xl border border-red-200/60 px-3 py-2 text-xs font-semibold text-red-700 transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:shadow-sm"
                    >
                      Eliminar
                    </button>

                    {item.url_storage && (
                      <a
                        href={item.url_storage}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                      >
                        Abrir enlace
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={generarSintesisIA}
                disabled={iaLoading || evidenciasFiltradas.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:from-violet-700 hover:to-purple-800 hover:shadow-md disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {iaLoading ? "Generando..." : "Generar síntesis con IA"}
              </button>

              {iaError && (
                <div className="mt-4 rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-red-800">
                  {iaError}
                </div>
              )}

              {iaResultado && (
                <div className="mt-4 rounded-2xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Síntesis IA</span>
                    {iaModo === "demo" && (
                      <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-teal-900">
                    {iaResultado}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Vista de trazabilidad
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
              Detalle de evidencia seleccionada
            </h2>
          </div>

          {!selected && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-6 text-center text-sm text-slate-500">
              Selecciona una evidencia para visualizar su detalle.
            </div>
          )}

          {selected && (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/30 p-5 border border-slate-100/80 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Etapa</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{nombreEtapa(selected.etapa)}</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/30 p-5 border border-slate-100/80 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tipo</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{selected.tipo_archivo}</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/30 p-5 border border-slate-100/80 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Responsable</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{selected.responsable || "Sin responsable"}</p>
              </div>

              <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{selected.nombre_archivo}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {selected.descripcion || "Sin descripción registrada."}
                </p>

                {selected.url_storage && (
                  <a
                    href={selected.url_storage}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                  >
                    Abrir evidencia
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
