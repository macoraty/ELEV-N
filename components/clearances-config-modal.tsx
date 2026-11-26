import React, { useState } from 'react';
import { X, Save, RotateCcw, Settings2, DoorOpen, Check, AlertTriangle, Database, CheckCircle2, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import {
  ElevatorConfigState,
  ABERTURAS_PORTA,
  getFolgaPortaNormalPorTipo,
  calculateLarguraOcupadaPorta,
  DEFAULT_PORTA_PAVIMENTO_MM,
  DEFAULT_FOLGA_ENTRE_PORTAS_MM,
} from '@/lib/elevator-calculator';
import {
  saveClearancesToStorage,
  clearClearancesFromStorage,
  hasSavedClearances,
} from '@/lib/clearances-storage';

interface ClearancesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ElevatorConfigState;
  onChange: (newState: ElevatorConfigState) => void;
}

const CLEARANCES_ACCESS_PIN = '15975312';

const DOOR_PRESETS = [
  { value: '700', label: '700 mm', desc: 'Compacto' },
  { value: '800', label: '800 mm', desc: 'Padrão' },
  { value: '900', label: '900 mm', desc: 'NBR 9050' },
  { value: '1000', label: '1000 mm', desc: 'Comercial' },
  { value: '1100', label: '1100 mm', desc: 'Carga' },
  { value: '1200', label: '1200 mm', desc: 'Maca' },
];

export function ClearancesConfigModal({
  isOpen,
  onClose,
  state,
  onChange,
}: ClearancesConfigModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError(null);
    setShowPassword(false);
    onClose();
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === CLEARANCES_ACCESS_PIN) {
      setIsUnlocked(true);
      setPasswordError(null);
      setPasswordInput('');
    } else {
      setPasswordError('Senha incorreta. Verifique e tente novamente.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-950/70 border border-amber-500/40 rounded-lg text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Acesso Restrito
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configuração de Folgas Técnicas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUnlockSubmit} className="p-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Informe a senha técnica para liberar a edição das folgas de poço, chassis e portas.
            </p>

            <div>
              <label
                htmlFor="input-clearances-password"
                className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Senha de Acesso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-clearances-password"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Digite a senha"
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 border rounded-lg text-sm text-white font-mono tracking-widest focus:outline-none transition-colors ${
                    passwordError
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-700 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/50 border border-rose-500/40 px-2.5 py-1.5 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-unlock-clearances"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <Lock className="w-3.5 h-3.5" />
                Acessar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleReset = () => {
    clearClearancesFromStorage();
    const resetState: ElevatorConfigState = {
      ...state,
      aberturaPorta: '800',
      incluirPortaPavimento: false,
      customMenorFolga: undefined,
      customFolgaFrontal: undefined,
      customFolgaFundo: undefined,
      customPortaPavimento: undefined,
      customFolgaEntrePortas: undefined,
      baseChassisHidraulicoL: undefined,
      baseChassisHidraulicoSuspensao: undefined,
      baseChassisEletricoL: undefined,
      baseChassisEletricoSuspensaoLateral: undefined,
      baseChassisEletricoSuspensaoFundo: undefined,
      basePorta2FL: undefined,
      basePorta3FL: undefined,
      basePorta2FC: undefined,
      basePorta4FC: undefined,
    };
    onChange(resetState);
    showToast('Padrões de fábrica restaurados com sucesso.');
  };

  const updateNum = (key: keyof ElevatorConfigState, val: string) => {
    const nextState = { ...state, [key]: val === '' ? undefined : Number(val) };
    onChange(nextState);
    saveClearancesToStorage(nextState);
  };

  const handleTogglePortaPavimento = () => {
    const nextState = {
      ...state,
      incluirPortaPavimento: !(state.incluirPortaPavimento ?? false),
    };
    onChange(nextState);
    saveClearancesToStorage(nextState);
  };

  const handleDoorOpeningChange = (val: string) => {
    const nextState = { ...state, aberturaPorta: val };
    onChange(nextState);
    saveClearancesToStorage(nextState);
  };

  const handleSaveAndClose = () => {
    saveClearancesToStorage(state);
    showToast('Configurações salvas permanentemente no programa!');
    setTimeout(() => {
      handleClose();
    }, 400);
  };

  const currentAbertura = state.aberturaPorta || '800';
  const aberturaMm = parseInt(currentAbertura, 10) || 700;

  // Largura ocupada pela porta calculada pelas fórmulas técnicas para cada modelo
  const occ2FL = calculateLarguraOcupadaPorta(aberturaMm, '2 Folhas Lateral', 'Direita');
  const occ3FL = calculateLarguraOcupadaPorta(aberturaMm, '3 Folhas Lateral', 'Direita');
  const occ2FC = calculateLarguraOcupadaPorta(aberturaMm, '2 Folhas Central', 'Central');
  const occ4FC = calculateLarguraOcupadaPorta(aberturaMm, '4 Folhas Central', 'Central');
  const occ6FC = calculateLarguraOcupadaPorta(aberturaMm, '6 Folhas Central', 'Central');
  const occAtual = calculateLarguraOcupadaPorta(aberturaMm, state.tipoPorta, state.sentidoAberturaPorta);
  const folgaPortaAtual = occAtual.recolhimentoMm;

  // Verificação contra a face da cabine
  const ladoInstalacao = state.ladoPorta || 'Largura';
  const larguraNum = parseInt(state.larguraCabine, 10) || 800;
  const profundidadeNum = parseInt(state.profundidadeCabine, 10) || 1250;
  const ladoFace = ladoInstalacao === 'Largura' ? larguraNum : profundidadeNum;
  const ladoEfetivo = state.tipoEntrada === 'Adjacente' ? Math.min(larguraNum, profundidadeNum) : ladoFace;
  const isPortaMaiorQueCabine = aberturaMm > ladoEfetivo;

  const incluirPortaPavimento = state.incluirPortaPavimento ?? false;
  const portaNormalInfo = getFolgaPortaNormalPorTipo(state.tipoPorta);
  const folgaPortaNormalMm = state.customFolgaFrontal ?? portaNormalInfo.totalMm;
  const portaPavimentoMm = state.customPortaPavimento ?? DEFAULT_PORTA_PAVIMENTO_MM;
  const folgaEntrePortasMm = state.customFolgaEntrePortas ?? DEFAULT_FOLGA_ENTRE_PORTAS_MM;
  const folgaPortaPavMm = portaPavimentoMm + folgaEntrePortasMm;
  const folgaPortaAtivaMm = incluirPortaPavimento ? folgaPortaPavMm : folgaPortaNormalMm;

  const renderInput = (
    label: string,
    stateKey: keyof ElevatorConfigState,
    defaultVal: number
  ) => {
    const rawVal = state[stateKey];
    const val = typeof rawVal === 'number' || typeof rawVal === 'string' ? rawVal : '';
    return (
      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
        <label className="block text-[11px] font-bold text-slate-300 mb-1 leading-tight">
          {label}
        </label>
        <div className="flex items-center gap-2 mt-auto">
          <input
            type="number"
            value={val}
            onChange={(e) => updateNum(stateKey, e.target.value)}
            placeholder={`Padrão: ${defaultVal}`}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          {rawVal !== undefined && (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono shrink-0">Modif.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        
        {/* Toast Notificação de Salvamento */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Configuração de Folgas Técnicas (Geral)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Salvo no Programa
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalize folgas e tamanho de porta. Tudo fica salvo automaticamente e é aplicado em todos os cálculos.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Explicativo de Persistência */}
        <div className="px-4 py-2.5 bg-cyan-950/40 border-b border-cyan-800/30 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Persistência Ativa:</strong> As medidas que você alterar aqui ficam gravadas no navegador e serão usadas em todos os novos cálculos por poço, por cabine, modelos padrão e relatórios PDF.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tamanho da Porta (Vão Livre de Abertura) */}
              <div className="bg-slate-950/70 border border-cyan-900/50 rounded-xl p-3.5 space-y-3 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Tamanho da Porta - Vão Livre (Abertura)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full text-cyan-300">
                    <span>Abertura Salva:</span>
                    <strong className="text-white text-xs">{aberturaMm} mm</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Selecione ou digite o vão livre padrão da porta. Essa abertura fica salva no programa e ajusta automaticamente a folga estrutural necessária no poço.
                </p>

                {/* Botões de Seleção Rápida */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {DOOR_PRESETS.map((preset) => {
                    const isSelected = state.aberturaPorta === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleDoorOpeningChange(preset.value)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-xs font-bold font-mono">{preset.label}</span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-500'}`}>
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Input Customizado e Validação */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Outra Medida (mm):</span>
                    <input
                      type="number"
                      min="500"
                      max="2500"
                      step="50"
                      value={state.aberturaPorta}
                      onChange={(e) => handleDoorOpeningChange(e.target.value)}
                      placeholder="Ex: 850"
                      className="w-24 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {isPortaMaiorQueCabine ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Abertura ({aberturaMm}mm) &gt; face da cabine ({ladoEfetivo}mm).</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Face da cabine: <strong className="text-slate-200">{ladoFace} mm</strong> (sobra montantes: <strong className="text-slate-200">{Math.max(0, ladoFace - aberturaMm)} mm</strong>)</span>
                    </div>
                  )}
                </div>
              </div>
              
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

              {/* Largura Ocupada pela Porta por Modelo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Largura Ocupada pela Porta (Vão + Recolhimento)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Base vão atual: {aberturaMm} mm
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { nome: '2 Folhas Lateral (Dir/Esq)', occ: occ2FL, active: state.tipoPorta === '2 Folhas Lateral' },
                    { nome: '3 Folhas Lateral (Dir/Esq)', occ: occ3FL, active: state.tipoPorta === '3 Folhas Lateral' },
                    { nome: '2 Folhas Central', occ: occ2FC, active: state.tipoPorta === '2 Folhas Central' },
                    { nome: '4 Folhas Central', occ: occ4FC, active: state.tipoPorta === '4 Folhas Central' },
                    { nome: '6 Folhas Central', occ: occ6FC, active: state.tipoPorta === '6 Folhas Central' },
                  ].map((item) => (
                    <div
                      key={item.nome}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                        item.active
                          ? 'bg-cyan-950/40 border-cyan-500/60'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-200 leading-tight">
                        {item.nome}
                      </span>
                      <div className="mt-2 space-y-0.5 font-mono">
                        <div className="text-xs font-bold text-cyan-400">
                          {item.occ.larguraOcupadaMm} mm
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {item.occ.formulaGeral}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Recolh.: +{item.occ.recolhimentoMm} mm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Folgas Livres */}
              <div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Folgas Livres da Cabine e Porta de Pavimento
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {renderInput('Menor Folga Lateral', 'customMenorFolga', 125)}
                  {renderInput(
                    `Folga Porta Normal (${state.tipoPorta}: ${portaNormalInfo.formula})`,
                    'customFolgaFrontal',
                    portaNormalInfo.totalMm
                  )}
                  {renderInput('Folga de Fundo', 'customFolgaFundo', 120)}
                </div>

                {/* Sub-card: Porta de Pavimento (90 + 30 = 120 mm no lugar da porta normal) */}
                <div className="mt-2.5 bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePortaPavimento}
                      className="flex items-center gap-2 cursor-pointer text-left"
                    >
                      <div
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                          incluirPortaPavimento ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow" />
                      </div>
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Usar Porta de Pavimento ({folgaPortaPavMm} mm no lugar de {folgaPortaNormalMm} mm)
                      </span>
                    </button>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-200">
                      {incluirPortaPavimento
                        ? `Ativa: ${folgaPortaPavMm} mm (${portaPavimentoMm}+${folgaEntrePortasMm})`
                        : `Porta Normal: ${folgaPortaNormalMm} mm (${state.customFolgaFrontal !== undefined ? 'custom' : portaNormalInfo.formula})`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {renderInput('Porta de Pavimento (Soleira/Batente)', 'customPortaPavimento', DEFAULT_PORTA_PAVIMENTO_MM)}
                    {renderInput('Folga Entre Portas (Cabine ↔ Pav.)', 'customFolgaEntrePortas', DEFAULT_FOLGA_ENTRE_PORTAS_MM)}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrões de Fábrica do Programa
                </button>
              </div>
            </div>

            {/* Right Column: Drawing */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Representação Esquemática
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {state.tipoPorta} ({aberturaMm}mm)
                </span>
              </div>
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
                  
                  {/* Folga Frontal + Porta de Pavimento */}
                  <rect x="160" y="280" width="100" height="6" fill="#10b981" rx="2" />
                  {incluirPortaPavimento && (
                    <>
                      <rect
                        x="145"
                        y="330"
                        width="130"
                        height="18"
                        fill="rgba(245, 158, 11, 0.22)"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        rx="2"
                      />
                      <line
                        x1="150"
                        y1="322"
                        x2="270"
                        y2="322"
                        stroke="#fbbf24"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                      />
                      <text x="210" y="342" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold">
                        P. Pav ({portaPavimentoMm}+{folgaEntrePortasMm}mm)
                      </text>
                    </>
                  )}
                  <line x1="210" y1="286" x2="210" y2={incluirPortaPavimento ? '328' : '348'} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" className="text-emerald-500" />
                  <rect x="140" y="298" width="140" height="18" fill="#0f172a" />
                  <text x="210" y="310" fill="#10b981" fontSize="9.5" textAnchor="middle" fontWeight="bold">
                    {incluirPortaPavimento
                      ? `Folga: ${folgaPortaAtivaMm}mm`
                      : `Porta Normal (${folgaPortaAtivaMm}mm)`}
                  </text>
                  
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

                  {/* Porta e Folga de Porta (Parede Frontal) */}
                  <line x1="160" y1="350" x2="240" y2="350" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
                  <text x="200" y="368" fill="#0ea5e9" fontSize="10" textAnchor="middle" fontWeight="bold">
                    Abertura ({aberturaMm} mm)
                  </text>
                  
                  <line x1="240" y1="358" x2="310" y2="358" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                  <rect x="235" y="362" width="85" height="15" fill="#0f172a" rx="2" />
                  <text x="277" y="373" fill="#a855f7" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Folga Porta ({folgaPortaAtual} mm)
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gravado na memória do programa para todos os seus projetos.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <Save className="w-4 h-4" />
              Salvar e Manter no Programa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
