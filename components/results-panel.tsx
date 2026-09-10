'use client';

import React, { useState } from 'react';
import {
  ElevatorConfigState,
  ElevatorCalculationResults,
} from '@/lib/elevator-calculator';
import {
  Calculator,
  Copy,
  Check,
  Ruler,
  Maximize,
  ArrowRightLeft,
  Wrench,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface ResultsPanelProps {
  state: ElevatorConfigState;
  results: ElevatorCalculationResults;
}

export function ResultsPanel({ state, results }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    const report = `
=============================================
RELATÓRIO DE DIMENSIONAMENTO DE ELEVADOR
Normas de Referência: ABNT NBR NM 207 / NM 313
=============================================
DIMENSÕES DA CABINE:
- Largura da Cabine: ${state.larguraCabine} mm
- Profundidade da Cabine: ${state.profundidadeCabine} mm
- Vão Livre de Porta: ${state.aberturaPorta} mm

CONFIGURAÇÃO TÉCNICA:
- Acionamento: ${state.acionamento}
- Tipo de Arcada: ${state.arcada}
- Posição do Chassis: ${state.posicao}
- Tipo de Porta: ${state.tipoPorta}
- Tipo de Entrada: ${state.tipoEntrada}
- Lado da Arcada / Chassis: ${state.ladoArcada}

DIMENSIONAMENTO DO POÇO (CAIXA DE CORRIDA):
- LARGURA DO POÇO (LP): ${results.larguraPoco} mm
- PROFUNDIDADE DO POÇO (PP): ${results.profundidadePoco} mm

FOLGAS E SUPORTES ESTRUTURAIS:
- Folga Necessária (Porta): ${results.folgaPorta} mm
- Espaço Chassis (L/S): ${results.espacoChassis} mm
- Menor Folga Lateral: ${results.menorFolga} mm
- Folga Frontal: ${results.folgaFrontal} mm
- Tipo de Suporte: ${results.tipoSuporte}
- Quantidade por Andar: ${results.qtdSuporte} unidades
=============================================
Gerado via Configurador de Elevador Web
    `.trim();

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Resultados do Dimensionamento
            </h2>
            <p className="text-xs text-slate-400">
              Medidas calculadas para a caixa de corrida e poço
            </p>
          </div>
        </div>

        <button
          id="btn-copy-report"
          type="button"
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copiar Dados</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Highlights: Largura & Profundidade do Poço */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950/70 border border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-1">
            <span>Largura do Poço (LP)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-mono">
              Eixo X
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-100 tracking-tight">
              {results.larguraPoco}
            </span>
            <span className="text-sm text-cyan-400 font-mono">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cabine ({state.larguraCabine}) + Chassis ({results.espacoChassis}) + Folgas ({results.menorFolga}
            {state.tipoEntrada === 'Adjacente' ? ' + 160' : ''})
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950/70 border border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-1">
            <span>Profundidade do Poço (PP)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-mono">
              Eixo Y
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-100 tracking-tight">
              {results.profundidadePoco}
            </span>
            <span className="text-sm text-cyan-400 font-mono">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cabine ({state.profundidadeCabine}) + Frontal ({results.folgaFrontal}) + Fundo (
            {state.ladoArcada === 'Fundo' ? results.espacoChassis : 120}
            {state.tipoEntrada === 'Oposta' ? ' + 160' : ''})
          </p>
        </div>
      </div>

      {/* Technical Breakdown List */}
      <div className="space-y-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400">Folga Necessária (Porta)</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.folgaPorta} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400">Espaço Chassis (L / S)</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.espacoChassis} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400">Menor Folga de Segurança</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.menorFolga} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
          <span className="text-slate-400">Tipo de Suporte de Guia</span>
          <span className="font-medium text-cyan-300">{results.tipoSuporte}</span>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <span className="text-slate-400">Quantidade de Suportes por Andar</span>
          <span className="font-mono font-semibold text-emerald-400">
            {results.qtdSuporte} unidades
          </span>
        </div>
      </div>
    </div>
  );
}
