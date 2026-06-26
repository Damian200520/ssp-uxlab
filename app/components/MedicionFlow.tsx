"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import SidebarMetodologico from "./SidebarMetodologico";
import { apiFetch as fetch } from "../../lib/api";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle,
  ClipboardList,
  FileText,
  Gauge,
  Link,
  Loader2,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  Target,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

const TOAST_DURATION_MS = 4200;
const MEDICION_META_PREFIX = "::uxlab-medicion-meta::";

type TabMedicion = "formulario" | "registros" | "lienzo";
type ToastType = "success" | "error" | "info";
type UnidadIndicador = "%" | "dias" | "horas" | "n" | "puntaje";

type Vinculacion = {
  id: string;
  necesidad_id: string;
  actividad_servicio: string;
  descripcion_vinculo?: string | null;
  alerta_ia?: string | null;
  tipo_vinculo?: string | null;
};

type IndicadorBackend = {
  id: string;
  proyecto_id: string;
  nombre: string;
  descripcion?: string | null;
  valor_base?: number | null;
  valor_meta?: number | null;
  unidad?: string | null;
  estado: string;
  sugerencia_ia?: string | null;
  created_at?: string | null;
};

type IndicadorMeta = {
  estandarServicio?: string;
  metodoMedicion?: string;
  evidenciaObservada?: string;
  frecuencia?: string;
  responsable?: string;
  vinculacionId?: string;
  estado?: "borrador" | "validado";
  validado_ruta?: boolean;
};

type Indicador = IndicadorBackend & {
  meta: IndicadorMeta;
};

type FormState = {
  vinculacionId: string;
  nombre: string;
  estandarServicio: string;
  metodoMedicion: string;
  evidenciaObservada: string;
  frecuencia: string;
  responsable: string;
  valorBase: string;
  valorMeta: string;
  unidad: UnidadIndicador;
  sugerenciaIa: string;
};

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

const FORM_INICIAL: FormState = {
  vinculacionId: "",
  nombre: "",
  estandarServicio: "",
  metodoMedicion: "",
  evidenciaObservada: "",
  frecuencia: "",
  responsable: "",
  valorBase: "",
  valorMeta: "",
  unidad: "%",
  sugerenciaIa: "",
};

const unidades: UnidadIndicador[] = ["%", "dias", "horas", "n", "puntaje"];

function serializarMeta(form: FormState) {
  const meta: IndicadorMeta = {
    estandarServicio: form.estandarServicio.trim(),
    metodoMedicion: form.metodoMedicion.trim(),
    evidenciaObservada: form.evidenciaObservada.trim(),
    frecuencia: form.frecuencia.trim(),
    responsable: form.responsable.trim(),
    vinculacionId: form.vinculacionId || undefined,
    estado: "borrador",
    validado_ruta: false,
  };

  return `${MEDICION_META_PREFIX}${JSON.stringify(meta)}`;
}

function serializarMetaValidada(indicador: Indicador) {
  const meta: IndicadorMeta = {
    ...indicador.meta,
    estado: "validado",
    validado_ruta: true,
  };

  return `${MEDICION_META_PREFIX}${JSON.stringify(meta)}`;
}

function parsearMeta(raw?: string | null): IndicadorMeta {
  if (!raw) return {};
  if (!raw.startsWith(MEDICION_META_PREFIX)) {
    return { estandarServicio: raw };
  }

  try {
    return JSON.parse(raw.slice(MEDICION_META_PREFIX.length));
  } catch {
    return {};
  }
}

function normalizarIndicador(row: IndicadorBackend): Indicador {
  return {
    ...row,
    meta: parsearMeta(row.descripcion),
  };
}

function numeroONull(valor: string) {
  if (!valor.trim()) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function sugerenciaFallback(form: FormState, vinculacion?: Vinculacion) {
  const foco = vinculacion?.actividad_servicio || form.nombre || "el estandar observado";
  return `Para medir ${foco}, registra una linea base comparable, define una meta realista y contrasta la experiencia declarada con evidencia observada en el punto de atencion.`;
}

export default function MedicionFlow({
  proyectoId = PROYECTO_ID,
  onNavigate,
}: {
  proyectoId?: string;
  onNavigate?: (flujo: string | null) => void;
}) {
  const [tab, setTab] = useState<TabMedicion>("formulario");
  const [vinculaciones, setVinculaciones] = useState<Vinculacion[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Indicador | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generandoIa, setGenerandoIa] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const vinculacionSeleccionada = useMemo(
    () => vinculaciones.find((item) => item.id === form.vinculacionId),
    [form.vinculacionId, vinculaciones]
  );

  const contadores = useMemo(() => {
    const conMeta = indicadores.filter((item) => item.valor_meta !== null && item.valor_meta !== undefined).length;
    const conBase = indicadores.filter((item) => item.valor_base !== null && item.valor_base !== undefined).length;
    const validados = indicadores.filter(
      (item) => item.meta.estado === "validado" || item.meta.validado_ruta === true
    ).length;
    const pendientes = indicadores.length - validados;

    return {
      total: indicadores.length,
      conBase,
      conMeta,
      validados,
      pendientes,
    };
  }, [indicadores]);

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
      const [vinculacionesRes, indicadoresRes] = await Promise.all([
        fetch(`${API_URL}/proyectos/${proyectoId}/vinculaciones`),
        fetch(`${API_URL}/proyectos/${proyectoId}/indicadores`),
      ]);

      if (!vinculacionesRes.ok) {
        throw new Error("No se pudieron cargar las vinculaciones registradas.");
      }
      if (!indicadoresRes.ok) {
        throw new Error("No se pudieron cargar los indicadores de medicion.");
      }

      const vinculacionesData = await vinculacionesRes.json();
      const indicadoresData = await indicadoresRes.json();
      const vinculacionesLista = (vinculacionesData.vinculaciones ?? []) as Vinculacion[];
      const indicadoresLista = ((indicadoresData.indicadores ?? []) as IndicadorBackend[]).map(normalizarIndicador);

      setVinculaciones(vinculacionesLista);
      setIndicadores(indicadoresLista);
      setForm((prev) => ({
        ...prev,
        vinculacionId: prev.vinculacionId || vinculacionesLista[0]?.id || "",
      }));
      setLienzoSeleccionado((prev) =>
        prev ? indicadoresLista.find((item) => item.id === prev.id) ?? null : null
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al cargar Medicion.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [addToast, proyectoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function actualizarForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrores((prev) => ({ ...prev, [key]: undefined }));
  }

  function formDesdeIndicador(indicador: Indicador): FormState {
    return {
      vinculacionId: indicador.meta.vinculacionId || vinculaciones[0]?.id || "",
      nombre: indicador.nombre || "",
      estandarServicio: indicador.meta.estandarServicio || "",
      metodoMedicion: indicador.meta.metodoMedicion || "",
      evidenciaObservada: indicador.meta.evidenciaObservada || "",
      frecuencia: indicador.meta.frecuencia || "",
      responsable: indicador.meta.responsable || "",
      valorBase: indicador.valor_base !== null && indicador.valor_base !== undefined ? String(indicador.valor_base) : "",
      valorMeta: indicador.valor_meta !== null && indicador.valor_meta !== undefined ? String(indicador.valor_meta) : "",
      unidad: unidades.includes(indicador.unidad as UnidadIndicador) ? (indicador.unidad as UnidadIndicador) : "%",
      sugerenciaIa: indicador.sugerencia_ia || "",
    };
  }

  function editarIndicador(indicador: Indicador) {
    setEditingId(indicador.id);
    setForm(formDesdeIndicador(indicador));
    setLienzoSeleccionado(indicador);
    setErrores({});
    setTab("formulario");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setEditingId(null);
    setForm({
      ...FORM_INICIAL,
      vinculacionId: vinculaciones[0]?.id || "",
    });
    setErrores({});
  }

  function validarForm() {
    const nuevosErrores: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = "Ingresa el nombre del indicador.";
    if (!form.estandarServicio.trim()) {
      nuevosErrores.estandarServicio = "Describe el estandar de servicio que se observara.";
    }
    if (!form.metodoMedicion.trim()) {
      nuevosErrores.metodoMedicion = "Indica como se medira la experiencia real.";
    }
    if (!form.valorMeta.trim()) nuevosErrores.valorMeta = "Define una meta esperada.";
    if (form.valorBase.trim() && numeroONull(form.valorBase) === null) {
      nuevosErrores.valorBase = "La linea base debe ser numerica.";
    }
    if (form.valorMeta.trim() && numeroONull(form.valorMeta) === null) {
      nuevosErrores.valorMeta = "La meta debe ser numerica.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function generarSugerenciaIa() {
    if (!form.nombre.trim() || !form.estandarServicio.trim()) {
      addToast("Ingresa el nombre y el estandar antes de generar la sugerencia IA.", "info");
      return;
    }

    setGenerandoIa(true);
    try {
      const res = await fetch(`${API_URL}/ia/sugerir-proximos-pasos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etapa: 6,
          contexto: `Medicion de experiencia real para el indicador ${form.nombre}`,
          datos_etapa: {
            indicador: form.nombre,
            estandar_servicio: form.estandarServicio,
            metodo_medicion: form.metodoMedicion,
            evidencia_observada: form.evidenciaObservada,
            vinculacion: vinculacionSeleccionada?.actividad_servicio,
            valor_base: form.valorBase,
            valor_meta: form.valorMeta,
            unidad: form.unidad,
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
        sugerenciaFallback(form, vinculacionSeleccionada);

      actualizarForm("sugerenciaIa", String(sugerencia));
      addToast("Sugerencia IA demo generada.", "success");
    } catch {
      actualizarForm("sugerenciaIa", sugerenciaFallback(form, vinculacionSeleccionada));
      addToast("Se uso una sugerencia local porque la asistencia IA no respondio.", "info");
    } finally {
      setGenerandoIa(false);
    }
  }

  async function guardarIndicador() {
    if (!validarForm()) return;
    setLoading(true);

    try {
      const res = await fetch(editingId ? `${API_URL}/indicadores/${editingId}` : `${API_URL}/indicadores`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? {} : { proyecto_id: proyectoId }),
          nombre: form.nombre.trim(),
          descripcion: serializarMeta(form),
          valor_base: numeroONull(form.valorBase),
          valor_meta: numeroONull(form.valorMeta),
          unidad: form.unidad,
          estado: "pendiente",
          sugerencia_ia: form.sugerenciaIa.trim() || sugerenciaFallback(form, vinculacionSeleccionada),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo guardar el indicador.");
      }

      const data = await res.json();
      const nuevo = normalizarIndicador(data.data as IndicadorBackend);
      setIndicadores((prev) =>
        editingId ? prev.map((item) => (item.id === nuevo.id ? nuevo : item)) : [nuevo, ...prev]
      );
      setLienzoSeleccionado(nuevo);
      setEditingId(null);
      setForm({
        ...FORM_INICIAL,
        vinculacionId: vinculaciones[0]?.id || "",
      });
      setTab("lienzo");
      addToast(
        editingId ? "Indicador de medicion actualizado correctamente." : "Indicador de medicion creado correctamente.",
        "success"
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al guardar el indicador.", "error");
    } finally {
      setLoading(false);
    }
  }

  function verLienzo(indicador: Indicador) {
    setLienzoSeleccionado(indicador);
    setTab("lienzo");
  }

  async function validarIndicador(indicador: Indicador) {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/indicadores/${indicador.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: serializarMetaValidada(indicador),
          sugerencia_ia: indicador.sugerencia_ia || sugerenciaFallback(formDesdeIndicador(indicador)),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo validar el indicador.");
      }

      const data = await res.json();
      const actualizado = normalizarIndicador(data.data as IndicadorBackend);
      setIndicadores((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
      setLienzoSeleccionado(actualizado);
      addToast("Indicador validado correctamente.", "success");
      window.dispatchEvent(new CustomEvent("actualizar-ruta-proposito", { detail: { siguienteEtapa: 7 } }));
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al validar el indicador.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-0 bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <ToastList toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="flex">
        <SidebarMetodologico activeRoute="medicion" onNavigate={(r) => onNavigate?.(r)} />
        <section className="px-6 py-8 ux-reveal w-full">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                <Gauge className="h-3.5 w-3.5" />
                Etapa 6
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Medicion de la experiencia real
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Observa y mide la experiencia entregada usando estandares de servicio para contrastar si los niveles declarados
                de calidad, atencion y respuesta ocurren realmente en la practica.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("vinculacion")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Volver a Vinculacion
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
                Nuevo indicador
              </button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-4">
            <ResumenCard label="Indicadores" value={contadores.total} tone="slate" />
            <ResumenCard label="Con linea base" value={contadores.conBase} tone="sky" />
            <ResumenCard label="Con meta" value={contadores.conMeta} tone="teal" />
            <ResumenCard label="Pendientes" value={contadores.pendientes} tone="amber" />
          </div>

          <div className="ux-card rounded-lg p-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <TabButton active={tab === "formulario"} onClick={() => setTab("formulario")} icon={<ClipboardList className="h-4 w-4" />} label="Formulario" />
              <TabButton active={tab === "registros"} onClick={() => setTab("registros")} icon={<FileText className="h-4 w-4" />} label="Indicadores guardados" />
              <TabButton active={tab === "lienzo"} onClick={() => setTab("lienzo")} icon={<BarChart3 className="h-4 w-4" />} label="Lienzo de medicion" />
            </div>
          </div>

          {loadingData ? (
            <div className="ux-card flex min-h-[320px] items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                Cargando vinculaciones e indicadores...
              </div>
            </div>
          ) : (
            <>
              {tab === "formulario" && (
                <FormularioMedicion
                  form={form}
                  vinculaciones={vinculaciones}
                  vinculacionSeleccionada={vinculacionSeleccionada}
                  errores={errores}
                  editingId={editingId}
                  loading={loading}
                  generandoIa={generandoIa}
                  onChange={actualizarForm}
                  onGuardar={guardarIndicador}
                  onGenerarIa={generarSugerenciaIa}
                  onIrVinculacion={() => onNavigate?.("vinculacion")}
                  onCancelarEdicion={cancelarEdicion}
                />
              )}

              {tab === "registros" && (
                <RegistrosMedicion
                  indicadores={indicadores}
                  vinculaciones={vinculaciones}
                  onVerLienzo={verLienzo}
                  onEditar={editarIndicador}
                  onValidar={validarIndicador}
                  onRecargar={cargarDatos}
                />
              )}

              {tab === "lienzo" && (
                <LienzoMedicion
                  indicador={lienzoSeleccionado}
                  indicadores={indicadores}
                  vinculacion={vinculaciones.find((item) => item.id === lienzoSeleccionado?.meta.vinculacionId)}
                  onSeleccionar={verLienzo}
                  onEditar={editarIndicador}
                  onValidar={validarIndicador}
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

function FormularioMedicion({
  form,
  vinculaciones,
  vinculacionSeleccionada,
  errores,
  editingId,
  loading,
  generandoIa,
  onChange,
  onGuardar,
  onGenerarIa,
  onIrVinculacion,
  onCancelarEdicion,
}: {
  form: FormState;
  vinculaciones: Vinculacion[];
  vinculacionSeleccionada?: Vinculacion;
  errores: Partial<Record<keyof FormState, string>>;
  editingId: string | null;
  loading: boolean;
  generandoIa: boolean;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onGuardar: () => void;
  onGenerarIa: () => void;
  onIrVinculacion: () => void;
  onCancelarEdicion: () => void;
}) {
  if (vinculaciones.length === 0) {
    return (
      <div className="ux-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
          <Link className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">
          Primero registra vinculaciones
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          La medicion necesita una relacion previa entre necesidad y servicio para definir que estandar se observara.
        </p>
        <button
          type="button"
          onClick={onIrVinculacion}
          className="ux-button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Ir a Vinculacion
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <aside className="space-y-5">
        <div className="ux-card rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Vinculaciones previas
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Selecciona un servicio a medir
          </h3>
          <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
            {vinculaciones.map((vinculacion) => {
              const active = vinculacion.id === form.vinculacionId;
              return (
                <button
                  key={vinculacion.id}
                  type="button"
                  onClick={() => onChange("vinculacionId", vinculacion.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-all duration-150 ${
                    active
                      ? "border-indigo-200 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold leading-snug text-slate-900">
                    {vinculacion.actividad_servicio}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                    {vinculacion.alerta_ia || "Sin oportunidad registrada."}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="ux-card rounded-lg p-5">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Lienzo de medicion
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Definir indicador y evidencia observable
          </h3>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Servicio seleccionado
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
              {vinculacionSeleccionada?.actividad_servicio || "Selecciona una vinculacion para comenzar."}
            </p>
          </div>

          {editingId && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-blue-800">
                  Estas editando un indicador guardado.
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

          <InputField
            label="Nombre del indicador"
            value={form.nombre}
            onChange={(value) => onChange("nombre", value)}
            error={errores.nombre}
            placeholder="Ejemplo: Comprension de requisitos antes del tramite"
          />

          <TextAreaField
            label="Estandar de servicio observado"
            description="Define el nivel de calidad, atencion o respuesta que la institucion declara entregar."
            value={form.estandarServicio}
            onChange={(value) => onChange("estandarServicio", value)}
            error={errores.estandarServicio}
            placeholder="Ejemplo: La persona debe comprender requisitos y pasos antes de iniciar la solicitud."
          />

          <TextAreaField
            label="Metodo de medicion"
            description="Indica como se observara la experiencia real y con que fuente de datos."
            value={form.metodoMedicion}
            onChange={(value) => onChange("metodoMedicion", value)}
            error={errores.metodoMedicion}
            placeholder="Ejemplo: encuesta breve post atencion, observacion de atenciones, revision de tickets."
          />

          <TextAreaField
            label="Evidencia observada"
            value={form.evidenciaObservada}
            onChange={(value) => onChange("evidenciaObservada", value)}
            placeholder="Ejemplo: respuestas de encuesta, tiempos de espera, reclamos, registros de derivacion."
          />

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Frecuencia</span>
              <select
                value={["Semanal", "Mensual"].includes(form.frecuencia) ? form.frecuencia : form.frecuencia ? "Otro" : ""}
                onChange={(event) => onChange("frecuencia", event.target.value === "Otro" ? "Otro: " : event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Selecciona...</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensual">Mensual</option>
                <option value="Otro">Otro</option>
              </select>
              {form.frecuencia.startsWith("Otro") && (
                <input
                  value={form.frecuencia.replace(/^Otro:\s*/, "")}
                  onChange={(event) => onChange("frecuencia", `Otro: ${event.target.value}`)}
                  placeholder="Especifica la frecuencia"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              )}
            </label>
            <InputField
              label="Responsable"
              value={form.responsable}
              onChange={(value) => onChange("responsable", value)}
              placeholder="Equipo o rol responsable"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <InputField
              label="Linea base"
              value={form.valorBase}
              onChange={(value) => onChange("valorBase", value)}
              error={errores.valorBase}
              placeholder="45"
            />
            <InputField
              label="Meta esperada"
              value={form.valorMeta}
              onChange={(value) => onChange("valorMeta", value)}
              error={errores.valorMeta}
              placeholder="75"
            />
            <SelectField
              label="Unidad"
              value={form.unidad}
              options={unidades}
              onChange={(value) => onChange("unidad", value as UnidadIndicador)}
            />
          </div>

          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                  <Bot className="h-4 w-4" />
                  IA demo
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Sugiere como observar el indicador y que evidencia conviene levantar.
                </p>
              </div>
              <button
                type="button"
                onClick={onGenerarIa}
                disabled={generandoIa}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 transition-all duration-150 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generandoIa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generar sugerencia
              </button>
            </div>
            <textarea
              value={form.sugerenciaIa}
              onChange={(event) => onChange("sugerenciaIa", event.target.value)}
              className="mt-4 min-h-24 w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              placeholder="La sugerencia IA aparecera aqui o puedes escribirla manualmente."
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onGuardar}
              disabled={loading}
              className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Actualizar indicador" : "Guardar indicador"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RegistrosMedicion({
  indicadores,
  vinculaciones,
  onVerLienzo,
  onEditar,
  onValidar,
  onRecargar,
}: {
  indicadores: Indicador[];
  vinculaciones: Vinculacion[];
  onVerLienzo: (indicador: Indicador) => void;
  onEditar: (indicador: Indicador) => void;
  onValidar: (indicador: Indicador) => void;
  onRecargar: () => void;
}) {
  return (
    <section className="ux-card rounded-lg p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Indicadores guardados
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Medicion de experiencia real
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

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {indicadores.map((indicador) => {
          const vinculacion = vinculaciones.find((item) => item.id === indicador.meta.vinculacionId);
          const validado = indicador.meta.estado === "validado" || indicador.meta.validado_ruta === true;
          return (
            <article key={indicador.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Indicador
                  </p>
                  <h4 className="mt-1 text-sm font-bold leading-6 text-slate-900">
                    {indicador.nombre}
                  </h4>
                </div>
                <Badge label={validado ? "validado" : indicador.estado || "pendiente"} tone={validado ? "teal" : "amber"} />
              </div>
              <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Base
                  </span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {indicador.valor_base ?? "Sin base"} {indicador.unidad || ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Meta
                  </span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {indicador.valor_meta ?? "Sin meta"} {indicador.unidad || ""}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                {vinculacion?.actividad_servicio || indicador.meta.estandarServicio || "Sin vinculacion asociada."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerLienzo(indicador)}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:border-indigo-300"
                >
                  Ver lienzo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditar(indicador)}
                  className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onValidar(indicador)}
                  disabled={validado}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {validado ? "Validado" : "Validar"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {indicadores.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Aun no existen indicadores guardados.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Crea un indicador para observar si el estandar declarado ocurre en la experiencia real.
          </p>
        </div>
      )}
    </section>
  );
}

function LienzoMedicion({
  indicador,
  indicadores,
  vinculacion,
  onSeleccionar,
  onEditar,
  onValidar,
  onCrear,
}: {
  indicador: Indicador | null;
  indicadores: Indicador[];
  vinculacion?: Vinculacion;
  onSeleccionar: (indicador: Indicador) => void;
  onEditar: (indicador: Indicador) => void;
  onValidar: (indicador: Indicador) => void;
  onCrear: () => void;
}) {
  if (!indicador) {
    return (
      <div className="ux-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">
          Selecciona un indicador
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          El lienzo muestra un indicador a la vez para mantener clara la relacion entre estandar, evidencia y meta.
        </p>
        <button
          type="button"
          onClick={onCrear}
          className="ux-button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Crear indicador
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const validado = indicador.meta.estado === "validado" || indicador.meta.validado_ruta === true;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)]">
      <aside className="ux-card rounded-lg p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Indicadores disponibles
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">
          Ver uno a la vez
        </h3>
        <div className="mt-4 space-y-3">
          {indicadores.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSeleccionar(item)}
              className={`w-full rounded-lg border p-3 text-left transition-all duration-150 ${
                item.id === indicador.id
                  ? "border-indigo-200 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-semibold leading-5 text-slate-800">
                {item.nombre}
              </p>
              <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                {item.valor_meta ?? "Sin meta"} {item.unidad || ""}
              </span>
            </button>
          ))}
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
                {indicador.nombre}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={validado ? "validado" : indicador.estado || "pendiente"} tone={validado ? "teal" : "amber"} />
              <button
                type="button"
                onClick={() => onEditar(indicador)}
                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:border-blue-300"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onValidar(indicador)}
                disabled={validado}
                className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {validado ? "Validado" : "Validar"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <LienzoBloque
            titulo="Servicio o vinculo observado"
            contenido={vinculacion?.actividad_servicio || "Sin vinculacion asociada."}
            icon={<Link className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Estandar declarado"
            contenido={indicador.meta.estandarServicio || "Sin estandar registrado."}
            icon={<Target className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Metodo de medicion"
            contenido={indicador.meta.metodoMedicion || "Sin metodo registrado."}
            icon={<Ruler className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Evidencia observada"
            contenido={indicador.meta.evidenciaObservada || "Sin evidencia registrada."}
            icon={<FileText className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Linea base y meta"
            contenido={`Base: ${indicador.valor_base ?? "sin base"} ${indicador.unidad || ""} | Meta: ${indicador.valor_meta ?? "sin meta"} ${indicador.unidad || ""}`}
            icon={<Gauge className="h-5 w-5" />}
          />
          <LienzoBloque
            titulo="Frecuencia y responsable"
            contenido={`${indicador.meta.frecuencia || "Sin frecuencia"} | ${indicador.meta.responsable || "Sin responsable"}`}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <div className="md:col-span-2">
            <LienzoBloque
              titulo="Sugerencia IA demo"
              contenido={indicador.sugerencia_ia || "Sin sugerencia registrada."}
              icon={<Sparkles className="h-5 w-5" />}
              destacado
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
          ? "border-indigo-100 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <span className={destacado ? "text-indigo-700" : "text-slate-500"}>{icon}</span>
        {titulo}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{contenido}</p>
    </article>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-800">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
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
        className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-800">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
  tone: "slate" | "teal" | "amber" | "sky";
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-800",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
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
  tone: "amber" | "teal";
}) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
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
