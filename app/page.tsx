"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, Zap, Lightbulb, Link, BarChart3, Target, Compass, Eye, Star, Handshake, Sparkles, Clipboard, FileText, Clock, AlertTriangle, CheckCircle, Check, X, Circle, ArrowRight, ArrowLeft, Loader2, Lock, CalendarDays, TrendingUp } from "lucide-react";
import InvestigacionFlow from "./components/InvestigacionFlow";
import PersonasFlow from "./components/PersonasFlow";
import HabilitacionFlow from "./components/HabilitacionFlow";
import NecesidadesFlow from "./components/NecesidadesFlow";
import EvidenciasFlow from "./components/EvidenciasFlow";
import CatalogoHerramientasProp1 from "./components/CatalogoHerramientasProp1";
import CalendarizacionProp1 from "./components/CalendarizacionProp1";
import EjecucionPasoAPasoProp1 from "./components/EjecucionPasoAPasoProp1";
import ResultadosActividadProp1 from "./components/ResultadosActividadProp1";
import TrazabilidadProcesoProp1 from "./components/TrazabilidadProcesoProp1";
import DashboardAvanceProp1 from "./components/DashboardAvanceProp1";
import VinculacionFlow from "./components/VinculacionFlow";
import MedicionFlow from "./components/MedicionFlow";
import MomentosCriticosFlow from "./components/MomentosCriticosFlow";
import type { FlujoHerramienta } from "./data/herramientasProp1";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROYECTO_ID =
  process.env.NEXT_PUBLIC_PROYECTO_ID ||
  "31576cfb-4c12-4080-a8c3-1f422b4830de";

type Vista = "acceso" | "propositos" | "proposito1";

type FlujoActivo =
  | "catalogo"
  | "ejecucion"
  | "dashboard"
  | "trazabilidad"
  | "investigacion"
  | "personas"
  | "habilitacion"
  | "necesidades"
  | "calendarizacion"
  | "evidencias"
  | "resultados"
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
  requisito?: string;
  puede_abrirse?: boolean;
  puede_avanzar_desde_aqui?: boolean;
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
    siguiente_etapa_sugerida?: RutaEtapa | null;
    puede_avanzar?: boolean;
    bloqueo_avance?: string | null;
    requisito_etapa_actual?: string | null;
    hito_actual?: string;
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

function numeroDesdeFlujo(flujo: FlujoActivo) {
  if (flujo === "catalogo") return null;
  if (flujo === "ejecucion") return null;
  if (flujo === "dashboard") return null;
  if (flujo === "trazabilidad") return null;
  if (flujo === "investigacion") return 1;
  if (flujo === "personas") return 2;
  if (flujo === "habilitacion") return 3;
  if (flujo === "necesidades") return 4;
  if (flujo === "calendarizacion") return null;
  if (flujo === "resultados") return null;
  if (flujo === "vinculacion") return 5;
  if (flujo === "medicion") return 6;
  if (flujo === "momentos") return 7;
  return null;
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
      "Permite levantar información inicial, caracterizar personas usuarias, identificar expectativas, necesidades, vínculos, mediciones y momentos críticos de la experiencia.",
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
  const [current, setCurrent] = useState<FlujoActivo>("catalogo");

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
    setCurrent("catalogo");
  }

  function seleccionarProposito(proposito: Proposito) {
    if (!proposito.activo || proposito.id !== 1) {
      setMensajeTipo("warning");
      setMensaje("Este propósito aún no está habilitado en el MVP.");
      return;
    }
    setMensaje("");
    setVista("proposito1");
    setCurrent("catalogo");
  }

  function irAEtapa(etapa: RutaEtapa) {
    setCurrent(flujoDesdeEtapa(etapa));
  }

  function irAEtapaNumero(numeroEtapa: number) {
    const etapa = ruta.find((item) => item.numero === numeroEtapa);

    if (!etapa) {
      setMensajeTipo("warning");
      setMensaje("No se encontro la etapa solicitada en la ruta del proyecto.");
      return;
    }

    if (etapa.estado_ruta === "bloqueada" && !etapa.puede_abrirse) {
      setMensajeTipo("warning");
      setMensaje(etapa.requisito || "Completa las etapas anteriores para habilitar este paso.");
      return;
    }

    irAEtapa(etapa);
  }

  function navegarFlujo(route: string | null) {
    if (!route) {
      setCurrent("catalogo");
      return;
    }

    if (
      route === "investigacion" ||
      route === "ejecucion" ||
      route === "trazabilidad" ||
      route === "personas" ||
      route === "habilitacion" ||
      route === "necesidades" ||
      route === "calendarizacion" ||
      route === "evidencias" ||
      route === "resultados" ||
      route === "vinculacion" ||
      route === "medicion" ||
      route === "momentos"
    ) {
      setCurrent(route);
      return;
    }

    setMensajeTipo("warning");
    setMensaje("Esta herramienta está planificada para una iteración posterior.");
  }

  function abrirHerramienta(flujo: FlujoHerramienta) {
    navegarFlujo(flujo);
  }

  // VISTA: ACCESO
  if (vista === "acceso") {
    return (
      <main className="ux-shell px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl ux-reveal">
            <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-white px-3.5 py-2 shadow-sm">
              <span className="ux-status-dot h-2 w-2 rounded-full bg-teal-600" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">SSP · UXLab</span>
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Propósito 1 · Experiencia usuaria
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Plataforma de apoyo metodológico para servicios públicos
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Un entorno digital para registrar información, ordenar evidencias y acompañar el avance del recorrido metodológico definido junto a UXLab.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="ux-card rounded-lg px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Alcance</p>
                <p className="mt-1 text-sm font-bold text-slate-800">MVP validado</p>
              </div>
              <div className="ux-card rounded-lg px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Ruta</p>
                <p className="mt-1 text-sm font-bold text-slate-800">7 etapas</p>
              </div>
              <div className="ux-card rounded-lg px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">IA</p>
                <p className="mt-1 text-sm font-bold text-slate-800">Demo metodológica</p>
              </div>
            </div>
          </div>

          <div className="ux-panel ux-reveal-delay rounded-lg p-7">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Ingreso al entorno</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Acceso a la plataforma
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa tus datos para continuar al espacio de trabajo del proyecto.
              </p>
            </div>

            {mensaje && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
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
              className="ux-button-primary mt-7 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar a la plataforma
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Acceso de demostración para revisión del MVP.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // VISTA: PROPÓSITOS
  if (vista === "propositos") {
    const lista = propositos.length ? propositos : propositosFallback;

    return (
      <main className="ux-shell">
        <header className="ux-topbar sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-teal-100 bg-white px-3.5 py-2 shadow-sm">
                <span className="ux-status-dot h-2 w-2 rounded-full bg-teal-600" />
                <span className="text-xs font-bold tracking-[0.15em] text-teal-700 uppercase">SSP · UXLab</span>
              </div>
              {usuario?.nombre_completo && (
                <span className="hidden text-sm text-slate-500 sm:block">
                  Bienvenido/a, <span className="font-semibold text-slate-800">{usuario.nombre_completo}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:inline-flex">
                Selección metodológica
              </span>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-white hover:text-slate-700"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="relative overflow-hidden border-b border-slate-100 bg-white/72">
          <div className="pointer-events-none absolute inset-0 bg-dots-subtle opacity-40" />
          <div className="mx-auto max-w-6xl px-6 py-10 ux-reveal">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm">
                  Guía UXLab
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  Selecciona un propósito
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                  Elige el propósito metodológico que deseas trabajar dentro de la Plataforma Web SSP-UXLab.
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-4 sm:flex">
                {usuario?.nombre_completo && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-teal-200/50">
                    {usuario.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                )}
                {usuario?.institucion && (
                  <div className="ux-card rounded-lg px-5 py-4">
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

        <section className="mx-auto max-w-6xl px-6 py-8 ux-reveal-delay">
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
  const numeroEtapaActual = numeroDesdeFlujo(current);
  const etapaAnterior = numeroEtapaActual
    ? ruta.find((etapa) => etapa.numero === numeroEtapaActual - 1)
    : null;
  const etapaSiguiente = numeroEtapaActual
    ? ruta.find((etapa) => etapa.numero === numeroEtapaActual + 1)
    : null;
  const etapasCompletadas = rutaData?.resumen_ruta?.total_etapas_completadas ?? 0;
  const totalEtapas = rutaData?.resumen_ruta?.total_etapas ?? 7;
  const resumenRuta = rutaData?.resumen_ruta;
  const siguienteEtapa = resumenRuta?.siguiente_etapa_sugerida || ruta.find((etapa) => etapaActiva && etapa.numero > etapaActiva.numero);
  const puedeAvanzar = resumenRuta?.puede_avanzar ?? false;
  const requisitoEtapaActual = !rutaData
    ? "Actualiza la ruta para sincronizar el avance con el backend."
    : resumenRuta?.requisito_etapa_actual || etapaActiva?.requisito;
  const estadoEtapaActiva = etapaActiva?.completada
    ? "Lista para avanzar"
    : !rutaData
    ? "Pendiente de sincronización"
    : etapaActiva?.estado_ruta === "actual"
    ? "Activa"
    : etapaActiva?.estado_ruta === "incompleta"
    ? "Requiere revisión"
    : "En desarrollo";

  return (
    <main className="ux-shell">
      <div className="pointer-events-none fixed inset-0 z-0 bg-dots-subtle opacity-30" />
      <header className="ux-topbar relative sticky top-0 z-50">
        <div className="flex flex-col gap-0 xl:flex-row xl:items-stretch">
          <div className="flex-1 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setVista("propositos")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Propósitos
              </button>
              <span className="text-slate-300">/</span>
              <span className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm">
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
              <span className="text-sm font-bold text-teal-700">{porcentajeAvance}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-700 ease-out"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {etapasCompletadas} de {totalEtapas} etapas completadas
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-6 py-4">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Herramientas</p>
                <p className="text-sm font-semibold text-slate-800">Accesos de apoyo para gestionar el recorrido</p>
              </div>
              <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCurrent("catalogo")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-150 ${
                current === "catalogo"
                      ? "border-teal-200 bg-teal-50 text-teal-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
                  <Clipboard className="h-4 w-4" strokeWidth={2.2} />
                  Catalogo
            </button>

            <button
              type="button"
              onClick={() => setCurrent("calendarizacion")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-150 ${
                current === "calendarizacion"
                      ? "border-teal-200 bg-teal-50 text-teal-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
                  <CalendarDays className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Calendarizacion
            </button>

            <button
              type="button"
              onClick={() => setCurrent("dashboard")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-150 ${
                current === "dashboard"
                      ? "border-teal-200 bg-teal-50 text-teal-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
                  <TrendingUp className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Sintesis
            </button>

                <button
                  type="button"
                  onClick={() => setCurrent("evidencias")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-150 ${
                    current === "evidencias"
                      ? "border-teal-200 bg-teal-50 text-teal-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Evidencias
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recorrido metodologico</p>
                  <p className="text-sm font-semibold text-slate-800">Avanza por las siete etapas del Proposito 1</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {etapasCompletadas}/{totalEtapas} completadas
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
              </div>
            </div>
          </div>
        </div>
      </header>

      {mensaje && (
        <div className="relative z-10 px-6 pt-4">
          <MensajeAlerta mensaje={mensaje} tipo={mensajeTipo} onClose={() => setMensaje("")} />
        </div>
      )}

      {current !== "catalogo" && current !== "calendarizacion" && current !== "ejecucion" && current !== "resultados" && current !== "trazabilidad" && (
      <div className="relative z-10 border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Etapa actual</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {numeroEtapaActual || 1}. {etapaActiva?.nombre || "Investigación"}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                etapaActiva?.completada
                  ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
              }`}>
                {estadoEtapaActiva}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {resumenRuta?.hito_actual || "La ruta se actualiza según los registros metodológicos guardados."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-500">
              {puedeAvanzar ? "Siguiente etapa sugerida" : "Requisito para avanzar"}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {!rutaData
                ? requisitoEtapaActual
                : puedeAvanzar
                ? siguienteEtapa?.nombre || "Alcance actual completo"
                : resumenRuta?.bloqueo_avance || requisitoEtapaActual || "Completa la etapa actual."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => etapaAnterior && irAEtapa(etapaAnterior)}
              disabled={!etapaAnterior || !numeroEtapaActual || current === "evidencias"}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => etapaSiguiente && irAEtapa(etapaSiguiente)}
              disabled={!etapaSiguiente || !numeroEtapaActual || current === "evidencias"}
              className="ux-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      <section className="relative z-10 ux-reveal">
        {current === "catalogo" && <CatalogoHerramientasProp1 onAbrirHerramienta={abrirHerramienta} />}
        {current === "calendarizacion" && <CalendarizacionProp1 apiUrl={API_URL} proyectoId={PROYECTO_ID} />}
        {current === "ejecucion" && (
          <EjecucionPasoAPasoProp1
            ruta={ruta}
            resumenRuta={resumenRuta}
            onAbrirEtapa={irAEtapaNumero}
            onAbrirCalendarizacion={() => setCurrent("calendarizacion")}
            onAbrirEvidencias={() => setCurrent("evidencias")}
            onActualizarRuta={cargarRuta}
          />
        )}
        {current === "dashboard" && (
          <DashboardAvanceProp1
            apiUrl={API_URL}
            proyectoId={PROYECTO_ID}
            ruta={ruta}
            resumenRuta={resumenRuta}
            onAbrirEtapa={irAEtapaNumero}
            onAbrirEvidencias={() => setCurrent("evidencias")}
            onAbrirTrazabilidad={() => setCurrent("trazabilidad")}
            onAbrirResultados={() => setCurrent("resultados")}
          />
        )}
        {current === "resultados" && (
          <ResultadosActividadProp1
            apiUrl={API_URL}
            proyectoId={PROYECTO_ID}
            ruta={ruta}
            onAbrirEtapa={irAEtapaNumero}
            onAbrirEvidencias={() => setCurrent("evidencias")}
          />
        )}
        {current === "trazabilidad" && (
          <TrazabilidadProcesoProp1
            apiUrl={API_URL}
            proyectoId={PROYECTO_ID}
            ruta={ruta}
            onAbrirEtapa={irAEtapaNumero}
            onAbrirEvidencias={() => setCurrent("evidencias")}
          />
        )}
        {current === "investigacion" && <InvestigacionFlow onNavigate={navegarFlujo} />}
        {current === "personas" && <PersonasFlow onNavigate={navegarFlujo} />}
        {current === "habilitacion" && <HabilitacionFlow onNavigate={navegarFlujo} />}
        {current === "necesidades" && <NecesidadesFlow onNavigate={navegarFlujo} />}
        {current === "evidencias" && <EvidenciasFlow />}
        {current === "vinculacion" && <VinculacionFlow onNavigate={navegarFlujo} />}
        {current === "medicion" && <MedicionFlow onNavigate={navegarFlujo} />}
        {current === "momentos" && <MomentosCriticosFlow onNavigate={navegarFlujo} />}
        {false && (
          <PlaceholderEtapa
            icono={<BarChart3 className="h-10 w-10 text-slate-400" />}
            titulo="Medición"
            descripcion="Etapa planificada para Hito 3"
          />
        )}
        {false && current === "momentos" && (
          <PlaceholderEtapa
            icono={<Target className="h-10 w-10 text-slate-400" />}
            titulo="Momentos críticos"
            descripcion="Etapa planificada para Hito 3"
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
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 hover:border-slate-300"
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
    success: "border-teal-200/60 bg-teal-50 text-teal-800",
    warning: "border-amber-200/60 bg-amber-50 text-amber-800",
    error: "border-red-200/60 bg-red-50 text-red-800",
  };
  const iconos = { success: <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />, warning: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />, error: <X className="h-5 w-5 text-rose-600" aria-hidden="true" /> };

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm ${styles[tipo]}`}>
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
  const esDisponible = proposito.activo;
  const titulo = numero === 1
    ? "Propósito 1: Comprender la experiencia actual"
    : proposito.titulo;
  const descripcion = numero === 1
    ? "Permite levantar información inicial, caracterizar personas usuarias, identificar expectativas, necesidades, vínculos, mediciones y momentos críticos de la experiencia."
    : proposito.descripcion;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={!esDisponible}
      className={`ux-card-interactive group relative w-full overflow-hidden rounded-lg border p-6 text-left transition-all duration-200 ${
        esDisponible
          ? "border-teal-200 bg-white shadow-md shadow-slate-200/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          : "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-80"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-all duration-200 ${
          esDisponible ? "bg-teal-50 border border-teal-100 text-teal-700 group-hover:shadow-md" : "bg-slate-100 border border-slate-200 text-slate-400"
        }`}>
          {icono}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
            esDisponible
              ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {esDisponible ? "Disponible" : "Próximamente"}
        </span>
      </div>

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
        Propósito {numero}
      </div>
      <h2 className={`text-base font-bold leading-snug tracking-tight transition-colors duration-150 ${
        esDisponible ? "text-slate-900 group-hover:text-teal-700" : "text-slate-600"
      }`}>
        {titulo}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {descripcion}
      </p>

      <div className="mt-5 flex items-center justify-between">
        {esDisponible ? (
          <div className="rounded-lg bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-100/50">
            7 etapas · Demo IA
          </div>
        ) : (
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200/50">
            Fuera del alcance del MVP
          </div>
        )}
        {esDisponible && (
          <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
            Entrar <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
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
    : etapa.estado_ruta === "disponible"
    ? "disponible"
    : etapa.estado_ruta === "incompleta"
    ? "incompleta"
    : "pendiente";

  const isLocked = !activa && estado === "pendiente";
  const isReview = estado === "incompleta";
  const estadoLabel = activa
    ? "Activa"
    : estado === "completada"
    ? "Completada"
    : estado === "disponible"
    ? "Disponible"
    : isReview
    ? "Pendiente"
    : "Pendiente";
  const estadoClass = activa
    ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
    : estado === "completada"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : estado === "disponible"
    ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
    : isReview
    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-lg border px-3 py-3 text-left transition-all duration-150 ${
        activa
          ? "border-teal-300 bg-white shadow-sm ring-2 ring-teal-100"
          : isLocked
          ? "border-slate-200 bg-white/70 opacity-70"
          : isReview
          ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          activa ? "bg-teal-600 text-white" : estado === "completada" ? "bg-emerald-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"
        }`}>
          {etapa.numero}
        </span>
        <span className={
          activa ? "text-teal-700" : isLocked ? "text-slate-400" : isReview ? "text-amber-600" : "text-slate-600 group-hover:text-slate-900"
        }>
          {icono}
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-xs font-bold transition-colors duration-150 ${
            activa ? "text-slate-900" : isLocked ? "text-slate-500" : isReview ? "text-amber-800" : "text-slate-700 group-hover:text-slate-900"
          }`}
        >
          {etapa.nombre}
        </span>
        {estado === "completada" && (
          <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 shadow-sm">
            <Check className="h-3 w-3 text-teal-700" strokeWidth={3} />
          </span>
        )}
        {estado === "actual" && !activa && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 shadow-sm" />
        )}
        {estado === "disponible" && (
          <span className="ml-auto rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 ring-1 ring-teal-100">
            Sigue
          </span>
        )}
        {isLocked && (
          <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300" />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${estadoClass}`}>
          {estadoLabel}
        </span>
      </div>
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
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          {icono}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          {descripcion}
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700 shadow-sm">
          <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Disponible en la próxima iteración
        </div>
      </div>
    </div>
  );
}
