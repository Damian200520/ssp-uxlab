"use client";

import { useState } from "react";
import InvestigacionFlow from "./components/InvestigacionFlow";
import PersonasFlow from "./components/PersonasFlow";
import HabilitacionFlow from "./components/HabilitacionFlow";
import NecesidadesFlow from "./components/NecesidadesFlow";

export default function Home() {
  const [current, setCurrent] = useState("habilitacion");

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 p-4 text-white flex gap-4 text-sm font-semibold sticky top-0 z-50">
        <span className="text-slate-400">Navegación de entorno de prueba:</span>
        <button onClick={() => setCurrent("investigacion")} className={current === "investigacion" ? "text-teal-400 underline" : "hover:text-teal-200"}>Investigación</button>
        <button onClick={() => setCurrent("personas")} className={current === "personas" ? "text-teal-400 underline" : "hover:text-teal-200"}>Personas</button>
        <button onClick={() => setCurrent("habilitacion")} className={current === "habilitacion" ? "text-teal-400 underline" : "hover:text-teal-200"}>Habilitación y Expectativas</button>
        <button onClick={() => setCurrent("necesidades")} className={current === "necesidades" ? "text-teal-400 underline" : "hover:text-teal-200"}>Necesidades</button>
      </div>
      <div className="flex-1">
        {current === "investigacion" && <InvestigacionFlow />}
        {current === "personas" && <PersonasFlow />}
        {current === "habilitacion" && <HabilitacionFlow />}
        {current === "necesidades" && <NecesidadesFlow />}
      </div>
    </div>
  );
}