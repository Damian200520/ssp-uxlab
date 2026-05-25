"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, Zap, Lightbulb, Link, BarChart3, Target, Compass, Eye, Star, Handshake, Sparkles, Clipboard, FileText, Clock, AlertTriangle, CheckCircle, Check, X, Circle, FileBox } from "lucide-react";
import InvestigacionFlow from "./components/InvestigacionFlow";
import PersonasFlow from "./components/PersonasFlow";
import HabilitacionFlow from "./components/HabilitacionFlow";
import NecesidadesFlow from "./components/NecesidadesFlow";
import EvidenciasFlow from "./components/EvidenciasFlow";

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
  | "evidencias"
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

const etapaIcono: Record<string, React.ReactNode> = {
  investigacion: <Search className="h-5 w-5" strokeWidth={2.2} />,
  personas: <Users className="h-5 w-5" strokeWidth={2.2} />,
  habilitacion_expectativas: <Zap className="h-5 w-5" strokeWidth={2.2} />,
  necesidades: <Lightbulb className="h-5 w-5" strokeWidth={2.2} />,
  vinculacion: <Link className="h-5 w-5" strokeWidth={2.2} />,
  medicion: <BarChart3 className="h-5 w-5" strokeWidth={2.2} />,
  momentos_criticos: <Target className="h-5 w-5" strokeWidth={2.2} />,
};

const propositosFallback: Proposito[] = [
  {
    id: 1,
    titulo: "Comprender la experiencia actual",
    descripcion:
      "Contar con un diagnóstico claro para individualizar desafíos y comprender la experiencia real de las personas usuarias.",
    activo: true,
  },
  {
    id: 2,
    titulo: "Incorporar perspectiva usuaria",
    descripcion:
      "Ejecutar acciones orientadas a reforzar la orientación a las personas en la institución.",
    activo: false,
  },
  {
    id: 3,
    titulo: "Mejorar satisfacción con el servicio",
    descripcion:
      "Identificar oportunidades de mejora y definir planes para elevar la satisfacción general.",
    activo: false,
  },
  {
    id: 4,
    titulo: "Mejorar la colaboración interna",
    descripcion:
      "Apoyar el trabajo colaborativo para el diseño de servicios coherentes.",
    activo: false,
  },
  {
    id: 5,
    titulo: "Diseñar un nuevo servicio",
    descripcion:
      "Transformar una necesidad no resuelta en una propuesta clara de servicio.",
    activo: false,
  },
];

const propositoIconos = [<Compass key="c1" className="h-5 w-5" strokeWidth={2.2} />, <Eye key="c2" className="h-5 w-5" strokeWidth={2.2} />, <Star key="c3" className="h-5 w-5" strokeWidth={2.2} />, <Handshake key="c4" className="h-5 w-5" strokeWidth={2.2} />, <Sparkles key="c5" className="h-5 w-5" strokeWidth={2.2} />];

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
  const [mensajeTipo, setMensajeTipo] = useState<"success" | "warning" | "error">("warning");

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ etapa_actual: siguienteEtapa }),
          });
          if (!res.ok) throw new Error(await res.text());
          if (siguienteEtapa === 1) setCurrent("investigacion");
          if (siguienteEtapa === 2) setCurrent("personas");
          if (siguienteEtapa === 3) setCurrent("habilitacion");
          if (siguienteEtapa === 4) setCurrent("necesidades");
          if (siguienteEtapa === 5) setCurrent("vinculacion");
          if (siguienteEtapa === 6) setCurrent("medicion");
          if (siguienteEtapa === 7) setCurrent("momentos");
        }
        await cargarRuta();
        setMensajeTipo("success");
        setMensaje("Avance actualizado correctamente.");
      } catch (error) {
        console.error("Error al actualizar avance desde flujo:", error);
        setMensajeTipo("error");
        setMensaje("No se pudo actualizar el avance del propósito.");
      }
    }
    window.addEventListener("actualizar-ruta-proposito", actualizarRutaDesdeFlujo);
    return () => window.removeEventListener("actualizar-ruta-proposito", actualizarRutaDesdeFlujo);
  }, []);

  async function cargarPropositos() {
    try {
      const res = await fetch(`${API_URL}/propositos`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setPropositos(json.data || propositosFallback);
    } catch (error) {
      console.warn("No se pudieron cargar propósitos desde backend:", error);
      setPropositos(propositosFallback);
      setMensaje("");
    }
  }

  async function cargarRuta() {
    try {
      const res = await fetch(`${API_URL}/proyectos/${PROYECTO_ID}/ruta`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setRutaData(json.data);
    } catch (error) {
      console.error("Error al cargar ruta:", error);
      setRutaData(null);
    }
  }

  useEffect(() => {
    if (vista === "propositos") cargarPropositos();
    if (vista === "proposito1") cargarRuta();
  }, [vista]);

  async function ingresarUsuario() {
    if (!formUsuario.email.trim()) {
      setMensajeTipo("warning");
      setMensaje("Debes ingresar un correo para acceder.");
      return;
    }
    setLoading(true);
    setMensaje("");
    try {
      const res = await fetch(`${API_URL}/usuarios/acceso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formUsuario),
      });
      if (!res.ok) throw new Error(await res.text());
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
      console.warn("No se pudo conectar con el backend. Modo prototipo:", error);
      const usuarioLocal = {
        id: "usuario-demo",
        email: formUsuario.email,
        nombre_completo: formUsuario.nombre_completo || "Usuario demo",
        institucion: formUsuario.institucion || "Institución demo",
        cargo: formUsuario.cargo || "Revisor/a",
      };
      setUsuario(usuarioLocal);
      localStorage.setItem("ssp_uxlab_usuario", JSON.stringify(usuarioLocal));
      setVista("propositos");
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
      setMensajeTipo("warning");
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
      if (!res.ok) throw new Error(await res.text());
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
      setMensajeTipo("success");
      setMensaje("Se avanzó a la siguiente etapa correctamente.");
    } catch (error) {
      console.error("Error al avanzar etapa:", error);
      setMensajeTipo("error");
      setMensaje("No se pudo avanzar a la siguiente etapa.");
    } finally {
      setLoading(false);
    }
  }

  // VISTA: ACCESO
  if (vista === "acceso") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/40 px-4">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-100/40 to-emerald-100/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-100/30 to-teal-100/20 blur-3xl" />
        </div>

        <section className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-2.5 shadow-lg shadow-teal-200/20 ring-1 ring-slate-200/60 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm" />
              <span className="text-sm font-bold tracking-[0.15em] text-slate-800 uppercase">SSP · UXLab</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-200/60">
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Acceso a la plataforma
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Ingresa tus datos para acceder al entorno de trabajo UXLab
                y comenzar la digitalización de herramientas.
              </p>
            </div>

            {mensaje && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <span className="mt-0.5 text-amber-500">\u26A0</span>
                <p className="text-sm text-amber-800">{mensaje}</p>
              </div>
            )}

            <div className="space-y-4">
              <FormField
                label="Nombre completo"
                placeholder="Ej.: Damián Muñoz"
                value={formUsuario.nombre_completo}
                onChange={(v) => setFormUsuario((p) => ({ ...p, nombre_completo: v }))}
              />
              <FormField
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.cl"
                value={formUsuario.email}
                onChange={(v) => setFormUsuario((p) => ({ ...p, email: v }))}
                required
              />
              <FormField
                label="Institución"
                placeholder="Ej.: Municipalidad / Servicio público"
                value={formUsuario.institucion}
                onChange={(v) => setFormUsuario((p) => ({ ...p, institucion: v }))}
              />
              <FormField
                label="Cargo"
                placeholder="Ej.: Encargado/a de atención ciudadana"
                value={formUsuario.cargo}
                onChange={(v) => setFormUsuario((p) => ({ ...p, cargo: v }))}
              />
            </div>

            <button
              type="button"
              onClick={ingresarUsuario}
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200/50 transition-all duration-200 hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-teal-300/50 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>Ingresar a la plataforma <span className="ml-1">&rarr;</span></>
              )}
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Plataforma de diagnóstico UX para servicios públicos
          </p>
        </section>
      </main>
    );
  }

  // VISTA: PROPÓSITOS
  if (vista === "propositos") {
    const lista = propositos.length ? propositos : propositosFallback;

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 px-3.5 py-2 shadow-sm ring-1 ring-teal-100/50">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500" />
                <span className="text-xs font-bold tracking-[0.15em] text-teal-700 uppercase">SSP · UXLab</span>
              </div>
              {usuario?.nombre_completo && (
                <span className="hidden text-sm text-slate-500 sm:block">
                  Bienvenido/a, <span className="font-semibold text-slate-800">{usuario.nombre_completo}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cargarRuta}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm"
              >
                \u21BA Actualizar
              </button>
              <button
                type="button"
                onClick={avanzarSiguienteEtapa}
                disabled={loading}
                className="rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md disabled:opacity-50"
              >
                {loading ? "..." : "Avanzar etapa \u2192"}
              </button>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-white hover:text-slate-700"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="relative border-b border-slate-100 bg-white/70 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-dots-subtle opacity-40" />
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100/50">
                  Guía UXLab
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  Selección de propósito
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                  Selecciona el propósito que deseas trabajar. En este MVP se encuentra habilitado el Propósito 1.
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-4 sm:flex">
                {usuario?.nombre_completo && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-teal-200/50">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                )}
                {usuario?.institucion && (
                  <div className="rounded-2xl border border-slate-100 bg-white/80 px-5 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Institución</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{usuario.institucion}</p>
                    {usuario.cargo && <p className="text-xs text-slate-500">{usuario.cargo}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {mensaje && (
          <div className="mx-auto max-w-6xl px-6 pt-5">
            <MensajeAlerta mensaje={mensaje} tipo={mensajeTipo} onClose={() => setMensaje("")} />
          </div>
        )}

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lista.map((proposito, i) => (
              <PropositoCard
                key={proposito.id}
                proposito={proposito}
                icono={propositoIconos[i] ?? <Clipboard className="h-5 w-5" strokeWidth={2.2} />}
                numero={i + 1}
                onClick={() => seleccionarProposito(proposito)}
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  // VISTA: PROPÓSITO 1 (flujo principal)
  const etapaActiva = ruta.find((e) => flujoDesdeEtapa(e) === current);
  const etapasCompletadas = rutaData?.resumen_ruta?.total_etapas_completadas ?? 0;
  const totalEtapas = rutaData?.resumen_ruta?.total_etapas ?? 7;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="pointer-events-none fixed inset-0 z-0 bg-dots-subtle opacity-30" />
      <header className="relative sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="flex flex-col gap-0 xl:flex-row xl:items-stretch">
          <div className="flex-1 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setVista("propositos")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                \u2190 Propósitos
              </button>
              <span className="text-slate-300">/</span>
              <span className="rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-teal-100/50">
                Propósito 1
              </span>
            </div>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Comprender la experiencia actual
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  Asistente de digitalización inicial de herramientas UXLab
                </p>
              </div>
              {usuario?.nombre_completo && (
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs font-semibold text-slate-800">{usuario.nombre_completo}</p>
                  {usuario.institucion && (
                    <p className="text-xs text-slate-400">{usuario.institucion}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 xl:w-72 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Avance total</span>
              <span className="text-sm font-bold text-transparent bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text">{porcentajeAvance}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {etapasCompletadas} de {totalEtapas} etapas completadas
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="flex gap-0 overflow-x-auto">
            {ruta.map((etapa) => {
              const esCurrent = current === flujoDesdeEtapa(etapa);
              return (
                <EtapaTab
                  key={`${etapa.numero}-${etapa.clave}`}
                  etapa={etapa}
                  activa={esCurrent}
                  icono={etapaIcono[etapa.clave] ?? <Circle className="h-5 w-5" />}
                  onClick={() => irAEtapa(etapa)}
                />
              );
            })}

            <button
              type="button"
              onClick={() => setCurrent("evidencias")}
              className={`group flex min-w-[140px] flex-col border-b-2 px-4 py-3 text-left transition-all duration-150 bg-white ${
                current === "evidencias"
                  ? "border-teal-600 shadow-sm"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className={`h-5 w-5 ${current === "evidencias" ? "text-teal-700" : "text-slate-600"}`} strokeWidth={2.2} aria-hidden="true" />
                <span className={`text-xs font-semibold ${current === "evidencias" ? "text-teal-700" : "text-slate-700"}`}>
                  Evidencias
                </span>
                <span className="rounded-full bg-gradient-to-r from-violet-50 to-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 ring-1 ring-violet-200/50">
                  Trans.
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                Respaldos por etapa
              </p>
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div className="relative z-10 px-6 pt-4">
          <MensajeAlerta mensaje={mensaje} tipo={mensajeTipo} onClose={() => setMensaje("")} />
        </div>
      )}

      <div className="relative z-10 border-b border-slate-100 bg-white/40 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-teal-200/50 bg-gradient-to-br from-teal-50 to-emerald-50/50 px-4 py-2.5 shadow-sm">
            <CheckCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-teal-800">
              <span className="text-sm font-bold">{etapasCompletadas}</span> de {totalEtapas} etapas completadas
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 shadow-sm">
            <FileText className="h-4 w-4 text-slate-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-700">Evidencias registradas</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-purple-50/50 px-4 py-2.5 shadow-sm">
            <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-violet-800">IA Demo activa</span>
          </div>
        </div>
      </div>

      <section className="relative z-10">
        {current === "investigacion" && <InvestigacionFlow />}
        {current === "personas" && <PersonasFlow />}
        {current === "habilitacion" && <HabilitacionFlow />}
        {current === "necesidades" && <NecesidadesFlow />}
        {current === "evidencias" && <EvidenciasFlow />}

        {current === "vinculacion" && (
          <PlaceholderEtapa
            icono={<Link className="h-10 w-10 text-slate-400" />}
            titulo="Vinculación"
            descripcion="Esta etapa permitirá relacionar necesidades detectadas con actividades, respuestas institucionales o puntos de contacto del servicio."
          />
        )}
        {current === "medicion" && (
          <PlaceholderEtapa
            icono={<BarChart3 className="h-10 w-10 text-slate-400" />}
            titulo="Medición"
            descripcion="Esta etapa permitirá definir indicadores, línea base, metas y evidencias asociadas a la experiencia usuaria."
          />
        )}
        {current === "momentos" && (
          <PlaceholderEtapa
            icono={<Target className="h-10 w-10 text-slate-400" />}
            titulo="Momentos críticos"
            descripcion="Esta etapa permitirá identificar fricciones, causas raíz, impactos y oportunidades de mejora en la experiencia."
          />
        )}
      </section>
    </main>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="text-teal-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
      />
    </div>
  );
}

function MensajeAlerta({
  mensaje,
  tipo,
  onClose,
}: {
  mensaje: string;
  tipo: "success" | "warning" | "error";
  onClose: () => void;
}) {
  const styles = {
    success: "border-teal-200/60 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800",
    warning: "border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800",
    error: "border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 text-red-800",
  };
  const iconos = { success: <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />, warning: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />, error: <X className="h-5 w-5 text-rose-600" aria-hidden="true" /> };

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm ${styles[tipo]}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{iconos[tipo]}</span>
        <p className="text-sm font-medium">{mensaje}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 opacity-50 transition-opacity duration-150 hover:opacity-100"
        aria-label="Cerrar mensaje"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function PropositoCard({
  proposito,
  icono,
  numero,
  onClick,
}: {
  proposito: Proposito;
  icono: React.ReactNode;
  numero: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl border p-6 text-left transition-all duration-200 ${
        proposito.activo
          ? "border-teal-100/80 bg-white shadow-md shadow-slate-200/40 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100/40"
          : "border-slate-100 bg-slate-50/60 opacity-70 cursor-not-allowed"
      }`}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full transition-all duration-200 ${
        proposito.activo ? "bg-gradient-to-bl from-teal-50/40 to-transparent" : ""
      }`} />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all duration-200 ${
          proposito.activo ? "bg-teal-50 border border-teal-100 text-teal-700 group-hover:scale-110 group-hover:shadow-md" : "bg-slate-100 border border-slate-200 text-slate-400"
        }`}>
          {icono}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
            proposito.activo
              ? "bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {proposito.activo ? "Disponible" : "Proximamente"}
        </span>
      </div>

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
        Propósito {numero}
      </div>
      <h2 className={`text-base font-bold leading-snug tracking-tight transition-colors duration-150 ${
        proposito.activo ? "text-slate-800 group-hover:text-teal-700" : "text-slate-600"
      }`}>
        {proposito.titulo}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {proposito.descripcion}
      </p>

      <div className="mt-5 flex items-center justify-between">
        {proposito.activo ? (
          <div className="rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-100/50">
            7 etapas · Demo IA
          </div>
        ) : (
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ring-1 ring-slate-200/50">
            Próximamente
          </div>
        )}
        {proposito.activo && (
          <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
            Entrar <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
          </span>
        )}
      </div>
    </button>
  );
}

function EtapaTab({
  etapa,
  activa,
  icono,
  onClick,
}: {
  etapa: RutaEtapa;
  activa: boolean;
  icono: React.ReactNode;
  onClick: () => void;
}) {
  const estado = etapa.completada
    ? "completada"
    : etapa.es_actual || etapa.estado_ruta === "actual"
    ? "actual"
    : "pendiente";

  const isPending = !activa && estado === "pendiente";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-[148px] flex-col border-b-2 px-4 py-3 text-left transition-all duration-150 ${
        activa
          ? "border-teal-600 bg-white shadow-sm"
          : isPending
          ? "border-transparent"
          : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={
          activa ? "text-teal-700" : isPending ? "text-slate-400" : "text-slate-600 group-hover:text-slate-900"
        }>
          {icono}
        </span>
        <span
          className={`text-xs font-semibold transition-colors duration-150 ${
            activa ? "text-slate-900" : isPending ? "text-slate-500" : "text-slate-700 group-hover:text-slate-900"
          }`}
        >
          {etapa.nombre}
        </span>
        {estado === "completada" && (
          <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 shadow-sm">
            <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
          </span>
        )}
        {estado === "actual" && !activa && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm" />
        )}
      </div>
      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">{etapa.descripcion}</p>
    </button>
  );
}

function PlaceholderEtapa({
  titulo,
  descripcion,
  icono,
}: {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          {icono}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          {descripcion}
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 text-sm font-medium text-amber-700 shadow-sm">
          <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Disponible en la próxima iteración
        </div>
      </div>
    </div>
  );
}
