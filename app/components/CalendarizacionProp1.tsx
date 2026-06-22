"use client";

import { apiFetch as fetch } from "../../lib/api";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Clock,
  Plus,
  X,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  actividadesMetodologicasBase,
  actividadesTecnicasOcultas,
  etapaDesdeNumero,
  etapasCalendarizacionDb,
  estadosCalendarizacionDb,
  herramientaPorEtapa,
} from "../data/calendarizacionProp1";
import type {
  ActividadCalendarizada,
  CalendarizacionBackend,
  CalendarizacionCreatePayload,
  EstadoCalendarizacionDb,
  EstadoActividad,
  EtapaProp1,
} from "../data/calendarizacionProp1";

type Props = {
  apiUrl: string;
  proyectoId: string;
};

type FuenteDatos = "backend" | "backend-mixto" | "base-ui";
type Filtro<T extends string> = "Todas" | T;

type FormCalendarizacion = {
  nombre_actividad: string;
  etapa: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoCalendarizacionDb;
  observaciones: string;
};

const formInicial: FormCalendarizacion = {
  nombre_actividad: "",
  etapa: "1",
  responsable: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "pendiente",
  observaciones: "",
};

const estadoStyles: Record<EstadoActividad, string> = {
  Planificada: "border-sky-200 bg-sky-50 text-sky-700",
  "En ejecución": "border-amber-200 bg-amber-50 text-amber-700",
  Completada: "border-teal-200 bg-teal-50 text-teal-700",
  Pendiente: "border-slate-200 bg-slate-100 text-slate-600",
  Atrasada: "border-rose-200 bg-rose-50 text-rose-700",
};

const estadoTimelineStyles: Record<EstadoActividad, string> = {
  Planificada: "bg-sky-500",
  "En ejecución": "bg-amber-500",
  Completada: "bg-teal-600",
  Pendiente: "bg-slate-400",
  Atrasada: "bg-rose-500",
};

function valoresUnicos<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

function normalizarEstado(estado?: string | null): EstadoActividad {
  const limpio = (estado || "").toLowerCase();
  if (limpio.includes("complet")) return "Completada";
  if (limpio.includes("ejec")) return "En ejecución";
  if (limpio.includes("atras")) return "Atrasada";
  if (limpio.includes("program")) return "Planificada";
  if (limpio.includes("plan")) return "Planificada";
  return "Pendiente";
}

function esActividadTecnicaInterna(item: CalendarizacionBackend) {
  const nombre = (item.nombre_actividad || "").toLowerCase();
  return actividadesTecnicasOcultas.some((patron) => nombre.includes(patron));
}

function semanaDesdeFecha(fechaInicio: string) {
  if (!fechaInicio) return "Sin semana";
  const fecha = new Date(`${fechaInicio}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return "Sin semana";
  const inicio = new Date(Date.UTC(fecha.getFullYear(), 0, 1));
  const diferenciaDias = Math.floor((fecha.getTime() - inicio.getTime()) / 86400000);
  const semana = Math.ceil((diferenciaDias + inicio.getUTCDay() + 1) / 7);
  return `Semana ${semana}`;
}

function fechaLegible(fecha: string) {
  if (!fecha) return "Sin fecha";
  const date = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function actividadDesdeBackend(item: CalendarizacionBackend): ActividadCalendarizada {
  const etapa = etapaDesdeNumero[item.etapa || 0] || "Investigación";
  return {
    id: item.id || `${item.nombre_actividad}-${item.fecha_inicio}`,
    actividad: item.nombre_actividad || "Actividad sin nombre",
    etapa,
    herramienta: herramientaPorEtapa[etapa],
    responsable: item.responsable || "Equipo SSP",
    fechaInicio: item.fecha_inicio || "",
    fechaTermino: item.fecha_fin || "",
    estado: normalizarEstado(item.estado),
    evidencia: item.observaciones || "Sin evidencia registrada",
    semana: semanaDesdeFecha(item.fecha_inicio || ""),
  };
}

export default function CalendarizacionProp1({ apiUrl, proyectoId }: Props) {
  const [actividades, setActividades] = useState<ActividadCalendarizada[]>(actividadesMetodologicasBase);
  const [fuenteDatos, setFuenteDatos] = useState<FuenteDatos>("base-ui");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "warning" | "error">("warning");
  const [actividadSeleccionada, setActividadSeleccionada] = useState<ActividadCalendarizada | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<string[]>([]);
  const [form, setForm] = useState<FormCalendarizacion>(formInicial);
  const [filtroEtapa, setFiltroEtapa] = useState<Filtro<EtapaProp1>>("Todas");
  const [filtroResponsable, setFiltroResponsable] = useState<Filtro<string>>("Todas");
  const [filtroEstado, setFiltroEstado] = useState<Filtro<EstadoActividad>>("Todas");
  const [filtroSemana, setFiltroSemana] = useState<Filtro<string>>("Todas");

  useEffect(() => {
    let activo = true;

    async function cargarCalendarizacion() {
      try {
        const res = await fetch(`${apiUrl}/proyectos/${proyectoId}/calendarizacion`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        const actividadesBackend = data.filter(
          (item: CalendarizacionBackend) => !esActividadTecnicaInterna(item)
        );

        if (!activo) return;

        if (actividadesBackend.length > 0) {
          setActividades([...actividadesBackend.map(actividadDesdeBackend), ...actividadesMetodologicasBase]);
          setFuenteDatos("backend-mixto");
          setTipoMensaje("success");
          setMensaje("Calendarización metodológica cargada desde backend y complementada con base UXLab.");
        } else {
          setActividades(actividadesMetodologicasBase);
          setFuenteDatos("base-ui");
          setTipoMensaje("warning");
          setMensaje("Sin registros metodológicos backend; se muestra base UXLab de referencia.");
        }
      } catch {
        if (!activo) return;
        setActividades(actividadesMetodologicasBase);
        setFuenteDatos("base-ui");
        setTipoMensaje("warning");
        setMensaje("Backend no disponible; se muestra base UXLab de referencia.");
      }
    }

    cargarCalendarizacion();

    return () => {
      activo = false;
    };
  }, [apiUrl, proyectoId]);

  const etapas = useMemo(() => valoresUnicos(actividades.map((item) => item.etapa)), [actividades]);
  const responsables = useMemo(() => valoresUnicos(actividades.map((item) => item.responsable)), [actividades]);
  const estados = useMemo(() => valoresUnicos(actividades.map((item) => item.estado)), [actividades]);
  const semanas = useMemo(() => valoresUnicos(actividades.map((item) => item.semana)), [actividades]);

  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideEtapa = filtroEtapa === "Todas" || actividad.etapa === filtroEtapa;
    const coincideResponsable = filtroResponsable === "Todas" || actividad.responsable === filtroResponsable;
    const coincideEstado = filtroEstado === "Todas" || actividad.estado === filtroEstado;
    const coincideSemana = filtroSemana === "Todas" || actividad.semana === filtroSemana;
    return coincideEtapa && coincideResponsable && coincideEstado && coincideSemana;
  });

  const resumen = {
    total: actividades.length,
    planificadas: actividades.filter((item) => item.estado === "Planificada").length,
    enEjecucion: actividades.filter((item) => item.estado === "En ejecución").length,
    completadas: actividades.filter((item) => item.estado === "Completada").length,
    atrasadasPendientes: actividades.filter((item) => item.estado === "Atrasada" || item.estado === "Pendiente").length,
  };

  const actividadesPorSemana = semanas.map((semana) => ({
    semana,
    actividades: actividadesFiltradas.filter((actividad) => actividad.semana === semana),
  })).filter((grupo) => grupo.actividades.length > 0);
  const actividadDetalle = actividadSeleccionada ?? actividadesFiltradas[0] ?? null;

  const filtrosActivos =
    filtroEtapa !== "Todas" ||
    filtroResponsable !== "Todas" ||
    filtroEstado !== "Todas" ||
    filtroSemana !== "Todas";

  function limpiarFiltros() {
    setFiltroEtapa("Todas");
    setFiltroResponsable("Todas");
    setFiltroEstado("Todas");
    setFiltroSemana("Todas");
    setActividadSeleccionada(null);
  }

  function seleccionarActividad(actividad: ActividadCalendarizada) {
    setActividadSeleccionada(actividad);
    setTipoMensaje("success");
    setMensaje(`Actividad seleccionada: ${actividad.actividad}.`);
  }

  function actualizarForm<K extends keyof FormCalendarizacion>(campo: K, valor: FormCalendarizacion[K]) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    if (erroresForm.length) setErroresForm([]);
  }

  function validarForm() {
    const errores: string[] = [];
    if (!proyectoId) errores.push("No existe proyecto_id para guardar la calendarización.");
    if (!form.nombre_actividad.trim()) errores.push("Nombre de actividad es obligatorio.");
    if (!form.etapa) errores.push("Etapa es obligatoria.");
    if (!form.responsable.trim()) errores.push("Responsable es obligatorio.");
    if (!form.fecha_inicio) errores.push("Fecha de inicio es obligatoria.");
    if (!form.fecha_fin) errores.push("Fecha de término es obligatoria.");
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      errores.push("Fecha de término no puede ser anterior a fecha de inicio.");
    }
    if (!form.estado) errores.push("Estado es obligatorio.");
    return errores;
  }

  async function crearActividad() {
    const errores = validarForm();
    if (errores.length) {
      setErroresForm(errores);
      setTipoMensaje("error");
      setMensaje("Revisa los campos obligatorios antes de guardar.");
      return;
    }

    const payload: CalendarizacionCreatePayload = {
      proyecto_id: proyectoId,
      etapa: Number(form.etapa),
      nombre_actividad: form.nombre_actividad.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      responsable: form.responsable.trim(),
      estado: form.estado,
      observaciones: form.observaciones.trim() || null,
    };

    try {
      setGuardando(true);
      const res = await fetch(`${apiUrl}/calendarizacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detalle = await res.text();
        throw new Error(detalle || "No se pudo crear la actividad calendarizada.");
      }

      const json = await res.json();
      const creada = actividadDesdeBackend(json.data || payload);
      setActividades((actuales) => [creada, ...actuales]);
      setActividadSeleccionada(creada);
      setFuenteDatos((actual) => (actual === "base-ui" ? "backend-mixto" : actual));
      setForm(formInicial);
      setFormAbierto(false);
      setErroresForm([]);
      setTipoMensaje("success");
      setMensaje("Actividad metodológica calendarizada correctamente");
    } catch (error) {
      console.error("Error al crear calendarización:", error);
      setTipoMensaje("error");
      setMensaje("No se pudo guardar la actividad metodológica. Verifica backend, proyecto_id y estado permitido.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="px-6 py-8 ux-reveal">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Calendarización
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              Calendarización de actividades metodológicas
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Organiza las actividades metodológicas del Propósito 1 según etapa,
              responsable, fechas y estado de avance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold shadow-sm ${
              fuenteDatos === "backend" || fuenteDatos === "backend-mixto"
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              <ClipboardList className="h-4 w-4" />
              {fuenteDatos === "backend-mixto"
                ? "Backend + base UXLab"
                : fuenteDatos === "backend"
                ? "Datos backend"
                : "Base UXLab"}
            </span>
            <button
              type="button"
              onClick={() => setFormAbierto(true)}
              className="ux-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Nueva actividad metodológica
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <ResumenCard label="Total" valor={resumen.total} icono={<ClipboardList className="h-4 w-4" />} />
          <ResumenCard label="Planificadas" valor={resumen.planificadas} icono={<CalendarDays className="h-4 w-4" />} />
          <ResumenCard label="En ejecución" valor={resumen.enEjecucion} icono={<Clock className="h-4 w-4" />} />
          <ResumenCard label="Completadas" valor={resumen.completadas} icono={<CheckCircle className="h-4 w-4" />} />
          <ResumenCard label="Pendientes/atrasadas" valor={resumen.atrasadasPendientes} icono={<AlertTriangle className="h-4 w-4" />} />
        </div>

        {mensaje && (
          <div className={`rounded-lg border px-5 py-4 text-sm font-medium shadow-sm ${
            tipoMensaje === "success"
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : tipoMensaje === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}>
            {mensaje}
          </div>
        )}

        {formAbierto && (
          <div className="ux-panel rounded-lg border-teal-200 p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Nueva actividad metodológica</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Crear actividad metodológica calendarizada</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Se guardará en `calendarizacion_actividad` usando solo campos reales de la tabla.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormAbierto(false);
                  setErroresForm([]);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                aria-label="Cerrar formulario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {erroresForm.length > 0 && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <p className="font-bold">No se pudo guardar todavía:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {erroresForm.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <FormInput
                label="Nombre de actividad"
                value={form.nombre_actividad}
                onChange={(value) => actualizarForm("nombre_actividad", value)}
                placeholder="Ej.: Aplicar entrevistas a personas usuarias"
                required
              />
              <FormSelect
                label="Etapa"
                value={form.etapa}
                onChange={(value) => actualizarForm("etapa", value)}
                options={etapasCalendarizacionDb.map((etapa) => ({
                  value: String(etapa.value),
                  label: `${etapa.value}. ${etapa.label}`,
                }))}
                required
              />
              <FormInput
                label="Responsable"
                value={form.responsable}
                onChange={(value) => actualizarForm("responsable", value)}
                placeholder="Ej.: Equipo SSP"
                required
              />
              <FormSelect
                label="Estado"
                value={form.estado}
                onChange={(value) => actualizarForm("estado", value as EstadoCalendarizacionDb)}
                options={estadosCalendarizacionDb}
                required
              />
              <FormInput
                label="Fecha de inicio"
                type="date"
                value={form.fecha_inicio}
                onChange={(value) => actualizarForm("fecha_inicio", value)}
                required
              />
              <FormInput
                label="Fecha de término"
                type="date"
                value={form.fecha_fin}
                onChange={(value) => actualizarForm("fecha_fin", value)}
                required
              />
              <label className="block md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Observaciones
                </span>
                <textarea
                  value={form.observaciones}
                  onChange={(event) => actualizarForm("observaciones", event.target.value)}
                  rows={3}
                  placeholder="Referencia metodológica, acuerdo con contraparte o estado de evidencia."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFormAbierto(false);
                  setErroresForm([]);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={crearActividad}
                disabled={guardando}
                className="ux-button-primary rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {guardando ? "Guardando..." : "Guardar actividad metodológica"}
              </button>
            </div>
          </div>
        )}

        <div className="ux-card rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="h-4 w-4 text-teal-700" />
            Filtros de calendarización
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <FiltroSelect
              label="Etapa"
              value={filtroEtapa}
              options={etapas}
              onChange={(value) => setFiltroEtapa(value as Filtro<EtapaProp1>)}
            />
            <FiltroSelect
              label="Responsable"
              value={filtroResponsable}
              options={responsables}
              onChange={setFiltroResponsable}
            />
            <FiltroSelect
              label="Estado"
              value={filtroEstado}
              options={estados}
              onChange={(value) => setFiltroEstado(value as Filtro<EstadoActividad>)}
            />
            <FiltroSelect
              label="Semana"
              value={filtroSemana}
              options={semanas}
              onChange={setFiltroSemana}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {actividadesFiltradas.length} de {actividades.length} actividades metodológicas calendarizadas.
            </p>
            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={!filtrosActivos}
              className="self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="ux-card overflow-hidden rounded-lg">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">Listado de actividades</h3>
              <p className="mt-1 text-sm text-slate-500">
                Fechas, responsables, etapa metodológica, herramienta y evidencia visual derivada.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Actividad</th>
                    <th className="px-4 py-3 font-bold">Etapa metodológica</th>
                    <th className="px-4 py-3 font-bold">Herramienta asociada</th>
                    <th className="px-4 py-3 font-bold">Responsable</th>
                    <th className="px-4 py-3 font-bold">Fecha inicio</th>
                    <th className="px-4 py-3 font-bold">Fecha término</th>
                    <th className="px-4 py-3 font-bold">Estado</th>
                    <th className="px-4 py-3 font-bold">Evidencia</th>
                    <th className="px-4 py-3 font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actividadesFiltradas.map((actividad) => (
                    <tr key={actividad.id} className="align-top transition-colors duration-150 hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-semibold text-slate-900">{actividad.actividad}</td>
                      <td className="px-4 py-4 text-slate-600">{actividad.etapa}</td>
                      <td className="px-4 py-4 text-slate-600">{actividad.herramienta}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <Users className="h-3.5 w-3.5" />
                          {actividad.responsable}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{fechaLegible(actividad.fechaInicio)}</td>
                      <td className="px-4 py-4 text-slate-600">{fechaLegible(actividad.fechaTermino)}</td>
                      <td className="px-4 py-4">
                        <EstadoBadge estado={actividad.estado} />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <span className={actividad.evidencia === "Sin evidencia registrada" ? "text-amber-700" : ""}>
                          {actividad.evidencia || "Sin evidencia registrada"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onPointerDown={() => seleccionarActividad(actividad)}
                          onClick={() => seleccionarActividad(actividad)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Search className="h-3.5 w-3.5" />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {actividadesFiltradas.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No hay actividades metodológicas que coincidan con los filtros seleccionados.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="ux-card rounded-lg p-5">
              <h3 className="text-base font-bold text-slate-900">Timeline por semana</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Vista simplificada para identificar período, semana, estado y relación metodológica.
              </p>
              <div className="mt-5 space-y-4">
                {actividadesPorSemana.map((grupo) => (
                  <div key={grupo.semana} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">{grupo.semana}</p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                        {grupo.actividades.length} actividades
                      </span>
                    </div>
                    <div className="space-y-3">
                      {grupo.actividades.map((actividad) => (
                        <button
                          type="button"
                          key={actividad.id}
                          onPointerDown={() => seleccionarActividad(actividad)}
                          onClick={() => seleccionarActividad(actividad)}
                          className="ux-card-interactive w-full rounded-lg border border-white bg-white p-3 text-left shadow-sm transition-all duration-150 hover:border-teal-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${estadoTimelineStyles[actividad.estado]}`} />
                            <p className="line-clamp-1 text-sm font-bold text-slate-900">{actividad.actividad}</p>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${estadoTimelineStyles[actividad.estado]}`} style={{ width: actividad.estado === "Completada" ? "100%" : actividad.estado === "En ejecución" ? "62%" : actividad.estado === "Atrasada" ? "44%" : "30%" }} />
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {fechaLegible(actividad.fechaInicio)} - {fechaLegible(actividad.fechaTermino)} · {actividad.etapa}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {actividadesPorSemana.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    Sin actividades para representar en el timeline.
                  </div>
                )}
              </div>
            </div>

            {actividadDetalle && (
              <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Detalle seleccionado</p>
                <h3 className="mt-2 text-base font-bold text-slate-900">{actividadDetalle.actividad}</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <Detalle label="Etapa" value={actividadDetalle.etapa} />
                  <Detalle label="Herramienta" value={actividadDetalle.herramienta} />
                  <Detalle label="Responsable" value={actividadDetalle.responsable} />
                  <Detalle label="Período" value={`${fechaLegible(actividadDetalle.fechaInicio)} - ${fechaLegible(actividadDetalle.fechaTermino)}`} />
                  <Detalle label="Evidencia" value={actividadDetalle.evidencia || "Sin evidencia registrada"} />
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EstadoBadge({ estado }: { estado: EstadoActividad }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${estadoStyles[estado]}`}>
      {estado}
    </span>
  );
}

function ResumenCard({ label, valor, icono }: { label: string; valor: number; icono: React.ReactNode }) {
  return (
    <div className="ux-card rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <span className="rounded-lg bg-teal-50 p-2 text-teal-700">{icono}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{valor}</p>
    </div>
  );
}

function FiltroSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      >
        <option value="Todas">Todas</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
        {required && <span className="ml-1 text-teal-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
        {required && <span className="ml-1 text-teal-600">*</span>}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all duration-150 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Detalle({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 font-bold text-teal-800">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}
