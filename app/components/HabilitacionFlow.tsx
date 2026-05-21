"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const NIVELES = ["Bajo", "Medio", "Alto"] as const;
const HAB_META_PREFIX = "::uxlab-hab-meta::";

type HabilitacionMeta = {
  persona_usuaria_id?: string;
  descripcion: string;
  barreras_detectadas: string;
  facilitadores: string;
  observaciones: string;
  estado?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID || "31576cfb-4c12-4080-a8c3-1f422b4830de";

type Habilitacion = {
  id: string;
  proyecto_id: string;
  persona_usuaria_id: string;
  nivel_acceso: string;
  nivel_conocimiento: string;
  nivel_digital: string;
  descripcion_habilitacion: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
};

type Expectativa = {
  id: string;
  proyecto_id: string;
  persona_usuaria_id?: string;
  expectativa_usuario: string;
  nivel_cumplimiento: string;
  resultado_esperado?: string;
  indicador_exito?: string;
  linea_accion?: string;
  analisis_ia?: string;
  created_at?: string;
  updated_at?: string;
};

type PersonaUsuaria = {
  id: string;
  proyecto_id: string;
  nombre_arquetipo: string;
  rol: string;
  descripcion: string;
  necesidades?: string[];
  barreras?: string[];
  motivaciones?: string[];
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
};

type ExpectativaForm = {
  persona_usuaria_id: string;
  expectativa_usuario: string;
  nivel_cumplimiento: string;
  resultado_esperado: string;
  indicador_exito: string;
  linea_accion: string;
  observaciones: string;
};

type HabilitacionForm = {
  nivel_acceso: string;
  nivel_conocimiento: string;
  nivel_digital: string;
  descripcion_habilitacion: string;
  barreras_detectadas: string;
  facilitadores: string;
  observaciones: string;
};

function createInitialExpectativaForm(): ExpectativaForm {
  return {
    persona_usuaria_id: "",
    expectativa_usuario: "",
    nivel_cumplimiento: "No cumplido",
    resultado_esperado: "",
    indicador_exito: "",
    linea_accion: "",
    observaciones: "",
  };
}

function createInitialHabilitacionForm(): HabilitacionForm {
  return {
    nivel_acceso: "",
    nivel_conocimiento: "",
    nivel_digital: "",
    descripcion_habilitacion: "",
    barreras_detectadas: "",
    facilitadores: "",
    observaciones: "",
  };
}

function serializarDescripcionHabilitacion(
  form: HabilitacionForm,
  persona_usuaria_id = "",
  estado = "borrador"
): string {
  const meta: HabilitacionMeta = {
    persona_usuaria_id,
    descripcion: form.descripcion_habilitacion,
    barreras_detectadas: form.barreras_detectadas,
    facilitadores: form.facilitadores,
    observaciones: form.observaciones,
    estado,
  };
  return `${HAB_META_PREFIX}${JSON.stringify(meta)}`;
}

function parsearDescripcionHabilitacion(
  raw: string,
  niveles: Pick<
    HabilitacionForm,
    "nivel_acceso" | "nivel_conocimiento" | "nivel_digital"
  >
): HabilitacionForm {
  if (raw.startsWith(HAB_META_PREFIX)) {
    try {
      const meta = JSON.parse(
        raw.slice(HAB_META_PREFIX.length)
      ) as HabilitacionMeta;
      return {
        ...niveles,
        descripcion_habilitacion: meta.descripcion || "",
        barreras_detectadas: meta.barreras_detectadas || "",
        facilitadores: meta.facilitadores || "",
        observaciones: meta.observaciones || "",
      };
    } catch {
      /* texto legacy */
    }
  }
  return {
    ...niveles,
    descripcion_habilitacion: raw,
    barreras_detectadas: "",
    facilitadores: "",
    observaciones: "",
  };
}


function obtenerMetaHabilitacion(raw?: string | null): Partial<HabilitacionMeta> {
  if (!raw || !raw.startsWith(HAB_META_PREFIX)) return {};
  try {
    return JSON.parse(raw.slice(HAB_META_PREFIX.length)) as HabilitacionMeta;
  } catch {
    return {};
  }
}

function normalizarPersonaUsuaria(row: any): PersonaUsuaria {
  return {
    id: String(row.id),
    proyecto_id: row.proyecto_id || PROYECTO_ID,
    nombre_arquetipo: row.nombre_arquetipo || "Perfil sin nombre",
    rol: row.rol || "",
    descripcion: row.descripcion || "",
    necesidades: row.necesidades || [],
    barreras: row.barreras || [],
    motivaciones: row.motivaciones || [],
    foto_url: row.foto_url || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function normalizarHabilitacion(row: any): Habilitacion {
  const meta = obtenerMetaHabilitacion(row.descripcion_habilitacion);
  return {
    id: String(row.id),
    proyecto_id: row.proyecto_id || PROYECTO_ID,
    persona_usuaria_id: row.persona_usuaria_id || meta.persona_usuaria_id || "",
    nivel_acceso: row.nivel_acceso || "",
    nivel_conocimiento: row.nivel_conocimiento || "",
    nivel_digital: row.nivel_digital || "",
    descripcion_habilitacion: row.descripcion_habilitacion || "",
    estado: row.estado || meta.estado || "borrador",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}


function habilitacionAResumen(hab: Habilitacion): string {
  return `${hab.nivel_acceso || "—"} / ${hab.nivel_conocimiento || "—"} / ${hab.nivel_digital || "—"}`;
}

function estadoHabilitacionLabel(estado?: string) {
  return estado === "validado" ? "Validado" : "Borrador";
}

function estadoHabilitacionClass(estado?: string) {
  return estado === "validado"
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";
}

function estadoLabel(cumplimiento?: string) {
  if (cumplimiento === "Cumplido") return "Cumplido";
  if (cumplimiento === "Parcialmente cumplido") return "Parcialmente cumplido";
  return "No cumplido";
}

function estadoClass(cumplimiento?: string) {
  if (cumplimiento === "Cumplido") return "bg-green-100 text-green-700";
  if (cumplimiento === "Parcialmente cumplido")
    return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

export default function HabilitacionFlow({
  onNavigate,
}: {
  onNavigate?: (flujo: string | null) => void;
}) {
  const [tab, setTab] = useState<"habilitacion" | "expectativas" | "registros" | "lienzo">(
    "habilitacion"
  );

  const [personasUsuarias, setPersonasUsuarias] = useState<PersonaUsuaria[]>([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<
    PersonaUsuaria | null
  >(null);

  const [expectativaForm, setExpectativaForm] =
    useState<ExpectativaForm>(createInitialExpectativaForm());

  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([]);
  const [expectativas, setExpectativas] = useState<Expectativa[]>([]);

  const [editingExpectativaId, setEditingExpectativaId] = useState<
    string | null
  >(null);
  const [habilitacionForm, setHabilitacionForm] = useState<HabilitacionForm>(
    createInitialHabilitacionForm()
  );
  const [editingHabilitacionId, setEditingHabilitacionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const habilitacionDelPerfil = useMemo(() => {
    if (!perfilSeleccionado) return null;
    return (
      habilitaciones.find(
        (h) => h.persona_usuaria_id === perfilSeleccionado.id
      ) || null
    );
  }, [habilitaciones, perfilSeleccionado]);

  const expectativasDelPerfil = useMemo(() => {
    if (!perfilSeleccionado) return [];
    return expectativas.filter(
      (exp) => exp.persona_usuaria_id === perfilSeleccionado.id
    );
  }, [expectativas, perfilSeleccionado]);

  const registrosPorPerfil = useMemo(() => {
    return personasUsuarias
      .map((perfil) => {
        const hab =
          habilitaciones.find((h) => h.persona_usuaria_id === perfil.id) ||
          null;
        const exps = expectativas.filter(
          (e) => e.persona_usuaria_id === perfil.id
        );
        return { perfil, hab, exps };
      })
      .filter((r) => r.hab || r.exps.length > 0);
  }, [personasUsuarias, habilitaciones, expectativas]);

  const habilitacionDetalle = useMemo(() => {
    if (!habilitacionDelPerfil) return null;
    return parsearDescripcionHabilitacion(
      habilitacionDelPerfil.descripcion_habilitacion || "",
      {
        nivel_acceso: habilitacionDelPerfil.nivel_acceso || "",
        nivel_conocimiento: habilitacionDelPerfil.nivel_conocimiento || "",
        nivel_digital: habilitacionDelPerfil.nivel_digital || "",
      }
    );
  }, [habilitacionDelPerfil]);

  function updateExpectativaField<K extends keyof ExpectativaForm>(
    field: K,
    value: ExpectativaForm[K]
  ) {
    setExpectativaForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateHabilitacionField<K extends keyof HabilitacionForm>(
    field: K,
    value: HabilitacionForm[K]
  ) {
    setHabilitacionForm((prev) => ({ ...prev, [field]: value }));
  }

  function cargarFormularioHabilitacion(hab: Habilitacion | null) {
    if (hab) {
      setEditingHabilitacionId(hab.id);
      setHabilitacionForm(
        parsearDescripcionHabilitacion(hab.descripcion_habilitacion || "", {
          nivel_acceso: hab.nivel_acceso || "",
          nivel_conocimiento: hab.nivel_conocimiento || "",
          nivel_digital: hab.nivel_digital || "",
        })
      );
      return;
    }
    setEditingHabilitacionId(null);
    setHabilitacionForm(createInitialHabilitacionForm());
  }

  function seleccionarPerfil(perfil: PersonaUsuaria | null) {
    setPerfilSeleccionado(perfil);
    if (!perfil) {
      cargarFormularioHabilitacion(null);
      setExpectativaForm(createInitialExpectativaForm());
      setEditingExpectativaId(null);
      return;
    }
    const hab = habilitaciones.find((h) => h.persona_usuaria_id === perfil.id);
    cargarFormularioHabilitacion(hab || null);
    setExpectativaForm({
      ...createInitialExpectativaForm(),
      persona_usuaria_id: perfil.id,
    });
    setEditingExpectativaId(null);
  }

  async function leerErrorBackend(res: Response) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return JSON.stringify(json);
    } catch {
      return text;
    }
  }

  async function cargarPersonasUsuarias() {
    try {
      const { data, error } = await supabase
        .from("persona_usuaria")
        .select("*")
        .eq("proyecto_id", PROYECTO_ID)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("No se pudieron cargar personas usuarias:", error);
        setMessage("No se pudieron cargar los perfiles de personas usuarias.");
        return;
      }

      const mappedData = (data || []).map(normalizarPersonaUsuaria);
      setPersonasUsuarias(mappedData);

      if (mappedData.length > 0 && !perfilSeleccionado) {
        seleccionarPerfil(mappedData[0]);
      }
    } catch (error) {
      console.warn("Error general al cargar personas usuarias:", error);
    }
  }
  async function cargarHabilitaciones() {
    try {
      const { data, error } = await supabase
        .from("habilitacion")
        .select("*")
        .eq("proyecto_id", PROYECTO_ID)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error al cargar habilitaciones:", error);
        return;
      }

      const habilitacionesMapeadas = (data || []).map(normalizarHabilitacion);
      setHabilitaciones(habilitacionesMapeadas);

      if (perfilSeleccionado) {
        const delPerfil = habilitacionesMapeadas.find(
          (h: Habilitacion) => h.persona_usuaria_id === perfilSeleccionado.id
        );
        cargarFormularioHabilitacion(delPerfil || null);
      }
    } catch (error) {
      console.warn("Error al cargar habilitaciones:", error);
    }
  }

  async function cargarExpectativas() {
    try {
      const { data, error } = await supabase
        .from("expectativa")
        .select("*")
        .eq("proyecto_id", PROYECTO_ID)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setExpectativas((data || []) as Expectativa[]);
    } catch (error) {
      console.warn("Error al listar expectativas:", error);
    }
  }

  async function obtenerExpectativaPorId(id: string) {
    const { data, error } = await supabase
      .from("expectativa")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("No se pudo cargar la expectativa.");
    }

    return data as Expectativa;
  }

  async function editarExpectativa(id: string) {
    try {
      const expectativa = await obtenerExpectativaPorId(id);

      setEditingExpectativaId(expectativa.id);
      setExpectativaForm({
        persona_usuaria_id: expectativa.persona_usuaria_id || "",
        expectativa_usuario: expectativa.expectativa_usuario || "",
        nivel_cumplimiento: expectativa.nivel_cumplimiento || "No cumplido",
        resultado_esperado: expectativa.resultado_esperado || "",
        indicador_exito: expectativa.indicador_exito || "",
        linea_accion: expectativa.linea_accion || "",
        observaciones: expectativa.analisis_ia || "",
      });

      setTab("expectativas");
      setMessage(`Editando expectativa`);
    } catch (error) {
      console.error("Error al cargar expectativa para editar:", error);
      setMessage("No se pudo cargar la expectativa para editar.");
    }
  }

  useEffect(() => {
    async function fetchData() {
      await cargarPersonasUsuarias();
      await cargarHabilitaciones();
      await cargarExpectativas();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function guardarHabilitacion() {
    if (!perfilSeleccionado) {
      setMessage("Debes seleccionar un perfil de persona usuaria.");
      return;
    }
    if (!habilitacionForm.descripcion_habilitacion.trim()) {
      setMessage("Debes ingresar la descripción de habilitación.");
      return;
    }
    if (
      !habilitacionForm.nivel_acceso ||
      !habilitacionForm.nivel_conocimiento ||
      !habilitacionForm.nivel_digital
    ) {
      setMessage("Completa los niveles de acceso, conocimiento y competencia digital.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const datosGuardar = {
        nivel_acceso: habilitacionForm.nivel_acceso,
        nivel_conocimiento: habilitacionForm.nivel_conocimiento,
        nivel_digital: habilitacionForm.nivel_digital,
        descripcion_habilitacion: serializarDescripcionHabilitacion(
          habilitacionForm,
          perfilSeleccionado.id,
          "borrador"
        ),
      };

      const operacion = editingHabilitacionId
        ? supabase
            .from("habilitacion")
            .update(datosGuardar)
            .eq("id", editingHabilitacionId)
            .select()
            .single()
        : supabase
            .from("habilitacion")
            .insert([{ ...datosGuardar, proyecto_id: PROYECTO_ID }])
            .select()
            .single();

      const { data, error } = await operacion;

      if (error) {
        throw new Error(error.message);
      }

      const guardada = normalizarHabilitacion(data);
      cargarFormularioHabilitacion(guardada);
      await cargarHabilitaciones();
      setTab("registros");
      setMessage("Habilitación guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar habilitación:", error);
      setMessage(
        error instanceof Error ? `Error: ${error.message}` : "No se pudo guardar."
      );
    } finally {
      setLoading(false);
    }
  }

  async function guardarExpectativa() {
    if (!expectativaForm.expectativa_usuario.trim()) {
      setMessage("Debes ingresar la expectativa del usuario.");
      return;
    }

    if (!expectativaForm.persona_usuaria_id) {
      setMessage("Debes seleccionar un perfil.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { observaciones, ...restoExpectativa } = expectativaForm;
      const payloadBase = {
        ...restoExpectativa,
        analisis_ia: observaciones || null,
      };

      const operacion = editingExpectativaId
        ? supabase
            .from("expectativa")
            .update(payloadBase)
            .eq("id", editingExpectativaId)
        : supabase
            .from("expectativa")
            .insert([{ ...payloadBase, proyecto_id: PROYECTO_ID }]);

      const { error } = await operacion;

      if (error) {
        throw new Error(error.message);
      }

      setEditingExpectativaId(null);
      setExpectativaForm({
        ...createInitialExpectativaForm(),
        persona_usuaria_id: perfilSeleccionado?.id || "",
      });

      await cargarExpectativas();

      setMessage("Expectativa guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar expectativa:", error);
      setMessage(
        error instanceof Error ? `Error: ${error.message}` : "No se pudo guardar."
      );
    } finally {
      setLoading(false);
    }
  }

  async function eliminarExpectativa(id: string) {
    const ok = window.confirm(
      "¿Seguro que deseas eliminar esta expectativa?"
    );

    if (!ok) return;

    try {
      const { error } = await supabase
        .from("expectativa")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await cargarExpectativas();
      setMessage("Expectativa eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar expectativa:", error);
      setMessage("No se pudo eliminar la expectativa.");
    }
  }

  async function editarHabilitacion(id: string) {
    const hab = habilitaciones.find((h) => h.id === id);
    if (!hab) return;

    const perfil = personasUsuarias.find((p) => p.id === hab.persona_usuaria_id);
    if (perfil) seleccionarPerfil(perfil);
    cargarFormularioHabilitacion(hab);
    setTab("habilitacion");
    setMessage("Editando habilitación");
  }

  async function eliminarHabilitacion(id: string) {
    const ok = window.confirm("¿Seguro que deseas eliminar esta habilitación?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("habilitacion")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      await cargarHabilitaciones();
      setMessage("Habilitación eliminada correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("No se pudo eliminar la habilitación.");
    }
  }

  function verRegistro(perfilId: string) {
    const perfil = personasUsuarias.find((p) => p.id === perfilId);
    if (perfil) seleccionarPerfil(perfil);
    setTab("lienzo");
    setMessage("Vista de lienzo del perfil seleccionado.");
  }

  async function validarHabilitacion(id: string) {
    try {
      const hab = habilitaciones.find((item) => item.id === id);
      if (!hab) return;

      const formHab = parsearDescripcionHabilitacion(hab.descripcion_habilitacion || "", {
        nivel_acceso: hab.nivel_acceso,
        nivel_conocimiento: hab.nivel_conocimiento,
        nivel_digital: hab.nivel_digital,
      });

      const { error } = await supabase
        .from("habilitacion")
        .update({
          descripcion_habilitacion: serializarDescripcionHabilitacion(
            formHab,
            hab.persona_usuaria_id,
            "validado"
          ),
        })
        .eq("id", id);

      if (error) throw new Error(error.message);

      const perfil = personasUsuarias.find((p) => p.id === hab.persona_usuaria_id);
      if (perfil) seleccionarPerfil(perfil);

    await cargarHabilitaciones();
setTab("lienzo");
setMessage("Habilitación y expectativas validadas correctamente.");

window.dispatchEvent(
  new CustomEvent("actualizar-ruta-proposito", {
    detail: { siguienteEtapa: 4 },
  })
);
    } catch (error) {
      console.error(error);
      setMessage("No se pudo validar el registro.");
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>
          <nav className="mt-10 space-y-2 text-sm flex flex-col items-start">
            {(
              [
                ["← Volver al Catálogo", null, false],
                ["Investigar", "investigacion", false],
                ["Definir Personas", "personas", false],
                ["Habilitación y Expectativas", "habilitacion", true],
                ["Definir Necesidades", "necesidades", false],
                ["Idear", "idear", false],
                ["Prototipar", "prototipar", false],
                ["Evaluar", "evaluar", false],
                ["Implementar", "implementar", false],
              ] as [string, string | null, boolean][]
            ).map(([label, route, active]) => (
              <button
                key={label}
                onClick={() => onNavigate && onNavigate(route)}
                className={`w-full text-left rounded-xl px-3 py-3 ${
                  active ? "bg-teal-50 font-semibold text-teal-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
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

                <h1 className="mt-6 text-4xl font-bold">
                  Habilitación y Expectativas
                </h1>

                <p className="mt-1 text-slate-500">
                  (Guía UXLab págs. 102-103) Detecta niveles de habilitación y expectativas de las personas
                  usuarias del servicio para asegurar una experiencia alineada a
                  sus capacidades y necesidades, identificando barreras y facilitadores clave.
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-4">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
              <label className="font-semibold text-lg">
                Perfil de persona usuaria
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona el perfil para evaluar su habilitación y sus expectativas.
              </p>
              <select
                aria-label="Selecciona un perfil de usuario"
                className="mt-3 w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                value={perfilSeleccionado?.id || ""}
                onChange={(e) => {
                  const perfil = personasUsuarias.find((p) => p.id === e.target.value);
                  seleccionarPerfil(perfil || null);
                }}
              >
                <option value="">Selecciona un perfil...</option>
                {personasUsuarias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_arquetipo} ({p.rol})
                  </option>
                ))}
              </select>
              {perfilSeleccionado && (
                <div className="mt-4 rounded-lg bg-teal-50 p-4">
                  <p className="text-sm font-semibold text-teal-900">
                    {perfilSeleccionado.nombre_arquetipo}
                  </p>
                  <p className="mt-1 text-sm text-teal-700">
                    {perfilSeleccionado.descripcion}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6 flex gap-4 border-b border-slate-200">
              {[
                ["habilitacion", "Habilitación"],
                ["expectativas", "Expectativas"],
                ["registros", "Registros Guardados"],
                ["lienzo", "Vista de lienzo"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key as typeof tab)}
                  className={`border-b-2 px-2 pb-3 text-sm font-semibold ${tab === key
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-slate-500"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {message}
              </div>
            )}

            {tab === "habilitacion" && (
              <div className="space-y-6">
                {!perfilSeleccionado ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Selecciona un perfil arriba para registrar su habilitación.
                  </p>
                ) : (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h2 className="text-lg font-bold">
                        Habilitación · {perfilSeleccionado.nombre_arquetipo}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Registra los niveles de habilitación del perfil seleccionado.
                      </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      {(
                        [
                          ["nivel_acceso", "Nivel de acceso al servicio"],
                          ["nivel_conocimiento", "Nivel de conocimiento del servicio"],
                          ["nivel_digital", "Competencia digital"],
                        ] as const
                      ).map(([field, label]) => (
                        <div
                          key={field}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <label className="font-semibold">{label}</label>
                          <select
                            aria-label={label}
                            value={habilitacionForm[field]}
                            onChange={(e) =>
                              updateHabilitacionField(field, e.target.value)
                            }
                            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                          >
                            <option value="">Selecciona...</option>
                            {NIVELES.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="font-semibold">Descripción de habilitación</label>
                      <textarea
                        value={habilitacionForm.descripcion_habilitacion}
                        onChange={(e) =>
                          updateHabilitacionField(
                            "descripcion_habilitacion",
                            e.target.value
                          )
                        }
                        placeholder="Describe la habilitación detectada para este perfil"
                        className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">Barreras detectadas</label>
                        <textarea
                          value={habilitacionForm.barreras_detectadas}
                          onChange={(e) =>
                            updateHabilitacionField(
                              "barreras_detectadas",
                              e.target.value
                            )
                          }
                          placeholder="Ej.: dificultad con canales digitales"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">Facilitadores</label>
                        <textarea
                          value={habilitacionForm.facilitadores}
                          onChange={(e) =>
                            updateHabilitacionField("facilitadores", e.target.value)
                          }
                          placeholder="Ej.: apoyo presencial, material simple"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                        <label className="font-semibold">Observaciones</label>
                        <textarea
                          value={habilitacionForm.observaciones}
                          onChange={(e) =>
                            updateHabilitacionField("observaciones", e.target.value)
                          }
                          placeholder="Notas adicionales sobre la habilitación del perfil"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={guardarHabilitacion}
                        disabled={loading}
                        className="rounded-xl border border-teal-600 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                      >
                        {loading
                          ? "Guardando..."
                          : editingHabilitacionId
                            ? "Guardar cambios"
                            : "Guardar habilitación"}
                      </button>
                      <button
                        type="button"
                        onClick={() => cargarFormularioHabilitacion(habilitacionDelPerfil)}
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("expectativas")}
                        className="rounded-xl border border-teal-600 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                      >
                        Ir a expectativas
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "expectativas" && (
              <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h2 className="text-lg font-bold">
                      Herramienta: Expectativas por Perfil
                    </h2>

                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                      Define expectativas específicas para cada perfil de
                      persona usuaria. Selecciona un perfil y registra sus
                      expectativas.
                    </p>

                    <span className="mt-4 inline-flex rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                      Guía UXLab · págs. 102–103
                    </span>
                  </div>

                  {perfilSeleccionado && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">
                          Expectativa principal
                        </label>

                        <textarea
                          value={expectativaForm.expectativa_usuario}
                          onChange={(e) =>
                            updateExpectativaField(
                              "expectativa_usuario",
                              e.target.value
                            )
                          }
                          placeholder="¿Qué espera esta persona del servicio?"
                          className="mt-3 min-h-16 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">
                          Nivel de cumplimiento
                        </label>

                        <select
                          aria-label="Nivel de cumplimiento"
                          value={expectativaForm.nivel_cumplimiento}
                          onChange={(e) =>
                            updateExpectativaField(
                              "nivel_cumplimiento",
                              e.target.value
                            )
                          }
                          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        >
                          <option>No cumplido</option>
                          <option>Parcialmente cumplido</option>
                          <option>Cumplido</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">
                          Resultado esperado
                        </label>

                        <textarea
                          value={expectativaForm.resultado_esperado}
                          onChange={(e) =>
                            updateExpectativaField(
                              "resultado_esperado",
                              e.target.value
                            )
                          }
                          placeholder="¿Cuál es el resultado esperado?"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <label className="font-semibold">
                          Indicador de éxito
                        </label>

                        <textarea
                          value={expectativaForm.indicador_exito}
                          onChange={(e) =>
                            updateExpectativaField(
                              "indicador_exito",
                              e.target.value
                            )
                          }
                          placeholder="¿Cómo medirás el éxito?"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                        <label className="font-semibold">
                          Línea de acción
                        </label>

                        <textarea
                          value={expectativaForm.linea_accion}
                          onChange={(e) =>
                            updateExpectativaField("linea_accion", e.target.value)
                          }
                          placeholder="¿Qué acciones se tomarán para cumplir?"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                        <label className="font-semibold">Observaciones</label>
                        <textarea
                          value={expectativaForm.observaciones}
                          onChange={(e) =>
                            updateExpectativaField("observaciones", e.target.value)
                          }
                          placeholder="Notas adicionales sobre esta expectativa"
                          className="mt-3 min-h-16 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  )}

                  {perfilSeleccionado && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">
                      Agrega y gestiona expectativas para{" "}
                      <strong>{perfilSeleccionado.nombre_arquetipo}</strong>.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={guardarExpectativa}
                        disabled={loading}
                        className="rounded-xl border border-teal-600 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                      >
                        {loading
                          ? "Guardando..."
                          : editingExpectativaId
                            ? "Guardar cambios"
                            : "Guardar expectativa"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpectativaId(null);
                          setExpectativaForm({
                            ...createInitialExpectativaForm(),
                            persona_usuaria_id: perfilSeleccionado.id,
                          });
                        }}
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  )}
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h2 className="text-lg font-bold">
                      Expectativas del perfil
                    </h2>

                    {!perfilSeleccionado ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Selecciona un perfil para ver sus expectativas.
                      </p>
                    ) : expectativasDelPerfil.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Sin expectativas registradas para este perfil.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {expectativasDelPerfil.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 p-3"
                          >
                            <p className="text-sm font-semibold">
                              {item.expectativa_usuario}
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${estadoClass(
                                item.nivel_cumplimiento
                              )}`}
                            >
                              {estadoLabel(item.nivel_cumplimiento)}
                            </span>

                            <div className="mt-3 flex gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => editarExpectativa(item.id)}
                                className="font-semibold text-teal-700 hover:underline"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarExpectativa(item.id)}
                                className="font-semibold text-red-600 hover:underline"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {tab === "registros" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold">Registros Guardados</h2>
                <p className="mt-1 mb-6 text-sm text-slate-500">
                  Lista de habilitaciones y expectativas por perfil de persona usuaria.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Perfil</th>
                        <th className="px-4 py-3 font-semibold">Habilitación</th>
                        <th className="px-4 py-3 font-semibold">Expectativas</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {habilitaciones.map((habilitacion) => {
                        const expectativasPerfil = expectativas.filter(
                          (exp) => exp.persona_usuaria_id === habilitacion.persona_usuaria_id
                        );
                        const perfil = personasUsuarias.find(
                          (p) => p.id === habilitacion.persona_usuaria_id
                        );

                        return (
                          <tr key={habilitacion.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {perfil?.nombre_arquetipo || "Sin perfil"}
                            </td>
                            <td className="px-4 py-3">
                              {habilitacion.nivel_acceso || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {expectativasPerfil.length} registradas
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${habilitacion.estado === "validado"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                  }`}
                              >
                                {habilitacion.estado === "validado" ? "Validado" : "Borrador"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    verRegistro(habilitacion.persona_usuaria_id)
                                  }
                                  className="font-semibold text-teal-700 hover:underline"
                                >
                                  Ver
                                </button>
                                <button
                                  type="button"
                                  onClick={() => editarHabilitacion(habilitacion.id)}
                                  className="font-semibold text-teal-700 hover:underline"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarHabilitacion(habilitacion.id)}
                                  className="font-semibold text-red-600 hover:underline"
                                >
                                  Eliminar
                                </button>
                                {habilitacion.estado !== "validado" && (
                                  <button
                                    type="button"
                                    onClick={() => validarHabilitacion(habilitacion.id)}
                                    className="font-semibold text-blue-600 hover:underline"
                                  >
                                    Validar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {habilitaciones.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No hay registros guardados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "lienzo" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      Lienzo: Habilitación y Expectativas
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {perfilSeleccionado
                        ? `Perfil: ${perfilSeleccionado.nombre_arquetipo}`
                        : "Selecciona un perfil para ver el resumen."}
                    </p>
                  </div>

                  {habilitacionDelPerfil && (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        habilitacionDelPerfil.estado === "validado"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {habilitacionDelPerfil.estado === "validado"
                        ? "Validado"
                        : "Borrador"}
                    </span>
                  )}
                </div>

                {!perfilSeleccionado ? (
                  <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Selecciona un perfil arriba para ver su lienzo.
                  </p>
                ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {habilitacionDelPerfil ? (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <h3 className="font-bold text-teal-700">
                        Diagnóstico de Habilitación
                      </h3>

                      <div className="mt-4 space-y-2 text-sm">
                        <div>
                          <strong>Acceso:</strong> {habilitacionDelPerfil.nivel_acceso}
                        </div>
                        <div>
                          <strong>Conocimiento:</strong>{" "}
                          {habilitacionDelPerfil.nivel_conocimiento}
                        </div>
                        <div>
                          <strong>Digital:</strong> {habilitacionDelPerfil.nivel_digital}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                        <strong className="block">Descripción:</strong>
                        <p className="mt-1 text-slate-700">
                          {habilitacionDetalle?.descripcion_habilitacion || "—"}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <strong className="block text-sm">Barreras:</strong>
                          <p className="mt-1 text-sm text-slate-700">
                            {habilitacionDetalle?.barreras_detectadas || "—"}
                          </p>
                        </div>
                        <div>
                          <strong className="block text-sm">Facilitadores:</strong>
                          <p className="mt-1 text-sm text-slate-700">
                            {habilitacionDetalle?.facilitadores || "—"}
                          </p>
                        </div>
                      </div>

                      {habilitacionDetalle?.observaciones && (
                        <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                          <strong className="block">Observaciones:</strong>
                          <p className="mt-1 text-slate-700">
                            {habilitacionDetalle.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                      Sin habilitación registrada.
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-bold text-teal-700">
                      Expectativas ({expectativasDelPerfil.length})
                    </h3>

                    {expectativasDelPerfil.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Sin expectativas registradas.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {expectativasDelPerfil.map((exp) => (
                          <div
                            key={exp.id}
                            className="rounded-xl border border-slate-200 p-3"
                          >
                            <p className="font-semibold text-sm">
                              {exp.expectativa_usuario}
                            </p>
                            
                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${estadoClass(
                                exp.nivel_cumplimiento
                              )}`}
                            >
                              {estadoLabel(exp.nivel_cumplimiento)}
                            </span>

                            {exp.resultado_esperado && (
                              <div className="mt-3 text-sm">
                                <strong>Resultado esperado:</strong>
                                <p className="text-slate-700">{exp.resultado_esperado}</p>
                              </div>
                            )}

                            {exp.indicador_exito && (
                              <div className="mt-2 text-sm">
                                <strong>Indicador de éxito:</strong>
                                <p className="text-slate-700">{exp.indicador_exito}</p>
                              </div>
                            )}

                            {exp.linea_accion && (
                              <div className="mt-2 text-sm">
                                <strong>Línea de acción:</strong>
                                <p className="text-slate-700">{exp.linea_accion}</p>
                              </div>
                            )}

                            {exp.analisis_ia && (
                              <div className="mt-2 text-sm">
                                <strong>Observaciones:</strong>
                                <p className="text-slate-700">{exp.analisis_ia}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
