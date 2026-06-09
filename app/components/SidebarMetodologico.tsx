"use client";

type Props = {
  activeRoute: string | null;
  onNavigate: (route: string | null) => void;
};

const RUTAS: [string, string | null][] = [
  ["← Volver al Catálogo", null],
  ["Investigar", "investigacion"],
  ["Definir Personas", "personas"],
  ["Habilitación y Expectativas", "habilitacion"],
  ["Definir Necesidades", "necesidades"],
  ["Vinculación", "vinculacion"],
  ["Medición", "medicion"],
  ["Momentos Críticos", "momentos"],
];

export default function SidebarMetodologico({ activeRoute, onNavigate }: Props) {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 lg:block">
      <div className="text-2xl font-bold bg-gradient-to-br from-teal-700 to-emerald-700 bg-clip-text text-transparent">
        SSP·UXLab
      </div>
      <nav className="mt-10 space-y-1 text-sm flex flex-col items-start">
        {RUTAS.map(([label, route]) => (
          <button
            key={label}
            onClick={() => onNavigate(route)}
            className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 ${
              activeRoute === route
                ? "bg-gradient-to-r from-teal-50 to-emerald-50 font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100/50"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
