"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function NecesidadesFlow() {
    const [tab, setTab] = useState<"formulario" | "registros">("formulario");
    const [necesidades, setNecesidades] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);

    const [form, setForm] = useState({
        persona_id: "",
        objetivo: "",
        acciones: "",
        situacion_inicial: "",
        fricciones: "",
        impacto: "Medio",
        rol_servicio: "",
        categoria: "Informar",
        estado: "Pendiente"
    });

    const ejemplosObjetivos = [
        "Completar un trámite sin asistencia",
        "Entender los requisitos del servicio",
        "Hacer seguimiento a una solicitud"
    ];

    async function cargarPersonas() {
        const { data } = await supabase.from('personas').select('id, nombre');
        if (data) {
            setPersonas(data);
            if (data.length > 0 && !form.persona_id) {
                setForm(prev => ({ ...prev, persona_id: data[0].id }));
            }
        }
    }

    async function cargarNecesidades() {
        const { data } = await supabase
            .from('necesidades')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setNecesidades(data);
    }

    useEffect(() => {
        cargarPersonas();
        cargarNecesidades();
    }, []);

    async function guardarNecesidad() {
        if (!form.persona_id || !form.objetivo.trim() || !form.acciones.trim()) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        setLoading(true);
        let errorAlGuardar = null;

        const datosNecesidad = {
            persona_id: form.persona_id,
            objetivo: form.objetivo,
            acciones: form.acciones,
            situacion_inicial: form.situacion_inicial,
            fricciones: form.fricciones,
            impacto: form.impacto,
            rol_servicio: form.rol_servicio,
            categoria: form.categoria,
            estado: form.estado
        };

        if (idEnEdicion) {
            const { error } = await supabase
                .from('necesidades')
                .update(datosNecesidad)
                .eq('id', idEnEdicion);
            errorAlGuardar = error;
        } else {
            const { error } = await supabase
                .from('necesidades')
                .insert([{ ...datosNecesidad, proyecto_id: "31576cfb-4c12-4080-a8c3-1f422b4830de" }]);
            errorAlGuardar = error;
        }

        setLoading(false);

        if (errorAlGuardar) {
            alert("Error al procesar: " + errorAlGuardar.message);
        } else {
            alert(idEnEdicion ? "¡Necesidad actualizada!" : "¡Necesidad guardada!");
            setForm({
                persona_id: personas.length > 0 ? personas[0].id : "",
                objetivo: "", acciones: "", situacion_inicial: "", fricciones: "",
                impacto: "Medio", rol_servicio: "", categoria: "Informar", estado: "Pendiente"
            });
            setIdEnEdicion(null);
            cargarNecesidades();
            setTab("registros");
        }
    }

    function prepararEdicion(n: any) {
        setForm({
            persona_id: n.persona_id,
            objetivo: n.objetivo,
            acciones: n.acciones,
            situacion_inicial: n.situacion_inicial || "",
            fricciones: n.fricciones || "",
            impacto: n.impacto || "Medio",
            rol_servicio: n.rol_servicio || "",
            categoria: n.categoria || "Informar",
            estado: n.estado || "Pendiente"
        });
        setIdEnEdicion(n.id);
        setTab("formulario");
    }

    async function eliminarNecesidad(id: string) {
        const confirmar = window.confirm("¿Seguro de eliminar?");
        if (confirmar) {
            await supabase.from('necesidades').delete().eq('id', id);
            cargarNecesidades();
        }
    }

    const obtenerNombrePersona = (id: string) => {
        const p = personas.find(persona => String(persona.id) === String(id));
        return p ? p.nombre : "Persona Desconocida";
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="flex">

                <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
                    <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>

                    <nav className="mt-10 space-y-2 text-sm">
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            ← Volver al propósito
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            Inicio del propósito
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            Investigar
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            Definir Personas
                        </div>
                        <div className="rounded-xl bg-teal-50 px-3 py-3 font-semibold text-teal-700">
                            Definir Necesidades
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">Idear</div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            Prototipar
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">Evaluar</div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
                            Implementar
                        </div>
                    </nav>
                </aside>

                <section className="w-full">
                    <header className="border-b border-slate-200 bg-white px-6 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm">
                                    Propósito 1 · Diseñar servicios centrados en las personas
                                </div>

                                <h1 className="mt-6 text-4xl font-bold">Necesidades y Objetivos</h1>

                                <p className="mt-1 text-slate-500">
                                    Mapeo e identificación exacta de fricciones y roles del servicio.
                                </p>
                            </div>

                            <div className="min-w-72">
                                <div className="text-center text-3xl font-bold">29%</div>
                                <div className="text-center text-sm text-slate-500">
                                    Avance global
                                </div>
                                <div className="mt-3 h-3 rounded-full bg-slate-200">
                                    <div className="h-3 w-[29%] rounded-full bg-teal-600" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-6">
                        <div className="mb-6 flex gap-6 border-b border-slate-200">
                            {[
                                ["formulario", idEnEdicion ? "Editando Necesidad..." : "Formulario"],
                                ["registros", "Necesidades Guardadas"]
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key as any)}
                                    className={`border-b-2 px-2 pb-3 text-sm font-semibold ${tab === key ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

                            <div>
                                {tab === "formulario" && (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">

                                            <div>
                                                <label className="font-semibold text-sm">Selector de Arquetipo (Persona)</label>
                                                <select value={form.persona_id} onChange={(e) => setForm({ ...form, persona_id: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none bg-teal-50/20 focus:border-teal-600">
                                                    <option value="" disabled>Elige un perfil...</option>
                                                    {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm">Situación Inicial</label>
                                                <textarea value={form.situacion_inicial} onChange={(e) => setForm({ ...form, situacion_inicial: e.target.value })} placeholder="Contexto inicial del problema..." className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm">Objetivo de la Persona</label>
                                                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                                    {ejemplosObjetivos.map((ej, idx) => (
                                                        <button key={idx} type="button" onClick={() => setForm({ ...form, objetivo: ej })} className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100">+ {ej}</button>
                                                    ))}
                                                </div>
                                                <input type="text" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="¿Qué quiere lograr?" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm">Acciones de la Persona</label>
                                                    <textarea value={form.acciones} onChange={(e) => setForm({ ...form, acciones: e.target.value })} placeholder="Pasos que ejecuta..." className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-teal-800">Rol del Servicio</label>
                                                    <textarea value={form.rol_servicio} onChange={(e) => setForm({ ...form, rol_servicio: e.target.value })} placeholder="¿Qué debe hacer el servicio institucional?" className="mt-2 min-h-24 w-full rounded-xl border border-teal-100 bg-teal-50/20 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm text-red-700">Fricciones Detectadas</label>
                                                <textarea value={form.fricciones} onChange={(e) => setForm({ ...form, fricciones: e.target.value })} placeholder="Dolores encontrados..." className="mt-2 min-h-20 w-full rounded-xl border border-red-200 bg-red-50/40 px-3 py-2 text-sm outline-none focus:border-red-500" />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm">Categoría</label>
                                                    <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Informar</option>
                                                        <option>Tramitar</option>
                                                        <option>Soporte</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm">Impacto</label>
                                                    <select value={form.impacto} onChange={(e) => setForm({ ...form, impacto: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Alto</option>
                                                        <option>Medio</option>
                                                        <option>Bajo</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm">Estado</label>
                                                    <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Pendiente</option>
                                                        <option>En Análisis</option>
                                                        <option>Resuelto</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button type="button" onClick={guardarNecesidad} disabled={loading} className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                                                {loading ? "Guardando..." : (idEnEdicion ? "Actualizar Necesidad" : "Guardar Necesidad")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {tab === "registros" && (
                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                        {necesidades.map((n) => (
                                            <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">👤 {obtenerNombrePersona(n.persona_id)}</span>
                                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${n.impacto === 'Alto' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>Impacto {n.impacto}</span>
                                                </div>
                                                <h3 className="font-bold text-slate-800 text-md">{n.objetivo}</h3>
                                                <p className="text-[11px] text-slate-400 font-medium">📋 Categoría: {n.categoria} | Estado: {n.estado}</p>
                                                {n.fricciones && <p className="text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">🔥 Fricción: {n.fricciones}</p>}
                                                {n.rol_servicio && <p className="text-xs bg-teal-50 text-teal-800 p-2 rounded border border-teal-100">⚙️ Rol Servicio: {n.rol_servicio}</p>}

                                                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-sm">
                                                    <button onClick={() => prepararEdicion(n)} className="font-semibold text-teal-700 hover:underline">Editar</button>
                                                    <button onClick={() => { if (confirm("¿Eliminar?")) eliminarNecesidad(n.id) }} className="font-semibold text-red-600 hover:underline">Eliminar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-6">
                                <div className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                                        <span>✨</span> ASISTENCIA METODOLÓGICA UXLab AI
                                    </div>
                                    <div className="text-sm bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            Genera sugerencias dinámicas de fricciones metodológicas de servicio basadas en los arquetipos almacenados en Supabase.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                let sugerencia = "";

                                                if (form.impacto === "Alto") {
                                                    sugerencia = `UXLab AI: Una fricción de impacto ALTO para "${form.objetivo || 'este objetivo'}" requiere una solución prioritaria. Sugerimos que el Rol del Servicio sea de 'Intervención Directa'.`;
                                                }
                                                else if (form.categoria === "Informar") {
                                                    sugerencia = "UXLab AI: En la categoría 'Informar', la fricción suele ser la falta de claridad. Se recomienda que el Rol del Servicio se enfoque en 'Orientación y Guía Paso a Paso'.";
                                                }
                                                else if (form.fricciones.length > 5) {
                                                    sugerencia = "UXLab AI: Analizando las fricciones detectadas, parece haber una brecha de comunicación. Se sugiere revisar si el canal digital es el adecuado.";
                                                }
                                                else {
                                                    sugerencia = "UXLab AI: Análisis de necesidad completado. Se recomienda validar si el impacto asignado coincide con la urgencia real del arquetipo seleccionado.";
                                                }

                                                alert(sugerencia);
                                            }}
                                            className="w-full text-center rounded-xl bg-teal-50 border border-teal-200 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
                                        >
                                            Mostrar sugerencia
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <h3 className="font-bold text-sm">Tabla de necesidades priorizadas</h3>
                                    <ul className="mt-4 space-y-3 text-[13px] text-slate-700">
                                        <li className="flex gap-3">
                                            <span className="font-bold text-teal-700">✓</span>
                                            <span>Vinculación 1:1 con Perfil</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-teal-700">✓</span>
                                            <span>Fricciones y Rol del Servicio</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-teal-700">✓</span>
                                            <span>Impacto y Estado mapeados</span>
                                        </li>
                                    </ul>
                                </div>
                            </aside>

                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}