import React from 'react';
import { X, Save, RotateCcw, Settings2 } from 'lucide-react';
import { ElevatorConfigState } from '@/lib/elevator-calculator';

interface ClearancesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ElevatorConfigState;
  onChange: (newState: ElevatorConfigState) => void;
}

export function ClearancesConfigModal({
  isOpen,
  onClose,
  state,
  onChange,
}: ClearancesConfigModalProps) {
  if (!isOpen) return null;

  const handleReset = () => {
    onChange({
      ...state,
      customMenorFolga: undefined,
      customFolgaFrontal: undefined,
      customFolgaFundo: undefined,
      baseChassisHidraulicoL: undefined,
      baseChassisHidraulicoSuspensao: undefined,
      baseChassisEletricoL: undefined,
      baseChassisEletricoSuspensaoLateral: undefined,
      baseChassisEletricoSuspensaoFundo: undefined,
      basePorta2FL: undefined,
      basePorta3FL: undefined,
      basePorta2FC: undefined,
      basePorta4FC: undefined,
    });
  };

  const updateNum = (key: keyof ElevatorConfigState, val: string) => {
    onChange({ ...state, [key]: val === '' ? undefined : Number(val) });
  };

  const renderInput = (
    label: string,
    stateKey: keyof ElevatorConfigState,
    defaultVal: number
  ) => {
    const val = state[stateKey];
    return (
      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
        <label className="block text-[11px] font-bold text-slate-300 mb-1 leading-tight">
          {label}
        </label>
        <div className="flex items-center gap-2 mt-auto">
          <input
            type="number"
            value={val ?? ''}
            onChange={(e) => updateNum(stateKey, e.target.value)}
            placeholder={`Padrão: ${defaultVal}`}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          {val !== undefined && (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono shrink-0">Modif.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Configuração de Folgas Técnicas (Geral)
              </h2>
              <p className="text-xs text-slate-400">
                Personalize as dimensões base para cálculos de chassis, portas e folgas livres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Espaço do Chassis */}
              <div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Espaço do Chassis (Tracionamento e Guias)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {renderInput('Elétrico: Arcada L', 'baseChassisEletricoL', 450)}
                  {renderInput('Elétrico: Suspensão Lateral', 'baseChassisEletricoSuspensaoLateral', 420)}
                  {renderInput('Elétrico: Suspensão Fundo', 'baseChassisEletricoSuspensaoFundo', 400)}
                  {renderInput('Hidráulico: Arcada L', 'baseChassisHidraulicoL', 320)}
                  {renderInput('Hidráulico: Suspensão', 'baseChassisHidraulicoSuspensao', 280)}
                </div>
              </div>

              {/* Portas */}
              <div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Folga de Portas (Base p/ Abertura 700mm)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {renderInput('2 Folhas Lateral', 'basePorta2FL', 450)}
                  {renderInput('3 Folhas Lateral', 'basePorta3FL', 320)}
                  {renderInput('2 Folhas Central', 'basePorta2FC', 420)}
                  {renderInput('4 Folhas Central', 'basePorta4FC', 280)}
                </div>
              </div>

              {/* Folgas Livres */}
              <div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Folgas Livres da Cabine
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {renderInput('Menor Folga Lateral', 'customMenorFolga', 125)}
                  {renderInput('Folga Frontal (Soleira)', 'customFolgaFrontal', 160)}
                  {renderInput('Folga de Fundo', 'customFolgaFundo', 120)}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrões de Fábrica
                </button>
              </div>
            </div>

            {/* Right Column: Drawing */}
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Representação Esquemática
              </h3>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center relative min-h-[300px]">
                <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[300px] drop-shadow-xl overflow-visible">
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                      <polygon points="0 0, 6 3, 0 6" fill="currentColor" />
                    </marker>
                  </defs>
                  
                  {/* Poço */}
                  <rect x="50" y="50" width="300" height="300" fill="#0f172a" stroke="#475569" strokeWidth="2" strokeDasharray="6 4" rx="4" />
                  <text x="200" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">Largura do Poço (LP)</text>
                  <text x="35" y="200" fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold" transform="rotate(-90 35 200)">Profundidade do Poço (PP)</text>
                  
                  {/* Cabine */}
                  <rect x="130" y="100" width="160" height="180" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="4" />
                  <text x="210" y="195" fill="#38bdf8" fontSize="14" textAnchor="middle" fontWeight="bold">Cabine</text>
                  
                  {/* Folga Frontal */}
                  <rect x="160" y="280" width="100" height="6" fill="#10b981" rx="2" />
                  <line x1="210" y1="280" x2="210" y2="350" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" className="text-emerald-500" />
                  <rect x="145" y="310" width="130" height="20" fill="#0f172a" />
                  <text x="210" y="324" fill="#10b981" fontSize="10" textAnchor="middle" fontWeight="bold">Folga Frontal</text>
                  
                  {/* Espaço Chassis (Lateral Esquerda) */}
                  <rect x="70" y="130" width="60" height="120" fill="#334155" stroke="#64748b" strokeWidth="1" rx="2" />
                  <line x1="50" y1="190" x2="130" y2="190" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" className="text-slate-300" />
                  <rect x="55" y="200" width="60" height="30" fill="#0f172a" />
                  <text x="85" y="212" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">Espaço</text>
                  <text x="85" y="224" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">Chassis</text>
                  
                  {/* Menor Folga Lateral (Direita) */}
                  <line x1="290" y1="190" x2="350" y2="190" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" className="text-rose-500" />
                  <rect x="300" y="170" width="40" height="30" fill="#0f172a" />
                  <text x="320" y="182" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">Menor</text>
                  <text x="320" y="194" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">Folga</text>

                  {/* Folga Fundo (Topo) */}
                  <line x1="210" y1="50" x2="210" y2="100" stroke="#eab308" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" className="text-yellow-500" />
                  <rect x="180" y="65" width="60" height="20" fill="#0f172a" />
                  <text x="210" y="79" fill="#eab308" fontSize="10" textAnchor="middle" fontWeight="bold">Folga Fundo</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
