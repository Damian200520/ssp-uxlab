"use client";

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  FileText,
  Lightbulb,
  Link,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type {
  EstadoHerramienta,
  EtapaProp1,
  FlujoHerramienta,
  HerramientaProp1,
  TipoHerramienta,
} from "../data/herramientasProp1";
import { herramientasProp1 } from "../data/herramientasProp1";

type Props = {
  onAbrirHerramienta: (flujo: FlujoHerramienta) => void;
};

type FiltroCatalogo<T extends string> = "Todas" | T;

const iconos: Record<FlujoHerramienta, ReactNode> = {
  investigacion: <Search className="h-5 w-5" strokeWidth={2.2} />,
  personas: <Users className="h-5 w-5" strokeWidth={2.2} />,
  habilitacion: <Zap className="h-5 w-5" strokeWidth={2.2} />,
  necesidades: <Lightbulb className="h-5 w-5" strokeWidth={2.2} />,
  vinculacion: <Link className="h-5 w-5" strokeWidth={2.2} />,
  calendarizacion: <CalendarDays className="h-5 w-5" strokeWidth={2.2} />,
  evidencias: <FileText className="h-5 w-5" strokeWidth={2.2} />,
  resultados: <BarChart3 className="h-5 w-5" strokeWidth={2.2} />,
};

const estadoClass: Record<EstadoHerramienta, string> = {
  Disponible: "border-teal-200 bg-teal-50 text-teal-700",
  "En desarrollo": "border-amber-200 bg-amber-50 text-amber-700",
  Planificada: "border-slate-200 bg-slate-100 text-slate-600",
};

function valoresUnicos<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

function herramientaDisponible(herramienta: HerramientaProp1) {
  return herramienta.estado === "Disponible";
}

export default function CatalogoHerramientasProp1({ onAbrirHerramienta }: Props) {
  const [filtroEtapa, setFiltroEtapa] = useState<FiltroCatalogo<EtapaProp1>>("Todas");
  const [filtroTipo, setFiltroTipo] = useState<FiltroCatalogo<TipoHerramienta>>("Todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroCatalogo<EstadoHerramienta>>("Todas");

  const etapas = useMemo(() => valoresUnicos(herramientasProp1.map((item) => item.etapa)), []);
  const tipos = useMemo(() => valoresUnicos(herramientasProp1.map((item) => item.tipo)), []);
  const estados = useMemo(() => valoresUnicos(herramientasProp1.map((item) => item.estado)), []);

  const herramientasFiltradas = herramientasProp1.filter((herramienta) => {
    const coincideEtapa = filtroEtapa === "Todas" || herramienta.etapa === filtroEtapa;
    const coincideTipo = filtroTipo === "Todas" || herramienta.tipo === filtroTipo;
    const coincideEstado = filtroEstado === "Todas" || herramienta.estado === filtroEstado;
    return coincideEtapa && coincideTipo && coincideEstado;
  });

  const totalDisponibles = herramientasProp1.filter((item) => item.estado === "Disponible").length;
  const totalEnDesarrollo = herramientasProp1.filter((item) => item.estado === "En desarrollo").length;
  const totalPlanificadas = herramientasProp1.filter((item) => item.estado === "Planificada").length;
  const filtrosActivos = filtroEtapa !== "Todas" || filtroTipo !== "Todas" || filtroEstado !== "Todas";

  function limpiarFiltros() {
    setFiltroEtapa("Todas");
    setFiltroTipo("Todas");
    setFiltroEstado("Todas");
  }

  return (
    <section className="px-6 py-8 ux-reveal">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
              <Sparkles className="h-3.5 w-3.5" />
              Catálogo de herramientas
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              Catálogo de herramientas del Propósito 1
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Interfaz funcional del catálogo MVP con herramientas de viabilidad alta,
              organizada por etapa, tipo de herramienta y estado de avance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
            <ResumenEstado label="Disponibles" valor={totalDisponibles} tono="teal" />
            <ResumenEstado label="En desarrollo" valor={totalEnDesarrollo} tono="amber" />
            <ResumenEstado label="Planificadas" valor={totalPlanificadas} tono="slate" />
          </div>
        </div>

        <div className="ux-card mb-5 rounded-lg p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FiltroSelect
              label="Etapa o módulo"
              value={filtroEtapa}
              options={etapas}
              onChange={(value) => setFiltroEtapa(value as FiltroCatalogo<EtapaProp1>)}
            />
            <FiltroSelect
              label="Tipo de herramienta"
              value={filtroTipo}
              options={tipos}
              onChange={(value) => setFiltroTipo(value as FiltroCatalogo<TipoHerramienta>)}
            />
            <FiltroSelect
              label="Estado"
              value={filtroEstado}
              options={estados}
              onChange={(value) => setFiltroEstado(value as FiltroCatalogo<EstadoHerramienta>)}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {herramientasFiltradas.length} de {herramientasProp1.length} herramientas MVP.
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {herramientasFiltradas.map((herramienta) => (
            <HerramientaCard
              key={herramienta.id}
              herramienta={herramienta}
              onAbrirHerramienta={onAbrirHerramienta}
            />
          ))}
        </div>

        {herramientasFiltradas.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
            No hay herramientas que coincidan con los filtros seleccionados.
          </div>
        )}

        <div className="ux-card mt-6 rounded-lg px-5 py-4 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <p>
              Las herramientas disponibles abren el flujo existente sin reemplazar registros,
              lienzos ni asistencia IA. Las herramientas en desarrollo quedan visibles sin
              bloquear el recorrido del Propósito 1.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HerramientaCard({
  herramienta,
  onAbrirHerramienta,
}: {
  herramienta: HerramientaProp1;
  onAbrirHerramienta: (flujo: FlujoHerramienta) => void;
}) {
  const disponible = herramientaDisponible(herramienta);
  const actionLabel = disponible
    ? herramienta.flujo === "evidencias"
      ? "Abrir herramienta"
      : "Ver etapa"
    : "En desarrollo";

  return (
    <article
      className={`ux-card-interactive flex min-h-[285px] flex-col rounded-lg border bg-white p-5 shadow-sm transition-all duration-150 ${
        disponible
          ? "border-teal-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
            disponible
              ? "border-teal-100 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {iconos[herramienta.flujo]}
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${estadoClass[herramienta.estado]}`}>
          {herramienta.estado}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {herramienta.etapa}
          </p>
          <h3 className="mt-1 text-base font-bold leading-snug text-slate-900">
            {herramienta.nombre}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {herramienta.tipo}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Viabilidad MVP: {herramienta.viabilidadMvp}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-600">{herramienta.descripcion}</p>
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => disponible && onAbrirHerramienta(herramienta.flujo)}
          disabled={!disponible}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-150 ${
            disponible
              ? "ux-button-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              : "cursor-not-allowed bg-slate-100 text-slate-500"
          }`}
        >
          {actionLabel}
          {disponible && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

function ResumenEstado({
  label,
  valor,
  tono,
}: {
  label: string;
  valor: number;
  tono: "teal" | "amber" | "slate";
}) {
  const styles = {
    teal: "border-teal-100 text-teal-700",
    amber: "border-amber-100 text-amber-700",
    slate: "border-slate-200 text-slate-700",
  };

  return (
    <div className={`ux-card rounded-lg px-3 py-2 ${styles[tono]}`}>
      <p className="text-lg font-bold">{valor}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
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
