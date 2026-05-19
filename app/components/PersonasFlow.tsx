"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";


interface Perfil {
    id: string;
    created_at: string;
    proyecto_id: string;
    rol: string;
    nombre: string;
    perfil: string;
    nivel_digital: NivelDigital;
    canales_contacto: CanalContacto;
    expectativas: string;
    relacion_servicio: RelacionServicio;
    necesidades_tag: string;
    barreras: string;
    motivaciones: string;
    estado_perfil: EstadoPerfil;
}

type NivelDigital = "Nulo" | "Básico" | "Intermedio" | "Avanzado";
type CanalContacto = "Presencial" | "Telefónico" | "Digital";
type RelacionServicio = "Uso frecuente" | "Uso esporádico" | "Primer acceso";
type EstadoPerfil = "Borrador" | "Validado";
type RolPerfil = "Persona Usuaria" | "PEC" | "Persona Funcionaria" | "Otros Roles";

interface FormState {
    rol: RolPerfil;
    nombre: string;
    acceso: string;
    nivel_digital: NivelDigital;
    canales_contacto: CanalContacto;
    expectativas: string;
    relacion_servicio: RelacionServicio;
    necesidades_tag: string;
    barreras: string;
    motivaciones: string;
    estado_perfil: EstadoPerfil;
}

interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
}


const PROYECTO_ID = "31576cfb-4c12-4080-a8c3-1f422b4830de";

const FORM_INICIAL: FormState = {
    rol: "Persona Usuaria",
    nombre: "",
    acceso: "",
    nivel_digital: "Intermedio",
    canales_contacto: "Digital",
    expectativas: "",
    relacion_servicio: "Uso frecuente",
    necesidades_tag: "",
    barreras: "",
    motivaciones: "",
    estado_perfil: "Borrador",
};

const SUGERENCIAS_INVESTIGACION = [
    "Personas mayores",
    "Baja alfabetización digital",
    "Uso esporádico del servicio",
];


function estadoClass(estado: EstadoPerfil) {
    return estado === "Validado"
        ? "bg-teal-100 text-teal-700"
        : "bg-amber-100 text-amber-700";
}

function generarSugerenciaIA(form: FormState): string {
    if (form.nivel_digital === "Nulo" || form.nivel_digital === "Básico") {
        return `Para «${form.nombre || "este perfil"}», se detecta un nivel digital bajo. Prioriza canales presenciales y añade la barrera "Dificultad con contraseñas".`;
    }
    if (form.rol === "Persona Funcionaria") {
        return "Los perfiles funcionarios suelen valorar la eficiencia. Añade la motivación «Optimización de tiempos internos».";
    }
    if (form.relacion_servicio === "Primer acceso") {
        return "Al ser el primer acceso, la barrera principal es el desconocimiento del lenguaje técnico. Se recomienda lenguaje claro.";
    }
    return "Análisis completado. El perfil parece equilibrado. Valida que las expectativas coincidan con los canales elegidos.";
}


function ToastList({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
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
                    <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
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

export default function PersonasFlow() {
    const [tab, setTab] = useState<"formulario" | "registros" | "lienzo">("formulario");
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);
    const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Perfil | null>(null);
    const [form, setForm] = useState<FormState>(FORM_INICIAL);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [toastCounter, setToastCounter] = useState(0);
    const [sugerenciaIA, setSugerenciaIA] = useState<string | null>(null);
    const [confirmPendiente, setConfirmPendiente] = useState<{ id: string } | null>(null);
    const [erroresForm, setErroresForm] = useState<Partial<Record<keyof FormState, string>>>({});


    const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
        const id = toastCounter + 1;
        setToastCounter(id);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }, [toastCounter]);

    const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));


    const cargarPerfiles = useCallback(async () => {
        const { data, error } = await supabase
            .from("personas")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setPerfiles(data as Perfil[]);
            setLienzoSeleccionado((prev) =>
                prev ? ((data as Perfil[]).find((p) => p.id === prev.id) ?? null) : null
            );
        }
    }, []);

    useEffect(() => {
        cargarPerfiles();
    }, [cargarPerfiles]);

    function validarForm(): boolean {
        const errores: typeof erroresForm = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
        if (!form.acceso.trim()) errores.acceso = "La descripción es obligatoria.";
        setErroresForm(errores);
        return Object.keys(errores).length === 0;
    }

    async function guardarPerfil() {
        if (!validarForm()) return;

        setLoading(true);

        const datosPerfil = {
            rol: form.rol,
            nombre: form.nombre,
            perfil: form.acceso,
            nivel_digital: form.nivel_digital,
            canales_contacto: form.canales_contacto,
            expectativas: form.expectativas,
            relacion_servicio: form.relacion_servicio,
            necesidades_tag: form.necesidades_tag,
            barreras: form.barreras,
            motivaciones: form.motivaciones,
            estado_perfil: form.estado_perfil,
        };

        const { error } = idEnEdicion
            ? await supabase.from("personas").update(datosPerfil).eq("id", idEnEdicion)
            : await supabase.from("personas").insert([{ ...datosPerfil, proyecto_id: PROYECTO_ID }]);

        setLoading(false);

        if (error) {
            addToast("Error al guardar: " + error.message, "error");
        } else {
            addToast(idEnEdicion ? "¡Perfil actualizado!" : "¡Perfil guardado!", "success");
            setForm(FORM_INICIAL);
            setIdEnEdicion(null);
            setSugerenciaIA(null);
            await cargarPerfiles();
            setTab("registros");
        }
    }


    function prepararEdicion(p: Perfil) {
        setForm({
            rol: p.rol as RolPerfil,
            nombre: p.nombre,
            acceso: p.perfil,
            nivel_digital: p.nivel_digital ?? "Intermedio",
            canales_contacto: p.canales_contacto ?? "Digital",
            expectativas: p.expectativas ?? "",
            relacion_servicio: p.relacion_servicio ?? "Uso frecuente",
            necesidades_tag: p.necesidades_tag ?? "",
            barreras: p.barreras ?? "",
            motivaciones: p.motivaciones ?? "",
            estado_perfil: p.estado_perfil ?? "Borrador",
        });
        setIdEnEdicion(p.id);
        setSugerenciaIA(null);
        setErroresForm({});
        setTab("formulario");
    }


    function solicitarEliminar(id: string) {
        setConfirmPendiente({ id });
    }

    async function confirmarEliminar() {
        if (!confirmPendiente) return;
        const { error } = await supabase.from("personas").delete().eq("id", confirmPendiente.id);
        if (!error) {
            if (lienzoSeleccionado?.id === confirmPendiente.id) setLienzoSeleccionado(null);
            addToast("Perfil eliminado.", "info");
            await cargarPerfiles();
        } else {
            addToast("Error al eliminar: " + error.message, "error");
        }
        setConfirmPendiente(null);
    }


    async function validarPerfil(id: string) {
        const { error } = await supabase
            .from("personas")
            .update({ estado_perfil: "Validado" })
            .eq("id", id);
        if (!error) {
            addToast("Perfil validado correctamente.", "success");
            await cargarPerfiles();
        } else {
            addToast("Error al validar: " + error.message, "error");
        }
    }

    function verFicha(p: Perfil) {
        setLienzoSeleccionado(p);
        setTab("lienzo");
    }


    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <ToastList toasts={toasts} onRemove={removeToast} />

            {confirmPendiente && (
                <ConfirmDialog
                    message="¿Seguro que deseas eliminar este perfil? Esta acción no se puede deshacer."
                    onConfirm={confirmarEliminar}
                    onCancel={() => setConfirmPendiente(null)}
                />
            )}

            <div className="flex">
                <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
                    <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>
                    <nav className="mt-10 space-y-2 text-sm">
                        {[
                            ["← Volver al propósito", false],
                            ["Inicio del propósito", false],
                            ["Investigar", false],
                            ["Definir Personas", true],
                            ["Definir Necesidades", false],
                            ["Idear", false],
                            ["Prototipar", false],
                            ["Evaluar", false],
                            ["Implementar", false],
                        ].map(([label, active]) => (
                            <div
                                key={label as string}
                                className={`rounded-xl px-3 py-3 ${active
                                    ? "bg-teal-50 font-semibold text-teal-700"
                                    : "text-slate-600"
                                    }`}
                            >
                                {label as string}
                            </div>
                        ))}
                    </nav>
                </aside>

                <section className="w-full">
                    {/* Header */}
                    <header className="border-b border-slate-200 bg-white px-6 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm">
                                    Propósito 1 · Diseñar servicios centrados en las personas
                                </div>
                                <h1 className="mt-6 text-4xl font-bold">Personas</h1>
                                <p className="mt-1 text-slate-500">
                                    Alineación completa con el estándar metodológico UXLab.
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
                                    ["formulario", idEnEdicion ? "Editando Perfil…" : "Formulario"],
                                    ["registros", "Perfiles guardados"],
                                    ["lienzo", "Ficha de Persona"],
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
                                            Herramienta: Plantilla de perfiles de persona usuaria
                                        </h2>
                                        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                                            Esta herramienta les permitirá explorar y representar la diversidad de grupos
                                            de personas que interactúan con un servicio. Si bien su uso principal está
                                            asociado a personas usuarias, pueden aplicar la misma técnica para PEC,
                                            personas funcionarias y otros roles.
                                        </p>
                                    </div>

                                    {/* Campos */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm">Rol del grupo</label>
                                                <select
                                                    value={form.rol}
                                                    onChange={(e) =>
                                                        setForm({ ...form, rol: e.target.value as RolPerfil })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Persona Usuaria</option>
                                                    <option>PEC</option>
                                                    <option>Persona Funcionaria</option>
                                                    <option>Otros Roles</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">Relación con el servicio</label>
                                                <select
                                                    value={form.relacion_servicio}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            relacion_servicio: e.target.value as RelacionServicio,
                                                        })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Uso frecuente</option>
                                                    <option>Uso esporádico</option>
                                                    <option>Primer acceso</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm">Nombre del Perfil</label>
                                            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                <span className="text-xs text-slate-500 font-medium py-1">
                                                    Sugerencias desde Investigación:
                                                </span>
                                                {SUGERENCIAS_INVESTIGACION.map((sug) => (
                                                    <button
                                                        key={sug}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, nombre: sug })}
                                                        className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100"
                                                    >
                                                        + {sug}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={form.nombre}
                                                onChange={(e) => {
                                                    setForm({ ...form, nombre: e.target.value });
                                                    if (erroresForm.nombre) setErroresForm({ ...erroresForm, nombre: undefined });
                                                }}
                                                placeholder="Ej: Adulto Mayor Digitalizado"
                                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-teal-600 ${erroresForm.nombre ? "border-red-400 bg-red-50" : "border-slate-200"
                                                    }`}
                                            />
                                            {erroresForm.nombre && (
                                                <p className="mt-1 text-xs text-red-500">{erroresForm.nombre}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm">
                                                ¿Cómo viven o acceden al servicio? (Descripción)
                                            </label>
                                            <textarea
                                                value={form.acceso}
                                                onChange={(e) => {
                                                    setForm({ ...form, acceso: e.target.value });
                                                    if (erroresForm.acceso) setErroresForm({ ...erroresForm, acceso: undefined });
                                                }}
                                                placeholder="Describe las características principales..."
                                                className={`mt-2 min-h-24 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-teal-600 ${erroresForm.acceso ? "border-red-400 bg-red-50" : "border-slate-200"
                                                    }`}
                                            />
                                            {erroresForm.acceso && (
                                                <p className="mt-1 text-xs text-red-500">{erroresForm.acceso}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-semibold text-sm">Nivel Digital</label>
                                                <select
                                                    value={form.nivel_digital}
                                                    onChange={(e) =>
                                                        setForm({ ...form, nivel_digital: e.target.value as NivelDigital })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Nulo</option>
                                                    <option>Básico</option>
                                                    <option>Intermedio</option>
                                                    <option>Avanzado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">Canal de Contacto</label>
                                                <select
                                                    value={form.canales_contacto}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            canales_contacto: e.target.value as CanalContacto,
                                                        })
                                                    }
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                                >
                                                    <option>Presencial</option>
                                                    <option>Telefónico</option>
                                                    <option>Digital</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                                            <div>
                                                <label className="font-semibold text-sm text-emerald-700">Necesidades (Tags)</label>
                                                <input
                                                    type="text"
                                                    value={form.necesidades_tag}
                                                    onChange={(e) => setForm({ ...form, necesidades_tag: e.target.value })}
                                                    placeholder="Ej: Información clara"
                                                    className="mt-2 w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm text-orange-700">Barreras detectadas</label>
                                                <input
                                                    type="text"
                                                    value={form.barreras}
                                                    onChange={(e) => setForm({ ...form, barreras: e.target.value })}
                                                    placeholder="Ej: Falta de clave única"
                                                    className="mt-2 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-3 py-2 text-sm outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm text-blue-700">Motivaciones</label>
                                                <input
                                                    type="text"
                                                    value={form.motivaciones}
                                                    onChange={(e) => setForm({ ...form, motivaciones: e.target.value })}
                                                    placeholder="Ej: Autonomía"
                                                    className="mt-2 w-full rounded-xl border border-blue-200 bg-blue-50/40 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-semibold text-sm">Expectativas del Servicio</label>
                                            <textarea
                                                value={form.expectativas}
                                                onChange={(e) => setForm({ ...form, expectativas: e.target.value })}
                                                placeholder="¿Qué espera lograr esta persona idealmente?"
                                                className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        {idEnEdicion && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm(FORM_INICIAL);
                                                    setIdEnEdicion(null);
                                                    setSugerenciaIA(null);
                                                    setErroresForm({});
                                                }}
                                                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                            >
                                                Cancelar edición
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={guardarPerfil}
                                            disabled={loading}
                                            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                                        >
                                            {loading ? "Guardando…" : idEnEdicion ? "Actualizar Perfil" : "Guardar Perfil"}
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
                                                Identifica brechas digitales o canales preferidos basados en el arquetipo
                                                seleccionado para refinar los tags cualitativos.
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
                                        <h3 className="font-bold text-sm">Plantilla de persona usuaria</h3>
                                        <ul className="mt-4 space-y-3 text-[13px] text-slate-700">
                                            {[
                                                "Rol y relación vinculados",
                                                "Tags cualitativos mapeados",
                                                "Expectativas redactadas",
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
                                    <h2 className="text-xl font-bold mb-6">Perfiles de persona guardados</h2>
                                    {perfiles.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-10">
                                            Aún no hay perfiles guardados. Crea el primero desde el formulario.
                                        </p>
                                    ) : (
                                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                            {perfiles.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={`rounded-2xl border p-5 shadow-sm space-y-3 ${lienzoSeleccionado?.id === p.id
                                                        ? "border-teal-600 bg-teal-50/40"
                                                        : "border-slate-200 bg-white"
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                                                                {p.rol}
                                                            </span>
                                                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                                {p.nombre}
                                                            </h3>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${estadoClass(
                                                                p.estado_perfil
                                                            )}`}
                                                        >
                                                            {p.estado_perfil ?? "Borrador"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 line-clamp-2">{p.perfil}</p>

                                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                                        <button
                                                            onClick={() => verFicha(p)}
                                                            className="text-xs font-semibold text-teal-700 hover:text-teal-900 border border-teal-200 px-3 py-1 rounded bg-teal-50"
                                                        >
                                                            Ver Ficha
                                                        </button>
                                                        <button
                                                            onClick={() => prepararEdicion(p)}
                                                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1 rounded"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => validarPerfil(p.id)}
                                                            className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-200 px-3 py-1 rounded bg-green-50"
                                                        >
                                                            Validar
                                                        </button>
                                                        <button
                                                            onClick={() => solicitarEliminar(p.id)}
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
                                        <h3 className="font-bold">Acciones rápidas</h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Selecciona "Ver ficha" en un perfil para visualizar su lienzo completo, o
                                            "Validar" para marcarlo como revisado.
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
                                            No hay ningún perfil seleccionado. Vuelve a los registros y haz clic en "Ver
                                            Ficha".
                                        </p>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-slate-900">
                                                        {lienzoSeleccionado.nombre}
                                                    </h2>
                                                    <p className="text-teal-700 font-medium mt-1">
                                                        {lienzoSeleccionado.rol} · {lienzoSeleccionado.relacion_servicio}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${estadoClass(
                                                        lienzoSeleccionado.estado_perfil
                                                    )}`}
                                                >
                                                    {lienzoSeleccionado.estado_perfil ?? "Borrador"}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Contexto y Acceso al Servicio
                                                </h3>
                                                <p className="text-slate-700 leading-relaxed">{lienzoSeleccionado.perfil}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-white border border-slate-200 p-5 rounded-xl">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Datos Demográficos / Digitales
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        <li className="flex justify-between border-b border-slate-50 pb-2">
                                                            <span className="text-slate-500 text-sm">Nivel Digital</span>
                                                            <span className="font-semibold text-sm">
                                                                📱 {lienzoSeleccionado.nivel_digital}
                                                            </span>
                                                        </li>
                                                        <li className="flex justify-between border-b border-slate-50 pb-2">
                                                            <span className="text-slate-500 text-sm">Canal Preferido</span>
                                                            <span className="font-semibold text-sm">
                                                                📞 {lienzoSeleccionado.canales_contacto}
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="bg-white border border-slate-200 p-5 rounded-xl">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                        Expectativas Ideales
                                                    </h3>
                                                    <p className="text-slate-700 text-sm italic">
                                                        "{lienzoSeleccionado.expectativas || "No se registraron expectativas."}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                                                        Necesidades
                                                    </h3>
                                                    <p className="text-sm text-emerald-900 font-medium">
                                                        {lienzoSeleccionado.necesidades_tag || "N/A"}
                                                    </p>
                                                </div>
                                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                                    <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                                                        Barreras
                                                    </h3>
                                                    <p className="text-sm text-orange-900 font-medium">
                                                        {lienzoSeleccionado.barreras || "N/A"}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                                    <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
                                                        Motivaciones
                                                    </h3>
                                                    <p className="text-sm text-blue-900 font-medium">
                                                        {lienzoSeleccionado.motivaciones || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
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
                                                        Editar Perfil
                                                    </button>
                                                    <button
                                                        onClick={() => validarPerfil(lienzoSeleccionado.id)}
                                                        className="w-full rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                                                    >
                                                        Validar Perfil
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