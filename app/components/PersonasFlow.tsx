"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function PersonasFlow() {
    const [tab, setTab] = useState<"formulario" | "registros">("formulario");
    const [perfiles, setPerfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);

    const [form, setForm] = useState({
        rol: "Persona Usuaria",
        nombre: "",
        acceso: "",
        nivel_digital: "Intermedio",
        canales_contacto: "Digital",
        expectativas: "",
        relacion_servicio: "Uso frecuente",
        necesidades_tag: "",
        barreras: "",
        motivaciones: ""
    });

    async function cargarPerfiles() {
        const { data, error } = await supabase
            .from('personas')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPerfiles(data);
        }
    }

    useEffect(() => {
        cargarPerfiles();
    }, []);

    async function guardarPerfil() {
        if (!form.nombre.trim() || !form.acceso.trim()) {
            alert("Por favor, completa el nombre y la descripción.");
            return;
        }

        setLoading(true);
        let errorAlGuardar = null;

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
            motivaciones: form.motivaciones
        };

        if (idEnEdicion) {
            const { error } = await supabase
                .from('personas')
                .update(datosPerfil)
                .eq('id', idEnEdicion);
            errorAlGuardar = error;
        } else {
            const { error } = await supabase
                .from('personas')
                .insert([{ ...datosPerfil, proyecto_id: "31576cfb-4c12-4080-a8c3-1f422b4830de" }]);
            errorAlGuardar = error;
        }

        setLoading(false);

        if (errorAlGuardar) {
            alert("Error al procesar: " + errorAlGuardar.message);
        } else {
            alert(idEnEdicion ? "¡Perfil actualizado!" : "¡Perfil guardado!");
            setForm({
                rol: "Persona Usuaria", nombre: "", acceso: "",
                nivel_digital: "Intermedio", canales_contacto: "Digital", expectativas: "",
                relacion_servicio: "Uso frecuente", necesidades_tag: "", barreras: "", motivaciones: ""
            });
            setIdEnEdicion(null);
            cargarPerfiles();
            setTab("registros");
        }
    }

    function prepararEdicion(p: any) {
        setForm({
            rol: p.rol,
            nombre: p.nombre,
            acceso: p.perfil,
            nivel_digital: p.nivel_digital || "Intermedio",
            canales_contacto: p.canales_contacto || "Digital",
            expectativas: p.expectativas || "",
            relacion_servicio: p.relacion_servicio || "Uso frecuente",
            necesidades_tag: p.necesidades_tag || "",
            barreras: p.barreras || "",
            motivaciones: p.motivaciones || ""
        });
        setIdEnEdicion(p.id);
        setTab("formulario");
    }

    async function eliminarPerfil(id: string) {
        const confirmar = window.confirm("¿Seguro que deseas eliminar este perfil?");
        if (!confirmar) return;
        const { error } = await supabase.from('personas').delete().eq('id', id);
        if (!error) cargarPerfiles();
    }

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
                        {/* AQUÍ ESTAMOS NOSOTROS */}
                        <div className="rounded-xl bg-teal-50 px-3 py-3 font-semibold text-teal-700">
                            Definir Personas
                        </div>
                        <div className="rounded-xl px-3 py-3 text-slate-600">
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

                                <h1 className="mt-6 text-4xl font-bold">Perfiles de Personas</h1>

                                <p className="mt-1 text-slate-500">
                                    Alineación completa con el estándar metodológico UXLab.
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
                                ["formulario", idEnEdicion ? "Editando Perfil..." : "Formulario"],
                                ["registros", "Perfiles guardados"]
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

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm">Rol del grupo</label>
                                                    <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Persona Usuaria</option>
                                                        <option>PEC</option>
                                                        <option>Persona Funcionaria</option>
                                                        <option>Otros Roles</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm">Relación con el servicio</label>
                                                    <select value={form.relacion_servicio} onChange={(e) => setForm({ ...form, relacion_servicio: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Uso frecuente</option>
                                                        <option>Uso esporádico</option>
                                                        <option>Primer acceso</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm">Nombre del Perfil</label>
                                                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Adulto Mayor Digitalizado" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm">¿Cómo viven o acceden al servicio? (Descripción)</label>
                                                <textarea value={form.acceso} onChange={(e) => setForm({ ...form, acceso: e.target.value })} placeholder="Describe las características principales..." className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="font-semibold text-sm">Nivel Digital</label>
                                                    <select value={form.nivel_digital} onChange={(e) => setForm({ ...form, nivel_digital: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Nulo</option>
                                                        <option>Básico</option>
                                                        <option>Intermedio</option>
                                                        <option>Avanzado</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm">Canal de Contacto</label>
                                                    <select value={form.canales_contacto} onChange={(e) => setForm({ ...form, canales_contacto: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600">
                                                        <option>Presencial</option>
                                                        <option>Telefónico</option>
                                                        <option>Digital</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                                                <div>
                                                    <label className="font-semibold text-sm text-emerald-700">Necesidades (Tags)</label>
                                                    <input type="text" value={form.necesidades_tag} onChange={(e) => setForm({ ...form, necesidades_tag: e.target.value })} placeholder="Ej: Información clara" className="mt-2 w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-orange-700">Barreras detectadas</label>
                                                    <input type="text" value={form.barreras} onChange={(e) => setForm({ ...form, barreras: e.target.value })} placeholder="Ej: Falta de clave única" className="mt-2 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-3 py-2 text-sm outline-none focus:border-orange-500" />
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-sm text-blue-700">Motivaciones</label>
                                                    <input type="text" value={form.motivaciones} onChange={(e) => setForm({ ...form, motivaciones: e.target.value })} placeholder="Ej: Autonomía" className="mt-2 w-full rounded-xl border border-blue-200 bg-blue-50/40 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="font-semibold text-sm">Expectativas del Servicio</label>
                                                <textarea value={form.expectativas} onChange={(e) => setForm({ ...form, expectativas: e.target.value })} placeholder="¿Qué espera lograr esta persona idealmente?" className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button type="button" onClick={guardarPerfil} disabled={loading} className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                                                {loading ? "Guardando..." : (idEnEdicion ? "Actualizar Perfil" : "Guardar Perfil")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {tab === "registros" && (
                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                        {perfiles.map((p) => (
                                            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                                                <div>
                                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{p.rol}</span> · <span className="text-xs text-slate-500">{p.relacion_servicio}</span>
                                                    <h3 className="text-lg font-bold text-slate-800">{p.nombre}</h3>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2">{p.perfil}</p>

                                                <div className="flex gap-2 pt-1 text-[11px] text-slate-500">
                                                    <span>📱 {p.nivel_digital}</span> | <span>📞 {p.canales_contacto}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {p.necesidades_tag && <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">🟢 {p.necesidades_tag}</span>}
                                                    {p.barreras && <span className="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">🛑 {p.barreras}</span>}
                                                    {p.motivaciones && <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">✨ {p.motivaciones}</span>}
                                                </div>

                                                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-sm">
                                                    <button onClick={() => prepararEdicion(p)} className="font-semibold text-teal-700 hover:underline">Editar</button>
                                                    <button onClick={() => { if (confirm("¿Eliminar?")) eliminarPerfil(p.id) }} className="font-semibold text-red-600 hover:underline">Eliminar</button>
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
                                            Identifica brechas digitales o canales preferidos basados en el arquetipo de usuario institucional seleccionado para refinar los tags cualitativos.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                let sugerencia = "";

                                                if (form.nivel_digital === "Nulo" || form.nivel_digital === "Básico") {
                                                    sugerencia = `UXLab AI: Para ${form.nombre || 'este perfil'}, detectamos un nivel digital bajo. Se sugiere priorizar canales presenciales y añadir la barrera 'Dificultad con contraseñas'.`;
                                                }
                                                else if (form.rol === "Persona Funcionaria") {
                                                    sugerencia = "UXLab AI: Los perfiles funcionarios suelen valorar la eficiencia. Se sugiere añadir la motivación 'Optimización de tiempos internos'.";
                                                }
                                                else if (form.relacion_servicio === "Primer acceso") {
                                                    sugerencia = "UXLab AI: Al ser el primer acceso, la barrera principal es el desconocimiento del lenguaje técnico. Se recomienda lenguaje claro.";
                                                }
                                                else {
                                                    sugerencia = "UXLab AI: Análisis completado. El perfil parece equilibrado. Se sugiere validar si las expectativas coinciden con los canales digitales elegidos.";
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
                                    <h3 className="font-bold">Plantilla de persona usuaria</h3>
                                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                                        {[
                                            "Rol y relación vinculados",
                                            "Nivel digital y canales mapeados",
                                            "Expectativas redactadas",
                                            "Tags cualitativos (Barreras/Motivaciones)",
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
                    </div>
                </section>
            </div>
        </main>
    );
}