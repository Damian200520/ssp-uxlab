"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Smartphone, Phone } from "lucide-react";
import AsistenciaIAEtapa from "./AsistenciaIAEtapa";
import RecursosComplementarios from "./RecursosComplementarios";


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
    foto_url: string;
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
    foto_url: string;
    estado_perfil: EstadoPerfil;
}

interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
    action?: { label: string; onClick: () => void };
}

interface PersonaUsuariaRow {
    id: string | number;
    created_at?: string;
    proyecto_id?: string;
    rol?: string;
    nombre_arquetipo?: string;
    descripcion?: string;
    nivel_digital?: string;
    canales_contacto?: string | string[];
    expectativas?: unknown;
    relacion_servicio?: string;
    necesidades?: unknown;
    barreras?: unknown;
    motivaciones?: unknown;
    foto_url?: string;
    estado_perfil?: string;
}

interface InvestigacionRow {
    personas_a_comprender?: string[] | unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID = process.env.NEXT_PUBLIC_PROYECTO_ID || "31576cfb-4c12-4080-a8c3-1f422b4830de";

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
    foto_url: "",
    estado_perfil: "Borrador",
};

function estadoClass(estado: EstadoPerfil) {
    return estado === "Validado"
        ? "bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/50"
        : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50";
}

function textoALista(value?: string | null): string[] {
    if (!value) return [];

    return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function listaATexto(value: unknown): string {
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    if (typeof value === "string") return value;
    return "";
}

function normalizarEstadoPerfil(value: unknown): EstadoPerfil {
    const estado = String(value || "").toLowerCase();
    return estado === "validado" ? "Validado" : "Borrador";
}

function dbToPerfil(row: PersonaUsuariaRow): Perfil {
    return {
        id: String(row.id),
        created_at: row.created_at || "",
        proyecto_id: String(row.proyecto_id || PROYECTO_ID),
        rol: row.rol || "Persona Usuaria",
        nombre: row.nombre_arquetipo || "Perfil sin nombre",
        perfil: row.descripcion || "",
        nivel_digital: (row.nivel_digital || "Intermedio") as NivelDigital,
        canales_contacto: (Array.isArray(row.canales_contacto)
            ? row.canales_contacto[0] || "Digital"
            : row.canales_contacto || "Digital") as CanalContacto,
        expectativas: listaATexto(row.expectativas),
        relacion_servicio: (row.relacion_servicio || "Uso frecuente") as RelacionServicio,
        necesidades_tag: listaATexto(row.necesidades),
        barreras: listaATexto(row.barreras),
        motivaciones: listaATexto(row.motivaciones),
        foto_url: row.foto_url || "",
        estado_perfil: normalizarEstadoPerfil(row.estado_perfil),
    };
}

function formToPersonaUsuariaDb(form: FormState) {
    const validado = form.estado_perfil === "Validado";

    return {
        proyecto_id: PROYECTO_ID,
        nombre_arquetipo: form.nombre,
        rol: form.rol,
        relacion_servicio: form.relacion_servicio,
        descripcion: form.acceso,
        necesidades: textoALista(form.necesidades_tag),
        barreras: textoALista(form.barreras),
        motivaciones: textoALista(form.motivaciones),
        foto_url: form.foto_url?.trim() || null,
        expectativas: textoALista(form.expectativas),
        canales_contacto: [form.canales_contacto],
        nivel_digital: form.nivel_digital,
        fuente_perfil: "manual",
        estado_perfil: validado ? "validado" : "borrador",
        completado: validado,
    };
}


function ToastList({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
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
                    {t.action && (
                        <button
                            onClick={t.action.onClick}
                            className="ml-2 rounded border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:bg-white/30 hover:scale-[1.02]"
                        >
                            {t.action.label}
                        </button>
                    )}
                    <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity" aria-label="Cerrar notificación"><X className="h-4 w-4" /></button>
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

export default function PersonasFlow({
    onNavigate
}: {
    onNavigate?: (flujo: string | null) => void;
}) {
    const [tab, setTab] = useState<"formulario" | "registros" | "lienzo">("formulario");
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [sugerenciasInvestigacion, setSugerenciasInvestigacion] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);
    const [lienzoSeleccionado, setLienzoSeleccionado] = useState<Perfil | null>(null);
    const [form, setForm] = useState<FormState>(FORM_INICIAL);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmPendiente, setConfirmPendiente] = useState<{ id: string } | null>(null);
    const [erroresForm, setErroresForm] = useState<Partial<Record<keyof FormState, string>>>({});


    const addToast = useCallback((message: string, type: Toast["type"] = "success", action?: Toast["action"]) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);

        setToasts((prev) => [...prev, { id, type, message, action }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, action ? 6000 : 4000);
    }, []);

    const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));


    const cargarPerfiles = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/personas-usuarias`);

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const perfilesNormalizados = (json.personas_usuarias || []).map(dbToPerfil);
            setPerfiles(perfilesNormalizados);
            setLienzoSeleccionado((prev) =>
                prev ? (perfilesNormalizados.find((perfil: Perfil) => perfil.id === prev.id) ?? null) : null
            );
        } catch (error) {
            addToast(
                "No se pudieron cargar los perfiles: " +
                (error instanceof Error ? error.message : "error desconocido"),
                "error"
            );
        }
    }, [addToast]);

    const cargarSugerenciasInvestigacion = useCallback(async () => {
        try {
            const res = await fetch(
                `${API_URL}/proyectos/${PROYECTO_ID}/investigaciones`
            );

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            const json = await res.json();
            const investigaciones = json.data || [];

            const sugerencias = Array.from(
                new Set(
                    investigaciones
                        .flatMap((row: InvestigacionRow) =>
                            Array.isArray(row.personas_a_comprender)
                                ? row.personas_a_comprender
                                : []
                        )
                        .map((item: unknown) => String(item).trim())
                        .filter(Boolean)
                )
            ) as string[];

            setSugerenciasInvestigacion(sugerencias);
        } catch (error) {
            console.warn("No se pudieron cargar sugerencias desde Investigación:", error);
            setSugerenciasInvestigacion([]);
        }
    }, []);

    useEffect(() => {
        cargarPerfiles();
        cargarSugerenciasInvestigacion();
    }, [cargarPerfiles, cargarSugerenciasInvestigacion]);

    function validarForm(): boolean {
        const errores: typeof erroresForm = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
        if (!form.acceso.trim()) errores.acceso = "La descripción es obligatoria.";
        setErroresForm(errores);
        return Object.keys(errores).length === 0;
    }

    async function guardarPerfil() {
        const errores: typeof erroresForm = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
        if (!form.acceso.trim()) errores.acceso = "La descripción es obligatoria.";

        if (Object.keys(errores).length > 0) {
            setErroresForm(errores);

            if (errores.nombre) {
                addToast("No puedes cerrar aún, falta completar el nombre.", "error", {
                    label: "Ir a completar Nombre",
                    onClick: () => {
                        document.querySelector('input[placeholder="Ej: Adulto Mayor Digitalizado"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => (document.querySelector('input[placeholder="Ej: Adulto Mayor Digitalizado"]') as HTMLInputElement)?.focus(), 300);
                    }
                });
                return;
            }
            if (errores.acceso) {
                addToast("No puedes cerrar aún, falta la descripción de acceso.", "error", {
                    label: "Ir a descripción",
                    onClick: () => {
                        document.querySelector('textarea[placeholder="Describe las características principales..."]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => (document.querySelector('textarea[placeholder="Describe las características principales..."]') as HTMLTextAreaElement)?.focus(), 300);
                    }
                });
                return;
            }
            return;
        }

        setLoading(true);

        const datosPerfil = formToPersonaUsuariaDb(form);

        const res = await fetch(
            idEnEdicion
                ? `${API_URL}/personas-usuarias/${idEnEdicion}`
                : `${API_URL}/personas-usuarias`,
            {
                method: idEnEdicion ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosPerfil),
            }
        );

        setLoading(false);

        if (!res.ok) {
            addToast("Error al guardar: " + (await res.text()), "error");
        } else {
            addToast(idEnEdicion ? "¡Perfil actualizado!" : "¡Perfil guardado!", "success");
            setForm(FORM_INICIAL);
            setIdEnEdicion(null);
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
            foto_url: p.foto_url ?? "",
            estado_perfil: p.estado_perfil ?? "Borrador",
        });
        setIdEnEdicion(p.id);
        setErroresForm({});
        setTab("formulario");
    }


    function solicitarEliminar(id: string) {
        setConfirmPendiente({ id });
    }

    async function confirmarEliminar() {
        if (!confirmPendiente) return;
        const res = await fetch(`${API_URL}/personas-usuarias/${confirmPendiente.id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            if (lienzoSeleccionado?.id === confirmPendiente.id) setLienzoSeleccionado(null);
            addToast("Perfil eliminado.", "info");
            await cargarPerfiles();
        } else {
            addToast("Error al eliminar: " + (await res.text()), "error");
        }
        setConfirmPendiente(null);
    }


    async function validarPerfil(id: string) {
        const res = await fetch(`${API_URL}/personas-usuarias/${id}/validar`, {
            method: "PATCH",
        });

        if (res.ok) {
            addToast("Perfil validado correctamente.", "success");
            await cargarPerfiles();

            window.dispatchEvent(
                new CustomEvent("actualizar-ruta-proposito", {
                    detail: { siguienteEtapa: 3 },
                })
            );
        } else {
            addToast("Error al validar: " + (await res.text()), "error");
        }
    }

    function verFicha(p: Perfil) {
        setLienzoSeleccionado(p);
        setTab("lienzo");
    }


    return (
        <main className="min-h-0 bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900">
            <ToastList toasts={toasts} onRemove={removeToast} />

            {confirmPendiente && (
                <ConfirmDialog
                    message="¿Seguro que deseas eliminar este perfil? Esta acción no se puede deshacer."
                    onConfirm={confirmarEliminar}
                    onCancel={() => setConfirmPendiente(null)}
                />
            )}

            <div className="flex">
                <aside className="hidden min-h-0 w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 lg:block">
                    <div className="text-2xl font-bold bg-gradient-to-br from-teal-700 to-emerald-700 bg-clip-text text-transparent">SSP·UXLab</div>
                    <nav className="mt-10 space-y-1 text-sm flex flex-col items-start">
                        {(
                            [
                                ["← Volver al Catálogo", null, false],
                                ["Investigar", "investigacion", false],
                                ["Definir Personas", "personas", true],
                                ["Habilitación y Expectativas", "habilitacion", false],
                                ["Definir Necesidades", "necesidades", false],
                                ["Vinculación", "vinculacion", false],
                                ["Medición", "medicion", false],
                                ["Momentos Críticos", "momentos", false],
                            ] as [string, string | null, boolean][]
                        ).map(([label, route, active]) => (
                            <button
                                key={label}
                                onClick={() => onNavigate && onNavigate(route)}
                                className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 ${active ? "bg-gradient-to-r from-teal-50 to-emerald-50 font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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

                                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Personas</h1>
                                <p className="mt-1 text-slate-500 leading-relaxed">
                                    Describe perfiles de personas usuarias para comprender roles, barreras, motivaciones y relacion con el servicio.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-6">
                        <div className="mb-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Objetivo</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                Identificar y caracterizar los perfiles de personas usuarias del servicio, documentando
                                su relación, nivel digital, canales, expectativas y barreras.
                            </p>
                        </div>

                        <AsistenciaIAEtapa etapa={2} contexto="Personas" />

                        <div className="mb-6 flex gap-6 border-b border-slate-200/80">
              {(
                [
                  ["formulario", idEnEdicion ? "Editando perfil…" : "Formulario"],
                  ["registros", "Perfiles guardados"],
                  ["lienzo", "Ficha de persona"],
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
                                                Herramienta: Plantilla de perfiles de persona usuaria
                                            </h2>
                                            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                                                Esta herramienta les permitirá explorar y representar la diversidad de grupos
                                                de personas que interactúan con un servicio. Si bien su uso principal está
                                                asociado a personas usuarias, pueden aplicar la misma técnica para PEC,
                                                personas funcionarias y otros roles.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100/50 space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm text-slate-700">Rol del grupo</label>
                                                    <select
                                                        value={form.rol}
                                                        onChange={(e) =>
                                                            setForm({ ...form, rol: e.target.value as RolPerfil })
                                                        }
                                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                    >
                                                        <option>Persona Usuaria</option>
                                                        <option>PEC</option>
                                                        <option>Persona Funcionaria</option>
                                                        <option>Otros Roles</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-slate-700">Relación con el servicio</label>
                                                    <select
                                                        value={form.relacion_servicio}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                relacion_servicio: e.target.value as RelacionServicio,
                                                            })
                                                        }
                                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                    >
                                                        <option>Uso frecuente</option>
                                                        <option>Uso esporádico</option>
                                                        <option>Primer acceso</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Nombre del Perfil</label>
                                                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                    <span className="text-xs text-slate-500 font-medium py-1">
                                                        Sugerencias desde Investigación:
                                                    </span>
                                                    {sugerenciasInvestigacion.length === 0 ? (
                                                        <span className="rounded-full border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-xs text-slate-400">
                                                            Sin sugerencias cargadas
                                                        </span>
                                                    ) : sugerenciasInvestigacion.map((sug, index) => (
                                                        <button
                                                            key={`${sug}-${index}`}
                                                            type="button"
                                                            onClick={() => setForm({ ...form, nombre: sug })}
                                                            className="rounded-full border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-2 py-0.5 text-xs text-teal-700 transition-all duration-150 hover:from-teal-100 hover:to-emerald-100 shadow-sm"
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
                                                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 ${erroresForm.nombre ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                />
                                                {erroresForm.nombre && (
                                                    <p className="mt-1 text-xs text-red-500">{erroresForm.nombre}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Foto o avatar del perfil</label>
                                                <input
                                                    type="url"
                                                    value={form.foto_url}
                                                    onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                                                    placeholder="Pega la URL de una imagen, por ejemplo https://..."
                                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                />
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Opcional. Si no agregas una imagen, se mostrará la inicial del perfil en la ficha.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">
                                                    ¿Cómo viven o acceden al servicio? (Descripción)
                                                </label>
                                                <textarea
                                                    value={form.acceso}
                                                    onChange={(e) => {
                                                        setForm({ ...form, acceso: e.target.value });
                                                        if (erroresForm.acceso) setErroresForm({ ...erroresForm, acceso: undefined });
                                                    }}
                                                    placeholder="Describe las características principales..."
                                                    className={`mt-2 min-h-24 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 ${erroresForm.acceso ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                />
                                                {erroresForm.acceso && (
                                                    <p className="mt-1 text-xs text-red-500">{erroresForm.acceso}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm text-slate-700">Nivel Digital</label>
                                                    <select
                                                        value={form.nivel_digital}
                                                        onChange={(e) =>
                                                            setForm({ ...form, nivel_digital: e.target.value as NivelDigital })
                                                        }
                                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                                                    >
                                                        <option>Nulo</option>
                                                        <option>Básico</option>
                                                        <option>Intermedio</option>
                                                        <option>Avanzado</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-slate-700">Canal de Contacto</label>
                                                    <select
                                                        value={form.canales_contacto}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                canales_contacto: e.target.value as CanalContacto,
                                                            })
                                                        }
                                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
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
                                                        className="mt-2 w-full rounded-xl border border-emerald-200/60 bg-emerald-50/40 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 hover:border-emerald-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-orange-700">Barreras detectadas</label>
                                                    <input
                                                        type="text"
                                                        value={form.barreras}
                                                        onChange={(e) => setForm({ ...form, barreras: e.target.value })}
                                                        placeholder="Ej: Falta de clave única"
                                                        className="mt-2 w-full rounded-xl border border-orange-200/60 bg-orange-50/40 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-orange-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-blue-700">Motivaciones</label>
                                                    <input
                                                        type="text"
                                                        value={form.motivaciones}
                                                        onChange={(e) => setForm({ ...form, motivaciones: e.target.value })}
                                                        placeholder="Ej: Autonomía"
                                                        className="mt-2 w-full rounded-xl border border-blue-200/60 bg-blue-50/40 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-blue-300"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm text-slate-700">Expectativas del Servicio</label>
                                                <textarea
                                                    value={form.expectativas}
                                                    onChange={(e) => setForm({ ...form, expectativas: e.target.value })}
                                                    placeholder="¿Qué espera lograr esta persona idealmente?"
                                                    className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
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
                                                        setErroresForm({});
                                                    }}
                                                    className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                                                >
                                                    Cancelar edición
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={guardarPerfil}
                                                disabled={loading}
                                                className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
                                            >
                                                {loading ? "Guardando…" : idEnEdicion ? "Actualizar perfil" : "Guardar perfil"}
                                            </button>
                                        </div>
                                    </div>

                                    <aside className="space-y-5">
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm">
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                                    Recursos complementarios
                                                </p>
                                            </div>
                                            <RecursosComplementarios actividad="personas" />
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
                                        <h2 className="text-xl font-bold tracking-tight mb-6">Perfiles de persona guardados</h2>
                                        {perfiles.length === 0 ? (
                                            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-8 text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50">
                                                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-600">Aún no hay perfiles guardados</p>
                                                    <p className="mt-1 text-xs text-slate-400">Completa el formulario y guarda tu primer perfil de persona usuaria.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                                {perfiles.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        className={`rounded-2xl border p-5 shadow-sm space-y-3 transition-all duration-200 ${lienzoSeleccionado?.id === p.id
                                                            ? "border-teal-400/60 bg-gradient-to-r from-teal-50/60 to-emerald-50/60 shadow-md shadow-teal-100/30"
                                                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex items-start gap-3">
                                                                {p.foto_url ? (
                                                                    <img
                                                                        src={p.foto_url}
                                                                        alt={p.nombre}
                                                                        className="h-12 w-12 rounded-full border-2 border-slate-200 object-cover shadow-sm"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = "none";
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-teal-100/60 bg-gradient-to-br from-teal-50 to-emerald-50 text-lg font-bold text-teal-700 shadow-sm">
                                                                        {p.nombre?.charAt(0)?.toUpperCase() || "P"}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                                                                        {p.rol}
                                                                    </span>
                                                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                                        {p.nombre}
                                                                    </h3>
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${estadoClass(
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
                                                                className="text-xs font-semibold text-teal-700 transition-all duration-150 border border-teal-200/60 px-3 py-1 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 shadow-sm"
                                                            >
                                                                Ver Ficha
                                                            </button>
                                                            <button
                                                                onClick={() => prepararEdicion(p)}
                                                                className="text-xs font-semibold text-slate-600 transition-all duration-150 border border-slate-200/60 px-3 py-1 rounded-lg hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => validarPerfil(p.id)}
                                                                className="text-xs font-semibold text-green-700 transition-all duration-150 border border-green-200/60 px-3 py-1 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 shadow-sm"
                                                            >
                                                                Validar
                                                            </button>
                                                            <button
                                                                onClick={() => solicitarEliminar(p.id)}
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
                                            <h3 className="font-bold text-slate-800">Acciones rápidas</h3>
                                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                                Selecciona "Ver ficha" en un perfil para visualizar su lienzo completo, o
                                                "Validar" para marcarlo como revisado.
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
                                                No hay ningún perfil seleccionado. Vuelve a los registros y haz clic en "Ver
                                                Ficha".
                                            </p>
                                        ) : (
                                            <div className="space-y-8">
                                                <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-5">
                                                        {lienzoSeleccionado.foto_url ? (
                                                            <img
                                                                src={lienzoSeleccionado.foto_url}
                                                                alt={lienzoSeleccionado.nombre}
                                                                className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover shadow-md"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-teal-100/60 bg-gradient-to-br from-teal-50 to-emerald-50 text-3xl font-bold text-teal-700 shadow-md">
                                                                {lienzoSeleccionado.nombre?.charAt(0)?.toUpperCase() || "P"}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                                                {lienzoSeleccionado.nombre}
                                                            </h2>
                                                            <p className="text-teal-700 font-medium mt-1">
                                                                {lienzoSeleccionado.rol} · {lienzoSeleccionado.relacion_servicio}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${estadoClass(
                                                            lienzoSeleccionado.estado_perfil
                                                        )}`}
                                                    >
                                                        {lienzoSeleccionado.estado_perfil ?? "Borrador"}
                                                    </span>
                                                </div>

                                                <div className="bg-gradient-to-b from-slate-50 to-slate-100/30 p-5 rounded-xl border border-slate-100/80 shadow-sm">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        Contexto y Acceso al Servicio
                                                    </h3>
                                                    <p className="text-slate-700 leading-relaxed">{lienzoSeleccionado.perfil}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                            Datos Demográficos / Digitales
                                                        </h3>
                                                        <ul className="space-y-3">
                                                            <li className="flex justify-between border-b border-slate-100 pb-2">
                                                                <span className="text-slate-500 text-sm">Nivel Digital</span>
                                                                <span className="font-semibold text-sm text-slate-800">
                                                                    <Smartphone className="h-4 w-4 inline mr-1.5 text-slate-400" aria-hidden="true" /> {lienzoSeleccionado.nivel_digital}
                                                                </span>
                                                            </li>
                                                            <li className="flex justify-between border-b border-slate-100 pb-2">
                                                                <span className="text-slate-500 text-sm">Canal Preferido</span>
                                                                <span className="font-semibold text-sm text-slate-800">
                                                                    <Phone className="h-4 w-4 inline mr-1.5 text-slate-400" aria-hidden="true" /> {lienzoSeleccionado.canales_contacto}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                            Expectativas Ideales
                                                        </h3>
                                                        <p className="text-slate-700 text-sm italic leading-relaxed">
                                                            "{lienzoSeleccionado.expectativas || "No se registraron expectativas."}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-gradient-to-b from-emerald-50 to-emerald-50/60 border border-emerald-200/60 p-4 rounded-xl shadow-sm">
                                                        <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                                                            Necesidades
                                                        </h3>
                                                        <p className="text-sm text-emerald-900 font-medium">
                                                            {lienzoSeleccionado.necesidades_tag || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-b from-orange-50 to-orange-50/60 border border-orange-200/60 p-4 rounded-xl shadow-sm">
                                                        <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                                                            Barreras
                                                        </h3>
                                                        <p className="text-sm text-orange-900 font-medium">
                                                            {lienzoSeleccionado.barreras || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-b from-blue-50 to-blue-50/60 border border-blue-200/60 p-4 rounded-xl shadow-sm">
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
                                                            Editar Perfil
                                                        </button>
                                                        <button
                                                            onClick={() => validarPerfil(lienzoSeleccionado.id)}
                                                            className="w-full rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md"
                                                        >
                                                            Validar Perfil
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
