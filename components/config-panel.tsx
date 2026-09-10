'use client';

import React from 'react';
import {
  ElevatorConfigState,
  Acionamento,
  Arcada,
  Posicao,
  TipoPorta,
  TipoEntrada,
  LadoArcada,
  ACIONAMENTOS,
  ARCADAS,
  POSICOES,
  TIPOS_PORTA,
  TIPOS_ENTRADA,
  LADOS_ARCADA,
  ABERTURAS_PORTA,
  ELEVATOR_PRESETS,
  ElevatorPreset,
} from '@/lib/elevator-calculator';
import {
  Sliders,
  Settings2,
  Box,
  DoorOpen,
  Zap,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface ConfigPanelProps {
  state: ElevatorConfigState;
  onChange: (newState: ElevatorConfigState) => void;
}

export function ConfigPanel({ state, onChange }: ConfigPanelProps) {
  const updateField = <K extends keyof ElevatorConfigState>(
    field: K,
    value: ElevatorConfigState[K]
  ) => {
    onChange({
      ...state,
      [field]: value,
    });
  };

  const applyPreset = (preset: ElevatorPreset) => {
    onChange({
      ...state,
      larguraCabine: preset.largura,
      profundidadeCabine: preset.profundidade,
      aberturaPorta: preset.aberturaPorta,
      acionamento: preset.acionamento,
      arcada: preset.arcada,
      tipoPorta: preset.tipoPorta,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Presets selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Modelos Padrão / Presets Rápidos
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">NBR NM 207 / NM 313</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ELEVATOR_PRESETS.map((preset) => {
            const isSelected =
              state.larguraCabine === preset.largura &&
              state.profundidadeCabine === preset.profundidade &&
              state.aberturaPorta === preset.aberturaPorta &&
              state.acionamento === preset.acionamento &&
              state.arcada === preset.arcada &&
              state.tipoPorta === preset.tipoPorta;

            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-900/30'
                    : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs font-medium leading-snug line-clamp-1">
                  {preset.nome}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {preset.largura}×{preset.profundidade} mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensões da Cabine Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Dimensões da Cabine</h2>
            <p className="text-xs text-slate-400">
              Medidas internas úteis da cabine e vão de abertura da porta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Largura Cabine */}
          <div>
            <label
              htmlFor="input-largura-cabine"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Largura da Cabine (mm)
            </label>
            <div className="relative">
              <input
                id="input-largura-cabine"
                type="number"
                min="500"
                max="3000"
                step="50"
                value={state.larguraCabine}
                onChange={(e) => updateField('larguraCabine', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg text-sm text-slate-100 font-mono transition-colors"
                placeholder="ex: 800"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono pointer-events-none">
                mm
              </span>
            </div>
          </div>

          {/* Profundidade Cabine */}
          <div>
            <label
              htmlFor="input-profundidade-cabine"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Profundidade da Cabine (mm)
            </label>
            <div className="relative">
              <input
                id="input-profundidade-cabine"
                type="number"
                min="600"
                max="3500"
                step="50"
                value={state.profundidadeCabine}
                onChange={(e) => updateField('profundidadeCabine', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg text-sm text-slate-100 font-mono transition-colors"
                placeholder="ex: 1250"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono pointer-events-none">
                mm
              </span>
            </div>
          </div>
        </div>

        {/* Abertura da Porta */}
        <div>
          <label
            htmlFor="select-abertura-porta"
            className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5"
          >
            <span>Abertura da Porta - Vão Livre (mm)</span>
            <span className="text-[11px] text-amber-400 font-mono">Vão Acabado</span>
          </label>
          <select
            id="select-abertura-porta"
            value={state.aberturaPorta}
            onChange={(e) => updateField('aberturaPorta', e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg text-sm text-slate-100 font-mono transition-colors"
          >
            {ABERTURAS_PORTA.map((abertura) => (
              <option key={abertura} value={abertura}>
                {abertura} mm {abertura === '800' ? '(Padrão Residencial)' : abertura === '900' ? '(Norma Acessibilidade)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Configuração do Equipamento Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/50 text-indigo-400">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Configuração do Equipamento</h2>
            <p className="text-xs text-slate-400">
              Acionamento motriz, sistema estrutural e arquitetura das portas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Acionamento */}
          <div>
            <label
              htmlFor="select-acionamento"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Acionamento
            </label>
            <select
              id="select-acionamento"
              value={state.acionamento}
              onChange={(e) => updateField('acionamento', e.target.value as Acionamento)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {ACIONAMENTOS.map((op) => (
                <option key={op} value={op}>
                  {op} {op === 'Elétrico' ? '(Máquina com Contrapeso)' : '(Pistão e Central Hidráulica)'}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Arcada */}
          <div>
            <label
              htmlFor="select-arcada"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Tipo de Arcada
            </label>
            <select
              id="select-arcada"
              value={state.arcada}
              onChange={(e) => updateField('arcada', e.target.value as Arcada)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {ARCADAS.map((op) => (
                <option key={op} value={op}>
                  {op === 'L' ? 'Arcada Tipo L (Mochila / Cantilever)' : 'Arcada de Suspensão (Tradicional)'}
                </option>
              ))}
            </select>
          </div>

          {/* Posição Contrapeso/Máquina */}
          <div>
            <label
              htmlFor="select-posicao"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Posição (Contrapeso/Máquina)
            </label>
            <select
              id="select-posicao"
              value={state.posicao}
              onChange={(e) => updateField('posicao', e.target.value as Posicao)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {POSICOES.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Porta */}
          <div>
            <label
              htmlFor="select-tipo-porta"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Tipo de Porta
            </label>
            <select
              id="select-tipo-porta"
              value={state.tipoPorta}
              onChange={(e) => updateField('tipoPorta', e.target.value as TipoPorta)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {TIPOS_PORTA.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Entrada */}
          <div>
            <label
              htmlFor="select-tipo-entrada"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Tipo de Entrada
            </label>
            <select
              id="select-tipo-entrada"
              value={state.tipoEntrada}
              onChange={(e) => updateField('tipoEntrada', e.target.value as TipoEntrada)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {TIPOS_ENTRADA.map((op) => (
                <option key={op} value={op}>
                  {op} {op === 'Unilateral' ? '(1 Acesso Frontal)' : op === 'Oposta' ? '(Acesso Frontal e Fundo)' : '(Acesso Frontal e Lateral)'}
                </option>
              ))}
            </select>
          </div>

          {/* Lado da Arcada / Chassis */}
          <div>
            <label
              htmlFor="select-lado-arcada"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Lado da Arcada / Chassis
            </label>
            <select
              id="select-lado-arcada"
              value={state.ladoArcada}
              onChange={(e) => updateField('ladoArcada', e.target.value as LadoArcada)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-sm text-slate-100 transition-colors"
            >
              {LADOS_ARCADA.map((op) => (
                <option key={op} value={op}>
                  {op} {op === 'Lateral' ? '(Guias na Parede Lateral)' : '(Guias na Parede de Fundo)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
