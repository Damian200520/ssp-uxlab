"use client";

import { useState, useEffect } from "react";
import { supabase } from "./components/supabaseClient";
import InvestigacionFlow from "./components/InvestigacionFlow";
import PersonasFlow from "./components/PersonasFlow";
import HabilitacionFlow from "./components/HabilitacionFlow";
import NecesidadesFlow from "./components/NecesidadesFlow";

type ToolStatus = "Vacío" | "Borrador" | "Validado";

interface Tool {
  id: string;
  name: string;
  status: ToolStatus;
  progress: string;
  description: string;
}

export default function Home() {
  const [current, setCurrent] = useState<string | null>(null);
  const [tools, setTools] = useState<Tool[]>([
    { id: "investigacion", name: "Investigación", status: "Vacío", progress: "0%", description: "Define el problema y descubre insights iniciales." },
    { id: "personas", name: "Personas", status: "Vacío", progress: "0%", description: "Crea arquetipos de usuarios basados en investigación." },
    { id: "habilitacion", name: "Habilitación y Expectativas", status: "Vacío", progress: "0%", description: "Identifica barreras, facilitadores y expectativas." },
    { id: "necesidades", name: "Necesidades", status: "Vacío", progress: "0%", description: "Profundiza en fricciones y acciones sugeridas." }
  ]);

  useEffect(() => {
    async function loadStatuses() {
      try {
        // Personas
        const { data: pData } = await supabase.from("personas").select("estado_perfil");
        let pStatus: ToolStatus = "Vacío";
        if (pData && pData.length > 0) {
          pStatus = pData.some(p => p.estado_perfil === "Validado") ? "Validado" : "Borrador";
        }

        // Necesidades
        const { data: nData } = await supabase.from("necesidades").select("estado");
        let nStatus: ToolStatus = "Vacío";
        if (nData && nData.length > 0) {
          nStatus = nData.some(n => n.estado === "Validado") ? "Validado" : "Borrador";
        }

        // We can infer progress based on status
        setTools(prev => prev.map(t => {
          if (t.id === "personas") return { ...t, status: pStatus, progress: pStatus === "Validado" ? "100%" : (pStatus === "Borrador" ? "50%" : "0%") };
          if (t.id === "necesidades") return { ...t, status: nStatus, progress: nStatus === "Validado" ? "100%" : (nStatus === "Borrador" ? "50%" : "0%") };
          return t;
        }));
      } catch (e) {
        console.error("Error cargando estados:", e);
      }
    }
    loadStatuses();
  }, []);

  if (current) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 bg-gray-50">
          {current === "investigacion" && <InvestigacionFlow onNavigate={setCurrent} />}
          {current === "personas" && <PersonasFlow onNavigate={setCurrent} />}
          {current === "habilitacion" && <HabilitacionFlow onNavigate={setCurrent} />}
          {current === "necesidades" && <NecesidadesFlow onNavigate={setCurrent} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Catálogo de Herramientas</h1>
        <p className="text-slate-600 mb-8 text-lg">Propósito 1: Ecosistema Interconectado</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map(tool => (
            <div 
              key={tool.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-800">{tool.name}</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-1">{tool.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    tool.status === 'Validado' ? 'bg-green-100 text-green-700' :
                    tool.status === 'Borrador' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {tool.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{tool.progress}</span>
                </div>
              </div>
              <button 
                onClick={() => setCurrent(tool.id)}
                className="w-full py-3 bg-slate-50 text-teal-600 font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors border-t border-slate-200 text-sm"
              >
                Ingresar a la Herramienta
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}