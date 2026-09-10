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
  Users,
  Weight,
  ShieldCheck,
  Ruler,
  Maximize2,
  Info,
} from 'lucide-react';

interface ResultsPanelProps {
  state: ElevatorConfigState;
  results: ElevatorCalculationResults;
  onViewBlueprint?: () => void;
}

export function ResultsPanel({
  state,
  results,
  onViewBlueprint,
}: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    const report = `
=============================================
RELATÓRIO DE DIMENSIONAMENTO DE ELEVADOR
Norma de Segurança: ABNT NBR 16858-1:2020 / NM 313
=============================================
CAPACIDADE E CARGA ÚTIL (ABNT NBR 16858-1):
- Lotação Máxima Suportada: ${results.numeroPassageiros} passageiros
- Carga Útil Nominal (Q): ${results.cargaUtilKg} kg
- Carga Mínima Calculada (Tabela 6): ${results.cargaMinimaInterpoladaKg} kg
- Área Útil Real da Cabine: ${results.areaCabineM2.toFixed(2)} m²
- Área Máxima Permitida (Tabela 6): ${results.areaMaxPermitidaM2.toFixed(2)} m²
- Massa de Referência por Passageiro: 75 kg (Item 5.4.2.2)

DIMENSÕES DA CABINE E PORTA:
- Largura da Cabine: ${state.larguraCabine} mm
- Profundidade da Cabine: ${state.profundidadeCabine} mm
- Lado de Instalação da Porta: ${results.nomeLadoPorta}
- Vão Livre da Porta: ${state.aberturaPorta} mm
- Espaço para Montantes Frontais: 2x ${results.montanteFrontalMm} mm (Total: ${results.diferencaPortaLadoMm} mm)
- Validação Porta x Cabine: ${results.isPortaMenorQueLado ? 'CONFORME (Porta estritamente menor que a face da cabine)' : 'INCONSISTENTE (Porta >= face)'}

DIMENSIONAMENTO DO POÇO (CAIXA DE CORRIDA):
- LARGURA DO POÇO (LP): ${results.larguraPoco} mm
- PROFUNDIDADE DO POÇO (PP): ${results.profundidadePoco} mm

CONFIGURAÇÃO TÉCNICA:
- Acionamento: ${state.acionamento}
- Tipo de Arcada: ${state.arcada}
- Posição do Chassis: ${state.posicao}
- Tipo de Porta: ${state.tipoPorta}
- Tipo de Entrada: ${state.tipoEntrada}
- Lado da Arcada / Chassis: ${state.ladoArcada}

FOLGAS E SUPORTES ESTRUTURAIS:
- Folga Necessária (Porta): ${results.folgaPorta} mm
- Espaço Chassis (L/S): ${results.espacoChassis} mm
- Menor Folga Lateral: ${results.menorFolga} mm
- Folga Frontal: ${results.folgaFrontal} mm
- Tipo de Suporte: ${results.tipoSuporte}
- Quantidade por Andar: ${results.qtdSuporte} unidades
=============================================
Gerado via Configurador de Elevador Web (ABNT NBR 16858-1)
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
              Capacidade, carga e medidas para a caixa de corrida
            </p>
          </div>
        </div>

        <button
          id="btn-copy-report"
          type="button"
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
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

      {/* Primary Highlights: 4 Key Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Número de Passageiros (NBR 16858-1) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950/70 border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Número de Passageiros
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 font-mono">
              NBR 16858-1
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-100 tracking-tight">
              {results.numeroPassageiros}
            </span>
            <span className="text-sm text-emerald-400 font-medium">
              {results.numeroPassageiros === 1 ? 'passageiro' : 'passageiros'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Base: {results.areaCabineM2.toFixed(2)} m² de cabine (Tabela 7 / 75 kg)
          </p>
        </div>

        {/* Carga Útil Nominal (Q) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-950/70 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-amber-400" />
              Carga Útil Nominal (Q)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 font-mono">
              Tabela 6
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-100 tracking-tight">
              {results.cargaUtilKg}
            </span>
            <span className="text-sm text-amber-400 font-mono">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Mínimo normativo: {results.cargaMinimaInterpoladaKg} kg (evita sobrecarga)
          </p>
        </div>

        {/* Largura do Poço */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950/70 border border-cyan-500/30">
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

        {/* Profundidade do Poço */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950/70 border border-cyan-500/30">
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

      {/* Technical Breakdown: Capacidade ABNT NBR 16858-1 */}
      <div className="mb-3 bg-slate-950/60 border border-emerald-900/40 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/80 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Dimensionamento de Lotação (ABNT NBR 16858-1:2020)</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Área Útil da Cabine</span>
            <span className="font-mono font-semibold text-slate-200">
              {results.areaCabineM2.toFixed(2)} m²
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Lotação de Passageiros (Tabela 7)</span>
            <span className="font-mono font-semibold text-emerald-400">
              {results.numeroPassageiros} pessoas
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Carga Útil Nominal Recomendada (Q)</span>
            <span className="font-mono font-semibold text-amber-300">
              {results.cargaUtilKg} kg
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Carga Mínima Exigida (Tabela 6)</span>
            <span className="font-mono text-slate-300">
              {results.cargaMinimaInterpoladaKg} kg
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Área Máxima Permitida (Tabela 6)</span>
            <span className="font-mono text-slate-300">
              {results.areaMaxPermitidaM2.toFixed(2)} m²
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Massa Média por Passageiro</span>
            <span className="font-mono text-slate-300">
              75 kg / pessoa (Item 5.4.2.2)
            </span>
          </div>
        </div>
      </div>

      {/* Technical Breakdown: Arquitetura da Porta e Montantes da Cabine */}
      <div className="mb-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 font-semibold">
          <span className="text-cyan-400 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            Arquitetura de Porta e Montantes de Cabine
          </span>
          {results.isPortaMenorQueLado ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              ✓ Porta Conforme
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              ⚠️ Inconsistente
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Face de Instalação da Porta</span>
            <span className="font-mono font-semibold text-slate-200">
              {results.nomeLadoPorta}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Vão Livre de Abertura</span>
            <span className="font-mono font-semibold text-cyan-300">
              {state.aberturaPorta} mm
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-400">Montantes Frontais (Retornos de Cabine)</span>
            <span className="font-mono font-semibold text-emerald-400">
              2× {results.montanteFrontalMm} mm (Total: {results.diferencaPortaLadoMm} mm)
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Regra Construtiva</span>
            <span className="text-slate-300">
              {results.isPortaMenorQueLado
                ? `Porta (${state.aberturaPorta} mm) < Face (${results.ladoFacePortaMm} mm)`
                : `ERRO: Porta (${state.aberturaPorta} mm) ≥ Face (${results.ladoFacePortaMm} mm)`}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Breakdown: Folgas e Caixa de Corrida */}
      <div className="space-y-2 bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs">
        <div className="text-slate-300 font-semibold pb-1 border-b border-slate-800/60">
          Folgas e Componentes Estruturais
        </div>
        <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
          <span className="text-slate-400">Folga Necessária (Porta)</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.folgaPorta} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
          <span className="text-slate-400">Espaço Chassis (L / S)</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.espacoChassis} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
          <span className="text-slate-400">Menor Folga de Segurança</span>
          <span className="font-mono font-semibold text-slate-200">
            {results.menorFolga} mm
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
          <span className="text-slate-400">Tipo de Suporte de Guia</span>
          <span className="font-medium text-cyan-300">{results.tipoSuporte}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-400">Quantidade de Suportes por Andar</span>
          <span className="font-mono font-semibold text-emerald-400">
            {results.qtdSuporte} unidades
          </span>
        </div>
      </div>

      {/* Quick Action Button to see/download Blueprint */}
      {onViewBlueprint && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <button
            id="btn-view-blueprint-results"
            type="button"
            onClick={onViewBlueprint}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/60 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ver Planta Baixa e Baixar Desenho Técnico</span>
          </button>
        </div>
      )}
    </div>
  );
}
