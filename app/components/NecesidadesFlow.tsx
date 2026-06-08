"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, X, User } from "lucide-react";
import AsistenciaIAEtapa from "./AsistenciaIAEtapa";


interface Persona {
    id: string;
    nombre: string;
    rol: string;
}

interface Necesidad {
    id: string;
    created_at: string;
    proyecto_id: string;
    persona_id: string;
    objetivo: string;
    acciones: string;
    situacion_inicial: string;
    fricciones: string;
    impacto: Impacto;
    rol_servicio: string;
    categoria: Categoria;
    estado: EstadoNecesidad;
}

type Impacto = "Alto" | "Medio" | "Bajo";
type Categoria = "Informar" | "Tramitar" | "Soporte";
type EstadoNecesidad = "Borrador" | "Validado";

interface MetaNecesidad extends Partial<FormState> {
    estado_visual?: string;
}

interface FormState {
    persona_id: string;
    objetivo: string;
    acciones: string;
    situacion_inicial: string;
    fricciones: string;
    impacto: Impacto;
    rol_servicio: string;
    categoria: Categoria;
    estado: EstadoNecesidad;
}

interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
    process.env.NEXT_PUBLIC_PROYECTO_ID || "31576cfb-4c12-4080-a8c3-1f422b4830de";
const TOAST_DURATION_MS = 4000;

const FORM_INICIAL: FormState = {
    persona_id: "",
    objetivo: "",
    acciones: "",
    situacion_inicial: "",
    fricciones: "",
    impacto: "Medio",
    rol_servicio: "",
    categoria: "Informar",
    estado: "Borrador",
};

const OBJETIVOS_SUGERIDOS: Record<string, string> = {
    "Resolver solicitud sin volver otro día":
        "1. Revisar requisitos en web\n2. Reunir documentos físicos/digitales\n3. Acudir a oficina o portal\n4. Esperar atención\n5. Validar respuesta\n6. Hacer seguimiento",
    "Completar un trámite 100% digital":
        "1. Ingresar a plataforma\n2. Autenticarse con ClaveÚnica\n3. Buscar el trámite en el buscador\n4. Llenar formulario paso a paso\n5. Descargar comprobante",
    "Entender los requisitos del servicio":
        "1. Buscar información oficial\n2. Leer preguntas frecuentes\n3. Consultar canales de ayuda (chat/teléfono)",
};

const FRICCIONES_SUGERIDAS = [
    "Lenguaje muy técnico",
    "Caída del sistema web",
    "Tiempos de espera largos",
    "Falta de retroalimentación",
];



const NECESIDAD_META_PREFIX = "::uxlab-necesidad-meta::";

function serializarMetaNecesidad(form: FormState) {
    return `${NECESIDAD_META_PREFIX}${JSON.stringify({
        persona_id: form.persona_id,
        objetivo: form.objetivo,
        acciones: form.acciones,
        situacion_inicial: form.situacion_inicial,
        fricciones: form.fricciones,
        rol_servicio: form.rol_servicio,
        estado_visual: form.estado,
    })}`;
}

function parsearMetaNecesidad(raw?: string | null): MetaNecesidad {
    if (!raw || !raw.startsWith(NECESIDAD_META_PREFIX)) return {};

    try {
        return JSON.parse(raw.slice(NECESIDAD_META_PREFIX.length));
    } catch {
        return {};
    }
}

function normalizarEstadoNecesidad(valor?: string): EstadoNecesidad {
    if (valor === "Validado") return "Validado";
    return "Borrador";
}

function normalizarImpacto(valor?: string): Impacto {
    if (valor === "Alto" || valor === "Medio" || valor === "Bajo") return valor;
    return "Medio";
}

function normalizarCategoria(valor?: string): Categoria {
    if (valor === "Informar" || valor === "Tramitar" || valor === "Soporte") return valor;
    return "Informar";
}

function mapPersonaUsuaria(row: any): Persona {
    return {
        id: String(row.id),
        nombre: row.nombre_arquetipo || "Perfil sin nombre",
        rol: row.rol || "",
    };
}

function mapNecesidad(row: any): Necesidad {
    const meta = parsearMetaNecesidad(row.sugerencia_ia);
    return {
        id: String(row.id),
        created_at: row.created_at || "",
        proyecto_id: row.proyecto_id || PROYECTO_ID,
        persona_id: row.persona_usuaria_id || meta.persona_id || "",
        objetivo: meta.objetivo || row.descripcion || "",
        acciones: meta.acciones || "",
        situacion_inicial: meta.situacion_inicial || row.descripcion || "",
        fricciones: meta.fricciones || "",
        impacto: normalizarImpacto(row.impacto),
        rol_servicio: meta.rol_servicio || "",
        categoria: normalizarCategoria(row.categoria),
        estado: normalizarEstadoNecesidad(meta.estado_visual || row.estado),
    };
}

function formToNecesidadDb(form: FormState) {
  return {
    persona_usuaria_id: form.persona_id || null,
    descripcion: form.situacion_inicial || form.objetivo,
    categoria: form.categoria,
    impacto: form.impacto,
    estado: form.estado,
    sugerencia_ia: serializarMetaNecesidad(form),
  };
}
function estadoClass(estado: EstadoNecesidad) {
    return estado === "Validado"
        ? "bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/50"
        : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50";
}

function impactoClass(impacto: Impacto) {
    const map: Record<Impacto, string> = {
        Alto: "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200/50",
        Medio: "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border border-yellow-200/50",
        Bajo: "bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600 border border-slate-200/50",
    };
    return map[impacto];
}

function ToastList({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: number) => void;
}) {
    if (!toasts.length) return null;
    const colors: Record<Toast["type"], string> = {
        success: "bg-gradient-to-br from-teal-600 to-emerald-600",
        error: "bg-gradient-to-br from-red-500 to-rose-600",
        info: "bg-gradient-to-br from-slate-700 to-slate-800",
    };
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/10 ${colors[t.type]}`}
                >
                    <span>{t.message}</span>
                    <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity" aria-label="Cerrar notificación">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

function ConfirmDialog({
    message,
    onConfirm,
    onCancel,
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-black/10">
                <p className="text-sm text-slate-700">{message}</p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-red-600 hover:to-rose-700 hover:shadow-md"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function NecesidadesFlow({
    onNavigate
}: {
    onNavigate?: (flujo: string | null) => void;
}) {
    const [tab, setTab] = useState<"formulario" | "registros" | "lienzo">("formulario");
    const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);
    const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Necesidad | null>(null);
    const [form, setForm] = useState<FormState>(FORM_INICIAL);
    const [erroresForm, setErroresForm] = useState<Partial<Record<keyof FormState, string>>>({});
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmPendiente, setConfirmPendiente] = useState<{ id: string } | null>(null);

    const toastIdRef = useRef(0);


    const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
        const id = ++toastIdRef.current;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(
            () => setToasts((prev) => prev.filter((t) => t.id !== id)),
            TOAST_DURATION_MS
        );
    }, []);

    const removeToast = useCallback(
        (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
        []
    );


    const cargarPersonas = useCallback(async (): Promise<Persona[]> => {
        try {
            const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/personas-usuarias`);

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const resultado = (json.personas_usuarias ?? []).map(mapPersonaUsuaria);
            setPersonas(resultado);
            return resultado;
        } catch (error) {
            addToast(
                "Error al cargar perfiles: " + (error instanceof Error ? error.message : "error desconocido"),
                "error"
            );
            setPersonas([]);
            return [];
        }
    }, [addToast]);

    const cargarNecesidades = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/necesidades`);

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const resultado = (json.necesidades ?? []).map(mapNecesidad);
            setNecesidades(resultado);
            setLienzoSeleccionado((prev) =>
                prev ? (resultado.find((n: Necesidad) => n.id === prev.id) ?? null) : null
            );
        } catch (error) {
            addToast(
                "Error al cargar necesidades: " +
                    (error instanceof Error ? error.message : "error desconocido"),
                "error"
            );
        }
    }, [addToast]);

    useEffect(() => {
        (async () => {
            const personasData = await cargarPersonas();
            await cargarNecesidades();
            if (personasData.length > 0) {
                setForm((prev) =>
                    prev.persona_id === "" ? { ...prev, persona_id: personasData[0].id } : prev
                );
            }
        })();
    }, [cargarPersonas, cargarNecesidades]);


    const obtenerNombrePersona = useCallback(
        (id: string) => personas.find((p) => p.id === id)?.nombre ?? "Perfil Desconocido",
        [personas]
    );

    const resetForm = useCallback(
        (personas: Persona[]) => {
            setForm({ ...FORM_INICIAL, persona_id: personas[0]?.id ?? "" });
            setIdEnEdicion(null);
            setErroresForm({});
        },
        []
    );


    function validarForm(): boolean {
        const errores: typeof erroresForm = {};
        if (!form.persona_id) errores.persona_id = "Debes seleccionar un perfil.";
        if (!form.objetivo.trim()) errores.objetivo = "El objetivo es obligatorio.";
        if (!form.acciones.trim()) errores.acciones = "Debes ingresar las acciones.";
        setErroresForm(errores);
        return Object.keys(errores).length === 0;
    }


    async function guardarNecesidad() {
        if (!validarForm()) return;
        setLoading(true);

        const datosNecesidad = formToNecesidadDb(form);

        const res = await fetch(
            idEnEdicion ? `${API_URL}/necesidades/${idEnEdicion}` : `${API_URL}/necesidades`,
            {
                method: idEnEdicion ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    idEnEdicion
                        ? datosNecesidad
                        : { ...datosNecesidad, proyecto_id: PROYECTO_ID }
                ),
            }
        );

        setLoading(false);

        if (!res.ok) {
            addToast("Error al guardar: " + (await res.text()), "error");
        } else {
            addToast(idEnEdicion ? "¡Necesidad actualizada!" : "¡Necesidad guardada!", "success");
            resetForm(personas);
            await cargarNecesidades();
            setTab("registros");
        }
    }


    function prepararEdicion(n: Necesidad) {
        setForm({
            persona_id: n.persona_id,
            objetivo: n.objetivo,
            acciones: n.acciones,
            situacion_inicial: n.situacion_inicial ?? "",
            fricciones: n.fricciones ?? "",
            impacto: n.impacto ?? "Medio",
            rol_servicio: n.rol_servicio ?? "",
            categoria: n.categoria ?? "Informar",
            estado: n.estado ?? "Borrador",
        });
        setIdEnEdicion(n.id);
        setErroresForm({});
        setTab("formulario");
    }


    function solicitarEliminar(id: string) {
        setConfirmPendiente({ id });
    }

    async function confirmarEliminar() {
        if (!confirmPendiente) return;
        const res = await fetch(`${API_URL}/necesidades/${confirmPendiente.id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            if (lienzoSeleccionado?.id === confirmPendiente.id) setLienzoSeleccionado(null);
            addToast("Necesidad eliminada.", "info");
            await cargarNecesidades();
        } else {
            addToast("Error al eliminar: " + (await res.text()), "error");
        }
        setConfirmPendiente(null);
    }


    async function validarNecesidad(id: string) {
        const necesidad = necesidades.find((n) => n.id === id);
        if (!necesidad) return;

        const formValidado: FormState = {
            persona_id: necesidad.persona_id,
            objetivo: necesidad.objetivo,
            acciones: necesidad.acciones,
            situacion_inicial: necesidad.situacion_inicial,
            fricciones: necesidad.fricciones,
            impacto: necesidad.impacto,
            rol_servicio: necesidad.rol_servicio,
            categoria: necesidad.categoria,
            estado: "Validado",
        };

        const res = await fetch(`${API_URL}/necesidades/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estado: "Validado",
                sugerencia_ia: serializarMetaNecesidad(formValidado),
            }),
        });

        if (res.ok) {
    addToast("Necesidad validada correctamente.", "success");
    await cargarNecesidades();

    window.dispatchEvent(
        new CustomEvent("actualizar-ruta-proposito", {
            detail: { siguienteEtapa: 5 },
        })
    );
} else {
    addToast("Error al validar: " + (await res.text()), "error");
}
    }

    function verFicha(n: Necesidad) {
        setLienzoSeleccionado(n);
        setTab("lienzo");
    }


    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900">
            <ToastList toasts={toasts} onRemove={removeToast} />

            {confirmPendiente && (
                <ConfirmDialog
                    message="¿Seguro que deseas eliminar esta necesidad? Esta acción no se puede deshacer."
                    onConfirm={confirmarEliminar}
                    onCancel={() => setConfirmPendiente(null)}
                />
            )}

            <div className="flex">
                <aside className="hidden min-h-screen w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 lg:block">
                    <div className="text-2xl font-bold bg-gradient-to-br from-teal-700 to-emerald-700 bg-clip-text text-transparent">SSP·UXLab</div>
                    <nav className="mt-10 space-y-1 text-sm flex flex-col items-start">
                        {(
                            [
                                ["← Volver al Catálogo", null, false],
                                ["Investigar", "investigacion", false],
                                ["Definir Personas", "personas", false],
                                ["Habilitación y Expectativas", "habilitacion", false],
                                ["Definir Necesidades", "necesidades", true],
                                ["Vinculación", "vinculacion", false],
                                ["Medición", "medicion", false],
                                ["Momentos Críticos", "momentos", false],
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

                                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Necesidades</h1>
                                <p className="mt-1 text-slate-500 leading-relaxed">
                                    Comprende el problema completo, las motivaciones de las personas y las oportunidades de mejora del servicio.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-6">
                        <div className="mb-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Objetivo</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                Identificar y documentar las necesidades, problemas y fricciones que enfrentan
                                las personas usuarias durante su interacción con el servicio.
                            </p>
                        </div>

                        <AsistenciaIAEtapa etapa={4} contexto="Necesidades" />

                        <div className="mb-6 flex gap-6 border-b border-slate-200/80">
                            {(
                                [
                                    ["formulario", idEnEdicion ? "Editando necesidad…" : "Formulario"],
                                    ["registros", "Necesidades guardadas"],
                                    ["lienzo", "Tabla Priorizada (Lienzo)"],
                                ] as [typeof tab, string][]
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`border-b-2 px-2 pb-3 text-sm font-semibold transition-all duration-150 ${tab === key
                                        ? "border-teal-600 text-teal-700"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === "formulario" && (
                            <>
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Herramienta principal</p>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                                        <h2 className="text-xl font-bold tracking-tight">
                                            Herramienta: Mapa de Problemas y Necesidades
                                        </h2>
                                        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                                            Esta actividad permite profundizar en los motivos que impulsan a las personas a
                                            interactuar con un servicio público, más allá de los trámites explícitos. Estas
                                            motivaciones suelen estar vinculadas a{" "}
                                            <strong>emociones, valores, temores o situaciones vitales</strong> que dan
                                            sentido a la búsqueda de ayuda institucional.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50 space-y-5">
                                        <div>
                                            <label className="font-semibold text-sm text-slate-700">
                                                Perfil Asociado (Persona Usuaria)
                                            </label>
                                            {personas.length === 0 ? (
                                                <p className="mt-2 text-xs text-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl px-3 py-2">
                                                    No hay perfiles creados aún. Crea uno primero en «Definir Personas».
                                                </p>
                                            ) : (
                                                <select
                                                    value={form.persona_id}
                                                    onChange={(e) => {
                                                        setForm({ ...form, persona_id: e.target.value });
                                                        if (erroresForm.persona_id)
                                                            setErroresForm({ ...erroresForm, persona_id: undefined });
                                                    }}
                                                    className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 ${erroresForm.persona_id ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <option value="" disabled>
                                                        Selecciona un perfil creado previamente...
                                                    </option>
                                                    {personas.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nombre} ({p.rol})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {erroresForm.persona_id && (
                                                <p className="mt-1 text-xs text-red-500">{erroresForm.persona_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm text-slate-700">Situación Vital / Inicial</label>
                                            <textarea
                                                value={form.situacion_inicial}
                                                onChange={(e) =>
                                                    setForm({ ...form, situacion_inicial: e.target.value })
                                                }
                                                placeholder="Ej: Acaba de perder su empleo y busca orientación..."
                                                className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm text-slate-700">Objetivo de la Persona</label>
                                            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                <span className="text-xs text-slate-500 font-medium py-1">
                                                    Sugerencias:
                                                </span>
                                                {Object.keys(OBJETIVOS_SUGERIDOS).map((obj) => (
                                                    <button
                                                        key={obj}
                                                        type="button"
                                                        onClick={() => {
                                                            setForm({
                                                                ...form,
                                                                objetivo: obj,
                                                                acciones: OBJETIVOS_SUGERIDOS[obj],
                                                            });
                                                            setErroresForm((prev) => ({
                                                                ...prev,
                                                                objetivo: undefined,
                                                                acciones: undefined,
                                                            }));
                                                        }}
                                                        className="rounded-full border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-0.5 text-xs text-teal-700 transition-all duration-150 hover:from-teal-100 hover:to-emerald-100 shadow-sm"
                                                    >
                                                        + {obj}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={form.objetivo}
                                                onChange={(e) => {
                                                    setForm({ ...form, objetivo: e.target.value });
                                                    if (erroresForm.objetivo)
                                                        setErroresForm({ ...erroresForm, objetivo: undefined });
                                                }}
                                                placeholder="¿Qué quiere lograr o resolver?"
                                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 ${erroresForm.objetivo ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                    }`}
                                            />
                                            {erroresForm.objetivo && (
                                                <p className="mt-1 text-xs text-red-500">{erroresForm.objetivo}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Acciones que debe realizar</label>
                                                <textarea
                                                    value={form.acciones}
                                                    onChange={(e) => {
                                                        setForm({ ...form, acciones: e.target.value });
                                                        if (erroresForm.acciones)
                                                            setErroresForm({ ...erroresForm, acciones: undefined });
                                                    }}
                                                    placeholder="Paso a paso de lo que la persona hace..."
                                                    className={`mt-2 min-h-32 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 ${erroresForm.acciones ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                />
                                                {erroresForm.acciones && (
                                                    <p className="mt-1 text-xs text-red-500">{erroresForm.acciones}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm text-teal-800">
                                                    Rol Institucional del Servicio
                                                </label>
                                                <textarea
                                                    value={form.rol_servicio}
                                                    onChange={(e) => setForm({ ...form, rol_servicio: e.target.value })}
                                                    placeholder="¿Cómo responde o qué facilita la institución en cada paso?"
                                                    className="mt-2 min-h-32 w-full rounded-xl border border-teal-200/60 bg-teal-50/30 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 hover:border-teal-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm text-red-700">
                                                Fricciones Detectadas
                                            </label>
                                            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                {FRICCIONES_SUGERIDAS.map((fric) => (
                                                    <button
                                                        key={fric}
                                                        type="button"
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                fricciones: form.fricciones
                                                                    ? `${form.fricciones}, ${fric}`
                                                                    : fric,
                                                            })
                                                        }
                                                        className="rounded-full border border-orange-200/60 bg-gradient-to-r from-orange-50 to-amber-50 px-2 py-0.5 text-[11px] text-orange-700 transition-all duration-150 hover:from-orange-100 hover:to-amber-100 shadow-sm"
                                                    >
                                                        + {fric}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={form.fricciones}
                                                onChange={(e) => setForm({ ...form, fricciones: e.target.value })}
                                                placeholder="Dolores, demoras o bloqueos encontrados..."
                                                className="w-full min-h-20 rounded-xl border border-red-200/60 bg-red-50/40 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-red-500 focus:ring-2 focus:ring-red-100 hover:border-red-300"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Categoría</label>
                                                <select
                                                    value={form.categoria}
                                                    onChange={(e) =>
                                                        setForm({ ...form, categoria: e.target.value as Categoria })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                >
                                                    <option>Informar</option>
                                                    <option>Tramitar</option>
                                                    <option>Soporte</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Impacto</label>
                                                <select
                                                    value={form.impacto}
                                                    onChange={(e) =>
                                                        setForm({ ...form, impacto: e.target.value as Impacto })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                >
                                                    <option>Alto</option>
                                                    <option>Medio</option>
                                                    <option>Bajo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Estado</label>
                                                <select
                                                    value={form.estado}
                                                    onChange={(e) =>
                                                        setForm({ ...form, estado: e.target.value as EstadoNecesidad })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                >
                                                    <option>Borrador</option>
                                                    <option>Validado</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        {idEnEdicion && (
                                            <button
                                                type="button"
                                                onClick={() => resetForm(personas)}
                                                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                                            >
                                                Cancelar edición
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={guardarNecesidad}
                                            disabled={loading}
                                            className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
                                        >
                                            {loading
                                                ? "Guardando…"
                                                : idEnEdicion
                                                    ? "Actualizar Necesidad"
                                                    : "Guardar necesidad"}
                                        </button>
                                    </div>
                                </div>

                                <aside className="space-y-5">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                                        <h3 className="font-bold text-sm text-slate-800">Mapa Priorizado</h3>
                                        <ul className="mt-4 space-y-3 text-[13px] text-slate-700">
                                            {[
                                                "Vinculación 1:1 con Perfil",
                                                "Conjunto de objetivos identificados",
                                                "Fricciones y Rol del Servicio",
                                                "Impacto y Estado definidos",
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

                        {tab === "registros" && (
                            <>
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Registros guardados</p>
                                </div>
                                <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                                    <h2 className="text-xl font-bold tracking-tight mb-6">Necesidades y Problemas Guardados</h2>
                                    {necesidades.length === 0 ? (
                                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-8 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50">
                                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-600">Aún no hay necesidades guardadas</p>
                                                <p className="mt-1 text-xs text-slate-400">Completa el formulario y registra la primera necesidad o problema detectado.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                            {necesidades.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`rounded-2xl border p-5 shadow-sm space-y-3 transition-all duration-200 ${
                                                        lienzoSeleccionado?.id === n.id
                                                            ? "border-teal-400/60 bg-gradient-to-r from-teal-50/60 to-emerald-50/60 shadow-md shadow-teal-100/30"
                                                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                                                            <User className="h-3.5 w-3.5 inline mr-1 text-slate-500" aria-hidden="true" /> {obtenerNombrePersona(n.persona_id)}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${impactoClass(
                                                                n.impacto
                                                            )}`}
                                                        >
                                                            Impacto {n.impacto}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-bold text-slate-800 text-md leading-tight">
                                                        {n.objetivo}
                                                    </h3>

                                                    <div className="flex gap-2">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm ${estadoClass(
                                                                n.estado
                                                            )}`}
                                                        >
                                                            {n.estado}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium py-0.5">
                                                            Categoría: {n.categoria}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                                                        <button
                                                            onClick={() => verFicha(n)}
                                                            className="text-xs font-semibold text-teal-700 transition-all duration-150 border border-teal-200/60 px-3 py-1 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 shadow-sm"
                                                        >
                                                            Ver Ficha
                                                        </button>
                                                        <button
                                                            onClick={() => prepararEdicion(n)}
                                                            className="text-xs font-semibold text-slate-600 transition-all duration-150 border border-slate-200/60 px-3 py-1 rounded-lg hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => validarNecesidad(n.id)}
                                                            className="text-xs font-semibold text-green-700 transition-all duration-150 border border-green-200/60 px-3 py-1 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 shadow-sm"
                                                        >
                                                            Validar
                                                        </button>
                                                        <button
                                                            onClick={() => solicitarEliminar(n.id)}
                                                            className="text-xs font-semibold text-red-600 transition-all duration-150 border border-red-200/60 px-3 py-1 rounded-lg hover:border-red-300 hover:bg-red-50 hover:shadow-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <aside className="hidden xl:block">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50 sticky top-6">
                                        <h3 className="font-bold text-slate-800">Acciones de Registros</h3>
                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                            Haz clic en "Ver Ficha" para revisar todo el mapa de fricciones y las acciones
                                            sugeridas de forma consolidada.
                                        </p>
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
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-md shadow-slate-100/50">
                                    {!lienzoSeleccionado ? (
                                        <p className="text-sm text-slate-500 text-center py-10">
                                            Selecciona "Ver Ficha" en la pestaña de registros para visualizar el lienzo.
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start border-b border-slate-200/80 pb-5">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                                            <User className="h-3.5 w-3.5 inline mr-1 text-slate-500" aria-hidden="true" /> Perfil: {obtenerNombrePersona(lienzoSeleccionado.persona_id)}
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${impactoClass(
                                                                lienzoSeleccionado.impacto
                                                            )}`}
                                                        >
                                                            Impacto {lienzoSeleccionado.impacto}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                                                        Objetivo: {lienzoSeleccionado.objetivo}
                                                    </h2>
                                                </div>
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${estadoClass(
                                                        lienzoSeleccionado.estado
                                                    )}`}
                                                >
                                                    {lienzoSeleccionado.estado}
                                                </span>
                                            </div>

                                            {lienzoSeleccionado.situacion_inicial && (
                                                <div className="bg-gradient-to-b from-slate-50 to-slate-100/30 p-4 rounded-xl border border-slate-100/80 shadow-sm">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        Situación Inicial / Vital
                                                    </h3>
                                                    <p className="text-slate-700 text-sm italic leading-relaxed">
                                                        "{lienzoSeleccionado.situacion_inicial}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Acciones de la Persona
                                                    </h3>
                                                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                        {lienzoSeleccionado.acciones}
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-b from-teal-50/30 to-teal-50/10 border border-teal-100/60 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                                    <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-3">
                                                        Rol Institucional del Servicio
                                                    </h3>
                                                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                        {lienzoSeleccionado.rol_servicio || "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            {lienzoSeleccionado.fricciones && (
                                                <div className="bg-gradient-to-b from-red-50/50 to-red-50/20 border border-red-100/60 p-5 rounded-xl shadow-sm">
                                                    <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                                                        Fricciones Detectadas
                                                    </h3>
                                                    <p className="text-sm text-red-900 leading-relaxed">{lienzoSeleccionado.fricciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <aside className="space-y-5">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50">
                                        <h3 className="font-bold text-slate-800 mb-4">Acciones del Lienzo</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setTab("registros")}
                                                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                                            >
                                                Volver al listado
                                            </button>
                                            {lienzoSeleccionado && (
                                                <>
                                                    <button
                                                        onClick={() => prepararEdicion(lienzoSeleccionado)}
                                                        className="w-full rounded-xl border border-teal-300/60 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                                                    >
                                                        Editar Necesidad
                                                    </button>
                                                    <button
                                                        onClick={() => validarNecesidad(lienzoSeleccionado.id)}
                                                        className="w-full rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                                                    >
                                                        Validar Necesidad
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
