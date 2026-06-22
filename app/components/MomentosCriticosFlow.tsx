"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import SidebarMetodologico from "./SidebarMetodologico";
import RecursosComplementarios from "./RecursosComplementarios";
import { apiFetch as fetch } from "../../lib/api";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle,
  ClipboardList,
  FileText,
  Layers,
  Loader2,
  Map,
  Plus,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

const TOAST_DURATION_MS = 4200;
const MOMENTO_META_PREFIX = "::uxlab-momento-meta::";

type TabMomento = "formulario" | "registros" | "lienzo" | "recorrido";
type Impacto = "alto" | "medio" | "bajo";
type TipoQuiebre = "Friccion" | "Espera" | "Falta de informacion" | "Abandono" | "Error de canal";
type ToastType = "success" | "error" | "info";

type Indicador = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  valor_base?: number | null;
  valor_meta?: number | null;
  unidad?: string | null;
  sugerencia_ia?: string | null;
};

type MomentoBackend = {
  id: string;
  proyecto_id: string;
  descripcion: string;
  punto_contacto: string;
  impacto: string;
  causa_raiz?: string | null;
  oportunidad_mejora?: string | null;
  sintesis_ia?: string | null;
  created_at?: string | null;
};

type MomentoMeta = {
  pasoRecorrido?: string;
  canal?: string;
  tipoQuiebre?: TipoQuiebre;
  senalesObservables?: string;
  magnitudAfectados?: string;
  indicadorId?: string;
  causaRaiz?: string;
  estado?: "borrador" | "validado";
  validado_ruta?: boolean;
};

type MomentoCritico = MomentoBackend & {
  meta: MomentoMeta;
};

type FormState = {
  indicadorId: string;
  pasoRecorrido: string;
  puntoContacto: string;
  canal: string;
  descripcion: string;
  impacto: Impacto;
  tipoQuiebre: TipoQuiebre;
  senalesObservables: string;
  magnitudAfectados: string;
  causaRaiz: string;
  oportunidadMejora: string;
  sintesisIa: string;
};

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

const FORM_INICIAL: FormState = {
  indicadorId: "",
  pasoRecorrido: "",
  puntoContacto: "",
  canal: "",
  descripcion: "",
  impacto: "alto",
  tipoQuiebre: "Friccion",
  senalesObservables: "",
  magnitudAfectados: "",
  causaRaiz: "",
  oportunidadMejora: "",
  sintesisIa: "",
};

const impactoOpciones: Impacto[] = ["alto", "medio", "bajo"];
const tipoQuiebreOpciones: TipoQuiebre[] = [
  "Friccion",
  "Espera",
  "Falta de informacion",
  "Abandono",
  "Error de canal",
];

const impactoClass: Record<Impacto, string> = {
  alto: "border-rose-200 bg-rose-50 text-rose-700",
  medio: "border-amber-200 bg-amber-50 text-amber-700",
  bajo: "border-teal-200 bg-teal-50 text-teal-700",
};

function serializarMeta(form: FormState, estado: "borrador" | "validado" = "borrador") {
  const meta: MomentoMeta = {
    pasoRecorrido: form.pasoRecorrido.trim(),
    canal: form.canal.trim(),
    tipoQuiebre: form.tipoQuiebre,
    senalesObservables: form.senalesObservables.trim(),
    magnitudAfectados: form.magnitudAfectados.trim(),
    indicadorId: form.indicadorId || undefined,
    causaRaiz: form.causaRaiz.trim(),
    estado,
    validado_ruta: estado === "validado",
  };

  return `${MOMENTO_META_PREFIX}${JSON.stringify(meta)}`;
}

function serializarMetaDesdeMomento(momento: MomentoCritico, estado: "borrador" | "validado") {
  const meta: MomentoMeta = {
    ...momento.meta,
    causaRaiz: momento.causa_raiz || momento.meta.causaRaiz,
    estado,
    validado_ruta: estado === "validado",
  };

  return `${MOMENTO_META_PREFIX}${JSON.stringify(meta)}`;
}

function parsearMeta(raw?: string | null): { meta: MomentoMeta; texto?: string } {
  if (!raw) return { meta: {} };
  if (!raw.startsWith(MOMENTO_META_PREFIX)) return { meta: {}, texto: raw };

  try {
    return { meta: JSON.parse(raw.slice(MOMENTO_META_PREFIX.length)) };
  } catch {
    return { meta: {} };
  }
}

function normalizarMomento(row: MomentoBackend): MomentoCritico {
  const parsed = parsearMeta(row.causa_raiz);
  return {
    ...row,
    causa_raiz: parsed.meta.causaRaiz || parsed.texto || row.causa_raiz,
    meta: parsed.meta,
  };
}

function formDesdeMomento(momento: MomentoCritico): FormState {
  return {
    indicadorId: momento.meta.indicadorId || "",
    pasoRecorrido: momento.meta.pasoRecorrido || "",
    puntoContacto: momento.punto_contacto || "",
    canal: momento.meta.canal || "",
    descripcion: momento.descripcion || "",
    impacto: impactoOpciones.includes(momento.impacto as Impacto) ? (momento.impacto as Impacto) : "medio",
    tipoQuiebre: momento.meta.tipoQuiebre || "Friccion",
    senalesObservables: momento.meta.senalesObservables || "",
    magnitudAfectados: momento.meta.magnitudAfectados || "",
    causaRaiz: momento.causa_raiz || momento.meta.causaRaiz || "",
    oportunidadMejora: momento.oportunidad_mejora || "",
    sintesisIa: momento.sintesis_ia || "",
  };
}

function estaValidado(momento: MomentoCritico) {
  return momento.meta.estado === "validado" || momento.meta.validado_ruta === true;
}

function sintesisFallback(form: FormState, indicador?: Indicador) {
  const referencia = indicador?.nombre || form.puntoContacto || "el punto de contacto";
  return `El quiebre en ${referencia} puede afectar la continuidad del recorrido. Se recomienda validar la causa raiz con evidencia observada y priorizar una mejora concreta para reducir friccion, espera o abandono.`;
}

export default function MomentosCriticosFlow({
  proyectoId = PROYECTO_ID,
  onNavigate,
}: {
  proyectoId?: string;
  onNavigate?: (flujo: string | null) => void;
}) {
  const [tab, setTab] = useState<TabMomento>("formulario");
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [momentos, setMomentos] = useState<MomentoCritico[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [lienzoSeleccionado, setLienzoSeleccionado] = useState<MomentoCritico | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validandoId, setValidandoId] = useState<string | null>(null);
  const [generandoIa, setGenerandoIa] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const indicadorSeleccionado = useMemo(
    () => indicadores.find((item) => item.id === form.indicadorId),
    [form.indicadorId, indicadores]
  );

  const contadores = useMemo(() => ({
    total: momentos.length,
    alto: momentos.filter((item) => item.impacto === "alto").length,
    medio: momentos.filter((item) => item.impacto === "medio").length,
    validados: momentos.filter(estaValidado).length,
  }), [momentos]);

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
      const [indicadoresRes, momentosRes] = await Promise.all([
        fetch(`${API_URL}/proyectos/${proyectoId}/indicadores`),
        fetch(`${API_URL}/proyectos/${proyectoId}/momentos-criticos`),
      ]);

      if (!indicadoresRes.ok) {
        throw new Error("No se pudieron cargar los indicadores de medicion.");
      }
      if (!momentosRes.ok) {
        throw new Error("No se pudieron cargar los momentos criticos.");
      }

      const indicadoresData = await indicadoresRes.json();
      const momentosData = await momentosRes.json();
      const indicadoresLista = (indicadoresData.indicadores ?? []) as Indicador[];
      const momentosLista = ((momentosData.momentos_criticos ?? []) as MomentoBackend[]).map(normalizarMomento);

      setIndicadores(indicadoresLista);
      setMomentos(momentosLista);
      setForm((prev) => ({
        ...prev,
        indicadorId: prev.indicadorId,
      }));
      setLienzoSeleccionado((prev) =>
        prev ? momentosLista.find((item) => item.id === prev.id) ?? null : null
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al cargar Momentos criticos.", "error");
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

  function validarForm() {
    const nuevosErrores: Partial<Record<keyof FormState, string>> = {};
    if (!form.pasoRecorrido.trim()) nuevosErrores.pasoRecorrido = "Describe el paso del recorrido.";
    if (!form.puntoContacto.trim()) nuevosErrores.puntoContacto = "Indica el punto de contacto.";
    if (!form.descripcion.trim()) nuevosErrores.descripcion = "Describe el momento critico.";
    if (!form.magnitudAfectados.trim()) nuevosErrores.magnitudAfectados = "Estima a quienes afecta o su magnitud.";
    if (!form.causaRaiz.trim()) nuevosErrores.causaRaiz = "Registra una causa raiz inicial.";
    if (!form.oportunidadMejora.trim()) {
      nuevosErrores.oportunidadMejora = "Define una oportunidad de mejora.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function generarSintesisIa() {
    if (!form.descripcion.trim() || !form.puntoContacto.trim()) {
      addToast("Ingresa el momento critico y punto de contacto antes de generar la sintesis IA.", "info");
      return;
    }

    setGenerandoIa(true);
    try {
      const res = await fetch(`${API_URL}/ia/sugerir-proximos-pasos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etapa: 7,
          contexto: `Momentos criticos de la experiencia actual en ${form.puntoContacto}`,
          datos_etapa: {
            paso_recorrido: form.pasoRecorrido,
            punto_contacto: form.puntoContacto,
            canal: form.canal,
            descripcion: form.descripcion,
            impacto: form.impacto,
            tipo_quiebre: form.tipoQuiebre,
            senales_observables: form.senalesObservables,
            magnitud_afectados: form.magnitudAfectados,
            indicador: indicadorSeleccionado?.nombre,
          },
        }),
      });

      if (!res.ok) throw new Error("La asistencia IA no respondio.");
      const data = await res.json();
      const sintesis =
        data.sugerencia ||
        data.respuesta ||
        data.resultado ||
        data.data?.sugerencia ||
        sintesisFallback(form, indicadorSeleccionado);

      actualizarForm("sintesisIa", String(sintesis));
      addToast("Sintesis IA demo generada.", "success");
    } catch {
      actualizarForm("sintesisIa", sintesisFallback(form, indicadorSeleccionado));
      addToast("Se uso una sintesis local porque la asistencia IA no respondio.", "info");
    } finally {
      setGenerandoIa(false);
    }
  }

  async function guardarMomento() {
    if (!validarForm()) return;
    setLoading(true);

    try {
      const url = editingId
        ? `${API_URL}/momentos-criticos/${editingId}`
        : `${API_URL}/momentos-criticos`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? {} : { proyecto_id: proyectoId }),
          descripcion: form.descripcion.trim(),
          punto_contacto: form.puntoContacto.trim(),
          impacto: form.impacto,
          causa_raiz: serializarMeta(form),
          oportunidad_mejora: form.oportunidadMejora.trim(),
          sintesis_ia: form.sintesisIa.trim() || sintesisFallback(form, indicadorSeleccionado),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo guardar el momento critico.");
      }

      const data = await res.json();
      const nuevo = normalizarMomento(data.data as MomentoBackend);
      setMomentos((prev) =>
        editingId ? prev.map((item) => (item.id === nuevo.id ? nuevo : item)) : [nuevo, ...prev]
      );
      setLienzoSeleccionado(nuevo);
      setForm({
        ...FORM_INICIAL,
        indicadorId: "",
      });
      setEditingId(null);
      setTab("lienzo");
      addToast(editingId ? "Momento critico actualizado correctamente." : "Momento critico creado correctamente.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al guardar el momento critico.", "error");
    } finally {
      setLoading(false);
    }
  }

  function editarMomento(momento: MomentoCritico) {
    setForm(formDesdeMomento(momento));
    setEditingId(momento.id);
    setErrores({});
    setTab("formulario");
  }

  function cancelarEdicion() {
    setEditingId(null);
    setErrores({});
    setForm({
      ...FORM_INICIAL,
      indicadorId: "",
    });
  }

  async function validarMomento(momento: MomentoCritico) {
    setValidandoId(momento.id);
    try {
      const res = await fetch(`${API_URL}/momentos-criticos/${momento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          causa_raiz: serializarMetaDesdeMomento(momento, "validado"),
          descripcion: momento.descripcion,
          punto_contacto: momento.punto_contacto,
          impacto: momento.impacto,
          oportunidad_mejora: momento.oportunidad_mejora,
          sintesis_ia: momento.sintesis_ia,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo validar el momento critico.");
      }

      const data = await res.json();
      const actualizado = normalizarMomento(data.data as MomentoBackend);
      setMomentos((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
      setLienzoSeleccionado((prev) => (prev?.id === actualizado.id ? actualizado : prev));
      window.dispatchEvent(new CustomEvent("actualizar-ruta-proposito", { detail: { siguienteEtapa: 7 } }));
      addToast("Momento critico validado para la ruta metodologica.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Error al validar el momento critico.", "error");
    } finally {
      setValidandoId(null);
    }
  }

  function verLienzo(momento: MomentoCritico) {
    setLienzoSeleccionado(momento);
    setTab("lienzo");
  }

  return (
    <main className="min-h-0 bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <ToastList toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="flex">
        <SidebarMetodologico activeRoute="momentos" onNavigate={(r) => onNavigate?.(r)} />
        <section className="px-6 py-8 ux-reveal w-full">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Etapa 7
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Momentos criticos de la experiencia
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Identifica pasos del recorrido donde aparecen fricciones, esperas, falta de informacion, abandono o quiebres
                que afectan la experiencia actual de las personas usuarias.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("medicion")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Volver a Medicion
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("formulario");
                  setErrores({});
                  cancelarEdicion();
                }}
                className="ux-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
              >
                <Plus className="h-4 w-4" />
                Nuevo momento critico
              </button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-4">
            <ResumenCard label="Momentos" value={contadores.total} tone="slate" />
            <ResumenCard label="Impacto alto" value={contadores.alto} tone="rose" />
            <ResumenCard label="Impacto medio" value={contadores.medio} tone="amber" />
            <ResumenCard label="Validados" value={contadores.validados} tone="teal" />
          </div>

          <div className="ux-card rounded-lg p-2">
            <div className="grid gap-2 sm:grid-cols-4">
              <TabButton active={tab === "formulario"} onClick={() => setTab("formulario")} icon={<ClipboardList className="h-4 w-4" />} label="Formulario" />
              <TabButton active={tab === "registros"} onClick={() => setTab("registros")} icon={<FileText className="h-4 w-4" />} label="Registros" />
              <TabButton active={tab === "lienzo"} onClick={() => setTab("lienzo")} icon={<Target className="h-4 w-4" />} label="Lienzo" />
              <TabButton active={tab === "recorrido"} onClick={() => setTab("recorrido")} icon={<Route className="h-4 w-4" />} label="Recorrido" />
            </div>
          </div>

          {loadingData ? (
            <div className="ux-card flex min-h-[320px] items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                Cargando indicadores y momentos criticos...
              </div>
            </div>
          ) : (
            <>
              {tab === "formulario" && (
                <FormularioMomento
                  form={form}
                  indicadores={indicadores}
                  indicadorSeleccionado={indicadorSeleccionado}
                  errores={errores}
                  loading={loading}
                  generandoIa={generandoIa}
                  onChange={actualizarForm}
                  onGuardar={guardarMomento}
                  onGenerarIa={generarSintesisIa}
                  onIrMedicion={() => onNavigate?.("medicion")}
                  editingId={editingId}
                  onCancelarEdicion={cancelarEdicion}
                />
              )}

              {tab === "registros" && (
                <RegistrosMomentos
                  momentos={momentos}
                  indicadores={indicadores}
                  validandoId={validandoId}
                  onVerLienzo={verLienzo}
                  onEditar={editarMomento}
                  onValidar={validarMomento}
                  onRecargar={cargarDatos}
                />
              )}

              {tab === "lienzo" && (
                <LienzoMomento
                  momento={lienzoSeleccionado}
                  momentos={momentos}
                  indicador={indicadores.find((item) => item.id === lienzoSeleccionado?.meta.indicadorId)}
                  onSeleccionar={verLienzo}
                  onCrear={() => setTab("formulario")}
                  validandoId={validandoId}
                  onEditar={editarMomento}
                  onValidar={validarMomento}
                />
              )}

              {tab === "recorrido" && (
                <RecorridoMomentos
                  momentos={momentos}
                  indicadores={indicadores}
                  validandoId={validandoId}
                  onVerLienzo={verLienzo}
                  onValidar={validarMomento}
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

function FormularioMomento({
  form,
  indicadores,
  indicadorSeleccionado,
  errores,
  loading,
  generandoIa,
  onChange,
  onGuardar,
  onGenerarIa,
  onIrMedicion,
  editingId,
  onCancelarEdicion,
}: {
  form: FormState;
  indicadores: Indicador[];
  indicadorSeleccionado?: Indicador;
  errores: Partial<Record<keyof FormState, string>>;
  loading: boolean;
  generandoIa: boolean;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onGuardar: () => void;
  onGenerarIa: () => void;
  onIrMedicion: () => void;
  editingId: string | null;
  onCancelarEdicion: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <aside className="space-y-5">
        <div className="ux-card rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Evidencia de apoyo
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Indicador o estandar asociado
          </h3>
          {indicadores.length === 0 ? (
            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Map className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Sin indicadores registrados</p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Puedes registrar el momento critico desde la observacion del recorrido. Luego podras asociarlo a un indicador de medicion.
                  </p>
                  <button
                    type="button"
                    onClick={onIrMedicion}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800 transition hover:border-amber-300"
                  >
                    Ir a Medicion
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onChange("indicadorId", "")}
                className={`w-full rounded-lg border p-4 text-left transition-all duration-150 ${
                  !form.indicadorId
                    ? "border-rose-200 bg-rose-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold leading-snug text-slate-900">Sin indicador directo</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Usar cuando el quiebre proviene de observacion cualitativa del recorrido.
                </p>
              </button>
              {indicadores.map((indicador) => {
                const active = indicador.id === form.indicadorId;
                return (
                <button
                  key={indicador.id}
                  type="button"
                  onClick={() => onChange("indicadorId", indicador.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-all duration-150 ${
                    active
                      ? "border-rose-200 bg-rose-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold leading-snug text-slate-900">{indicador.nombre}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Meta: {indicador.valor_meta ?? "sin meta"} {indicador.unidad || ""}
                  </p>
                </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Recursos complementarios
            </p>
          </div>
          <RecursosComplementarios actividad="momentos" />
        </div>
      </aside>

      <section className="ux-card rounded-lg p-5">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Lienzo de momento critico
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {editingId ? "Editar quiebre de experiencia" : "Registrar quiebre de experiencia"}
          </h3>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Referencia de evaluacion
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
              {indicadorSeleccionado?.nombre || "Sin indicador directo; el registro puede basarse en observacion del recorrido."}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Paso del recorrido"
              value={form.pasoRecorrido}
              onChange={(value) => onChange("pasoRecorrido", value)}
              error={errores.pasoRecorrido}
              placeholder="Ejemplo: revisar requisitos antes de iniciar solicitud"
            />
            <InputField
              label="Punto de contacto"
              value={form.puntoContacto}
              onChange={(value) => onChange("puntoContacto", value)}
              error={errores.puntoContacto}
              placeholder="Oficina, sitio web, call center..."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Canal"
              value={form.canal}
              onChange={(value) => onChange("canal", value)}
              placeholder="Presencial, digital, telefonico..."
            />
            <SelectField
              label="Tipo de quiebre"
              value={form.tipoQuiebre}
              options={tipoQuiebreOpciones}
              onChange={(value) => onChange("tipoQuiebre", value as TipoQuiebre)}
            />
          </div>

          <TextAreaField
            label="Momento critico detectado"
            description="Describe la friccion, espera, falta de informacion, error o riesgo de abandono."
            value={form.descripcion}
            onChange={(value) => onChange("descripcion", value)}
            error={errores.descripcion}
            placeholder="Ejemplo: la persona no entiende que documento presentar y debe volver otro dia."
          />

          <div>
            <p className="text-sm font-bold text-slate-800">Impacto observado</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {impactoOpciones.map((impacto) => (
                <button
                  key={impacto}
                  type="button"
                  onClick={() => onChange("impacto", impacto)}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize transition-all duration-150 ${
                    form.impacto === impacto
                      ? impactoClass[impacto]
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {impacto}
                </button>
              ))}
            </div>
          </div>

          <TextAreaField
            label="Senales observables"
            value={form.senalesObservables}
            onChange={(value) => onChange("senalesObservables", value)}
            placeholder="Ejemplo: consultas repetidas, reclamos, abandono de fila, documentos rechazados."
          />

          <TextAreaField
            label="Personas afectadas o magnitud estimada"
            description="Estima a quienes afecta el quiebre o su alcance dentro del recorrido."
            value={form.magnitudAfectados}
            onChange={(value) => onChange("magnitudAfectados", value)}
            error={errores.magnitudAfectados}
            placeholder="Ejemplo: afecta principalmente a personas sin clave digital; se observa en la mayoria de atenciones presenciales."
          />

          <TextAreaField
            label="Causa raiz inicial"
            value={form.causaRaiz}
            onChange={(value) => onChange("causaRaiz", value)}
            error={errores.causaRaiz}
            placeholder="Ejemplo: lenguaje tecnico y falta de guia simple visible en el primer contacto."
          />

          <TextAreaField
            label="Oportunidad de mejora"
            value={form.oportunidadMejora}
            onChange={(value) => onChange("oportunidadMejora", value)}
            error={errores.oportunidadMejora}
            placeholder="Ejemplo: crear guia paso a paso y validar requisitos antes de la atencion."
          />

          <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
                  <Bot className="h-4 w-4" />
                  IA demo
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Sintetiza el quiebre y sugiere foco de mejora para el recorrido.
                </p>
              </div>
              <button
                type="button"
                onClick={onGenerarIa}
                disabled={generandoIa}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition-all duration-150 hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generandoIa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generar sintesis
              </button>
            </div>
            <textarea
              value={form.sintesisIa}
              onChange={(event) => onChange("sintesisIa", event.target.value)}
              className="mt-4 min-h-24 w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="La sintesis IA aparecera aqui o puedes escribirla manualmente."
            />
          </div>

          <div className="flex flex-col justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
            {editingId && (
              <button
                type="button"
                onClick={onCancelarEdicion}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar edicion
              </button>
            )}
            <button
              type="button"
              onClick={onGuardar}
              disabled={loading}
              className="ux-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Guardar cambios" : "Guardar momento critico"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RegistrosMomentos({
  momentos,
  indicadores,
  validandoId,
  onVerLienzo,
  onEditar,
  onValidar,
  onRecargar,
}: {
  momentos: MomentoCritico[];
  indicadores: Indicador[];
  validandoId: string | null;
  onVerLienzo: (momento: MomentoCritico) => void;
  onEditar: (momento: MomentoCritico) => void;
  onValidar: (momento: MomentoCritico) => void;
  onRecargar: () => void;
}) {
  return (
    <section className="ux-card rounded-lg p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Registros</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Momentos criticos detectados</h3>
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
        {momentos.map((momento) => {
          const indicador = indicadores.find((item) => item.id === momento.meta.indicadorId);
          const validado = estaValidado(momento);
          return (
            <article key={momento.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {momento.punto_contacto}
                  </p>
                  <h4 className="mt-1 text-sm font-bold leading-6 text-slate-900">{momento.descripcion}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <EstadoBadge validado={validado} />
                  <Badge label={momento.impacto} tone={momento.impacto as Impacto} />
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                {indicador?.nombre || momento.meta.pasoRecorrido || "Sin indicador asociado."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerLienzo(momento)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300"
                >
                  Ver lienzo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditar(momento)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onValidar(momento)}
                  disabled={validado || validandoId === momento.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {validandoId === momento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {validado ? "Validado" : "Validar etapa"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {momentos.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">Aun no existen momentos criticos guardados.</p>
          <p className="mt-1 text-sm text-slate-500">Registra el primer quiebre de experiencia del recorrido actual.</p>
        </div>
      )}
    </section>
  );
}

function LienzoMomento({
  momento,
  momentos,
  indicador,
  onSeleccionar,
  onCrear,
  validandoId,
  onEditar,
  onValidar,
}: {
  momento: MomentoCritico | null;
  momentos: MomentoCritico[];
  indicador?: Indicador;
  onSeleccionar: (momento: MomentoCritico) => void;
  onCrear: () => void;
  validandoId: string | null;
  onEditar: (momento: MomentoCritico) => void;
  onValidar: (momento: MomentoCritico) => void;
}) {
  if (!momento) {
    return (
      <div className="ux-card rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          <Target className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">Selecciona un momento critico</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          El lienzo muestra un quiebre a la vez para mantener claro el paso, punto de contacto, causa y oportunidad.
        </p>
        <button type="button" onClick={onCrear} className="ux-button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold">
          Crear momento
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const validado = estaValidado(momento);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)]">
      <aside className="ux-card rounded-lg p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Momentos disponibles</p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">Ver uno a la vez</h3>
        <div className="mt-4 space-y-3">
          {momentos.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSeleccionar(item)}
              className={`w-full rounded-lg border p-3 text-left transition-all duration-150 ${
                item.id === momento.id
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-semibold leading-5 text-slate-800">{item.punto_contacto}</p>
              <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                {item.impacto}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="ux-card overflow-hidden rounded-lg">
        <div className="border-b border-slate-100 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Lienzo metodologico</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">{momento.punto_contacto}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <EstadoBadge validado={validado} />
              <Badge label={momento.impacto} tone={momento.impacto as Impacto} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEditar(momento)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Editar registro
            </button>
            <button
              type="button"
              onClick={() => onValidar(momento)}
              disabled={validado || validandoId === momento.id}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {validandoId === momento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {validado ? "Validado para ruta" : "Validar etapa"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <LienzoBloque titulo="Paso del recorrido" contenido={momento.meta.pasoRecorrido || "Sin paso registrado."} icon={<Route className="h-5 w-5" />} />
          <LienzoBloque titulo="Indicador asociado" contenido={indicador?.nombre || "Sin indicador asociado."} icon={<ClipboardList className="h-5 w-5" />} />
          <LienzoBloque titulo="Momento critico" contenido={momento.descripcion} icon={<AlertTriangle className="h-5 w-5" />} />
          <LienzoBloque titulo="Canal y tipo de quiebre" contenido={`${momento.meta.canal || "Sin canal"} | ${momento.meta.tipoQuiebre || "Sin tipo"}`} icon={<Layers className="h-5 w-5" />} />
          <LienzoBloque titulo="Senales observables" contenido={momento.meta.senalesObservables || "Sin senales registradas."} icon={<FileText className="h-5 w-5" />} />
          <LienzoBloque titulo="Personas afectadas o magnitud" contenido={momento.meta.magnitudAfectados || "Sin estimacion registrada."} icon={<Users className="h-5 w-5" />} />
          <LienzoBloque titulo="Causa raiz" contenido={momento.causa_raiz || "Sin causa registrada."} icon={<Target className="h-5 w-5" />} />
          <div className="md:col-span-2">
            <LienzoBloque titulo="Oportunidad de mejora" contenido={momento.oportunidad_mejora || "Sin oportunidad registrada."} icon={<Sparkles className="h-5 w-5" />} destacado />
          </div>
          <div className="md:col-span-2">
            <LienzoBloque titulo="Sintesis IA demo" contenido={momento.sintesis_ia || "Sin sintesis registrada."} icon={<Bot className="h-5 w-5" />} destacado />
          </div>
        </div>
      </section>
    </div>
  );
}

function RecorridoMomentos({
  momentos,
  indicadores,
  validandoId,
  onVerLienzo,
  onValidar,
}: {
  momentos: MomentoCritico[];
  indicadores: Indicador[];
  validandoId: string | null;
  onVerLienzo: (momento: MomentoCritico) => void;
  onValidar: (momento: MomentoCritico) => void;
}) {
  return (
    <section className="ux-card rounded-lg p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recorrido secuencial</p>
      <h3 className="mt-1 text-lg font-bold text-slate-950">Pasos y quiebres de experiencia</h3>
      <div className="mt-5 space-y-4">
        {momentos.map((momento, index) => {
          const indicador = indicadores.find((item) => item.id === momento.meta.indicadorId);
          const validado = estaValidado(momento);
          return (
            <article key={momento.id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                {index + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{momento.meta.pasoRecorrido || momento.punto_contacto}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{momento.descripcion}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-400">{indicador?.nombre || "Sin indicador asociado"}</p>
                  <EstadoBadge validado={validado} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerLienzo(momento)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300"
                >
                  Ver lienzo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onValidar(momento)}
                  disabled={validado || validandoId === momento.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {validandoId === momento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {validado ? "Validado" : "Validar"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {momentos.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No hay momentos criticos para representar en el recorrido.
        </div>
      )}
    </section>
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
    <article className={`min-h-36 rounded-lg border p-4 ${destacado ? "border-rose-100 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <span className={destacado ? "text-rose-700" : "text-slate-500"}>{icon}</span>
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
        className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
        active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResumenCard({ label, value, tone }: { label: string; value: number; tone: "slate" | "rose" | "amber" | "teal" }) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-800",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] opacity-70">{label}</p>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: Impacto }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${impactoClass[tone] || impactoClass.medio}`}>
      {label}
    </span>
  );
}

function EstadoBadge({ validado }: { validado: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        validado
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {validado ? "Validado" : "Borrador"}
    </span>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs font-semibold text-rose-600">{children}</p>;
}

function ToastList({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
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
            {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : toast.type === "error" ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
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
