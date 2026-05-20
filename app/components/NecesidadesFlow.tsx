"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";


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


const PROYECTO_ID = "31576cfb-4c12-4080-a8c3-1f422b4830de";
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


function estadoClass(estado: EstadoNecesidad) {
    return estado === "Validado"
        ? "bg-teal-100 text-teal-700"
        : "bg-amber-100 text-amber-700";
}

function impactoClass(impacto: Impacto) {
    const map: Record<Impacto, string> = {
        Alto: "bg-red-100 text-red-800",
        Medio: "bg-yellow-100 text-yellow-800",
        Bajo: "bg-slate-100 text-slate-600",
    };
    return map[impacto];
}

function generarSugerenciaIA(form: FormState): string {
    if (form.impacto === "Alto") {
        return "Una fricción de impacto ALTO requiere que el «Rol del Servicio» incluya una solución prioritaria documentada.";
    }
    if (form.categoria === "Informar") {
        return "En categoría «Informar», la fricción suele ser la confusión de canales. Sugerimos enfocarse en orientación clara y acceso directo a la información.";
    }
    if (form.fricciones.trim().length > 5) {
        return "Analizando las fricciones, parece haber una brecha operativa. Valida si el sistema puede automatizar ese paso o simplificar el flujo.";
    }
    return "El mapa parece equilibrado. Valida si las acciones de la persona se corresponden realmente con el objetivo declarado.";
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
        success: "bg-teal-600",
        error: "bg-red-500",
        info: "bg-slate-700",
    };
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${colors[t.type]}`}
                >
                    <span>{t.message}</span>
                    <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
                        ✕
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <p className="text-sm text-slate-700">{message}</p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function NecesidadesFlow() {
    const [tab, setTab] = useState<"formulario" | "registros" | "lienzo">("formulario");
    const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);
    const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Necesidad | null>(null);
    const [form, setForm] = useState<FormState>(FORM_INICIAL);
    const [erroresForm, setErroresForm] = useState<Partial<Record<keyof FormState, string>>>({});
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [sugerenciaIA, setSugerenciaIA] = useState<string | null>(null);
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
        const { data } = await supabase.from("personas").select("id, nombre, rol");
        const resultado = (data ?? []) as Persona[];
        setPersonas(resultado);
        return resultado;
    }, []);

    const cargarNecesidades = useCallback(async () => {
        const { data, error } = await supabase
            .from("necesidades")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            const resultado = data as Necesidad[];
            setNecesidades(resultado);
            setLienzoSeleccionado((prev) =>
                prev ? (resultado.find((n) => n.id === prev.id) ?? null) : null
            );
        }
    }, []);

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
            setSugerenciaIA(null);
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

        const datosNecesidad = {
            persona_id: form.persona_id,
            objetivo: form.objetivo,
            acciones: form.acciones,
            situacion_inicial: form.situacion_inicial,
            fricciones: form.fricciones,
            impacto: form.impacto,
            rol_servicio: form.rol_servicio,
            categoria: form.categoria,
            estado: form.estado,
        };

        const { error } = idEnEdicion
            ? await supabase.from("necesidades").update(datosNecesidad).eq("id", idEnEdicion)
            : await supabase
                .from("necesidades")
                .insert([{ ...datosNecesidad, proyecto_id: PROYECTO_ID }]);

        setLoading(false);

        if (error) {
            addToast("Error al guardar: " + error.message, "error");
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
        setSugerenciaIA(null);
        setErroresForm({});
        setTab("formulario");
    }


    function solicitarEliminar(id: string) {
        setConfirmPendiente({ id });
    }

    async function confirmarEliminar() {
        if (!confirmPendiente) return;
        const { error } = await supabase
            .from("necesidades")
            .delete()
            .eq("id", confirmPendiente.id);
        if (!error) {
            if (lienzoSeleccionado?.id === confirmPendiente.id) setLienzoSeleccionado(null);
            addToast("Necesidad eliminada.", "info");
            await cargarNecesidades();
        } else {
            addToast("Error al eliminar: " + error.message, "error");
        }
        setConfirmPendiente(null);
    }


    async function validarNecesidad(id: string) {
        const { error } = await supabase
            .from("necesidades")
            .update({ estado: "Validado" })
            .eq("id", id);
        if (!error) {
            addToast("Necesidad validada correctamente.", "success");
            await cargarNecesidades();
        } else {
            addToast("Error al validar: " + error.message, "error");
        }
    }

    function verFicha(n: Necesidad) {
        setLienzoSeleccionado(n);
        setTab("lienzo");
    }


    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <ToastList toasts={toasts} onRemove={removeToast} />

            {confirmPendiente && (
                <ConfirmDialog
                    message="¿Seguro que deseas eliminar esta necesidad? Esta acción no se puede deshacer."
                    onConfirm={confirmarEliminar}
                    onCancel={() => setConfirmPendiente(null)}
                />
            )}

            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
                    <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>
                    <nav className="mt-10 space-y-2 text-sm">
                        {(
                            [
                                ["← Volver al propósito", false],
                                ["Inicio del propósito", false],
                                ["Investigar", false],
                                ["Definir Personas", false],
                                ["Habilitación y Expectativas", false],
                                ["Definir Necesidades", true],
                                ["Idear", false],
                                ["Prototipar", false],
                                ["Evaluar", false],
                                ["Implementar", false],
                            ] as [string, boolean][]
                        ).map(([label, active]) => (
                            <div
                                key={label}
                                className={`rounded-xl px-3 py-3 ${active ? "bg-teal-50 font-semibold text-teal-700" : "text-slate-600"
                                    }`}
                            >
                                {label}
                            </div>
                        ))}
                    </nav>
                </aside>

                <section className="w-full">
                    <header className="border-b border-slate-200 bg-white px-6 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm">
                                    Propósito 1 · Diseñar servicios centrados en las personas
                                </div>
                                <h1 className="mt-6 text-4xl font-bold">Necesidades</h1>
                                <p className="mt-1 text-slate-500">
                                    Mapeo e identificación exacta de fricciones y roles del servicio.
                                </p>
                            </div>
                            <div className="min-w-72">
                                <div className="text-center text-3xl font-bold">29%</div>
                                <div className="text-center text-sm text-slate-500">Avance global</div>
                                <div className="mt-3 h-3 rounded-full bg-slate-200">
                                    <div className="h-3 w-[29%] rounded-full bg-teal-600" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-6">
                        <div className="mb-6 flex gap-6 border-b border-slate-200">
                            {(
                                [
                                    ["formulario", idEnEdicion ? "Editando Necesidad…" : "Formulario"],
                                    ["registros", "Necesidades Guardadas"],
                                    ["lienzo", "Tabla Priorizada (Lienzo)"],
                                ] as [typeof tab, string][]
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`border-b-2 px-2 pb-3 text-sm font-semibold ${tab === key
                                        ? "border-teal-600 text-teal-700"
                                        : "border-transparent text-slate-500"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === "formulario" && (
                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                                <div className="space-y-6">
                                    {/* Descripción */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <h2 className="text-xl font-bold">
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

                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                                        <div>
                                            <label className="font-semibold text-sm">
                                                Perfil Asociado (Persona Usuaria)
                                            </label>
                                            {personas.length === 0 ? (
                                                <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
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
                                                    className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-teal-50/20 focus:border-teal-600 ${erroresForm.persona_id ? "border-red-400" : "border-slate-200"
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
                                            <label className="font-semibold text-sm">Situación Vital / Inicial</label>
                                            <textarea
                                                value={form.situacion_inicial}
                                                onChange={(e) =>
                                                    setForm({ ...form, situacion_inicial: e.target.value })
                                                }
                                                placeholder="Ej: Acaba de perder su empleo y busca orientación..."
                                                className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm">Objetivo de la Persona</label>
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
                                                        className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100"
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
                                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-teal-600 ${erroresForm.objetivo ? "border-red-400 bg-red-50" : "border-slate-200"
                                                    }`}
                                            />
                                            {erroresForm.objetivo && (
                                                <p className="mt-1 text-xs text-red-500">{erroresForm.objetivo}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm">Acciones que debe realizar</label>
                                                <textarea
                                                    value={form.acciones}
                                                    onChange={(e) => {
                                                        setForm({ ...form, acciones: e.target.value });
                                                        if (erroresForm.acciones)
                                                            setErroresForm({ ...erroresForm, acciones: undefined });
                                                    }}
                                                    placeholder="Paso a paso de lo que la persona hace..."
                                                    className={`mt-2 min-h-32 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-teal-600 ${erroresForm.acciones ? "border-red-400 bg-red-50" : "border-slate-200"
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
                                                    className="mt-2 min-h-32 w-full rounded-xl border border-teal-200 bg-teal-50/30 px-3 py-2 text-sm outline-none focus:border-teal-600"
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
                                                        className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700 hover:bg-orange-100"
                                                    >
                                                        + {fric}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={form.fricciones}
                                                onChange={(e) => setForm({ ...form, fricciones: e.target.value })}
                                                placeholder="Dolores, demoras o bloqueos encontrados..."
                                                className="w-full min-h-20 rounded-xl border border-red-200 bg-red-50/40 px-3 py-2 text-sm outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm">Categoría</label>
                                                <select
                                                    value={form.categoria}
                                                    onChange={(e) =>
                                                        setForm({ ...form, categoria: e.target.value as Categoria })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Informar</option>
                                                    <option>Tramitar</option>
                                                    <option>Soporte</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">Impacto</label>
                                                <select
                                                    value={form.impacto}
                                                    onChange={(e) =>
                                                        setForm({ ...form, impacto: e.target.value as Impacto })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Alto</option>
                                                    <option>Medio</option>
                                                    <option>Bajo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">Estado</label>
                                                <select
                                                    value={form.estado}
                                                    onChange={(e) =>
                                                        setForm({ ...form, estado: e.target.value as EstadoNecesidad })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
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
                                                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                            >
                                                Cancelar edición
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={guardarNecesidad}
                                            disabled={loading}
                                            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                                        >
                                            {loading
                                                ? "Guardando…"
                                                : idEnEdicion
                                                    ? "Actualizar Necesidad"
                                                    : "Guardar Necesidad"}
                                        </button>
                                    </div>
                                </div>

                                <aside className="space-y-6">
                                    <div className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                                            <span>✨</span> ASISTENCIA METODOLÓGICA UXLab AI
                                        </div>
                                        <div className="text-sm bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                                            <p className="text-slate-600 text-xs leading-relaxed">
                                                Genera sugerencias dinámicas de fricciones metodológicas basadas en los
                                                datos del formulario.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setSugerenciaIA(generarSugerenciaIA(form))}
                                                className="w-full text-center rounded-xl bg-teal-50 border border-teal-200 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
                                            >
                                                Mostrar sugerencia
                                            </button>
                                            {sugerenciaIA && (
                                                <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800 leading-relaxed">
                                                    <span className="font-bold block mb-1">UXLab AI</span>
                                                    {sugerenciaIA}
                                                    <button
                                                        onClick={() => setSugerenciaIA(null)}
                                                        className="mt-2 block text-teal-500 hover:text-teal-700 text-[10px]"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <h3 className="font-bold text-sm">Mapa Priorizado</h3>
                                        <ul className="mt-4 space-y-3 text-[13px] text-slate-700">
                                            {[
                                                "Vinculación 1:1 con Perfil",
                                                "Pool de objetivos mapeados",
                                                "Fricciones y Rol del Servicio",
                                                "Impacto y Estado definidos",
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
                        )}

                        {tab === "registros" && (
                            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <h2 className="text-xl font-bold mb-6">Necesidades y Problemas Guardados</h2>
                                    {necesidades.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-10">
                                            Aún no hay necesidades guardadas. Crea la primera desde el formulario.
                                        </p>
                                    ) : (
                                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                            {necesidades.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`rounded-2xl border p-5 shadow-sm space-y-3 ${lienzoSeleccionado?.id === n.id
                                                        ? "border-teal-600 bg-teal-50/40"
                                                        : "border-slate-200 bg-white"
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                                                            👤 {obtenerNombrePersona(n.persona_id)}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${impactoClass(
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
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${estadoClass(
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
                                                            className="text-xs font-semibold text-teal-700 hover:text-teal-900 border border-teal-200 px-3 py-1 rounded bg-teal-50"
                                                        >
                                                            Ver Ficha
                                                        </button>
                                                        <button
                                                            onClick={() => prepararEdicion(n)}
                                                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1 rounded"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => validarNecesidad(n.id)}
                                                            className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-200 px-3 py-1 rounded bg-green-50"
                                                        >
                                                            Validar
                                                        </button>
                                                        <button
                                                            onClick={() => solicitarEliminar(n.id)}
                                                            className="text-xs font-semibold text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded"
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
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 sticky top-6">
                                        <h3 className="font-bold">Acciones de Registros</h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Haz clic en "Ver Ficha" para revisar todo el mapa de fricciones y las acciones
                                            sugeridas de forma consolidada.
                                        </p>
                                    </div>
                                </aside>
                            </div>
                        )}

                        {tab === "lienzo" && (
                            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                                <div className="rounded-2xl border border-slate-200 bg-white p-8">
                                    {!lienzoSeleccionado ? (
                                        <p className="text-sm text-slate-500 text-center py-10">
                                            Selecciona "Ver Ficha" en la pestaña de registros para visualizar el lienzo.
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                                            👤 Perfil: {obtenerNombrePersona(lienzoSeleccionado.persona_id)}
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${impactoClass(
                                                                lienzoSeleccionado.impacto
                                                            )}`}
                                                        >
                                                            Impacto {lienzoSeleccionado.impacto}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                                        Objetivo: {lienzoSeleccionado.objetivo}
                                                    </h2>
                                                </div>
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${estadoClass(
                                                        lienzoSeleccionado.estado
                                                    )}`}
                                                >
                                                    {lienzoSeleccionado.estado}
                                                </span>
                                            </div>

                                            {lienzoSeleccionado.situacion_inicial && (
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        Situación Inicial / Vital
                                                    </h3>
                                                    <p className="text-slate-700 text-sm italic">
                                                        "{lienzoSeleccionado.situacion_inicial}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-white border border-slate-200 p-5 rounded-xl">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Acciones de la Persona
                                                    </h3>
                                                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                                        {lienzoSeleccionado.acciones}
                                                    </div>
                                                </div>
                                                <div className="bg-teal-50/30 border border-teal-100 p-5 rounded-xl">
                                                    <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-3">
                                                        Rol Institucional del Servicio
                                                    </h3>
                                                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                                        {lienzoSeleccionado.rol_servicio || "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            {lienzoSeleccionado.fricciones && (
                                                <div className="bg-red-50/50 border border-red-100 p-5 rounded-xl">
                                                    <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                                                        Fricciones Detectadas
                                                    </h3>
                                                    <p className="text-sm text-red-900">{lienzoSeleccionado.fricciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <aside className="space-y-6">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <h3 className="font-bold mb-4">Acciones del Lienzo</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setTab("registros")}
                                                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Volver al listado
                                            </button>
                                            {lienzoSeleccionado && (
                                                <>
                                                    <button
                                                        onClick={() => prepararEdicion(lienzoSeleccionado)}
                                                        className="w-full rounded-xl border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                                                    >
                                                        Editar Necesidad
                                                    </button>
                                                    <button
                                                        onClick={() => validarNecesidad(lienzoSeleccionado.id)}
                                                        className="w-full rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                                    >
                                                        Validar Necesidad
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}