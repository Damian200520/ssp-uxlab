"use client";

import { useEffect, useMemo, useState } from "react";
import AsistenciaIAEtapa from "./AsistenciaIAEtapa";
import TagInput from "./TagInput";
import { apiFetch as fetch } from "../../lib/api";

const NIVELES = ["Bajo", "Medio", "Alto"] as const;
const HAB_META_PREFIX = "::uxlab-hab-meta::";

type HabilitacionMeta = {
  persona_usuaria_id?: string;
  descripcion: string;
  barreras_detectadas: string;
  facilitadores: string;
  observaciones: string;
  estado?: string;
  validado_ruta?: boolean;
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
  estado = "borrador",
  validado_ruta = false
): string {
  const meta: HabilitacionMeta = {
    persona_usuaria_id,
    descripcion: form.descripcion_habilitacion,
    barreras_detectadas: form.barreras_detectadas,
    facilitadores: form.facilitadores,
    observaciones: form.observaciones,
    estado,
    validado_ruta,
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
    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50"
    : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50";
}

function estadoLabel(cumplimiento?: string) {
  if (cumplimiento === "Cumplido") return "Cumplido";
  if (cumplimiento === "Parcialmente cumplido") return "Parcialmente cumplido";
  return "No cumplido";
}

function estadoClass(cumplimiento?: string) {
  if (cumplimiento === "Cumplido") return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50";
  if (cumplimiento === "Parcialmente cumplido")
    return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50";
  return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50";
}

export default function HabilitacionFlow({
  proyectoId = PROYECTO_ID,
  onNavigate,
}: {
  proyectoId?: string;
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
      const res = await fetch(`${API_URL}/proyectos/${proyectoId}/personas-usuarias`);

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      const mappedData = (json.personas_usuarias || []).map(normalizarPersonaUsuaria);
      setPersonasUsuarias(mappedData);

      if (mappedData.length > 0 && !perfilSeleccionado) {
        seleccionarPerfil(mappedData[0]);
      }
    } catch (error) {
      console.warn("Error general al cargar personas usuarias:", error);
      setMessage("No se pudieron cargar los perfiles de personas usuarias.");
    }
  }
  async function cargarHabilitaciones() {
    try {
      const res = await fetch(`${API_URL}/proyectos/${proyectoId}/habilitaciones`);

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      const habilitacionesMapeadas = (json.habilitaciones || []).map(normalizarHabilitacion);
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
      const res = await fetch(`${API_URL}/proyectos/${proyectoId}/expectativas`);

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setExpectativas((json.expectativas || []) as Expectativa[]);
    } catch (error) {
      console.warn("Error al listar expectativas:", error);
    }
  }

  async function obtenerExpectativaPorId(id: string) {
    const res = await fetch(`${API_URL}/expectativas/${id}`);

    if (!res.ok) {
      throw new Error("No se pudo cargar la expectativa.");
    }

    const json = await res.json();
    return json.data as Expectativa;
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
      setMessage(`Editando la expectativa`);
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
  }, [proyectoId]);

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

      const res = await fetch(
        editingHabilitacionId
          ? `${API_URL}/habilitacion/${editingHabilitacionId}`
          : `${API_URL}/habilitacion`,
        {
          method: editingHabilitacionId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingHabilitacionId
              ? datosGuardar
              : { ...datosGuardar, proyecto_id: proyectoId }
          ),
        }
      );

      if (!res.ok) throw new Error(await leerErrorBackend(res));

      const json = await res.json();

      const guardada = normalizarHabilitacion(json.data);
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

      const res = await fetch(
        editingExpectativaId
          ? `${API_URL}/expectativas/${editingExpectativaId}`
          : `${API_URL}/expectativas`,
        {
          method: editingExpectativaId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingExpectativaId
              ? payloadBase
              : { ...payloadBase, proyecto_id: proyectoId }
          ),
        }
      );

      if (!res.ok) throw new Error(await leerErrorBackend(res));

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
      const res = await fetch(`${API_URL}/expectativas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await leerErrorBackend(res));

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
    setMessage("Editando la habilitación");
  }

  async function eliminarHabilitacion(id: string) {
    const ok = window.confirm("¿Seguro que deseas eliminar esta habilitación?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/habilitacion/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await leerErrorBackend(res));

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

      const res = await fetch(`${API_URL}/habilitacion/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion_habilitacion: serializarDescripcionHabilitacion(
            formHab,
            hab.persona_usuaria_id,
            "validado",
            true
          ),
        }),
      });

      if (!res.ok) throw new Error(await leerErrorBackend(res));

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
    <main className="min-h-0 bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900">
      <div className="flex">
        <aside className="hidden">
          <div className="text-2xl font-bold bg-gradient-to-br from-teal-700 to-emerald-700 bg-clip-text text-transparent">SSP·UXLab</div>
          <nav className="mt-10 space-y-1 text-sm flex flex-col items-start">
            {(
              [
                ["← Volver al Catálogo", null, false],
                ["Investigar", "investigacion", false],
                ["Definir Personas", "personas", false],
                ["Habilitación y Expectativas", "habilitacion", true],
                ["Definir Necesidades", "necesidades", false],
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Habilitación y Expectativas
                </h1>

                <p className="mt-1 text-slate-500 leading-relaxed">
                  (Guía UXLab págs. 102-103) Detecta niveles de habilitación y expectativas de las personas
                  usuarias del servicio. Asegura una experiencia alineada con
                  sus capacidades y necesidades, e identifica barreras y facilitadores clave.
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-4">
            <div className="mb-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Objetivo</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Detectar los niveles de habilitación digital y las expectativas de las personas usuarias
                para asegurar una experiencia alineada con sus capacidades y necesidades.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md shadow-slate-100/50">
              <label className="font-semibold text-lg text-slate-800">
                Perfil de persona usuaria
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona el perfil para evaluar su habilitación y sus expectativas.
              </p>
              <select
                aria-label="Selecciona un perfil de usuario"
                className="mt-3 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
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
                <div className="mt-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 p-4 border border-teal-100/60 shadow-sm">
                  <p className="text-sm font-semibold text-teal-900">
                    {perfilSeleccionado.nombre_arquetipo}
                  </p>
                  <p className="mt-1 text-sm text-teal-700">
                    {perfilSeleccionado.descripcion}
                  </p>
                </div>
              )}
            </div>

            <AsistenciaIAEtapa etapa={3} contexto="Habilitación y Expectativas" />

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTab("habilitacion")}
                className={`rounded-lg border p-4 text-left transition ${
                  tab === "habilitacion"
                    ? "border-teal-300 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-teal-200"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Paso 1</span>
                <p className="mt-1 text-sm font-bold text-slate-900">Registrar habilitación</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Evalúa acceso, conocimiento, competencia digital, barreras y facilitadores.</p>
              </button>
              <button
                type="button"
                onClick={() => setTab("expectativas")}
                className={`rounded-lg border p-4 text-left transition ${
                  tab === "expectativas"
                    ? "border-teal-300 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-teal-200"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Paso 2</span>
                <p className="mt-1 text-sm font-bold text-slate-900">Registrar expectativas</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Usa el mismo perfil seleccionado para documentar lo que espera del servicio.</p>
              </button>
            </div>

            <div className="ux-card mb-6 grid gap-2 rounded-lg p-2 sm:grid-cols-4">
              {[
                ["habilitacion", "Habilitación"],
                ["expectativas", "Expectativas"],
                ["registros", "Registros guardados"],
                ["lienzo", "Vista de lienzo"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key as typeof tab)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${tab === key
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3 text-sm text-teal-800 shadow-sm">
                {message}
              </div>
            )}

            {tab === "habilitacion" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Herramienta principal</p>
                </div>
                <div className="space-y-6">
                  {!perfilSeleccionado ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/30 p-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">Selecciona un perfil para comenzar</p>
                        <p className="mt-1 text-xs text-slate-400">Elige un perfil de persona usuaria en el selector superior para evaluar su habilitación.</p>
                      </div>
                    </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-100/50">
                      <h2 className="text-lg font-bold tracking-tight text-slate-800">
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
                          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200"
                        >
                          <label className="font-semibold text-slate-700">{label}</label>
                          <select
                            aria-label={label}
                            value={habilitacionForm[field]}
                            onChange={(e) =>
                              updateHabilitacionField(field, e.target.value)
                            }
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
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

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                      <label className="font-semibold text-slate-700">Descripción de habilitación</label>
                      <textarea
                        value={habilitacionForm.descripcion_habilitacion}
                        onChange={(e) =>
                          updateHabilitacionField(
                            "descripcion_habilitacion",
                            e.target.value
                          )
                        }
                        placeholder="Describe la habilitación detectada para este perfil"
                        className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <TagInput
                          label="Barreras detectadas"
                          value={habilitacionForm.barreras_detectadas}
                          onChange={(value) => updateHabilitacionField("barreras_detectadas", value)}
                          placeholder="Agregar barrera"
                          tone="amber"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <TagInput
                          label="Facilitadores"
                          value={habilitacionForm.facilitadores}
                          onChange={(value) => updateHabilitacionField("facilitadores", value)}
                          placeholder="Agregar facilitador"
                          tone="teal"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200 lg:col-span-2">
                        <label className="font-semibold text-slate-700">Observaciones</label>
                        <textarea
                          value={habilitacionForm.observaciones}
                          onChange={(e) =>
                            updateHabilitacionField("observaciones", e.target.value)
                          }
                          placeholder="Notas adicionales sobre la habilitación del perfil"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={guardarHabilitacion}
                        disabled={loading}
                        className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
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
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("expectativas")}
                        className="rounded-xl border border-teal-300/60 px-5 py-2 text-sm font-semibold text-teal-700 transition-all duration-150 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm"
                      >
                        Ir a expectativas
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
            )}

            {tab === "expectativas" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Expectativas de la persona usuaria</p>
                </div>
                <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-100/50">
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                      Herramienta: Expectativas por Perfil
                    </h2>

                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                      Define expectativas específicas para cada perfil de
                      persona usuaria. Selecciona un perfil y registra sus
                      expectativas.
                    </p>

                    <span className="mt-4 inline-flex rounded-xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm">
                      Guía UXLab · págs. 102–103
                    </span>
                  </div>

                  {perfilSeleccionado && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <label className="font-semibold text-slate-700">
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
                          className="mt-3 min-h-16 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <label className="font-semibold text-slate-700">
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
                          className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        >
                          <option>No cumplido</option>
                          <option>Parcialmente cumplido</option>
                          <option>Cumplido</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <label className="font-semibold text-slate-700">
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
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200">
                        <label className="font-semibold text-slate-700">
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
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200 lg:col-span-2">
                        <label className="font-semibold text-slate-700">
                          Línea de acción
                        </label>

                        <textarea
                          value={expectativaForm.linea_accion}
                          onChange={(e) =>
                            updateExpectativaField("linea_accion", e.target.value)
                          }
                          placeholder="¿Qué acciones se tomarán para cumplir?"
                          className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100/50 hover:shadow-md transition-all duration-200 lg:col-span-2">
                        <label className="font-semibold text-slate-700">Observaciones</label>
                        <textarea
                          value={expectativaForm.observaciones}
                          onChange={(e) =>
                            updateExpectativaField("observaciones", e.target.value)
                          }
                          placeholder="Notas adicionales sobre esta expectativa"
                          className="mt-3 min-h-16 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all duration-150 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {perfilSeleccionado && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">
                      Agrega y gestiona expectativas para{" "}
                      <strong>{perfilSeleccionado.nombre_arquetipo}</strong>.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={guardarExpectativa}
                        disabled={loading}
                        className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
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
                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  )}
                </div>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/50">
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
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
                            className="rounded-xl border border-slate-200/80 p-3 hover:shadow-sm transition-all duration-150"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {item.expectativa_usuario}
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold shadow-sm ${estadoClass(
                                item.nivel_cumplimiento
                              )}`}
                            >
                              {estadoLabel(item.nivel_cumplimiento)}
                            </span>

                            <div className="mt-3 flex gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => editarExpectativa(item.id)}
                                className="font-semibold text-teal-700 hover:underline underline-offset-2 transition-all duration-150"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarExpectativa(item.id)}
                                className="font-semibold text-red-600 hover:underline underline-offset-2 transition-all duration-150"
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
            </>
            )}

            {tab === "registros" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Registros guardados</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                <h2 className="text-lg font-bold tracking-tight text-slate-800">Registros Guardados</h2>
                <p className="mt-1 mb-6 text-sm text-slate-500">
                  Lista de habilitaciones y expectativas por perfil de persona usuaria.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200/60">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Perfil</th>
                        <th className="px-4 py-3 font-semibold">Habilitación</th>
                        <th className="px-4 py-3 font-semibold">Expectativas</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {habilitaciones.map((habilitacion) => {
                        const expectativasPerfil = expectativas.filter(
                          (exp) => exp.persona_usuaria_id === habilitacion.persona_usuaria_id
                        );
                        const perfil = personasUsuarias.find(
                          (p) => p.id === habilitacion.persona_usuaria_id
                        );

                        return (
                          <tr key={habilitacion.id} className="hover:bg-slate-50/50 transition-colors duration-100">
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
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-bold shadow-sm ${habilitacion.estado === "validado"
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50"
                                    : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50"
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
                                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2 transition-all duration-150"
                                >
                                  Ver
                                </button>
                                <button
                                  type="button"
                                  onClick={() => editarHabilitacion(habilitacion.id)}
                                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2 transition-all duration-150"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarHabilitacion(habilitacion.id)}
                                  className="font-semibold text-red-600 hover:text-red-700 hover:underline underline-offset-2 transition-all duration-150"
                                >
                                  Eliminar
                                </button>
                                {habilitacion.estado !== "validado" && (
                                  <button
                                    type="button"
                                    onClick={() => validarHabilitacion(habilitacion.id)}
                                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-all duration-150"
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
                          <td colSpan={5} className="px-4 py-10 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50 mx-auto">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                              </div>
                              <p className="text-sm font-semibold text-slate-500">No hay registros guardados</p>
                              <p className="text-xs text-slate-400">Completa la encuesta de habilitación para registrar el primer perfil.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
            )}

            {tab === "lienzo" && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Vista de lienzo</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-100/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
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
                      className={`rounded-full px-3 py-1 text-sm font-bold shadow-sm ${
                        habilitacionDelPerfil.estado === "validado"
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50"
                          : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50"
                      }`}
                    >
                      {habilitacionDelPerfil.estado === "validado"
                        ? "Validado"
                        : "Borrador"}
                    </span>
                  )}
                </div>

                {!perfilSeleccionado ? (
                  <p className="mt-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 text-sm text-slate-500 border border-slate-200/60">
                    Selecciona un perfil arriba para ver su lienzo.
                  </p>
                ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {habilitacionDelPerfil ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                      <h3 className="font-bold text-teal-700">
                        Diagnóstico de Habilitación
                      </h3>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Acceso:</span>
                          <span className="font-semibold text-slate-800">{habilitacionDelPerfil.nivel_acceso}</span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-slate-100">
                          <span className="text-slate-500">Conocimiento:</span>
                          <span className="font-semibold text-slate-800">{habilitacionDelPerfil.nivel_conocimiento}</span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-slate-100">
                          <span className="text-slate-500">Digital:</span>
                          <span className="font-semibold text-slate-800">{habilitacionDelPerfil.nivel_digital}</span>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-200/80 pt-4 text-sm">
                        <strong className="block text-slate-700">Descripción:</strong>
                        <p className="mt-1 text-slate-700 leading-relaxed">
                          {habilitacionDetalle?.descripcion_habilitacion || "—"}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="bg-orange-50/50 border border-orange-200/60 p-3 rounded-xl">
                          <strong className="block text-sm text-orange-700">Barreras:</strong>
                          <p className="mt-1 text-sm text-slate-700">
                            {habilitacionDetalle?.barreras_detectadas || "—"}
                          </p>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-200/60 p-3 rounded-xl">
                          <strong className="block text-sm text-emerald-700">Facilitadores:</strong>
                          <p className="mt-1 text-sm text-slate-700">
                            {habilitacionDetalle?.facilitadores || "—"}
                          </p>
                        </div>
                      </div>

                      {habilitacionDetalle?.observaciones && (
                        <div className="mt-4 border-t border-slate-200/80 pt-4 text-sm">
                          <strong className="block text-slate-700">Observaciones:</strong>
                          <p className="mt-1 text-slate-700 leading-relaxed">
                            {habilitacionDetalle.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100/30 p-4 text-center text-sm text-slate-500">
                      Sin habilitación registrada.
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
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
                            className="rounded-xl border border-slate-200/80 p-3 hover:shadow-sm transition-all duration-150"
                          >
                            <p className="font-semibold text-sm text-slate-800">
                              {exp.expectativa_usuario}
                            </p>
                            
                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold shadow-sm ${estadoClass(
                                exp.nivel_cumplimiento
                              )}`}
                            >
                              {estadoLabel(exp.nivel_cumplimiento)}
                            </span>

                            {exp.resultado_esperado && (
                              <div className="mt-3 text-sm">
                                <strong className="text-slate-700">Resultado esperado:</strong>
                                <p className="text-slate-600 mt-1">{exp.resultado_esperado}</p>
                              </div>
                            )}

                            {exp.indicador_exito && (
                              <div className="mt-2 text-sm">
                                <strong className="text-slate-700">Indicador de éxito:</strong>
                                <p className="text-slate-600 mt-1">{exp.indicador_exito}</p>
                              </div>
                            )}

                            {exp.linea_accion && (
                              <div className="mt-2 text-sm">
                                <strong className="text-slate-700">Línea de acción:</strong>
                                <p className="text-slate-600 mt-1">{exp.linea_accion}</p>
                              </div>
                            )}

                            {exp.analisis_ia && (
                              <div className="mt-2 text-sm">
                                <strong className="text-slate-700">Observaciones:</strong>
                                <p className="text-slate-600 mt-1">{exp.analisis_ia}</p>
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
