"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import SidebarMetodologico from "./SidebarMetodologico";
import RecursosComplementarios from "./RecursosComplementarios";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle,
  ClipboardList,
  FileText,
  Layers,
  Link,
  Loader2,
  Network,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

const TOAST_DURATION_MS = 4200;
const VINCULACION_META_PREFIX = "::uxlab-vinculacion-meta::";

type TabVinculacion = "formulario" | "registros" | "lienzo" | "recursos";
type ToastType = "success" | "error" | "info";
type DiagnosticoVinculo =
  | "Coincidencia"
  | "Brecha"
  | "Duplicacion"
  | "Desajuste";
type NivelVinculacion = "Bajo" | "Medio" | "Alto";

type Necesidad = {
  id: string;
  descripcion: string;
  categoria?: string | null;
  impacto?: string | null;
  estado?: string | null;
  sugerencia_ia?: string | null;
  created_at?: string | null;
};

type VinculacionBackend = {
  id: string;
  proyecto_id: string;
  necesidad_id: string;
  actividad_servicio: string;
  descripcion_vinculo?: string | null;
  tipo_vinculo: string;
  alerta_ia?: string | null;
  created_at?: string | null;
};

type VinculacionMeta = {
  actorResponsable?: string;
  actorExterno?: string;
  canalVinculacion?: string;
  nivelVinculacion?: NivelVinculacion;
  servicioInstitucional?: string;
  serviciosExternos?: string;
  relacionServicios?: string;
  diagnostico?: DiagnosticoVinculo;
  observaciones?: string;
  estado?: "borrador" | "validado";
  validado_ruta?: boolean;
};

type Vinculacion = VinculacionBackend & {
  meta: VinculacionMeta;
};

type FormState = {
  necesidadId: string;
  actorResponsable: string;
  actorExterno: string;
  canalVinculacion: string;
  nivelVinculacion: NivelVinculacion;
  servicioInstitucional: string;
  serviciosExternos: string;
  relacionServicios: string;
  diagnostico: DiagnosticoVinculo;
  observaciones: string;
  oportunidadIa: string;
};

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

const FORM_INICIAL: FormState = {
  necesidadId: "",
  actorResponsable: "",
  actorExterno: "",
  canalVinculacion: "",
  nivelVinculacion: "Medio",
  servicioInstitucional: "",
  serviciosExternos: "",
  relacionServicios: "",
  diagnostico: "Coincidencia",
  observaciones: "",
  oportunidadIa: "",
};

const diagnosticoOpciones: Array<{
  value: DiagnosticoVinculo;
  label: string;
  descripcion: string;
}> = [
  {
    value: "Coincidencia",
    label: "Coincidencia",
    descripcion: "La respuesta institucional cubre claramente la necesidad.",
  },
  {
    value: "Brecha",
    label: "Brecha",
    descripcion: "La necesidad queda parcialmente cubierta o sin respuesta.",
  },
  {
    value: "Duplicacion",
    label: "Duplicacion",
    descripcion: "Existen respuestas similares sin suficiente coordinacion.",
  },
  {
    value: "Desajuste",
    label: "Desajuste",
    descripcion: "El servicio entregado no coincide con lo que la persona busca.",
  },
];

const diagnosticoClass: Record<DiagnosticoVinculo, string> = {
  Coincidencia: "border-teal-200 bg-teal-50 text-teal-700",
  Brecha: "border-amber-200 bg-amber-50 text-amber-700",
  Duplicacion: "border-sky-200 bg-sky-50 text-sky-700",
  Desajuste: "border-rose-200 bg-rose-50 text-rose-700",
};

const diagnosticoTexto: Record<DiagnosticoVinculo, string> = {
  Coincidencia: "Coincidencia",
  Brecha: "Brecha",
  Duplicacion: "Duplicacion",
  Desajuste: "Desajuste",
};

function serializarMeta(form: FormState) {
  const meta: VinculacionMeta = {
    actorResponsable: form.actorResponsable.trim(),
    actorExterno: form.actorExterno.trim(),
    canalVinculacion: form.canalVinculacion.trim(),
    nivelVinculacion: form.nivelVinculacion,
    servicioInstitucional: form.servicioInstitucional.trim(),
    serviciosExternos: form.serviciosExternos.trim(),
    relacionServicios: form.relacionServicios.trim(),
    diagnostico: form.diagnostico,
    observaciones: form.observaciones.trim(),
    estado: "borrador",
    validado_ruta: false,
  };

  return `${VINCULACION_META_PREFIX}${JSON.stringify(meta)}`;
}

function parsearMeta(raw?: string | null): VinculacionMeta {
  if (!raw) return {};
  if (!raw.startsWith(VINCULACION_META_PREFIX)) {
    return { observaciones: raw };
  }

  try {
    return JSON.parse(raw.slice(VINCULACION_META_PREFIX.length));
  } catch {
    return {};
  }
}

function normalizarVinculacion(row: VinculacionBackend): Vinculacion {
  return {
    ...row,
    meta: parsearMeta(row.descripcion_vinculo),
  };
}

function oportunidadFallback(form: FormState, necesidad?: Necesidad) {
  const necesidadTexto = necesidad?.descripcion || "la necesidad seleccionada";
  const foco: Record<DiagnosticoVinculo, string> = {
    Coincidencia:
      "documentar la buena practica y definir evidencia para demostrar que la respuesta se mantiene en canales presenciales y digitales",
    Brecha:
      "priorizar una accion de cierre de brecha con responsable, plazo y criterio de exito observable por la persona usuaria",
    Duplicacion:
      "coordinar roles entre servicios internos y externos para reducir repeticion de pasos y mensajes inconsistentes",
    Desajuste:
      "revisar el servicio ofrecido frente a la motivacion real de la persona usuaria y ajustar lenguaje, canal o secuencia de atencion",
  };

  return `Para ${necesidadTexto}, se recomienda ${foco[form.diagnostico]}.`;
}

export default function VinculacionFlow({
  onNavigate,
}: {
  onNavigate?: (flujo: string | null) => void;
}) {
  const [tab, setTab] = useState<TabVinculacion>("formulario");
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [generandoIa, setGenerandoIa] = useState(false);
  const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Vinculacion | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const necesidadSeleccionada = useMemo(
    () => necesidades.find((necesidad) => necesidad.id === form.necesidadId),
    [form.necesidadId, necesidades]
  );

  const vinculacionDeNecesidad = useMemo(
    () => vinculaciones.find((item) => item.necesidad_id === form.necesidadId),
    [form.necesidadId, vinculaciones]
  );

  const contadores = useMemo(() => {
    const necesidadesVinculadas = new Set(vinculaciones.map((item) => item.necesidad_id));
    const coincidencias = vinculaciones.filter(
      (item) => item.meta.diagnostico === "Coincidencia"
    ).length;
    const brechas = vinculaciones.filter((item) =>
      ["Brecha", "Desajuste"].includes(item.meta.diagnostico || "")
    ).length;

    return {
      necesidades: necesidades.length,
      vinculadas: necesidadesVinculadas.size,
      pendientes: Math.max(necesidades.length - necesidadesVinculadas.size, 0),
      brechas,
      coincidencias,
    };
  }, [necesidades.length, vinculaciones]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
      TOAST_DURATION_MS
    );
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoadingData(true);
    try {
      const [necesidadesRes, vinculacionesRes] = await Promise.all([
        fetch(`${API_URL}/proyectos/${PROYECTO_ID}/necesidades`),
        fetch(`${API_URL}/proyectos/${PROYECTO_ID}/vinculaciones`),
      ]);

      if (!necesidadesRes.ok) {
        throw new Error("No se pudieron cargar las necesidades registradas.");
      }
      if (!vinculacionesRes.ok) {
        throw new Error("No se pudieron cargar las vinculaciones registradas.");
      }

      const necesidadesData = await necesidadesRes.json();
      const vinculacionesData = await vinculacionesRes.json();
      const necesidadesLista = (necesidadesData.necesidades ?? []) as Necesidad[];
      const vinculacionesLista = ((vinculacionesData.vinculaciones ?? []) as VinculacionBackend[]).map(
        normalizarVinculacion
      );

      setNecesidades(necesidadesLista);
      setVinculaciones(vinculacionesLista);
      setForm((prev) => ({
        ...prev,
        necesidadId: prev.necesidadId || necesidadesLista[0]?.id || "",
      }));
      setLienzoSeleccionado((prev) =>
        prev ? vinculacionesLista.find((item) => item.id === prev.id) ?? null : null
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al cargar Vinculacion.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [addToast]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function actualizarForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrores((prev) => ({ ...prev, [key]: undefined }));
  }

  function formDesdeVinculacion(vinculacion: Vinculacion): FormState {
    return {
      necesidadId: vinculacion.necesidad_id,
      actorResponsable: vinculacion.meta.actorResponsable || "",
      actorExterno: vinculacion.meta.actorExterno || "",
      canalVinculacion: vinculacion.meta.canalVinculacion || "",
      nivelVinculacion: vinculacion.meta.nivelVinculacion || "Medio",
      servicioInstitucional:
        vinculacion.meta.servicioInstitucional || vinculacion.actividad_servicio || "",
      serviciosExternos: vinculacion.meta.serviciosExternos || "",
      relacionServicios: vinculacion.meta.relacionServicios || "",
      diagnostico: vinculacion.meta.diagnostico || "Coincidencia",
      observaciones: vinculacion.meta.observaciones || "",
      oportunidadIa: vinculacion.alerta_ia || "",
    };
  }

  function editarVinculacion(vinculacion: Vinculacion) {
    setForm(formDesdeVinculacion(vinculacion));
    setEditingId(vinculacion.id);
    setErrores({});
    setTab("formulario");
    addToast("Editando vinculacion guardada.", "info");
  }

  function serializarMetaValidada(vinculacion: Vinculacion) {
    const meta: VinculacionMeta = {
      ...vinculacion.meta,
      servicioInstitucional:
        vinculacion.meta.servicioInstitucional || vinculacion.actividad_servicio,
      estado: "validado",
      validado_ruta: true,
    };

    return `${VINCULACION_META_PREFIX}${JSON.stringify(meta)}`;
  }

  function validarForm() {
    const nuevosErrores: Partial<Record<keyof FormState, string>> = {};
    if (!form.necesidadId) nuevosErrores.necesidadId = "Selecciona una necesidad registrada.";
    if (!form.actorResponsable.trim()) {
      nuevosErrores.actorResponsable = "Indica el actor responsable de la vinculacion.";
    }
    if (!form.canalVinculacion.trim()) {
      nuevosErrores.canalVinculacion = "Indica el canal o punto de relacion.";
    }
    if (!form.servicioInstitucional.trim()) {
      nuevosErrores.servicioInstitucional =
        "Indica que servicio entrega la institucion frente a esta necesidad.";
    }
    if (!form.relacionServicios.trim()) {
      nuevosErrores.relacionServicios =
        "Describe como se relacionan los servicios internos y externos.";
    }
    if (!form.diagnostico) nuevosErrores.diagnostico = "Selecciona un diagnostico.";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function generarOportunidadIa() {
    if (!form.necesidadId || !form.servicioInstitucional.trim()) {
      addToast("Selecciona una necesidad e ingresa el servicio institucional antes de generar la sugerencia.", "info");
      return;
    }

    setGenerandoIa(true);
    try {
      const res = await fetch(`${API_URL}/ia/sugerir-proximos-pasos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etapa: 5,
          contexto: `Vinculacion de necesidad con oferta institucional: ${necesidadSeleccionada?.descripcion || ""}`,
          datos_etapa: {
            necesidad: necesidadSeleccionada?.descripcion,
            servicio_institucional: form.servicioInstitucional,
            servicios_externos: form.serviciosExternos,
            relacion_servicios: form.relacionServicios,
            diagnostico: form.diagnostico,
          },
        }),
      });

      if (!res.ok) throw new Error("La asistencia IA no respondio.");
      const data = await res.json();
      const sugerencia =
        data.sugerencia ||
        data.respuesta ||
        data.resultado ||
        data.data?.sugerencia ||
        oportunidadFallback(form, necesidadSeleccionada);

      actualizarForm("oportunidadIa", String(sugerencia));
      addToast("Oportunidad IA demo generada.", "success");
    } catch {
      actualizarForm("oportunidadIa", oportunidadFallback(form, necesidadSeleccionada));
      addToast("Se uso una sugerencia local porque la asistencia IA no respondio.", "info");
    } finally {
      setGenerandoIa(false);
    }
  }

  async function guardarVinculacion() {
    if (!validarForm()) return;
    setLoading(true);

    try {
      const res = await fetch(
        editingId ? `${API_URL}/vinculaciones/${editingId}` : `${API_URL}/vinculaciones`,
        {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? {} : { proyecto_id: PROYECTO_ID }),
          necesidad_id: form.necesidadId,
          actividad_servicio: form.servicioInstitucional.trim(),
          descripcion_vinculo: serializarMeta(form),
          tipo_vinculo: "directa",
          alerta_ia: form.oportunidadIa.trim() || oportunidadFallback(form, necesidadSeleccionada),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo guardar la vinculacion.");
      }

      const data = await res.json();
      const nueva = normalizarVinculacion(data.data as VinculacionBackend);
      setVinculaciones((prev) => [nueva, ...prev.filter((item) => item.id !== nueva.id)]);
      setLienzoSeleccionado(nueva);
      setEditingId(null);
      setForm({
        ...FORM_INICIAL,
        necesidadId: necesidades.find((item) => item.id !== form.necesidadId)?.id || "",
      });
      setTab("lienzo");
      addToast(
        editingId ? "Vinculacion actualizada correctamente." : "Vinculacion metodologica creada correctamente.",
        "success"
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Error al guardar la vinculacion.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function verLienzo(vinculacion: Vinculacion) {
    setLienzoSeleccionado(vinculacion);
    setTab("lienzo");
  }

  async function validarVinculacion(vinculacion: Vinculacion) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vinculaciones/${vinculacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion_vinculo: serializarMetaValidada(vinculacion),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo validar la vinculacion.");
      }

      const data = await res.json();
      const actualizada = normalizarVinculacion(data.data as VinculacionBackend);
      setVinculaciones((prev) => [actualizada, ...prev.filter((item) => item.id !== actualizada.id)]);
      setLienzoSeleccionado(actualizada);
      addToast("Vinculacion validada correctamente.", "success");

      window.dispatchEvent(
        new CustomEvent("actualizar-ruta-proposito", {
          detail: { siguienteEtapa: 6 },
        })
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Error al validar la vinculacion.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function cargarNecesidadEnFormulario(necesidadId: string) {
    setForm((prev) => ({ ...prev, necesidadId }));
    setEditingId(null);
    setTab("formulario");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <ToastList toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="flex">
        <SidebarMetodologico activeRoute="vinculacion" onNavigate={(r) => onNavigate?.(r)} />
        <section className="px-6 py-8 ux-reveal w-full">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                <Link className="h-3.5 w-3.5" />
                Etapa 5
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Vinculacion necesidad-servicio
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Analiza como los servicios responden a necesidades, objetivos y expectativas reales de las personas usuarias,
                identificando coincidencias, brechas, duplicaciones o desajustes entre lo que buscan y lo que reciben.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("necesidades")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Volver a Necesidades
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("formulario");
                  setErrores({});
                }}
                className="ux-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                Nueva vinculacion
              </button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-5">
            <ResumenCard label="Necesidades cargadas" value={contadores.necesidades} tone="slate" />
            <ResumenCard label="Vinculadas" value={contadores.vinculadas} tone="teal" />
            <ResumenCard label="Pendientes" value={contadores.pendientes} tone="amber" />
            <ResumenCard label="Brechas/desajustes" value={contadores.brechas} tone="rose" />
            <ResumenCard label="Coincidencias" value={contadores.coincidencias} tone="sky" />
          </div>

          <div className="ux-card rounded-lg p-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <TabButton active={tab === "formulario"} onClick={() => setTab("formulario")} icon={<ClipboardList className="h-4 w-4" />} label="Formulario" />
              <TabButton active={tab === "registros"} onClick={() => setTab("registros")} icon={<FileText className="h-4 w-4" />} label="Registros guardados" />
              <TabButton active={tab === "lienzo"} onClick={() => setTab("lienzo")} icon={<Layers className="h-4 w-4" />} label="Lienzo unico" />
            </div>
          </div>

          {loadingData ? (
            <div className="ux-card flex min-h-[320px] items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                Cargando necesidades y vinculaciones...
              </div>
            </div>
          ) : (
            <>
              {tab === "formulario" && (
                <FormularioVinculacion
                  form={form}
                  necesidades={necesidades}
                  necesidadSeleccionada={necesidadSeleccionada}
                  vinculacionDeNecesidad={vinculacionDeNecesidad}
                  errores={errores}
                  loading={loading}
                  editingId={editingId}
                  generandoIa={generandoIa}
                  onChange={actualizarForm}
                  onGuardar={guardarVinculacion}
                  onGenerarIa={generarOportunidadIa}
                  onVerExistente={vinculacionDeNecesidad ? () => verLienzo(vinculacionDeNecesidad) : undefined}
                  onCancelarEdicion={() => {
                    setEditingId(null);
                    setForm({
                      ...FORM_INICIAL,
                      necesidadId: necesidades[0]?.id || "",
                    });
                    setErrores({});
                  }}
                  onIrNecesidades={() => onNavigate?.("necesidades")}
                />
              )}

              {tab === "registros" && (
                <RegistrosVinculacion
                  necesidades={necesidades}
                  vinculaciones={vinculaciones}
                  onVerLienzo={verLienzo}
                  onEditar={editarVinculacion}
                  onValidar={validarVinculacion}
                  onCrearDesdeNecesidad={cargarNecesidadEnFormulario}
                  onRecargar={cargarDatos}
                />
              )}

              {tab === "lienzo" && (
                <LienzoVinculacion
                  vinculacion={lienzoSeleccionado}
                  necesidad={necesidades.find((item) => item.id === lienzoSeleccionado?.necesidad_id)}
                  vinculaciones={vinculaciones}
                  necesidades={necesidades}
                  onSeleccionar={verLienzo}
                  onEditar={editarVinculacion}
                  onValidar={validarVinculacion}
                  onCrear={() => setTab("formulario")}
                />
              )}
            </>
          )}

        </div>
        </section>
      </div>
    </main>
  );
}

function FormularioVinculacion({
  form,
  necesidades,
  necesidadSeleccionada,
  vinculacionDeNecesidad,
  errores,
  loading,
  editingId,
  generandoIa,
  onChange,
  onGuardar,
  onGenerarIa,
  onVerExistente,
  onCancelarEdicion,
  onIrNecesidades,
}: {
  form: FormState;
  necesidades: Necesidad[];
  necesidadSeleccionada?: Necesidad;
  vinculacionDeNecesidad?: Vinculacion;
  errores: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  editingId: string | null;
  generandoIa: boolean;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onGuardar: () => void;
  onGenerarIa: () => void;
  onVerExistente?: () => void;
  onCancelarEdicion: () => void;
  onIrNecesidades: () => void;
}) {
  if (necesidades.length === 0) {
    return (
      <div className="ux-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
          <Network className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">
          Primero registra necesidades
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          La etapa de Vinculacion se alimenta de las necesidades cargadas en la etapa anterior,
          tal como fue indicado en los comentarios de UXLab.
        </p>
        <button
          type="button"
          onClick={onIrNecesidades}
          className="ux-button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Ir a Necesidades
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <aside className="ux-card rounded-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Necesidades previas
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Selecciona una necesidad
            </h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
            {necesidades.length}
          </span>
        </div>

        <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
          {necesidades.map((necesidad) => {
            const active = necesidad.id === form.necesidadId;
            return (
              <button
                key={necesidad.id}
                type="button"
                onClick={() => onChange("necesidadId", necesidad.id)}
                className={`w-full rounded-lg border p-4 text-left transition-all duration-150 ${
                  active
                    ? "border-teal-200 bg-teal-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold leading-snug text-slate-900">
                  {necesidad.descripcion}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge label={necesidad.categoria || "Sin categoria"} tone="slate" />
                  <Badge label={`Impacto ${necesidad.impacto || "no definido"}`} tone="amber" />
                  <Badge label={necesidad.estado || "Sin estado"} tone={active ? "teal" : "slate"} />
                </div>
              </button>
            );
          })}
        </div>
        {errores.necesidadId && <ErrorText>{errores.necesidadId}</ErrorText>}

        <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Recursos complementarios
            </p>
          </div>
          <RecursosComplementarios actividad="vinculacion" />
        </div>
      </aside>

      <section className="ux-card rounded-lg p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Lienzo de vinculacion
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Alinear necesidad con oferta de servicio
            </h3>
          </div>
          {vinculacionDeNecesidad && onVerExistente && (
            <button
              type="button"
              onClick={onVerExistente}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700"
            >
              <CheckCircle className="h-4 w-4" />
              Ver vinculo existente
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Necesidad seleccionada
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
              {necesidadSeleccionada?.descripcion || "Selecciona una necesidad para comenzar."}
            </p>
          </div>

          {editingId && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-blue-800">
                  Estas editando una vinculacion guardada.
                </p>
                <button
                  type="button"
                  onClick={onCancelarEdicion}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300"
                >
                  Cancelar edicion
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField
              label="Actor responsable"
              description="Equipo, unidad o rol institucional que lidera la respuesta."
              value={form.actorResponsable}
              onChange={(value) => onChange("actorResponsable", value)}
              error={errores.actorResponsable}
              placeholder="Ejemplo: Unidad de atencion ciudadana, ejecutivo de soporte, equipo digital..."
            />

            <TextAreaField
              label="Actor externo o institucion relacionada"
              description="Contraparte externa, servicio complementario o actor que influye en la experiencia."
              value={form.actorExterno}
              onChange={(value) => onChange("actorExterno", value)}
              placeholder="Ejemplo: Municipalidad, ChileAtiende, proveedor tecnologico..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <TextAreaField
              label="Canal de vinculacion"
              description="Canal, punto de contacto o mecanismo donde ocurre la relacion."
              value={form.canalVinculacion}
              onChange={(value) => onChange("canalVinculacion", value)}
              error={errores.canalVinculacion}
              placeholder="Ejemplo: portal web, atencion presencial, correo, call center, derivacion interna..."
            />

            <div>
              <p className="text-sm font-bold text-slate-800">Nivel de vinculacion</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Indica que tan fuerte es la relacion entre necesidad y respuesta.
              </p>
              <div className="mt-3 grid gap-2">
                {(["Bajo", "Medio", "Alto"] as NivelVinculacion[]).map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => onChange("nivelVinculacion", nivel)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-bold transition ${
                      form.nivelVinculacion === nivel
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TextAreaField
            label="Que servicio entrega nuestra institucion en respuesta a esta necesidad"
            description="Corresponde al servicio, actividad o respuesta institucional que aborda la necesidad."
            value={form.servicioInstitucional}
            onChange={(value) => onChange("servicioInstitucional", value)}
            error={errores.servicioInstitucional}
            placeholder="Ejemplo: Orientacion inicial, revision de antecedentes, acompanamiento digital..."
          />

          <TextAreaField
            label="Que servicio entregan otras instituciones"
            description="Registra servicios externos relacionados, complementarios o similares."
            value={form.serviciosExternos}
            onChange={(value) => onChange("serviciosExternos", value)}
            placeholder="Ejemplo: derivacion municipal, apoyo ChileAtiende, canal telefonico externo..."
          />

          <TextAreaField
            label="Como se relacionan los servicios internos y externos"
            description="Indica si existe colaboracion, coordinacion, derivacion o duplicidad entre proveedores."
            value={form.relacionServicios}
            onChange={(value) => onChange("relacionServicios", value)}
            error={errores.relacionServicios}
            placeholder="Describe colaboraciones, traspasos de informacion, puntos sin coordinacion o duplicidades."
          />

          <div>
            <p className="text-sm font-bold text-slate-800">Diagnostico de ajuste</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {diagnosticoOpciones.map((opcion) => (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => onChange("diagnostico", opcion.value)}
                  className={`rounded-lg border p-3 text-left transition-all duration-150 ${
                    form.diagnostico === opcion.value
                      ? diagnosticoClass[opcion.value]
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-bold">{opcion.label}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">{opcion.descripcion}</span>
                </button>
              ))}
            </div>
            {errores.diagnostico && <ErrorText>{errores.diagnostico}</ErrorText>}
          </div>

          <TextAreaField
            label="Observaciones metodologicas"
            value={form.observaciones}
            onChange={(value) => onChange("observaciones", value)}
            placeholder="Anota riesgos, evidencia requerida o decisiones del equipo."
          />

          <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                  <Bot className="h-4 w-4" />
                  IA demo
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Puede sugerir oportunidades de mejora automaticas a partir de la necesidad y la relacion entre servicios.
                </p>
              </div>
              <button
                type="button"
                onClick={onGenerarIa}
                disabled={generandoIa}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition-all duration-150 hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generandoIa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generar oportunidad
              </button>
            </div>
            <textarea
              value={form.oportunidadIa}
              onChange={(event) => onChange("oportunidadIa", event.target.value)}
              className="mt-4 min-h-24 w-full rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="La oportunidad IA aparecera aqui o puedes escribirla manualmente."
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onGuardar}
              disabled={loading}
              className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Actualizar vinculacion" : "Guardar vinculacion"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RegistrosVinculacion({
  necesidades,
  vinculaciones,
  onVerLienzo,
  onEditar,
  onValidar,
  onCrearDesdeNecesidad,
  onRecargar,
}: {
  necesidades: Necesidad[];
  vinculaciones: Vinculacion[];
  onVerLienzo: (vinculacion: Vinculacion) => void;
  onEditar: (vinculacion: Vinculacion) => void;
  onValidar: (vinculacion: Vinculacion) => void;
  onCrearDesdeNecesidad: (necesidadId: string) => void;
  onRecargar: () => void;
}) {
  const necesidadesVinculadas = new Set(vinculaciones.map((item) => item.necesidad_id));
  const pendientes = necesidades.filter((necesidad) => !necesidadesVinculadas.has(necesidad.id));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="ux-card rounded-lg p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Registros guardados
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Vinculaciones creadas
            </h3>
          </div>
          <button
            type="button"
            onClick={onRecargar}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:text-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {vinculaciones.map((vinculacion) => {
            const necesidad = necesidades.find((item) => item.id === vinculacion.necesidad_id);
            const diagnostico = vinculacion.meta.diagnostico || "Coincidencia";
            const validada = vinculacion.meta.estado === "validado" || vinculacion.meta.validado_ruta === true;
            return (
              <article
                key={vinculacion.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Necesidad
                    </p>
                    <h4 className="mt-1 text-sm font-bold leading-6 text-slate-900">
                      {necesidad?.descripcion || "Necesidad no encontrada"}
                    </h4>
                  </div>
                  <Badge label={diagnosticoTexto[diagnostico]} tone={diagnostico === "Coincidencia" ? "teal" : "amber"} />
                </div>

                <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Servicio institucional
                    </span>
                    <p className="mt-1 leading-6">{vinculacion.actividad_servicio}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Actor, canal y nivel
                    </span>
                    <p className="mt-1 leading-6">
                      {vinculacion.meta.actorResponsable || "Sin actor"} · {vinculacion.meta.canalVinculacion || "Sin canal"} · Nivel {vinculacion.meta.nivelVinculacion || "Medio"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onVerLienzo(vinculacion)}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300"
                  >
                    Ver lienzo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditar(vinculacion)}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onValidar(vinculacion)}
                    disabled={validada}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {validada ? "Validada" : "Validar"}
                  </button>
                </div>
              </article>
            );
          })}

          {vinculaciones.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Aun no existen vinculaciones guardadas.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Crea la primera vinculacion desde una necesidad previamente registrada.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="ux-card rounded-lg p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Pendientes
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">
          Necesidades sin vincular
        </h3>
        <div className="mt-4 space-y-3">
          {pendientes.map((necesidad) => (
            <button
              key={necesidad.id}
              type="button"
              onClick={() => onCrearDesdeNecesidad(necesidad.id)}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-all duration-150 hover:border-teal-200 hover:bg-teal-50"
            >
              <p className="text-sm font-semibold leading-5 text-slate-800">
                {necesidad.descripcion}
              </p>
              <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                Pendiente de vincular
              </span>
            </button>
          ))}
          {pendientes.length === 0 && (
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm text-teal-700">
              Todas las necesidades cargadas tienen al menos una vinculacion.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function LienzoVinculacion({
  vinculacion,
  necesidad,
  vinculaciones,
  necesidades,
  onSeleccionar,
  onEditar,
  onValidar,
  onCrear,
}: {
  vinculacion: Vinculacion | null;
  necesidad?: Necesidad;
  vinculaciones: Vinculacion[];
  necesidades: Necesidad[];
  onSeleccionar: (vinculacion: Vinculacion) => void;
  onEditar: (vinculacion: Vinculacion) => void;
  onValidar: (vinculacion: Vinculacion) => void;
  onCrear: () => void;
}) {
  if (!vinculacion) {
    return (
      <div className="ux-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">
          Selecciona un lienzo
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          La vista muestra un lienzo a la vez para evitar mezclar necesidades, servicios y oportunidades.
        </p>
        <button
          type="button"
          onClick={onCrear}
          className="ux-button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Crear vinculacion
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const diagnostico = vinculacion.meta.diagnostico || "Coincidencia";
  const validada = vinculacion.meta.estado === "validado" || vinculacion.meta.validado_ruta === true;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)]">
      <aside className="ux-card rounded-lg p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Lienzos disponibles
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">
          Ver uno a la vez
        </h3>
        <div className="mt-4 space-y-3">
          {vinculaciones.map((item) => {
            const activa = item.id === vinculacion.id;
            const necesidadItem = necesidades.find((n) => n.id === item.necesidad_id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSeleccionar(item)}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-150 ${
                  activa
                    ? "border-teal-200 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold leading-5 text-slate-800">
                  {necesidadItem?.descripcion || "Necesidad no encontrada"}
                </p>
                <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                  {item.meta.diagnostico || "Coincidencia"}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="ux-card overflow-hidden rounded-lg">
        <div className="border-b border-slate-100 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Lienzo metodologico
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Alineacion necesidad-oferta de servicio
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${diagnosticoClass[diagnostico]}`}>
                {diagnosticoTexto[diagnostico]}
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                validada
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}>
                {validada ? "Validada" : "Borrador"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEditar(vinculacion)}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300"
            >
              Editar vinculacion
            </button>
            <button
              type="button"
              onClick={() => onValidar(vinculacion)}
              disabled={validada}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {validada ? "Vinculacion validada" : "Validar vinculacion"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <LienzoBloque
            titulo="Actor responsable"
            contenido={vinculacion.meta.actorResponsable || "Sin actor responsable registrado."}
            icon={<Network className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Canal y nivel de vinculacion"
            contenido={`${vinculacion.meta.canalVinculacion || "Sin canal registrado."} · Nivel ${vinculacion.meta.nivelVinculacion || "Medio"}`}
            icon={<Link className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Necesidad cargada previamente"
            contenido={necesidad?.descripcion || "Necesidad no encontrada."}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Servicio institucional"
            contenido={vinculacion.meta.servicioInstitucional || vinculacion.actividad_servicio}
            icon={<Network className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Servicios de otras instituciones"
            contenido={vinculacion.meta.serviciosExternos || vinculacion.meta.actorExterno || "Sin servicios externos registrados."}
            icon={<Link className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Relacion entre servicios"
            contenido={vinculacion.meta.relacionServicios || "Sin relacion registrada."}
            icon={<Layers className="h-5 w-5" />}
          />
          <div className="md:col-span-2">
            <LienzoBloque
              titulo="Oportunidad IA demo"
              contenido={vinculacion.alerta_ia || "Sin oportunidad IA registrada."}
              icon={<Sparkles className="h-5 w-5" />}
              destacado
            />
          </div>
          <div className="md:col-span-2">
            <LienzoBloque
              titulo="Observaciones metodologicas"
              contenido={vinculacion.meta.observaciones || "Sin observaciones adicionales."}
              icon={<FileText className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function LienzoBloque({
  titulo,
  contenido,
  icon,
  destacado = false,
}: {
  titulo: string;
  contenido: string;
  icon: ReactNode;
  destacado?: boolean;
}) {
  return (
    <article
      className={`min-h-36 rounded-lg border p-4 ${
        destacado
          ? "border-sky-100 bg-sky-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <span className={destacado ? "text-sky-700" : "text-slate-500"}>{icon}</span>
        {titulo}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{contenido}</p>
    </article>
  );
}

function TextAreaField({
  label,
  description,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-800">{label}</label>
      {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResumenCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "teal" | "amber" | "rose" | "sky";
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-800",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "slate" | "teal" | "amber";
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClass}`}>
      {label}
    </span>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs font-semibold text-rose-600">{children}</p>;
}

function ToastList({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex min-w-72 items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "border-teal-100 bg-teal-50 text-teal-800"
              : toast.type === "error"
                ? "border-rose-100 bg-rose-50 text-rose-800"
                : "border-sky-100 bg-sky-50 text-sky-800"
          }`}
        >
          <span className="mt-0.5">
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : toast.type === "error" ? (
              <X className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button type="button" onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
