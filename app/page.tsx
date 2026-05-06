'use client';

import React, { useState, useEffect } from 'react';
import { actualizarEtapaProyecto, guardarEtapaDemo } from "@/lib/api";

// ─── TIPOS Y DATOS ─────────────────────────────────────────────────────────────
type Vista = 0 | 1 | 2 | 3 | 4 | 5;

interface EtapaData {
  num: number;
  nombre: string;
  icon: React.ReactNode;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorAccent: string;
  descripcion: string;
  pagGuia: string;
  resultado: string;
  sugerenciaIA: string;
}

interface HerramientaMVP {
  id: number;
  nombre: string;
  descripcion: string;
  etapaNum: number;
  etapaNombre: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  icon: React.ReactNode;
}

// ─── ICONOGRAFÍA ──────────────────────────────────────────────────────────────
// Principio: cada icono tiene un rol claro. No se repite en contextos distintos.
const ICONS = {
  // Etapas — identidad visual de cada fase
  investigacion: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  personas: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  habilitacion: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  necesidades: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  vinculacion: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
  medicion: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  criticos: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,

  // Navegación y estructura
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  catalog: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  selection: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />,

  // Acciones
  check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />,
  checkCircle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  arrowRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />,
  arrowLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />,
  upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,

  // Archivos
  filePdf: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  fileImg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,

  // Identidad y seguridad
  user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  mail: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,

  // Métricas y tendencias
  trendUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
  trendDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />,
  chartBar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,

  // Apoyo y propósitos
  bulb: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M12 21v-1m4.708-2.864l1.208 1.208M7.308 18.136l-1.208 1.208M17 12a5 5 0 11-10 0 5 5 0 0110 0z" />,
  collaboration: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />,
  satisfaction: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  newService: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
  userPerspective: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,

  // Exportar
  export: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
};

const ETAPAS: EtapaData[] = [
  { num: 1, nombre: 'Investigación', icon: ICONS.investigacion, colorBg: 'bg-stone-100/80', colorBorder: 'border-stone-200/80', colorText: 'text-stone-700', colorAccent: 'bg-stone-500', descripcion: 'Diseñar y ejecutar la investigación de las personas usuarias del servicio.', pagGuia: '110', resultado: 'Plan de investigación documentado y guardado en el sistema.', sugerenciaIA: 'Enfoque recomendado: barreras de acceso digital, tiempos de espera y puntos de abandono del trámite.' },
  { num: 2, nombre: 'Personas', icon: ICONS.personas, colorBg: 'bg-orange-50/50', colorBorder: 'border-orange-100', colorText: 'text-orange-700', colorAccent: 'bg-orange-500', descripcion: 'Describir a las personas usuarias de los servicios institucionales.', pagGuia: '142', resultado: 'Fichas de arquetipos creadas y guardadas en el repositorio.', sugerenciaIA: 'Perfil frecuente: adulto mayor con baja alfabetización digital y funcionario con sobrecarga operativa.' },
  { num: 3, nombre: 'Habilitación y Expectativas', icon: ICONS.habilitacion, colorBg: 'bg-teal-50/50', colorBorder: 'border-teal-100', colorText: 'text-teal-700', colorAccent: 'bg-teal-600', descripcion: 'Detectar niveles de habilitación y consensuar expectativas del equipo.', pagGuia: '102', resultado: 'Diagnóstico de capacidades y objetivos estratégicos alineados.', sugerenciaIA: 'Baja habilitación digital sugiere dependencia presencial. Considera estrategias omnicanales.' },
  { num: 4, nombre: 'Necesidades', icon: ICONS.necesidades, colorBg: 'bg-rose-50/50', colorBorder: 'border-rose-100', colorText: 'text-rose-700', colorAccent: 'bg-rose-500', descripcion: 'Comprender a fondo las motivaciones y necesidades de las personas.', pagGuia: '134', resultado: 'Listado de necesidades priorizadas por impacto y urgencia.', sugerenciaIA: 'Evalúa: acceso a la información, tiempos de respuesta, claridad de requisitos y calidad del trato.' },
  { num: 5, nombre: 'Vinculación', icon: ICONS.vinculacion, colorBg: 'bg-sky-50/50', colorBorder: 'border-sky-100', colorText: 'text-sky-700', colorAccent: 'bg-sky-600', descripcion: 'Alinear las necesidades de las personas usuarias con la oferta de servicio.', pagGuia: '156', resultado: 'Matriz de cobertura que cruza necesidades reales con actividades.', sugerenciaIA: 'Asegura la cobertura de necesidades críticas mediante canales digitales alternativos viables.' },
  { num: 6, nombre: 'Medición', icon: ICONS.medicion, colorBg: 'bg-emerald-50/50', colorBorder: 'border-emerald-100', colorText: 'text-emerald-700', colorAccent: 'bg-emerald-500', descripcion: 'Observar y medir la experiencia entregada a través de indicadores.', pagGuia: '118', resultado: 'Panel de seguimiento y repositorio de evidencias configurado.', sugerenciaIA: 'Monitorea: tiempo de resolución, éxito en primera interacción y satisfacción (CSAT).' },
  { num: 7, nombre: 'Momentos Críticos', icon: ICONS.criticos, colorBg: 'bg-amber-50/50', colorBorder: 'border-amber-100', colorText: 'text-amber-700', colorAccent: 'bg-amber-500', descripcion: 'Identificar los momentos de quiebre en la experiencia actual del servicio.', pagGuia: '128', resultado: 'Mapa de quiebres priorizados con causas raíz identificadas.', sugerenciaIA: 'Fricciones severas suelen ubicarse en el onboarding inicial o tras el rechazo de documentos.' },
];

const HERRAMIENTAS_MVP: HerramientaMVP[] = [
  { id: 1, nombre: 'Formulario de registro de investigación', descripcion: 'Ingreso de contexto, objetivos y metodología.', etapaNum: 1, etapaNombre: 'Investigación', prioridad: 'Alta', icon: ICONS.investigacion },
  { id: 2, nombre: 'Plantilla de perfiles de persona usuaria', descripcion: 'Fichas guiadas con rol, barreras y motivaciones.', etapaNum: 2, etapaNombre: 'Personas', prioridad: 'Alta', icon: ICONS.personas },
  { id: 3, nombre: 'Formulario de declaración de expectativas', descripcion: 'Captura de capacidades y objetivos del equipo.', etapaNum: 3, etapaNombre: 'Habilitación y Expectativas', prioridad: 'Alta', icon: ICONS.habilitacion },
  { id: 4, nombre: 'Tabla de necesidades priorizadas', descripcion: 'Lista editable con impacto estimado.', etapaNum: 4, etapaNombre: 'Necesidades', prioridad: 'Alta', icon: ICONS.necesidades },
  { id: 5, nombre: 'Tabla de vinculación necesidad–actividad', descripcion: 'Relación entre necesidades y oferta.', etapaNum: 5, etapaNombre: 'Vinculación', prioridad: 'Alta', icon: ICONS.vinculacion },
  { id: 6, nombre: 'Plantilla de calendarización de actividades', descripcion: 'Planificación temporal de las actividades de medición.', etapaNum: 6, etapaNombre: 'Medición', prioridad: 'Alta', icon: ICONS.calendar },
  { id: 7, nombre: 'Carga de evidencias por actividad', descripcion: 'Repositorio documental centralizado.', etapaNum: 6, etapaNombre: 'Medición', prioridad: 'Media', icon: ICONS.filePdf },
  { id: 8, nombre: 'Dashboard de resultados del Propósito 1', descripcion: 'Vista consolidada del recorrido completo.', etapaNum: 7, etapaNombre: 'Momentos Críticos', prioridad: 'Alta', icon: ICONS.dashboard },
];

const TAG_COLORS = {
  stone: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', btn: 'hover:text-stone-900', ring: 'focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-400' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', btn: 'hover:text-emerald-900', ring: 'focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', btn: 'hover:text-orange-900', ring: 'focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400' }
};

const calcularProgresoKPI = (base: number, meta: number, actual: number, mejorSi: 'sube' | 'baja') => {
  if (base === meta) return 100;
  let progreso = 0;
  if (mejorSi === 'sube') {
    progreso = ((actual - base) / (meta - base)) * 100;
  } else {
    progreso = ((base - actual) / (base - meta)) * 100;
  }
  return Math.max(0, Math.min(Math.round(progreso), 100));
};

// ─── COMPONENTES UI REUTILIZABLES ──────────────────────────────────────────────

function TagInput({ placeholder, initialTags = [], accentColor = 'stone' }: { placeholder?: string, initialTags?: string[], accentColor?: 'stone' | 'emerald' | 'orange' }) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');
  const theme = TAG_COLORS[accentColor];

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      setTags([...tags, input.trim()]);
      setInput('');
      e.preventDefault();
    }
  };

  return (
    <div className={`rounded-xl border border-stone-200/80 bg-white p-3 transition-all ${theme.ring}`}>
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className={`flex items-center gap-1.5 rounded-md ${theme.bg} px-2.5 py-1 text-xs font-medium ${theme.text} border ${theme.border}`}>
            {tag}
            <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className={`ml-1 text-slate-400 ${theme.btn} transition-colors`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center px-1">
        <svg className="w-4 h-4 text-stone-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.plus}</svg>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder={placeholder || 'Añadir y presionar Enter...'} className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 font-light" />
      </div>
    </div>
  );
}

function GestorEvidencias() {
  const evidencias = [
    { id: 1, nombre: 'Pauta_Entrevistas.pdf', tipo: 'PDF', icon: ICONS.filePdf, etapa: 'Investigación', fecha: '28 Abr 26', responsable: 'DM', estado: 'Validado' },
    { id: 2, nombre: 'Arquetipos_Base.png', tipo: 'IMG', icon: ICONS.fileImg, etapa: 'Personas', fecha: '29 Abr 26', responsable: 'LV', estado: 'En revisión' },
  ];

  return (
    <div className="border border-stone-200/80 bg-white rounded-2xl overflow-hidden shadow-sm mt-8">
      <div className="p-5 border-b border-stone-100 bg-[#FAF9F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Icono de herramienta principal — sí aporta como identificador de sección */}
          <h4 className="text-sm font-semibold text-stone-800 tracking-tight flex items-center gap-2">
            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.filePdf}</svg>
            Herramienta: Carga de evidencias por actividad
          </h4>
          <p className="text-xs text-stone-500 mt-1 font-light">Repositorio documental del proceso metodológico.</p>
        </div>
        <button className="bg-teal-900 hover:bg-teal-800 text-white text-[11px] uppercase tracking-wider font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 active:scale-95 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.upload}</svg>
          Subir archivo
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white border-b border-stone-100 text-stone-400 text-[10px] uppercase tracking-widest font-semibold">
            <tr>
              <th className="px-6 py-4 font-medium">Archivo</th>
              <th className="px-6 py-4 font-medium">Etapa</th>
              <th className="px-6 py-4 font-medium">Responsable</th>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50/80">
            {evidencias.map((ev) => (
              <tr key={ev.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 text-stone-700 font-medium text-xs flex items-center gap-3">
                  <div className="w-7 h-7 rounded border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ev.icon}</svg>
                  </div>
                  {ev.nombre}
                </td>
                <td className="px-6 py-4 text-stone-500 text-xs font-light">{ev.etapa}</td>
                <td className="px-6 py-4 text-stone-500 text-xs font-light">{ev.responsable}</td>
                {/* Fecha sin icono — el contexto es suficiente */}
                <td className="px-6 py-4 text-stone-500 text-xs font-light">{ev.fecha}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${ev.estado === 'Validado' ? 'border-emerald-200/60 text-emerald-700 bg-emerald-50/50' : 'border-amber-200/60 text-amber-700 bg-amber-50/50'}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ev.estado === 'Validado' ? ICONS.checkCircle : ICONS.criticos}</svg>
                    {ev.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── NAVEGACIÓN Y ESTRUCTURA ──────────────────────────────────────────────────

function PantallaLogin({ cambiarVista }: { cambiarVista: (v: Vista) => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);

  return (
    <main className={`flex min-h-screen items-center justify-center bg-[#F7F6F3] font-sans p-6 relative overflow-hidden transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50rem] h-[50rem] bg-teal-900/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
      
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-stone-200/60 p-12 flex flex-col items-center relative z-10">
        {/* Logo — icono escudo tiene peso visual claro aquí */}
        <div className="w-14 h-14 bg-teal-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.shield}</svg>
        </div>
        <h1 className="text-2xl font-medium text-stone-900 tracking-tight mb-1">Plataforma SSP</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400 mb-10">Laboratorio UTEM</p>
        
        <div className="w-full space-y-5">
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Correo Electrónico</label>
            <div className="absolute top-8 left-4 text-stone-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.mail}</svg></div>
            <input type="email" defaultValue="usuario@utem.cl" className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl pl-11 pr-4 py-3.5 text-sm text-stone-800 focus:outline-none focus:bg-white focus:border-teal-700 transition-all font-light placeholder:text-stone-400" />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Contraseña</label>
            <div className="absolute top-8 left-4 text-stone-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.lock}</svg></div>
            <input type="password" defaultValue="12345678" className="w-full bg-stone-50/50 border border-stone-200/80 rounded-xl pl-11 pr-4 py-3.5 text-sm text-stone-800 focus:outline-none focus:bg-white focus:border-teal-700 transition-all font-light placeholder:text-stone-400" />
          </div>
          <button onClick={() => cambiarVista(1)} className="w-full bg-teal-900 hover:bg-teal-800 text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm active:scale-[0.98] mt-4 text-sm flex items-center justify-center gap-2">
            Ingresar al sistema <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowRight}</svg>
          </button>
        </div>
      </div>
    </main>
  );
}

interface SidebarProps {
  vista: Vista;
  cambiarVista: (v: Vista) => void;
  etapaActiva: number;
  setEtapaActiva: (n: number) => void;
}

function Sidebar({ vista, cambiarVista, etapaActiva, setEtapaActiva }: SidebarProps) {
  return (
    <aside className="w-72 bg-[#FDFCFB] border-r border-stone-200/60 flex flex-col shrink-0 shadow-sm relative z-30">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo del sidebar — icono escudo necesario para identidad de marca */}
          <div className="w-8 h-8 bg-teal-900 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.shield}</svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900 tracking-tight leading-none">Plataforma SSP</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1.5">Metodología</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        <div>
          {/* Sección sin icono de encabezado — el label es suficiente */}
          <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3 px-2">Flujo Principal</div>
          <div className="space-y-1">
            {/* Items de navegación: icono como identificador visual de destino */}
            <button onClick={() => cambiarVista(1)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${vista === 1 ? 'bg-white text-teal-900 border border-stone-200/80 shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.selection}</svg> Seleccionar enfoque
            </button>
            <button onClick={() => cambiarVista(2)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${vista === 2 ? 'bg-white text-teal-900 border border-stone-200/80 shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.habilitacion}</svg> Propósito 1
            </button>
            
            {vista === 2 && (
              <div className="ml-5 mt-1 border-l border-stone-200/80 pl-3 space-y-1 mb-4">
                {ETAPAS.map((etapa, i) => (
                  <button key={etapa.num} onClick={() => setEtapaActiva(i)} className={`w-full text-left py-1.5 px-3 text-xs transition-colors rounded-lg font-medium flex items-center gap-2 ${etapaActiva === i ? 'text-teal-900 bg-teal-50/50' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
                    {/* Sub-items de etapa: icono como identificador de etapa */}
                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">{etapa.icon}</svg>
                    {etapa.nombre}
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => cambiarVista(5)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 ${vista === 5 ? 'bg-white text-teal-900 border border-stone-200/80 shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.chartBar}</svg> Resultados P1
            </button>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3 px-2">Recursos y Apoyo</div>
          <div className="space-y-1">
            <button onClick={() => cambiarVista(3)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${vista === 3 ? 'bg-white text-teal-900 border border-stone-200/80 shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.catalog}</svg> Catálogo General
            </button>
            <button onClick={() => cambiarVista(4)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${vista === 4 ? 'bg-white text-teal-900 border border-stone-200/80 shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.calendar}</svg> Calendarización
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-6 border-t border-stone-200/60 mt-auto bg-[#FDFCFB]">
         <div className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200/60">
            <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.user}</svg>
            </div>
            <div className="text-xs font-medium text-stone-800">Damián M.</div>
         </div>
      </div>
    </aside>
  );
}

function PantallaSeleccion({ cambiarVista }: { cambiarVista: (v: Vista) => void }) {
  // Iconos semánticamente distintos para cada propósito — diferenciación visual clara
  const propositos = [
    { id: 1, titulo: 'Propósito 1 · Comprender la experiencia actual', desc: 'Contar con un diagnóstico claro para individualizar desafíos y comprender la experiencia real.', activo: true, icon: ICONS.investigacion },
    { id: 2, titulo: 'Propósito 2 · Incorporar perspectiva usuaria', desc: 'Ejecutar acciones orientadas a reforzar la orientación a las personas en la institución.', activo: false, icon: ICONS.userPerspective },
    { id: 3, titulo: 'Propósito 3 · Mejorar satisfacción con el servicio', desc: 'Identificar oportunidades de mejora y definir planes para elevar la satisfacción general.', activo: false, icon: ICONS.satisfaction },
    { id: 4, titulo: 'Propósito 4 · Mejorar la colaboración interna', desc: 'Apoyar el trabajo colaborativo, rompiendo silos para el diseño de servicios coherentes.', activo: false, icon: ICONS.collaboration },
    { id: 5, titulo: 'Propósito 5 · Diseñar un nuevo servicio', desc: 'Transformar una necesidad no resuelta en una propuesta clara: qué hará, para quién y cómo.', activo: false, icon: ICONS.newService }
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-[#F9F8F6] font-sans">
      <div className="bg-[#F2F4F4] border-b border-stone-200/60 px-10 py-16 lg:px-16 lg:py-24 shadow-sm relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Encabezado de sección — icono con intención, no decorativo */}
          <h2 className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.selection}</svg>
            Paso 1 · Enfoque Estratégico
          </h2>
          <h1 className="text-4xl lg:text-5xl font-light text-stone-900 mb-6 tracking-tight leading-tight">¿Cuál es el <span className="font-medium text-teal-900">propósito</span> de tu diagnóstico?</h1>
          <p className="text-stone-500 text-lg font-light max-w-2xl leading-relaxed">Selecciona una de las líneas de acción para estructurar metodológicamente el recorrido y habilitar las herramientas necesarias.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12 relative z-20 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propositos.map((p) => (
            <div 
              key={p.id} 
              onClick={() => p.activo ? cambiarVista(2) : null}
              className={`flex flex-col transition-all duration-300 rounded-3xl bg-white p-8 ${p.activo ? 'border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer ring-2 ring-teal-900/5' : 'border border-stone-200/60 opacity-80 cursor-not-allowed shadow-sm'}`}
            >
              <div className="flex items-center justify-between mb-8">
                 {/* Icono de propósito — gran protagonismo visual, tamaño destacado */}
                 <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-base font-bold ${p.activo ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{p.icon}</svg>
                 </span>
                 {!p.activo && <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 px-3 py-1.5 rounded border border-stone-100">Próximamente</span>}
              </div>
              <h3 className={`text-xl font-medium tracking-tight mb-3 ${p.activo ? 'text-stone-900' : 'text-stone-600'}`}>{p.titulo}</h3>
              <p className="text-sm text-stone-500 font-light leading-relaxed flex-1 mb-8">{p.desc}</p>
              {p.activo && (
                 <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-teal-900 hover:text-teal-700 bg-teal-50/50 border border-teal-100 self-start px-6 py-3 rounded-xl transition-colors active:scale-95">
                    Seleccionar propósito <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowRight}</svg>
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── COMPONENTES DE ETAPA ─────────────────────────────────────────────────────


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">{label}</label>
      {children}
    </div>
  );
}

function LayoutInvestigacion() {
  return (
    <div className="space-y-8">
      <div className="bg-teal-50/30 border border-teal-100/70 rounded-[2rem] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <h4 className="text-sm font-bold text-teal-900 tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.investigacion}</svg>
              Herramienta: Plan de investigación de experiencia usuaria
            </h4>
            <p className="text-xs text-teal-800/70 mt-1 font-light max-w-2xl">Pantalla ajustada para recabar foco, información requerida, perfiles, técnicas y preparativos de la investigación.</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-teal-700 bg-white border border-teal-100 px-3 py-2 rounded-lg shrink-0">Guía págs. 110–111</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-stone-50/50 border border-stone-200/60 p-8 rounded-[2rem] shadow-sm">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Nombre del servicio</label>
            <input type="text" placeholder="Ej: Servicio de atención ciudadana presencial" className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-base text-stone-900 font-medium focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 transition-all outline-none placeholder:text-stone-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Aspectos del servicio a investigar</label>
            <textarea rows={4} placeholder="Ej: orientación inicial, tiempos de espera, comprensión de requisitos, seguimiento de solicitudes..." className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm text-stone-800 font-light focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Información que se necesita recolectar</label>
            <textarea rows={4} placeholder="Ej: motivaciones de uso, barreras de acceso, dudas frecuentes, emociones durante el trámite..." className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm text-stone-800 font-light focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-stone-200/80 p-8 rounded-[2rem] shadow-sm">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Personas usuarias que se necesita comprender</label>
            <TagInput placeholder="Agregar grupo o perfil a investigar..." initialTags={['Personas mayores', 'Usuarios con baja alfabetización digital']} accentColor="emerald" />
          </div>
          <div className="bg-[#FDFCFB] border border-stone-200/80 p-8 rounded-[2rem] shadow-sm">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Objetivo de investigación</label>
            <textarea rows={3} placeholder="¿Qué se busca comprender o validar con este levantamiento?" className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm text-stone-800 font-light focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
          <div className="bg-teal-50/30 border border-teal-100 p-8 rounded-[2rem] shadow-sm">
             <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-800 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.investigacion}</svg>
                Técnicas y preparativos
             </label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['Entrevistas semiestructuradas', 'Observación en terreno', 'Revisión documental', 'Encuestas breves'].map((met, i) => (
                 <label key={i} className="flex items-center gap-3 cursor-pointer group bg-white border border-stone-200/60 p-4 rounded-xl shadow-sm hover:border-teal-300 transition-all">
                   <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${i < 2 ? 'bg-teal-700 border-teal-700 text-white shadow-sm' : 'border-stone-300 group-hover:border-teal-400 bg-stone-50'}`}>
                     {i < 2 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.check}</svg>}
                   </div>
                   <span className="text-sm font-medium text-stone-700">{met}</span>
                 </label>
               ))}
             </div>
             <div className="mt-6">
               <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-700/70 mb-3">Preparativos y logística</label>
               <textarea rows={3} placeholder="Pautas, autorizaciones, contacto de usuarios, materiales, revisión de información secundaria..." className="w-full bg-white border border-teal-100 rounded-xl px-4 py-3 text-sm text-stone-800 font-light focus:border-teal-700 outline-none resize-none placeholder:text-stone-300 shadow-sm" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function LayoutPersonas() {
  const [cantidadPerfiles, setCantidadPerfiles] = useState(2);
  const perfiles = Array.from({ length: cantidadPerfiles }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div className="bg-orange-50/30 border border-orange-100/70 rounded-[2rem] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h4 className="text-sm font-bold text-orange-900 tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.personas}</svg>
              Herramienta: Plantilla de perfiles de persona usuaria
            </h4>
            <p className="text-xs text-orange-800/70 mt-1 font-light max-w-2xl">Permite registrar varios arquetipos asociados al mismo proyecto, tal como fue sugerido por UXLab.</p>
          </div>
          <div className="bg-white border border-orange-100 rounded-2xl px-4 py-3 shadow-sm">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-orange-700 mb-2">Cantidad de perfiles</label>
            <select value={cantidadPerfiles} onChange={(e) => setCantidadPerfiles(Number(e.target.value))} className="bg-transparent text-sm font-semibold text-stone-800 outline-none cursor-pointer">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} perfil{n > 1 ? 'es' : ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {perfiles.map((perfil) => (
          <div key={perfil} className="bg-[#FAF9F6] border border-stone-200/80 p-8 rounded-[2rem] shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-orange-50/50 flex flex-col items-center justify-center text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition-all cursor-pointer shrink-0 shadow-sm">
                <svg className="w-7 h-7 mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.user}</svg>
                <span className="text-[9px] uppercase tracking-widest font-bold">Perfil {perfil}</span>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="flex items-center justify-between gap-4">
                  <h5 className="text-sm font-bold text-stone-800">Perfil de persona usuaria {perfil}</h5>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 bg-white border border-stone-200 px-2.5 py-1 rounded-md">Editable</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Nombre del arquetipo</label>
                  <input type="text" placeholder={perfil === 1 ? 'Ej: Persona mayor con baja alfabetización digital' : 'Ej: Trabajador con poco tiempo disponible'} className="w-full bg-white border border-stone-200/60 rounded-xl px-5 py-4 text-lg font-light text-stone-900 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 transition-all outline-none placeholder:text-stone-300 shadow-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Rol</label>
                    <select className="w-full bg-white border border-stone-200/60 rounded-xl px-5 py-3 text-sm text-stone-700 font-medium focus:border-orange-400 outline-none appearance-none shadow-sm cursor-pointer">
                      <option>Usuario final</option>
                      <option>Usuario intermediario</option>
                      <option>Cuidador / acompañante</option>
                      <option>Funcionario interno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Relación con el servicio</label>
                    <select className="w-full bg-white border border-stone-200/60 rounded-xl px-5 py-3 text-sm text-stone-700 font-medium focus:border-orange-400 outline-none appearance-none shadow-sm cursor-pointer">
                      <option>Uso frecuente</option>
                      <option>Uso ocasional</option>
                      <option>Primera vez</option>
                      <option>Uso mediado por terceros</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Descripción del perfil</label>
                  <textarea rows={3} placeholder="Describe características, contexto, capacidades, relación con canales y situación al acceder al servicio..." className="w-full bg-white border border-stone-200/60 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-orange-400 outline-none resize-none placeholder:text-stone-300 shadow-sm" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="bg-white border border-stone-200/60 p-5 rounded-2xl">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-4">Necesidades</label>
                    <TagInput placeholder="Agregar necesidad..." initialTags={perfil === 1 ? ['Información clara'] : ['Rapidez']} accentColor="emerald" />
                  </div>
                  <div className="bg-white border border-stone-200/60 p-5 rounded-2xl">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-orange-700 mb-4">Barreras</label>
                    <TagInput placeholder="Agregar barrera..." initialTags={perfil === 1 ? ['Baja competencia digital'] : ['Horarios limitados']} accentColor="orange" />
                  </div>
                  <div className="bg-white border border-stone-200/60 p-5 rounded-2xl">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-4">Motivaciones</label>
                    <TagInput placeholder="Agregar motivación..." initialTags={perfil === 1 ? ['Resolver sin volver a consultar'] : ['Evitar traslados']} accentColor="stone" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Expectativas principales</label>
                  <textarea rows={2} placeholder="Ej: espera comprender requisitos, recibir orientación clara y resolver el trámite sin pasos innecesarios..." className="w-full bg-white border border-stone-200/60 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-orange-400 outline-none resize-none placeholder:text-stone-300 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function LayoutHabilitacion() {
  const [habilitacion, setHabilitacion] = useState({
    acceso: 'Medio',
    conocimiento: 'Medio',
    digital: 'Media',
    descripcion: '',
    perfil: 'Persona mayor con baja alfabetización digital',
    expectativa: '',
    cumplimiento: 'Parcial',
    resultado: '',
    indicador: '',
    linea: ''
  });

  const updateHab = (field: keyof typeof habilitacion, value: string) => {
    setHabilitacion(prev => ({ ...prev, [field]: value }));
  };

  const ToggleGroup = ({ field, label, opts }: { field: keyof typeof habilitacion; label: string; opts: string[] }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-700/60 mb-3">{label}</label>
      <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-teal-100/50 shadow-sm">
        {opts.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => updateHab(field, opt)}
            className={`flex-1 py-2 text-xs font-medium transition-all rounded-lg ${habilitacion[field] === opt ? 'bg-teal-700 text-white shadow-sm border border-teal-700' : 'bg-transparent text-stone-500 hover:text-teal-800 hover:bg-teal-50/50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-teal-50/20 border border-teal-100/60 rounded-[2rem] p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-600/60"></div>
        <h4 className="text-lg font-medium tracking-tight text-teal-900/90 border-b border-teal-100/60 pb-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700 border border-teal-100/60"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.habilitacion}</svg></div>
          Habilitación de personas usuarias
        </h4>
        <div className="space-y-6">
          <ToggleGroup field="acceso" label="Nivel de acceso al servicio" opts={['Bajo', 'Medio', 'Alto']} />
          <ToggleGroup field="conocimiento" label="Nivel de conocimiento del servicio" opts={['Bajo', 'Medio', 'Alto']} />
          <ToggleGroup field="digital" label="Competencia digital de los usuarios" opts={['Baja', 'Media', 'Alta']} />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-700/60 mb-3">Descripción de habilitación</label>
            <textarea value={habilitacion.descripcion} onChange={(e) => updateHab('descripcion', e.target.value)} rows={4} placeholder="Describe cómo las personas acceden, comprenden y usan el servicio, incluyendo brechas de información, acceso o capacidades digitales..." className="w-full bg-white border border-teal-100/70 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-teal-600 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
        </div>
      </div>
      
      <div className="bg-[#FAFAFA] border border-stone-200/60 rounded-[2rem] p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-300/50"></div>
        <h4 className="text-lg font-medium tracking-tight text-stone-800 border-b border-stone-200/60 pb-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-500 border border-stone-200/60"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.vinculacion}</svg></div>
          Expectativas usuarias y cumplimiento
        </h4>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Perfil asociado</label>
            <select value={habilitacion.perfil} onChange={(e) => updateHab('perfil', e.target.value)} className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-700 font-medium focus:border-teal-500 outline-none appearance-none shadow-sm cursor-pointer">
              <option>Persona mayor con baja alfabetización digital</option>
              <option>Trabajador con poco tiempo disponible</option>
              <option>Todos los perfiles</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Expectativa de la persona usuaria</label>
            <textarea value={habilitacion.expectativa} onChange={(e) => updateHab('expectativa', e.target.value)} rows={3} placeholder="Ej: espera saber claramente qué documentos necesita antes de ir a la oficina..." className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-teal-500 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Resultado esperado</label>
            <input value={habilitacion.resultado} onChange={(e) => updateHab('resultado', e.target.value)} type="text" placeholder="Ej: el usuario comprende requisitos y próximos pasos antes de iniciar el trámite" className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-teal-500 outline-none placeholder:text-stone-300 shadow-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Nivel de cumplimiento</label>
              <select value={habilitacion.cumplimiento} onChange={(e) => updateHab('cumplimiento', e.target.value)} className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-700 font-medium focus:border-teal-500 outline-none appearance-none shadow-sm cursor-pointer">
                <option>Satisfecha</option><option>Parcial</option><option>No cumplida</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Indicador de éxito</label>
              <input value={habilitacion.indicador} onChange={(e) => updateHab('indicador', e.target.value)} type="text" placeholder="Ej: % de usuarios que entiende requisitos" className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-teal-500 outline-none placeholder:text-stone-300 shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Línea de acción</label>
            <textarea value={habilitacion.linea} onChange={(e) => updateHab('linea', e.target.value)} rows={3} placeholder="Acción preliminar para gestionar la expectativa o brecha detectada..." className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-teal-500 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}


function LayoutNecesidades() {
  const [necesidades, setNecesidades] = useState([
    { id: 1, inicial: 'Necesita realizar un trámite presencial', objetivo: 'Resolver solicitud sin volver otro día', acciones: 'Reunir documentos, acudir a oficina y esperar atención', rol: 'Orientar requisitos y validar documentos', fricciones: 'Información dispersa y falta de claridad previa', categoria: 'Información', impacto: 'Alto', estado: 'Pendiente' },
    { id: 2, inicial: 'Tiene dudas sobre requisitos', objetivo: 'Comprender pasos antes de acudir', acciones: 'Buscar información web o consultar telefónicamente', rol: 'Disponibilizar información clara', fricciones: 'Lenguaje técnico y canales poco consistentes', categoria: 'Acceso', impacto: 'Alto', estado: 'En proceso' },
    { id: 3, inicial: 'Quiere conocer estado de solicitud', objetivo: 'Evitar incertidumbre durante la espera', acciones: 'Consultar estado por canales disponibles', rol: 'Entregar trazabilidad', fricciones: 'Ausencia de seguimiento claro', categoria: 'Seguimiento', impacto: 'Medio', estado: 'Pendiente' },
  ]);

  const updateNecesidad = (index: number, field: keyof typeof necesidades[number], value: string) => {
    setNecesidades(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const agregarNecesidad = () => {
    setNecesidades(prev => [...prev, { id: prev.length + 1, inicial: '', objetivo: '', acciones: '', rol: '', fricciones: '', categoria: '', impacto: 'Medio', estado: 'Pendiente' }]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-[#FAFAFA] border border-stone-200/60 p-6 rounded-[2rem] shadow-sm">
         <div>
            <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.necesidades}</svg> Herramienta: Mapa del problema completo / necesidades priorizadas
            </h4>
            <p className="text-xs text-stone-500 mt-1 font-light ml-6">Relaciona situación inicial, objetivo de la persona, acciones, rol del servicio y fricciones.</p>
         </div>
         <button type="button" onClick={agregarNecesidad} className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2 active:scale-95">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.plus}</svg> Agregar necesidad
         </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {necesidades.map((n, i) => (
          <div key={n.id} className="bg-white border border-stone-200/70 rounded-[1.75rem] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-stone-500">Necesidad {i + 1}</h5>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${n.impacto === 'Alto' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-stone-50 text-stone-500 border border-stone-100'}`}>{n.impacto}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Field label="Situación inicial">
                <textarea value={n.inicial} onChange={(e) => updateNecesidad(i, 'inicial', e.target.value)} rows={2} placeholder="¿Qué situación moviliza a la persona?" className="input-like" />
              </Field>
              <Field label="Objetivo persona usuaria">
                <textarea value={n.objetivo} onChange={(e) => updateNecesidad(i, 'objetivo', e.target.value)} rows={2} placeholder="¿Qué busca lograr?" className="input-like" />
              </Field>
              <Field label="Acciones que debe realizar">
                <textarea value={n.acciones} onChange={(e) => updateNecesidad(i, 'acciones', e.target.value)} rows={2} placeholder="Pasos o acciones clave que realiza la persona" className="input-like" />
              </Field>
              <Field label="Rol del servicio">
                <textarea value={n.rol} onChange={(e) => updateNecesidad(i, 'rol', e.target.value)} rows={2} placeholder="¿Cómo ayuda el servicio institucional?" className="input-like" />
              </Field>
              <Field label="Fricciones detectadas">
                <textarea value={n.fricciones} onChange={(e) => updateNecesidad(i, 'fricciones', e.target.value)} rows={2} placeholder="Barreras, pasos innecesarios o puntos confusos" className="input-like" />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Categoría"><input value={n.categoria} onChange={(e) => updateNecesidad(i, 'categoria', e.target.value)} className="input-like" placeholder="Información, acceso..." /></Field>
                <Field label="Impacto"><select value={n.impacto} onChange={(e) => updateNecesidad(i, 'impacto', e.target.value)} className="input-like"><option>Alto</option><option>Medio</option><option>Bajo</option></select></Field>
                <Field label="Estado"><select value={n.estado} onChange={(e) => updateNecesidad(i, 'estado', e.target.value)} className="input-like"><option>Pendiente</option><option>En proceso</option><option>Atendida</option></select></Field>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`.input-like{width:100%;background:#fff;border:1px solid rgba(231,229,228,.9);border-radius:0.9rem;padding:0.75rem 1rem;font-size:0.875rem;color:#292524;font-weight:300;outline:none;box-shadow:0 1px 2px rgba(0,0,0,.03);resize:none}.input-like:focus{border-color:#fb923c}.input-like::placeholder{color:#d6d3d1}`}</style>
    </div>
  );
}


function LayoutVinculacion() {
  const [vinculaciones, setVinculaciones] = useState([
    { nec: 'Información clara sobre requisitos', act: 'Rediseño de ficha web del trámite', desc: 'La ficha permite anticipar documentos y reduce consultas presenciales.', tipo: 'Directa', brecha: 'Sin brecha crítica', mejora: 'Validar lenguaje claro con usuarios', estado: 'Cubierta' },
    { nec: 'Reducción de tiempos de espera', act: 'Implementación de agendamiento online', desc: 'La agenda distribuye demanda y evita filas extensas.', tipo: 'Parcial', brecha: 'No cubre usuarios sin acceso digital', mejora: 'Diseñar asistencia presencial para agendamiento', estado: 'Brecha' },
    { nec: 'Acompañamiento en casos complejos', act: '', desc: 'No existe actividad institucional claramente asignada para casos de alta complejidad.', tipo: 'Indirecta', brecha: 'Brecha de soporte especializado', mejora: 'Crear protocolo de derivación asistida', estado: 'Brecha' },
  ]);

  const updateVinculacion = (index: number, field: keyof typeof vinculaciones[number], value: string) => {
    setVinculaciones(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const agregarVinculacion = () => {
    setVinculaciones(prev => [...prev, { nec: '', act: '', desc: '', tipo: 'Parcial', brecha: '', mejora: '', estado: 'Brecha' }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-[#FAFAFA] border border-stone-200/60 p-6 rounded-[2rem] shadow-sm">
        <div>
          <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.vinculacion}</svg> Herramienta: Tabla de vinculación necesidad–actividad
          </h4>
          <p className="text-xs text-stone-500 mt-1 font-light ml-6">Permite explicar cobertura, brechas y oportunidades entre necesidades y oferta institucional.</p>
        </div>
        <button type="button" onClick={agregarVinculacion} className="text-[10px] font-bold uppercase tracking-widest text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.plus}</svg> Agregar vínculo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {vinculaciones.map((v, i) => (
          <div key={i} className="bg-white border border-stone-200/70 rounded-[1.75rem] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-stone-500">Vinculación {i + 1}</h5>
              <select value={v.estado} onChange={(e) => updateVinculacion(i, 'estado', e.target.value)} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border outline-none ${v.estado === 'Cubierta' ? 'border-emerald-200/60 text-emerald-700 bg-emerald-50/50' : 'border-amber-200/60 text-amber-700 bg-amber-50/50'}`}>
                <option>Cubierta</option><option>Brecha</option>
              </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Field label="Necesidad asociada"><textarea value={v.nec} onChange={(e) => updateVinculacion(i, 'nec', e.target.value)} rows={2} placeholder="Necesidad u objetivo de la persona usuaria" className="input-like-sky" /></Field>
              <Field label="Actividad institucional"><textarea value={v.act} onChange={(e) => updateVinculacion(i, 'act', e.target.value)} rows={2} placeholder="Servicio, actividad o recurso que responde a la necesidad" className="input-like-sky" /></Field>
              <Field label="Descripción del vínculo"><textarea value={v.desc} onChange={(e) => updateVinculacion(i, 'desc', e.target.value)} rows={3} placeholder="Explica cómo la actividad responde a la necesidad" className="input-like-sky" /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tipo de vínculo"><select value={v.tipo} onChange={(e) => updateVinculacion(i, 'tipo', e.target.value)} className="input-like-sky"><option>Directa</option><option>Parcial</option><option>Indirecta</option></select></Field>
                <Field label="Brecha detectada"><input value={v.brecha} onChange={(e) => updateVinculacion(i, 'brecha', e.target.value)} className="input-like-sky" placeholder="Brecha o riesgo" /></Field>
                <div className="md:col-span-2"><Field label="Oportunidad de mejora"><textarea value={v.mejora} onChange={(e) => updateVinculacion(i, 'mejora', e.target.value)} rows={2} placeholder="Acción o mejora sugerida" className="input-like-sky" /></Field></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`.input-like-sky{width:100%;background:#fff;border:1px solid rgba(231,229,228,.9);border-radius:0.9rem;padding:0.75rem 1rem;font-size:0.875rem;color:#292524;font-weight:300;outline:none;box-shadow:0 1px 2px rgba(0,0,0,.03);resize:none}.input-like-sky:focus{border-color:#0ea5e9}.input-like-sky::placeholder{color:#d6d3d1}`}</style>
    </div>
  );
}


function LayoutMedicion({ cambiarVista }: { cambiarVista: (v: Vista) => void }) {
  const [indicadores, setIndicadores] = useState([
    { nombre: 'Tiempo promedio de atención', desc: 'Mide el tiempo desde que la persona ingresa al canal hasta que recibe atención efectiva.', estandar: 'Rapidez de atención', metodo: 'Datos operativos', frecuencia: 'Mensual', responsable: 'Unidad de Atención', base: '45', meta: '20', unidad: 'minutos', estado: 'En seguimiento', trend: 'down' },
    { nombre: 'Resolución en primer contacto', desc: 'Mide la proporción de casos resueltos sin derivación o visita adicional.', estandar: 'Resolutividad', metodo: 'Registro de casos', frecuencia: 'Trimestral', responsable: 'Operaciones', base: '60', meta: '85', unidad: '%', estado: 'Pendiente', trend: 'up' },
    { nombre: 'Comprensión de requisitos', desc: 'Mide si las personas declaran entender requisitos y pasos antes de iniciar el trámite.', estandar: 'Claridad de información', metodo: 'Encuesta breve', frecuencia: 'Mensual', responsable: 'Experiencia Usuaria', base: '3.2', meta: '4.5', unidad: 'escala 1-5', estado: 'Pendiente', trend: 'up' }
  ]);

  const updateIndicador = (index: number, field: keyof typeof indicadores[number], value: string) => {
    setIndicadores(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const agregarIndicador = () => {
    setIndicadores(prev => [...prev, { nombre: '', desc: '', estandar: '', metodo: '', frecuencia: 'Mensual', responsable: '', base: '', meta: '', unidad: '', estado: 'Pendiente', trend: 'up' }]);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center bg-[#FAFAFA] border border-stone-200/80 p-6 rounded-[2rem] gap-6 shadow-sm">
         <div>
            <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.medicion}</svg>
              Herramienta: Plan de evaluación de estándares de servicio
            </h4>
            <p className="text-xs text-stone-500 font-light ml-6">Define qué se medirá, cómo, con qué frecuencia y quién será responsable.</p>
         </div>
         <div className="flex flex-wrap gap-3">
           <button type="button" onClick={agregarIndicador} className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.plus}</svg> Agregar indicador
           </button>
           <button onClick={() => cambiarVista(4)} className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-2">
              Abrir Calendarización <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowRight}</svg>
           </button>
         </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Indicadores de experiencia y estándares asociados</h4>
        <div className="grid grid-cols-1 gap-5">
          {indicadores.map((kpi, i) => (
            <div key={i} className="p-6 border border-stone-200/60 rounded-2xl bg-white shadow-sm hover:border-stone-300 transition-colors">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Indicador {i + 1}</span>
                <span className="text-emerald-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{kpi.trend === 'up' ? ICONS.trendUp : ICONS.trendDown}</svg></span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Field label="Nombre del indicador"><input value={kpi.nombre} onChange={(e) => updateIndicador(i, 'nombre', e.target.value)} className="input-like-emerald" placeholder="Ej: tiempo promedio de atención" /></Field>
                <Field label="Estándar asociado"><input value={kpi.estandar} onChange={(e) => updateIndicador(i, 'estandar', e.target.value)} className="input-like-emerald" placeholder="Ej: rapidez, resolutividad, claridad" /></Field>
                <Field label="Descripción / qué mide"><textarea value={kpi.desc} onChange={(e) => updateIndicador(i, 'desc', e.target.value)} rows={3} className="input-like-emerald" placeholder="Describe exactamente qué mide el indicador" /></Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Método de recolección"><input value={kpi.metodo} onChange={(e) => updateIndicador(i, 'metodo', e.target.value)} className="input-like-emerald" placeholder="Encuesta, datos operativos..." /></Field>
                  <Field label="Frecuencia"><select value={kpi.frecuencia} onChange={(e) => updateIndicador(i, 'frecuencia', e.target.value)} className="input-like-emerald"><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></Field>
                  <Field label="Responsable"><input value={kpi.responsable} onChange={(e) => updateIndicador(i, 'responsable', e.target.value)} className="input-like-emerald" placeholder="Área o rol responsable" /></Field>
                  <Field label="Estado"><select value={kpi.estado} onChange={(e) => updateIndicador(i, 'estado', e.target.value)} className="input-like-emerald"><option>Pendiente</option><option>En seguimiento</option><option>Alcanzado</option></select></Field>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF9F6] border border-stone-200/70 rounded-2xl p-5">
                  <Field label="Línea base"><input value={kpi.base} onChange={(e) => updateIndicador(i, 'base', e.target.value)} className="input-like-emerald" placeholder="Valor actual" /></Field>
                  <Field label="Meta"><input value={kpi.meta} onChange={(e) => updateIndicador(i, 'meta', e.target.value)} className="input-like-emerald" placeholder="Valor deseado" /></Field>
                  <Field label="Unidad"><input value={kpi.unidad} onChange={(e) => updateIndicador(i, 'unidad', e.target.value)} className="input-like-emerald" placeholder="%, minutos, nota..." /></Field>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GestorEvidencias />
      <style jsx>{`.input-like-emerald{width:100%;background:#fff;border:1px solid rgba(231,229,228,.9);border-radius:0.9rem;padding:0.75rem 1rem;font-size:0.875rem;color:#292524;font-weight:300;outline:none;box-shadow:0 1px 2px rgba(0,0,0,.03);resize:none}.input-like-emerald:focus{border-color:#10b981}.input-like-emerald::placeholder{color:#d6d3d1}`}</style>
    </div>
  );
}


function LayoutCriticos() {
  return (
    <div className="space-y-10">
      <div className="bg-[#FAF9F6] border border-stone-200/80 p-8 lg:p-10 rounded-[2rem] shadow-sm">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="w-14 h-14 bg-white border border-stone-200 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.criticos}</svg>
            </div>
            <div className="flex-1 space-y-8">
               <div>
                 <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Interacción del viaje</label>
                 <input type="text" placeholder="Ej: Espera por orientación inicial en oficina" className="w-full bg-transparent border-b border-stone-300 py-2 text-xl font-light text-stone-900 focus:border-amber-600 transition-colors outline-none placeholder:text-stone-300" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Canal o punto de contacto</label>
                    <select className="w-full bg-transparent border-b border-stone-300 py-2 text-sm text-stone-800 font-medium focus:border-amber-600 outline-none appearance-none cursor-pointer">
                      <option>Oficina presencial</option><option>Call Center</option><option>Portal Web</option><option>Correo electrónico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Magnitud afectada</label>
                    <input type="text" placeholder="Ej: mayoría / 60% / usuarios nuevos" className="w-full bg-transparent border-b border-stone-300 py-2 text-sm text-stone-800 font-light focus:border-amber-600 outline-none placeholder:text-stone-300" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Impacto</label>
                    <select className="w-full bg-transparent border-b border-stone-300 py-2 text-sm text-stone-800 font-medium focus:border-amber-600 outline-none appearance-none cursor-pointer">
                      <option>Alto</option><option>Medio</option><option>Bajo</option>
                    </select>
                  </div>
               </div>
               <div>
                 <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Quiebre, fricción o error detectado</label>
                 <textarea rows={3} placeholder="Describe qué ocurre, cuándo se deteriora la experiencia y cómo afecta a la persona usuaria..." className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-amber-500 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Causa raíz</label>
                    <textarea rows={3} placeholder="Ej: falta de orientación inicial, información fragmentada, capacidad insuficiente..." className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-amber-500 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Oportunidad de mejora</label>
                    <textarea rows={3} placeholder="Acción concreta para reducir la fricción o prevenir el quiebre..." className="w-full bg-white border border-stone-200/80 rounded-xl px-5 py-3 text-sm text-stone-800 font-light focus:border-amber-500 transition-all outline-none resize-none placeholder:text-stone-300 shadow-sm" />
                  </div>
               </div>
               <div className="flex justify-end pt-4">
                 <button className="bg-teal-900 hover:bg-teal-800 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-sm transition-colors active:scale-95 flex items-center gap-2">
                   Registrar Momento Crítico <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.plus}</svg>
                 </button>
               </div>
            </div>
         </div>
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Historial de momentos críticos priorizados</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="border border-stone-200/80 rounded-2xl p-5 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center text-xs font-bold text-stone-400">1</div>
                  <span className="text-sm font-medium text-stone-800">Rechazo de documentos web</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-md">Impacto alto</span>
              </div>
              <p className="text-xs text-stone-500 font-light pl-12">Afecta principalmente a usuarios que no comprenden el formato requerido para subir documentos.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

interface PantallaFlujoProps {
  etapaActiva: number;
  setEtapaActiva: (n: number) => void;
  cambiarVista: (v: Vista) => void;
}

function PantallaFlujo({ etapaActiva, setEtapaActiva, cambiarVista }: PantallaFlujoProps) {
  const [iaVisible, setIaVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [etapasCompletadas, setEtapasCompletadas] = useState<Set<number>>(new Set([0, 1])); 

  const etapa = ETAPAS[etapaActiva];
  const herramientasEtapa = HERRAMIENTAS_MVP.filter((h) => h.etapaNum === etapa.num);
  const progreso = Math.round((etapasCompletadas.size / ETAPAS.length) * 100);

  const handleGuardar = async () => {
  try {
    setGuardando(true);

    const esModoRevision =
      typeof window !== "undefined" &&
      window.location.hostname.includes("vercel.app");

    if (!esModoRevision) {
      await guardarEtapaDemo(etapa.num);
      await actualizarEtapaProyecto(etapa.num);
    } else {
      // En Vercel funciona como prototipo navegable para revisión UXLab.
      // No intenta guardar en backend local.
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setEtapasCompletadas((prev) => new Set([...prev, etapaActiva]));
    setIaVisible(false);

    if (etapaActiva < ETAPAS.length - 1) {
      setEtapaActiva(etapaActiva + 1);
    } else {
      cambiarVista(5);
    }
  } catch (error) {
    console.error("Error al guardar etapa:", error);
    alert(
      "No se pudo guardar la etapa. Revisa que el backend esté encendido y que Supabase esté conectado."
    );
  } finally {
    setGuardando(false);
  }
};

  const renderLayoutEtapa = () => {
    switch (etapa.num) {
      case 1: return <LayoutInvestigacion />;
      case 2: return <LayoutPersonas />;
      case 3: return <LayoutHabilitacion />;
      case 4: return <LayoutNecesidades />;
      case 5: return <LayoutVinculacion />;
      case 6: return <LayoutMedicion cambiarVista={cambiarVista} />;
      case 7: return <LayoutCriticos />;
      default: return null;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC] font-sans">
      <div className="bg-[#FAF9F6] border-b border-stone-200/60 px-10 py-10 lg:px-16 lg:py-12 relative overflow-hidden shadow-sm z-20">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb sin iconos — texto suficiente para navegación */}
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-6">
             <span>Plataforma</span><span className="text-stone-300">/</span><span>Propósito 1</span><span className="text-stone-300">/</span><span className="text-stone-700">{etapa.nombre}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
               {/* Icono de etapa — protagonismo en encabezado, tamaño destacado */}
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${etapa.colorBg} ${etapa.colorText} ${etapa.colorBorder}`}>
                  <svg className="w-7 h-7 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">{etapa.icon}</svg>
               </div>
               <div>
                 <h1 className="text-3xl lg:text-4xl font-light text-stone-900 tracking-tight leading-tight">{etapa.nombre}</h1>
                 <p className="text-sm font-medium text-stone-500 mt-1.5">{etapa.descripcion}</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-light tracking-tight text-stone-900 leading-none">{progreso}%</div>
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-2">Avance global</div>
            </div>
          </div>
          {/* Barra de progreso — pura forma, sin iconos */}
          <div className="flex gap-1 h-1">
            {ETAPAS.map((e, i) => (
              <button key={i} onClick={() => { setEtapaActiva(i); setIaVisible(false); }} className={`flex-1 rounded-full transition-all ${etapasCompletadas.has(i) ? 'bg-teal-900' : i === etapaActiva ? 'bg-teal-600' : 'bg-stone-200 hover:bg-stone-300'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-10 px-10 lg:px-16 py-12 xl:grid-cols-[minmax(0,1fr)_320px] relative z-10">
        <div className="space-y-8">
          <section className="bg-white border border-stone-200/80 rounded-[2.5rem] p-10 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-10 pb-5 border-b border-stone-100">
               <h3 className="text-base font-semibold tracking-tight text-stone-800">Espacio de Trabajo</h3>
               {/* Badge de guía — sin icono, el contenido habla */}
               <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 bg-[#FAF9F6] px-3 py-1.5 rounded border border-stone-200/60">Guía UXLab · Pág. {etapa.pagGuia}</span>
            </div>
            
            {renderLayoutEtapa()}

          </section>

          <section className="flex items-center justify-between gap-4 py-2">
            <button onClick={() => etapaActiva > 0 && setEtapaActiva(etapaActiva - 1)} disabled={etapaActiva === 0} className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 transition-colors hover:text-stone-800 hover:bg-white rounded-xl disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2 border border-transparent hover:border-stone-200 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowLeft}</svg> Anterior
            </button>
            <button onClick={handleGuardar} className="bg-teal-900 px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-xl transition-all shadow-md shadow-teal-900/10 hover:bg-teal-800 active:scale-[0.98] flex items-center gap-2">
              {guardando ? 'Guardando...' : etapaActiva < ETAPAS.length - 1 ? 'Guardar y Continuar' : 'Finalizar Proceso'}
              {!guardando && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{etapaActiva < ETAPAS.length - 1 ? ICONS.arrowRight : ICONS.checkCircle}</svg>}
            </button>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="rounded-[2rem] border border-teal-100/60 bg-teal-50/40 p-8 shadow-sm relative overflow-hidden">
            <div className="mb-6 flex items-start justify-between relative z-10 border-b border-teal-100/60 pb-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-teal-600">Asistencia Metodológica</div>
                <div className="text-sm font-bold text-teal-900 mt-1 tracking-tight">UXLab AI</div>
              </div>
              {/* Icono bombilla — identificador de sección de ideas/sugerencias */}
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.bulb}</svg>
            </div>
            {!iaVisible ? (
              <button onClick={() => setIaVisible(true)} className="w-full rounded-xl border border-teal-200/60 bg-white py-2.5 text-[10px] font-bold uppercase tracking-widest text-teal-800 transition-colors hover:bg-teal-50 shadow-sm relative z-10">
                Mostrar Sugerencia
              </button>
            ) : (
              <div className="animate-fade-in relative z-10">
                <p className="text-sm leading-relaxed text-teal-900/80 font-light">{etapa.sugerenciaIA}</p>
                <button onClick={() => setIaVisible(false)} className="mt-4 text-[9px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-900 transition-colors">Ocultar</button>
              </div>
            )}
          </section>

          <section className="px-2">
            <div className="mb-4 text-[9px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-200/60 pb-2">Herramientas del MVP en uso</div>
            <div className="space-y-3">
              {herramientasEtapa.length > 0 ? herramientasEtapa.map((h) => (
                <div key={h.id} className="group cursor-pointer p-4 border border-stone-200/50 rounded-xl hover:border-teal-200 bg-white transition-colors">
                  <div className="text-sm font-medium text-stone-800 leading-tight group-hover:text-teal-700 transition-colors flex items-center gap-2">
                    {/* Icono de herramienta — identifica visualmente de qué trata */}
                    <svg className="w-4 h-4 text-stone-400 group-hover:text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{h.icon}</svg>
                    {h.nombre}
                  </div>
                  <div className="text-xs text-stone-400 font-light mt-1.5 leading-relaxed ml-6">{h.descripcion}</div>
                </div>
              )) : (
                <div className="text-xs text-stone-400 font-light italic flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.check}</svg>
                  Herramienta integrada en la vista principal
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

// ─── PANTALLA RESULTADOS ──────────────────────────────────────────────────────

interface PantallaResultadosProps {
  cambiarVista: (v: Vista) => void;
  setEtapaActiva: (n: number) => void;
}

function PantallaResultados({ cambiarVista, setEtapaActiva }: PantallaResultadosProps) {
  const kpis = [
    { n: 'Tiempo de atención', base: 45, meta: 20, actual: 25, uni: 'min', ok: true, mejorSi: 'baja' as const },
    { n: 'Resolución 1ra visita', base: 60, meta: 85, actual: 80, uni: '%', ok: true, mejorSi: 'sube' as const },
    { n: 'Satisfacción (CSAT)', base: 3.2, meta: 4.5, actual: 3.9, uni: '/5', ok: false, mejorSi: 'sube' as const },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC] font-sans">
      
      <div className="bg-[#FAF9F6] border-b border-stone-200/60 px-10 py-16 lg:px-16 lg:py-20 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-600/5 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
               {/* Badge de completado — icono esencial para señal de estado */}
               <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 mb-6 shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.checkCircle}</svg> Propósito 1 Completado
               </div>
               <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-stone-900 leading-tight">Dashboard de resultados<br/><span className="font-bold text-teal-900">del Propósito 1</span></h1>
               <p className="mt-4 text-stone-500 text-lg font-light max-w-2xl">Visión consolidada del diagnóstico de experiencia usuaria para el servicio evaluado.</p>
            </div>
            <button className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-[10px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors shadow-sm active:scale-95 flex items-center gap-2 whitespace-nowrap">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.export}</svg>
               Exportar Reporte
            </button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12 -mt-10 relative z-20">
        
        {/* Tarjetas de resumen — icono semántico en cada una */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
           {[
             { l: 'Habilitación', v: 'Media', c: 'text-stone-800', i: ICONS.habilitacion },
             { l: 'Necesidades', v: '4 Altas', c: 'text-stone-800', i: ICONS.necesidades },
             { l: 'Cobertura', v: '75%', c: 'text-teal-700', i: ICONS.vinculacion },
             { l: 'Quiebres', v: '2 Severos', c: 'text-stone-800', i: ICONS.criticos }
           ].map((s, i) => (
              <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                 <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{s.i}</svg> {s.l}
                 </div>
                 <div className={`text-2xl font-light tracking-tight ${s.c}`}>{s.v}</div>
              </div>
           ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 mb-10">
          <div className="bg-white border border-stone-200/80 rounded-[2.5rem] p-10 shadow-sm flex flex-col">
             {/* Encabezado de bloque con icono — identifica sección en dashboard */}
             <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-stone-100 pb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.dashboard}</svg> Síntesis Ejecutiva
             </h3>
             <p className="text-stone-700 leading-relaxed font-light text-lg mb-8 flex-1">
               El diagnóstico revela que la principal fricción de la experiencia usuaria se concentra en el <strong className="text-stone-900 font-medium">canal presencial</strong>, especialmente durante la etapa de llegada. 
               Las causas raíz identificadas apuntan a una <strong className="text-stone-900 font-medium">falta de información previa</strong> y una gestión de filas ineficiente.
             </p>
             <div className="bg-[#FAF9F6] border border-stone-200/60 rounded-2xl p-6 border-l-2 border-l-teal-600">
                {/* Icono bombilla — identifica recomendación estratégica */}
                <div className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.bulb}</svg> Recomendación Estratégica
                </div>
                <p className="text-sm text-stone-700 font-medium leading-relaxed">Priorizar el rediseño del onboarding digital del trámite para desviar la carga presencial y mejorar el CSAT en el primer cuatrimestre.</p>
             </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-[2.5rem] p-10 shadow-sm">
             <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-stone-100 pb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.medicion}</svg> Métricas de Éxito (KPIs)
             </h3>
             <div className="space-y-8">
                {kpis.map((k, i) => {
                  const pct = calcularProgresoKPI(k.base, k.meta, k.actual, k.mejorSi);
                  return (
                     <div key={i}>
                        <div className="flex justify-between items-end mb-3">
                           <span className="font-medium text-stone-700 text-sm tracking-tight flex items-center gap-2">
                              {k.n}
                              {/* Icono de tendencia — esencial para lectura rápida */}
                              <svg className={`w-3.5 h-3.5 ${k.ok ? 'text-emerald-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{k.mejorSi === 'sube' ? ICONS.trendUp : ICONS.trendDown}</svg>
                           </span>
                           <span className="text-xl font-light tracking-tight text-stone-900">{k.actual} <span className="text-[10px] font-bold uppercase text-stone-400">{k.uni}</span></span>
                        </div>
                        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2.5">
                           <div className={`h-full rounded-full transition-all ${k.ok ? 'bg-teal-600' : 'bg-stone-400'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-stone-400">
                           <span>Base: {k.base}</span><span>Meta: {k.meta}</span>
                        </div>
                     </div>
                  )
                })}
             </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-[2.5rem] p-10 shadow-sm">
           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-10 border-b border-stone-100 pb-4">Trazabilidad Metodológica</h3>
           <div className="relative border-l border-stone-200 ml-4 space-y-10 pb-4">
              {[
                { e: 1, n: 'Investigación', d: 'Servicio documentado vía entrevistas semiestructuradas y observación en sala.', icon: ICONS.investigacion },
                { e: 2, n: 'Personas', d: 'Identificados 3 arquetipos. Foco en "Adulto mayor con baja alfabetización digital".', icon: ICONS.personas },
                { e: 4, n: 'Necesidades', d: 'Priorizadas 4 necesidades. "Acceso a información clara" es la más crítica (Impacto Alto).', icon: ICONS.necesidades },
                { e: 7, n: 'Momentos Críticos', d: 'Quiebre severo detectado en la llegada presencial sin documentos requeridos.', icon: ICONS.criticos }
              ].map((h, i) => (
                 <div key={i} className="relative pl-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 group">
                    <div className="flex-1">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-100 border border-stone-300 group-hover:bg-teal-600 group-hover:border-teal-600 transition-colors"></div>
                      {/* Icono de etapa en trazabilidad — identifica a qué etapa pertenece */}
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5 text-stone-400 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{h.icon}</svg> Etapa {h.e} · {h.n}
                      </div>
                      <p className="text-stone-700 text-sm font-light leading-relaxed max-w-2xl">{h.d}</p>
                    </div>
                    <button onClick={() => { setEtapaActiva(h.e - 1); cambiarVista(2); }} className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-teal-700 transition-colors whitespace-nowrap mt-1 border border-stone-200 hover:border-teal-200 px-4 py-2.5 rounded-lg bg-[#FAF9F6] flex items-center gap-2">
                      Revisar etapa <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowRight}</svg>
                    </button>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </main>
  );
}

// ─── PANTALLA CATÁLOGO ────────────────────────────────────────────────────────

function PantallaCatalogo({ cambiarVista }: { cambiarVista: (v: Vista) => void }) {
  return (
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC] font-sans">
      <div className="bg-[#FAF9F6] border-b border-stone-200/60 px-10 py-16 lg:px-16 lg:py-20 shadow-sm relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-8">
          <div>
            {/* Encabezado de sección — icono con intención de categorización */}
            <div className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.catalog}</svg>
               Metodología UXLab
            </div>
            <h1 className="text-4xl lg:text-5xl font-light text-stone-900 tracking-tight mb-4">Catálogo de Herramientas</h1>
            <p className="text-stone-500 text-lg font-light">8 herramientas oficiales dispuestas para el diagnóstico institucional.</p>
          </div>
          <button onClick={() => cambiarVista(2)} className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm whitespace-nowrap">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowLeft}</svg> Volver al flujo
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-20">
          {HERRAMIENTAS_MVP.map((tool, idx) => {
            const etapa = ETAPAS.find(e => e.num === tool.etapaNum) || ETAPAS[0];
            return (
              <div key={idx} className="bg-white rounded-3xl border border-stone-200/80 p-8 flex flex-col hover:border-teal-300 hover:shadow-[0_8px_30px_rgb(15,118,110,0.06)] transition-all group cursor-default shadow-sm">
                <div className="mb-6 flex justify-between items-start">
                  {/* Tag de etapa con icono — identifica a qué fase pertenece la herramienta */}
                  <span className={`px-2.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${etapa.colorBg} ${etapa.colorText} border ${etapa.colorBorder} flex items-center gap-1.5`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{etapa.icon}</svg> {etapa.nombre}
                  </span>
                </div>
                {/* Icono de herramienta — protagonismo visual en tarjeta */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${etapa.colorBg} ${etapa.colorText} border ${etapa.colorBorder}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{tool.icon}</svg>
                </div>
                <h3 className="text-base font-semibold text-stone-800 leading-snug tracking-tight mb-3 group-hover:text-teal-800 transition-colors">{tool.nombre}</h3>
                <p className="text-stone-500 text-xs font-light leading-relaxed flex-1 mb-8">{tool.descripcion}</p>
                <div className="pt-5 border-t border-stone-100 flex justify-between items-center mt-auto">
                   <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Prioridad</span>
                   {/* Color semántico para prioridad — sin icono adicional */}
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${tool.prioridad === 'Alta' ? 'text-orange-600' : 'text-amber-600'}`}>
                      {tool.prioridad}
                   </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
}

// ─── PANTALLA CALENDARIZACIÓN ─────────────────────────────────────────────────

function PantallaCalendarizacion({ cambiarVista }: { cambiarVista: (v: Vista) => void }) {
  const semanas = ['S1 May', 'S2 May', 'S3 May', 'S4 May'];
  const tareas = [
    { n: 'Investigación y Contexto', r: 'Damián M.', st: 0, w: 1, e: 'done' },
    { n: 'Arquetipos de Personas', r: 'Laura V.', st: 0, w: 1, e: 'done' },
    { n: 'Habilitación & Expectativas', r: 'Damián M.', st: 1, w: 1, e: 'active' },
    { n: 'Levantamiento Necesidades', r: 'Carlos R.', st: 1, w: 2, e: 'pending' },
    { n: 'Cruce Vinculación', r: 'Laura V.', st: 2, w: 1, e: 'pending' },
    { n: 'Medición & KPIs', r: 'Carlos R.', st: 3, w: 1, e: 'pending' },
  ];
  
  const getStyle = (e: string) => {
    if(e==='done') return 'bg-stone-100 text-stone-500 border-stone-200/80';
    if(e==='active') return 'bg-teal-900 text-white border-teal-900 shadow-md shadow-teal-900/20';
    return 'bg-white border-stone-200 border-dashed text-stone-400';
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8FAFC] font-sans">
      <div className="bg-[#FAF9F6] border-b border-stone-200/60 px-10 py-16 lg:px-16 lg:py-20 shadow-sm relative overflow-hidden">
         <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.calendar}</svg>
               Herramienta Oficial
            </div>
            <h1 className="text-3xl lg:text-4xl font-light text-stone-900 tracking-tight mb-4">Plantilla de calendarización de actividades</h1>
            <p className="text-stone-500 text-lg font-light">Planificación temporal y responsables del Propósito 1.</p>
          </div>
          <div className="flex flex-col items-end gap-6">
            <button onClick={() => cambiarVista(2)} className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-stone-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm whitespace-nowrap">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.arrowLeft}</svg> Volver al flujo
            </button>
            {/* Leyenda con indicadores de color — sin iconos redundantes */}
            <div className="flex gap-4 text-[9px] font-bold text-stone-500 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-stone-200/80 shadow-sm">
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-stone-200"></div> Completado</span>
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-teal-900"></div> En Curso</span>
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-white border border-dashed border-stone-300"></div> Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12 -mt-10 relative z-20">
        <div className="border border-stone-200/80 rounded-[2.5rem] shadow-sm overflow-hidden bg-white">
           <div className="grid grid-cols-[250px_1fr] border-b border-stone-100 bg-[#FAF9F6]">
              <div className="p-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-r border-stone-100">Actividad</div>
              <div className="grid grid-cols-4">
                 {/* Encabezados de semana — sin icono, el texto es suficiente */}
                 {semanas.map(s => <div key={s} className="p-6 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest border-r border-stone-100 last:border-0">{s}</div>)}
              </div>
           </div>
           <div className="divide-y divide-stone-50">
              {tareas.map((t, i) => (
                 <div key={i} className="grid grid-cols-[250px_1fr] hover:bg-stone-50/50 transition-colors">
                    <div className="p-6 border-r border-stone-100 flex flex-col justify-center">
                       <span className="font-semibold text-stone-800 text-sm tracking-tight">{t.n}</span>
                       {/* Responsable con avatar inicial — icono en avatar es suficiente */}
                       <span className="text-[9px] font-bold text-stone-400 mt-2 uppercase tracking-widest flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded bg-stone-100 text-stone-500 flex items-center justify-center text-[8px] border border-stone-200/80">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.user}</svg>
                          </div>
                          {t.r}
                       </span>
                    </div>
                    <div className="grid grid-cols-4 py-5 relative">
                       {Array.from({length:4}).map((_, col) => (
                          <div key={col} className="border-r border-stone-100 border-dashed last:border-0 relative px-3 flex items-center">
                             {col >= t.st && col < t.st + t.w && (
                                <div className={`h-8 w-full rounded-md border flex items-center px-4 ${getStyle(t.e)} relative z-10`}>
                                   <span className="text-[9px] font-bold uppercase tracking-wider truncate flex items-center gap-1.5">
                                     {/* Estado solo en texto dentro de la barra — limpio */}
                                     {t.e === 'done' ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICONS.check}</svg> Listo</> : t.e === 'active' ? 'En ejecución' : 'Planificado'}
                                   </span>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </main>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────

export default function AppSSP() {
  const [vista, setVista] = useState<Vista>(0);
  const [etapaActiva, setEtapaActiva] = useState(0);

  if (vista === 0) return <PantallaLogin cambiarVista={setVista} />;

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-stone-900">
      <Sidebar vista={vista} cambiarVista={setVista} etapaActiva={etapaActiva} setEtapaActiva={setEtapaActiva} />
      {vista === 1 && <PantallaSeleccion cambiarVista={setVista} />}
      {vista === 2 && <PantallaFlujo etapaActiva={etapaActiva} setEtapaActiva={setEtapaActiva} cambiarVista={setVista} />}
      {vista === 3 && <PantallaCatalogo cambiarVista={setVista} />}
      {vista === 4 && <PantallaCalendarizacion cambiarVista={setVista} />}
      {vista === 5 && <PantallaResultados cambiarVista={setVista} setEtapaActiva={setEtapaActiva} />}
    </div>
  );
}