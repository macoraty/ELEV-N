export type Acionamento = 'Elétrico' | 'Hidráulico';
export type Arcada = 'L' | 'Suspensão';
export type Posicao = 'Centralizado' | 'Deslocado';
export type TipoPorta =
  | '2 Folhas Lateral'
  | '3 Folhas Lateral'
  | '2 Folhas Central'
  | '4 Folhas Central';
export type TipoEntrada = 'Unilateral' | 'Oposta' | 'Adjacente';
export type LadoArcada = 'Lateral' | 'Fundo';

export const ACIONAMENTOS: Acionamento[] = ['Elétrico', 'Hidráulico'];
export const ARCADAS: Arcada[] = ['L', 'Suspensão'];
export const POSICOES: Posicao[] = ['Centralizado', 'Deslocado'];
export const TIPOS_PORTA: TipoPorta[] = [
  '2 Folhas Lateral',
  '3 Folhas Lateral',
  '2 Folhas Central',
  '4 Folhas Central',
];
export const TIPOS_ENTRADA: TipoEntrada[] = ['Unilateral', 'Oposta', 'Adjacente'];
export const LADOS_ARCADA: LadoArcada[] = ['Lateral', 'Fundo'];
export const ABERTURAS_PORTA = ['700', '800', '900', '1000', '1100', '1200'] as const;

export interface ElevatorConfigState {
  larguraCabine: string;
  profundidadeCabine: string;
  aberturaPorta: string;
  acionamento: Acionamento;
  arcada: Arcada;
  posicao: Posicao;
  tipoPorta: TipoPorta;
  tipoEntrada: TipoEntrada;
  ladoArcada: LadoArcada;
}

export interface ElevatorCalculationResults {
  larguraPoco: number;
  profundidadePoco: number;
  folgaPorta: number;
  espacoChassis: number;
  menorFolga: number;
  folgaFrontal: number;
  tipoSuporte: string;
  qtdSuporte: number;
}

export const INITIAL_STATE: ElevatorConfigState = {
  larguraCabine: '800',
  profundidadeCabine: '1250',
  aberturaPorta: '800',
  acionamento: 'Elétrico',
  arcada: 'L',
  posicao: 'Centralizado',
  tipoPorta: '2 Folhas Lateral',
  tipoEntrada: 'Unilateral',
  ladoArcada: 'Lateral',
};

export interface ElevatorPreset {
  id: string;
  nome: string;
  descricao: string;
  largura: string;
  profundidade: string;
  aberturaPorta: string;
  acionamento: Acionamento;
  arcada: Arcada;
  tipoPorta: TipoPorta;
}

export const ELEVATOR_PRESETS: ElevatorPreset[] = [
  {
    id: 'padrao-residencial',
    nome: 'Residencial / Homelift (3-4 Pass.)',
    descricao: 'Cabine compacta 800 x 1250 mm',
    largura: '800',
    profundidade: '1250',
    aberturaPorta: '800',
    acionamento: 'Elétrico',
    arcada: 'L',
    tipoPorta: '2 Folhas Lateral',
  },
  {
    id: 'comercial-padrao',
    nome: 'Comercial Padrão (6 Pass. / 450 kg)',
    descricao: 'Cabine 1000 x 1300 mm com porta 800 mm',
    largura: '1000',
    profundidade: '1300',
    aberturaPorta: '800',
    acionamento: 'Elétrico',
    arcada: 'Suspensão',
    tipoPorta: '2 Folhas Central',
  },
  {
    id: 'acessibilidade-nbr',
    nome: 'Acessibilidade NBR 313 (8 Pass. / 600 kg)',
    descricao: 'Cabine 1100 x 1400 mm com vão livre 900 mm',
    largura: '1100',
    profundidade: '1400',
    aberturaPorta: '900',
    acionamento: 'Elétrico',
    arcada: 'L',
    tipoPorta: '2 Folhas Lateral',
  },
  {
    id: 'hospitalar-maca',
    nome: 'Hospitalar Maca (1500 kg)',
    descricao: 'Cabine 1300 x 2200 mm com vão livre 1100 mm',
    largura: '1300',
    profundidade: '2200',
    aberturaPorta: '1100',
    acionamento: 'Hidráulico',
    arcada: 'Suspensão',
    tipoPorta: '4 Folhas Central',
  },
];

export function calculateElevator(state: ElevatorConfigState): ElevatorCalculationResults {
  const largura = parseInt(state.larguraCabine, 10) || 800;
  const profundidade = parseInt(state.profundidadeCabine, 10) || 1250;
  
  const aberturasArray: readonly string[] = ABERTURAS_PORTA;
  const rawIdx = aberturasArray.indexOf(state.aberturaPorta);
  const indexAbertura = rawIdx >= 0 ? rawIdx : 1;

  let folgaPorta = 400;
  switch (state.tipoPorta) {
    case '2 Folhas Lateral':
      folgaPorta = 400 + indexAbertura * 50;
      break;
    case '3 Folhas Lateral':
      folgaPorta = 260 + indexAbertura * 40;
      break;
    case '2 Folhas Central':
      folgaPorta = 350 + indexAbertura * 45;
      break;
    case '4 Folhas Central':
      folgaPorta = 220 + indexAbertura * 35;
      break;
    default:
      folgaPorta = 400;
  }

  let espacoChassis = 400;
  if (state.acionamento === 'Hidráulico' && state.arcada === 'L') {
    espacoChassis = 320;
  } else if (state.acionamento === 'Hidráulico') {
    espacoChassis = 280;
  } else if (state.arcada === 'L') {
    espacoChassis = 450;
  } else if (state.ladoArcada === 'Lateral') {
    espacoChassis = 420;
  } else {
    espacoChassis = 400;
  }

  const menorFolga = 125;
  const folgaFrontal = 160;
  const folgaFundoPadrao = 120;

  const folgaEntradaOposta = state.tipoEntrada === 'Oposta' ? 160 : 0;
  const folgaEntradaAdjacente = state.tipoEntrada === 'Adjacente' ? 160 : 0;

  const larguraPoco =
    state.ladoArcada === 'Lateral'
      ? largura + espacoChassis + menorFolga + folgaEntradaAdjacente
      : largura + menorFolga * 2 + folgaEntradaAdjacente;

  const profundidadePoco =
    state.ladoArcada === 'Fundo'
      ? profundidade + folgaFrontal + espacoChassis + folgaEntradaOposta
      : profundidade + folgaFrontal + folgaFundoPadrao + folgaEntradaOposta;

  const tipoSuporte =
    state.arcada === 'Suspensão' ? 'Braket Suspensão' : 'Suporte Guia Tipo L';
  const qtdSuporte = state.arcada === 'Suspensão' ? 4 : 6;

  return {
    larguraPoco,
    profundidadePoco,
    folgaPorta,
    espacoChassis,
    menorFolga,
    folgaFrontal,
    tipoSuporte,
    qtdSuporte,
  };
}
