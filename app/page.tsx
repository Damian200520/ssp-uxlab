"use client";

import { useEffect, useMemo, useState } from "react";
import InvestigacionFlow from "./components/InvestigacionFlow";
import PersonasFlow from "./components/PersonasFlow";
import HabilitacionFlow from "./components/HabilitacionFlow";
import NecesidadesFlow from "./components/NecesidadesFlow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

type Vista = "acceso" | "propositos" | "proposito1";

type FlujoActivo =
  | "investigacion"
  | "personas"
  | "habilitacion"
  | "necesidades"
  | "vinculacion"
  | "medicion"
  | "momentos";

type Usuario = {
  id?: string;
  email: string;
  nombre_completo?: string;
  institucion?: string;
  cargo?: string;
};

type Proposito = {
  id: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
};

type RutaEtapa = {
  numero: number;
  clave: string;
  nombre: string;
  descripcion: string;
  estado_ruta: string;
  completada: boolean;
  es_actual: boolean;
  conteos: Record<string, number>;
};

type RutaResponse = {
  proyecto: {
    id: string;
    nombre_proyecto: string;
    etapa_actual: number;
  };
  resumen_ruta: {
    etapa_actual: number;
    total_etapas: number;
    total_etapas_completadas: number;
    porcentaje_completitud: number;
    porcentaje_avance_por_etapa_actual: number;
  };
  ruta: RutaEtapa[];
};

const etapasFallback: RutaEtapa[] = [
  {
    numero: 1,
    clave: "investigacion",
    nombre: "Investigación",
    descripcion: "Levantamiento inicial de contexto, servicio, objetivo y metodología.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: true,
    conteos: {},
  },
  {
    numero: 2,
    clave: "personas",
    nombre: "Personas usuarias",
    descripcion: "Identificación y caracterización de perfiles de personas usuarias.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
  {
    numero: 3,
    clave: "habilitacion_expectativas",
    nombre: "Habilitación y expectativas",
    descripcion: "Registro de acceso, conocimiento, competencias digitales y expectativas.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
  {
    numero: 4,
    clave: "necesidades",
    nombre: "Necesidades",
    descripcion: "Documentación de necesidades detectadas, impacto, categoría y estado.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
  {
    numero: 5,
    clave: "vinculacion",
    nombre: "Vinculación",
    descripcion: "Relación entre necesidades detectadas y actividades del servicio.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
  {
    numero: 6,
    clave: "medicion",
    nombre: "Medición",
    descripcion: "Definición de indicadores, línea base, metas y evidencias.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
  {
    numero: 7,
    clave: "momentos_criticos",
    nombre: "Momentos críticos",
    descripcion: "Identificación de fricciones, causas raíz y oportunidades de mejora.",
    estado_ruta: "pendiente",
    completada: false,
    es_actual: false,
    conteos: {},
  },
];

function flujoDesdeEtapa(etapa: RutaEtapa): FlujoActivo {
  if (etapa.numero === 1) return "investigacion";
  if (etapa.numero === 2) return "personas";
  if (etapa.numero === 3) return "habilitacion";
  if (etapa.numero === 4) return "necesidades";
  if (etapa.numero === 5) return "vinculacion";
  if (etapa.numero === 6) return "medicion";
  return "momentos";
}

function estadoClase(etapa: RutaEtapa) {
  if (etapa.completada) return "border-teal-500 bg-teal-50 text-teal-800";
  if (etapa.es_actual || etapa.estado_ruta === "actual")
    return "border-blue-500 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-white text-slate-600";
}

function estadoTexto(etapa: RutaEtapa) {
  if (etapa.completada) return "Completada";
  if (etapa.es_actual || etapa.estado_ruta === "actual") return "Actual";
  return "Pendiente";
}



export default function Home() {
  const [vista, setVista] = useState<Vista>("acceso");
  const [current, setCurrent] = useState<FlujoActivo>("investigacion");

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [propositos, setPropositos] = useState<Proposito[]>([]);
  const [rutaData, setRutaData] = useState<RutaResponse | null>(null);

  const [formUsuario, setFormUsuario] = useState({
    nombre_completo: "",
    email: "",
    institucion: "",
    cargo: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const ruta = rutaData?.ruta?.length ? rutaData.ruta : etapasFallback;

  const porcentajeAvance = useMemo(() => {
    if (rutaData?.resumen_ruta?.porcentaje_completitud !== undefined) {
      return Math.round(rutaData.resumen_ruta.porcentaje_completitud);
    }

    const completadas = ruta.filter((etapa) => etapa.completada).length;
    return Math.round((completadas / ruta.length) * 100);
  }, [rutaData, ruta]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("ssp_uxlab_usuario");

    if (usuarioGuardado) {
      try {
        const parsed = JSON.parse(usuarioGuardado);
        setUsuario(parsed);
        setVista("propositos");
      } catch {
        localStorage.removeItem("ssp_uxlab_usuario");
      }
    }
  }, []);

  useEffect(() => {
  async function actualizarRutaDesdeFlujo(event: Event) {
    const customEvent = event as CustomEvent<{ siguienteEtapa?: number }>;
    const siguienteEtapa = customEvent.detail?.siguienteEtapa;

    try {
      if (siguienteEtapa) {
        const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/etapa`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            etapa_actual: siguienteEtapa,
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        if (siguienteEtapa === 1) setCurrent("investigacion");
        if (siguienteEtapa === 2) setCurrent("personas");
        if (siguienteEtapa === 3) setCurrent("habilitacion");
        if (siguienteEtapa === 4) setCurrent("necesidades");
        if (siguienteEtapa === 5) setCurrent("vinculacion");
        if (siguienteEtapa === 6) setCurrent("medicion");
        if (siguienteEtapa === 7) setCurrent("momentos");
      }

      await cargarRuta();
      setMensaje("Avance actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar avance desde flujo:", error);
      setMensaje("No se pudo actualizar el avance del propósito.");
    }
  }

  window.addEventListener(
    "actualizar-ruta-proposito",
    actualizarRutaDesdeFlujo
  );

  return () => {
    window.removeEventListener(
      "actualizar-ruta-proposito",
      actualizarRutaDesdeFlujo
    );
  };
}, []);
  

  async function cargarPropositos() {
    try {
      const res = await fetch(`${API_URL}/propositos`);
      const json = await res.json();
      setPropositos(json.data || []);
    } catch (error) {
      console.error("Error al cargar propósitos:", error);
      setMensaje("No se pudieron cargar los propósitos.");
    }
  }

  async function cargarRuta() {
    try {
      const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/ruta`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      setRutaData(json.data);
    } catch (error) {
      console.error("Error al cargar ruta:", error);
      setRutaData(null);
    }
  }

  useEffect(() => {
    if (vista === "propositos") {
      cargarPropositos();
    }

    if (vista === "proposito1") {
      cargarRuta();
    }
  }, [vista]);

  async function ingresarUsuario() {
    if (!formUsuario.email.trim()) {
      setMensaje("Debes ingresar un correo para acceder.");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/usuarios/acceso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formUsuario),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const usuarioProcesado = json.data?.usuario || {
        email: formUsuario.email,
        nombre_completo: formUsuario.nombre_completo,
        institucion: formUsuario.institucion,
        cargo: formUsuario.cargo,
      };

      setUsuario(usuarioProcesado);
      localStorage.setItem("ssp_uxlab_usuario", JSON.stringify(usuarioProcesado));
      setVista("propositos");
    } catch (error) {
      console.error("Error al ingresar:", error);
      setMensaje("No se pudo procesar el acceso del usuario.");
    } finally {
      setLoading(false);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("ssp_uxlab_usuario");
    setUsuario(null);
    setVista("acceso");
    setCurrent("investigacion");
  }

  function seleccionarProposito(proposito: Proposito) {
    if (!proposito.activo || proposito.id !== 1) {
      setMensaje("Este propósito aún no está habilitado en el MVP.");
      return;
    }

    setMensaje("");
    setVista("proposito1");
    setCurrent("investigacion");
  }

  function irAEtapa(etapa: RutaEtapa) {
    setCurrent(flujoDesdeEtapa(etapa));
  }
  async function avanzarSiguienteEtapa() {
  try {
    setLoading(true);
    setMensaje("");

    const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/ruta/avanzar`, {
      method: "PATCH",
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = await res.json();
    const rutaActualizada = json.ruta_actualizada;

    setRutaData(rutaActualizada);

    const etapaActual = rutaActualizada?.proyecto?.etapa_actual;

    if (etapaActual === 1) setCurrent("investigacion");
    if (etapaActual === 2) setCurrent("personas");
    if (etapaActual === 3) setCurrent("habilitacion");
    if (etapaActual === 4) setCurrent("necesidades");
    if (etapaActual === 5) setCurrent("vinculacion");
    if (etapaActual === 6) setCurrent("medicion");
    if (etapaActual === 7) setCurrent("momentos");

    await cargarRuta();

    setMensaje("Se avanzó a la siguiente etapa correctamente.");
  } catch (error) {
    console.error("Error al avanzar etapa:", error);
    setMensaje("No se pudo avanzar a la siguiente etapa.");
  } finally {
    setLoading(false);
  }
}

  if (vista === "acceso") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>
            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Acceso a la plataforma
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ingresa tus datos para acceder al entorno de trabajo del Propósito 1
              y continuar con la digitalización de herramientas UXLab.
            </p>
          </div>

          {mensaje && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {mensaje}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nombre completo
              </label>
              <input
                value={formUsuario.nombre_completo}
                onChange={(e) =>
                  setFormUsuario((prev) => ({
                    ...prev,
                    nombre_completo: e.target.value,
                  }))
                }
                placeholder="Ej.: Damián Muñoz"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Correo
              </label>
              <input
                type="email"
                value={formUsuario.email}
                onChange={(e) =>
                  setFormUsuario((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="correo@ejemplo.cl"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Institución
              </label>
              <input
                value={formUsuario.institucion}
                onChange={(e) =>
                  setFormUsuario((prev) => ({
                    ...prev,
                    institucion: e.target.value,
                  }))
                }
                placeholder="Ej.: Municipalidad / Servicio público / Universidad"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Cargo
              </label>
              <input
                value={formUsuario.cargo}
                onChange={(e) =>
                  setFormUsuario((prev) => ({
                    ...prev,
                    cargo: e.target.value,
                  }))
                }
                placeholder="Ej.: Encargado/a de atención ciudadana"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={ingresarUsuario}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar a la plataforma"}
          </button>
        </section>
      </main>
    );
  }

  if (vista === "propositos") {
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-teal-700">SSP·UXLab</div>
              <p className="mt-1 text-sm text-slate-500">
                Bienvenido/a{usuario?.nombre_completo ? `, ${usuario.nombre_completo}` : ""}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={cargarRuta}
    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
  >
    Actualizar avance
  </button>

  <button
    type="button"
    onClick={avanzarSiguienteEtapa}
    disabled={loading}
    className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
  >
    {loading ? "Avanzando..." : "Avanzar a siguiente etapa"}
  </button>
</div>
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Selección de propósito
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Selecciona el propósito de la guía UXLab que deseas trabajar. En este
            MVP se encuentra habilitado el Propósito 1.
          </p>

          {mensaje && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {mensaje}
            </div>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {(propositos.length ? propositos : []).map((proposito) => (
              <button
                key={proposito.id}
                type="button"
                onClick={() => seleccionarProposito(proposito)}
                className={`rounded-3xl border p-6 text-left shadow-sm transition ${
                  proposito.activo
                    ? "border-teal-200 bg-white hover:border-teal-600 hover:bg-teal-50"
                    : "border-slate-200 bg-slate-50 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {proposito.titulo}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      proposito.activo
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {proposito.activo ? "Disponible" : "Próximamente"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {proposito.descripcion}
                </p>
              </button>
            ))}

            {propositos.length === 0 && (
              <div className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Propósito 1: Comprender la experiencia actual
                  </h2>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
                    Disponible
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Contar con un diagnóstico claro para individualizar desafíos y
                  comprender la experiencia real.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    seleccionarProposito({
                      id: 1,
                      titulo: "Propósito 1",
                      descripcion: "",
                      activo: true,
                    })
                  }
                  className="mt-5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
                >
                  Entrar al propósito
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setVista("propositos")}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Propósitos
              </button>

              <span className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">
                Propósito 1
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Comprender la experiencia actual
            </h1>
            <p className="text-sm text-slate-500">
              Wizard de trabajo para la digitalización inicial de herramientas.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">
                Avance del propósito
              </span>
              <span className="font-bold text-teal-700">
                {porcentajeAvance}%
              </span>
            </div>

            <div className="mt-2 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-teal-600 transition-all"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {rutaData?.resumen_ruta?.total_etapas_completadas ?? 0} de{" "}
              {rutaData?.resumen_ruta?.total_etapas ?? 7} etapas con registros.
            </p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto border-t border-slate-100 px-6 py-3">
          {ruta.map((etapa) => (
            <button
              key={`${etapa.numero}-${etapa.clave}`}
              type="button"
              onClick={() => irAEtapa(etapa)}
              className={`min-w-56 rounded-2xl border px-4 py-3 text-left text-sm transition hover:shadow-sm ${
                current === flujoDesdeEtapa(etapa)
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : estadoClase(etapa)
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">
                  {etapa.numero}. {etapa.nombre}
                </span>
                <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold">
                  {estadoTexto(etapa)}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-xs opacity-80">
                {etapa.descripcion}
              </p>
            </button>
          ))}
        </div>
      </header>

      <section>

        {mensaje && (
    <div className="mx-6 mt-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
      {mensaje}
    </div>
  )}

        {current === "investigacion" && <InvestigacionFlow />}
        {current === "personas" && <PersonasFlow />}
        {current === "habilitacion" && <HabilitacionFlow />}
        {current === "necesidades" && <NecesidadesFlow />}

        {current === "vinculacion" && (
          <PlaceholderEtapa
            titulo="Vinculación"
            descripcion="Esta etapa permitirá relacionar necesidades detectadas con actividades, respuestas institucionales o puntos de contacto del servicio."
          />
        )}

        {current === "medicion" && (
          <PlaceholderEtapa
            titulo="Medición"
            descripcion="Esta etapa permitirá definir indicadores, línea base, metas y evidencias asociadas a la experiencia usuaria."
          />
        )}

        {current === "momentos" && (
          <PlaceholderEtapa
            titulo="Momentos críticos"
            descripcion="Esta etapa permitirá identificar fricciones, causas raíz, impactos y oportunidades de mejora en la experiencia."
          />
        )}
      </section>
    </main>
  );
}



function PlaceholderEtapa({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="min-h-[70vh] bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl font-bold text-teal-700">
          +
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">{titulo}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {descripcion}
        </p>
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Flujo pendiente para una siguiente iteración del cronograma.
        </p>
      </div>
    </div>
  );
}