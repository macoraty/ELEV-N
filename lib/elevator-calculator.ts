export type Acionamento = 'Elétrico' | 'Hidráulico';
export type Arcada = 'L' | 'Suspensão';
export type Posicao = 'Centralizado' | 'Deslocado';
export type TipoPorta =
  | '2 Folhas Lateral'
  | '3 Folhas Lateral'
  | '2 Folhas Central'
  | '4 Folhas Central'
  | '6 Folhas Central';
export type SentidoAberturaPorta = 'Direita' | 'Esquerda' | 'Central';
export type TipoEntrada = 'Unilateral' | 'Oposta' | 'Adjacente';
export type LadoArcada = 'Lateral' | 'Fundo';
export type LadoInstalacaoPorta = 'Largura' | 'Profundidade';

export const ACIONAMENTOS: Acionamento[] = ['Elétrico', 'Hidráulico'];
export const ARCADAS: Arcada[] = ['L', 'Suspensão'];
export const POSICOES: Posicao[] = ['Centralizado', 'Deslocado'];
export const TIPOS_PORTA: TipoPorta[] = [
  '2 Folhas Lateral',
  '3 Folhas Lateral',
  '2 Folhas Central',
  '4 Folhas Central',
  '6 Folhas Central',
];
export const SENTIDOS_ABERTURA_PORTA: SentidoAberturaPorta[] = [
  'Direita',
  'Esquerda',
  'Central',
];
export const TIPOS_ENTRADA: TipoEntrada[] = ['Unilateral', 'Oposta', 'Adjacente'];
export const LADOS_ARCADA: LadoArcada[] = ['Lateral', 'Fundo'];
export const LADOS_INSTALACAO_PORTA: LadoInstalacaoPorta[] = ['Largura', 'Profundidade'];
export const ABERTURAS_PORTA = [
  '500',
  '600',
  '650',
  '700',
  '800',
  '900',
  '1000',
  '1100',
  '1200',
] as const;

export const DEFAULT_FOLGA_PORTA_NORMAL_MM = 210;
export const DEFAULT_PORTA_PAVIMENTO_MM = 90;
export const DEFAULT_FOLGA_ENTRE_PORTAS_MM = 30;

export interface DoorClearanceBreakdown {
  folhaCabineMm: number;
  folgaEntrePortasMm: number;
  folhaPavimentoMm: number;
  totalMm: number;
  formula: string;
}

export const FOLGA_PORTA_NORMAL_POR_TIPO: Record<TipoPorta, DoorClearanceBreakdown> = {
  '2 Folhas Lateral': {
    folhaCabineMm: 90,
    folgaEntrePortasMm: 30,
    folhaPavimentoMm: 90,
    totalMm: 210,
    formula: '90+30+90',
  },
  '3 Folhas Lateral': {
    folhaCabineMm: 136,
    folgaEntrePortasMm: 30,
    folhaPavimentoMm: 136,
    totalMm: 302,
    formula: '136+30+136',
  },
  '2 Folhas Central': {
    folhaCabineMm: 75,
    folgaEntrePortasMm: 30,
    folhaPavimentoMm: 75,
    totalMm: 180,
    formula: '75+30+75',
  },
  '4 Folhas Central': {
    folhaCabineMm: 90,
    folgaEntrePortasMm: 30,
    folhaPavimentoMm: 90,
    totalMm: 210,
    formula: '90+30+90',
  },
  '6 Folhas Central': {
    folhaCabineMm: 136,
    folgaEntrePortasMm: 30,
    folhaPavimentoMm: 136,
    totalMm: 302,
    formula: '136+30+136',
  },
};

export function getFolgaPortaNormalPorTipo(tipoPorta?: TipoPorta): DoorClearanceBreakdown {
  if (tipoPorta && FOLGA_PORTA_NORMAL_POR_TIPO[tipoPorta]) {
    return FOLGA_PORTA_NORMAL_POR_TIPO[tipoPorta];
  }
  return FOLGA_PORTA_NORMAL_POR_TIPO['2 Folhas Lateral'];
}

export function getTiposPortaPorSentido(sentido: SentidoAberturaPorta): TipoPorta[] {
  if (sentido === 'Central') {
    return ['2 Folhas Central', '4 Folhas Central', '6 Folhas Central'];
  }
  return ['2 Folhas Lateral', '3 Folhas Lateral'];
}

export function getSentidoCompativelTipoPorta(
  tipoPorta: TipoPorta,
  sentidoAtual?: SentidoAberturaPorta
): SentidoAberturaPorta {
  if (tipoPorta.includes('Central')) {
    return 'Central';
  }
  return sentidoAtual === 'Esquerda' ? 'Esquerda' : 'Direita';
}

export function getTipoPortaCompativelSentido(
  sentido: SentidoAberturaPorta,
  tipoAtual: TipoPorta
): TipoPorta {
  const validos = getTiposPortaPorSentido(sentido);
  if (validos.includes(tipoAtual)) return tipoAtual;
  if (sentido === 'Central') {
    return tipoAtual === '3 Folhas Lateral' ? '6 Folhas Central' : '4 Folhas Central';
  }
  return tipoAtual === '6 Folhas Central' ? '3 Folhas Lateral' : '2 Folhas Lateral';
}

export interface DoorOccupiedWidthInfo {
  larguraOcupadaMm: number;
  recolhimentoMm: number;
  fator: number;
  acrescimoMm: number;
  formulaTexto: string;
  formulaGeral: string;
  sentidoEfetivo: SentidoAberturaPorta;
}

export function calculateLarguraOcupadaPorta(
  aberturaMm: number,
  tipoPorta: TipoPorta,
  sentido?: SentidoAberturaPorta
): DoorOccupiedWidthInfo {
  const sentidoEfetivo = getSentidoCompativelTipoPorta(tipoPorta, sentido);
  let fator = 1.5;
  let acrescimoMm = 50;
  let fatorLabel = '1,5';

  switch (tipoPorta) {
    case '3 Folhas Lateral':
      fator = 1.33;
      acrescimoMm = 50;
      fatorLabel = '1,33';
      break;
    case '2 Folhas Lateral':
      fator = 1.5;
      acrescimoMm = 50;
      fatorLabel = '1,5';
      break;
    case '4 Folhas Central':
      fator = 1.5;
      acrescimoMm = 100;
      fatorLabel = '1,5';
      break;
    case '6 Folhas Central':
      fator = 1.3;
      acrescimoMm = 100;
      fatorLabel = '1,3';
      break;
    case '2 Folhas Central':
      fator = 2.0;
      acrescimoMm = 100;
      fatorLabel = '2,0';
      break;
  }

  const larguraOcupadaMm = Math.round(fator * aberturaMm + acrescimoMm);
  const recolhimentoMm = Math.max(0, larguraOcupadaMm - aberturaMm);

  return {
    larguraOcupadaMm,
    recolhimentoMm,
    fator,
    acrescimoMm,
    formulaTexto: `${fatorLabel} × ${aberturaMm} + ${acrescimoMm}`,
    formulaGeral: `${fatorLabel} × L + ${acrescimoMm}`,
    sentidoEfetivo,
  };
}

export interface DoorWallCollisionInput {
  larguraCabine: number;
  profundidadeCabine: number;
  larguraPoco: number;
  profundidadePoco: number;
  aberturaMm: number;
  larguraOcupadaPortaMm: number;
  recolhimentoMm: number;
  sentidoAberturaPorta: SentidoAberturaPorta;
  ladoArcada: LadoArcada;
  folgaEsquerda: number;
  folgaDireita: number;
  folgaFrontalParede: number;
  folgaFundoParede: number;
  hasFrontDoor: boolean;
  hasRearDoor: boolean;
  hasRightDoor: boolean;
  hasLeftDoor: boolean;
  incluirPortaPavimento?: boolean;
}

export interface DoorWallCollisionResult {
  hasCollision: boolean;
  colisaoMm: number;
  espacoDisponivelMm: number;
  recolhimentoNecessarioMm: number;
  sugestaoSentido?: SentidoAberturaPorta;
  alertaTexto?: string;
}

export function checkDoorWallCollision(input: DoorWallCollisionInput): DoorWallCollisionResult {
  const {
    larguraCabine,
    profundidadeCabine,
    larguraPoco,
    profundidadePoco,
    aberturaMm,
    larguraOcupadaPortaMm,
    recolhimentoMm,
    sentidoAberturaPorta,
    ladoArcada,
    folgaEsquerda,
    folgaDireita,
    folgaFrontalParede,
    folgaFundoParede,
    hasFrontDoor,
    hasRearDoor,
    hasRightDoor,
    hasLeftDoor,
    incluirPortaPavimento = false,
  } = input;

  if (incluirPortaPavimento || recolhimentoMm <= 0) {
    return {
      hasCollision: false,
      colisaoMm: 0,
      espacoDisponivelMm: Math.max(larguraPoco, profundidadePoco),
      recolhimentoNecessarioMm: 0,
    };
  }

  // Posição exata da cabine dentro do poço (espelha 1-a-1 a geometria da planta baixa)
  let cabLeftMm: number;
  let cabTopMm: number;

  if (ladoArcada === 'Lateral') {
    cabLeftMm =
      folgaEsquerda + larguraCabine <= larguraPoco
        ? folgaEsquerda
        : Math.max(0, (larguraPoco - larguraCabine) / 2);
    if (hasFrontDoor) {
      const targetBottom = profundidadePoco - folgaFrontalParede;
      cabTopMm =
        targetBottom - profundidadeCabine >= 0
          ? targetBottom - profundidadeCabine
          : Math.max(0, (profundidadePoco - profundidadeCabine) / 2);
    } else {
      cabTopMm = Math.max(0, (profundidadePoco - profundidadeCabine) / 2);
    }
  } else {
    if (hasRightDoor && !hasLeftDoor) {
      const candidate = larguraPoco - folgaDireita - larguraCabine;
      cabLeftMm = candidate >= 0 ? candidate : Math.max(0, (larguraPoco - larguraCabine) / 2);
    } else if (hasLeftDoor && !hasRightDoor) {
      cabLeftMm =
        folgaEsquerda + larguraCabine <= larguraPoco
          ? folgaEsquerda
          : Math.max(0, (larguraPoco - larguraCabine) / 2);
    } else {
      cabLeftMm = Math.max(0, (larguraPoco - larguraCabine) / 2);
    }
    cabTopMm =
      folgaFundoParede + profundidadeCabine <= profundidadePoco
        ? folgaFundoParede
        : Math.max(0, (profundidadePoco - profundidadeCabine) / 2);
  }

  const cabRightSpaceMm = Math.max(0, larguraPoco - (cabLeftMm + larguraCabine));
  const cabBottomSpaceMm = Math.max(0, profundidadePoco - (cabTopMm + profundidadeCabine));

  const evaluateAxis = (
    sentido: SentidoAberturaPorta,
    espacoNeg: number,
    espacoPos: number
  ) => {
    if (sentido === 'Direita') {
      const colisao = Math.max(0, Math.round(recolhimentoMm - espacoPos));
      return {
        colisao,
        espacoDisp: Math.round(espacoPos),
        necessario: Math.round(recolhimentoMm),
      };
    }
    if (sentido === 'Esquerda') {
      const colisao = Math.max(0, Math.round(recolhimentoMm - espacoNeg));
      return {
        colisao,
        espacoDisp: Math.round(espacoNeg),
        necessario: Math.round(recolhimentoMm),
      };
    }
    const halfReq = recolhimentoMm / 2;
    const colNeg = Math.max(0, Math.round(halfReq - espacoNeg));
    const colPos = Math.max(0, Math.round(halfReq - espacoPos));
    const colisao = Math.max(colNeg, colPos);
    const espacoDisp = Math.round(colNeg >= colPos ? espacoNeg : espacoPos);
    return {
      colisao,
      espacoDisp,
      necessario: Math.round(halfReq),
    };
  };

  const axesToCheck: Array<{ espacoNeg: number; espacoPos: number; wallSize: number }> = [];
  if (hasFrontDoor || hasRearDoor) {
    const montanteX = Math.max(0, (larguraCabine - aberturaMm) / 2);
    axesToCheck.push({
      espacoNeg: cabLeftMm + montanteX,
      espacoPos: cabRightSpaceMm + montanteX,
      wallSize: larguraPoco,
    });
  }
  if (hasRightDoor || hasLeftDoor) {
    const montanteY = Math.max(0, (profundidadeCabine - aberturaMm) / 2);
    axesToCheck.push({
      espacoNeg: cabTopMm + montanteY,
      espacoPos: cabBottomSpaceMm + montanteY,
      wallSize: profundidadePoco,
    });
  }

  let worstColisao = 0;
  let worstEspacoDisp = 0;
  let worstNecessario = Math.round(
    sentidoAberturaPorta === 'Central' ? recolhimentoMm / 2 : recolhimentoMm
  );

  for (const axis of axesToCheck) {
    const check = evaluateAxis(sentidoAberturaPorta, axis.espacoNeg, axis.espacoPos);
    const totalWallOverflow = Math.max(0, Math.round(larguraOcupadaPortaMm - axis.wallSize));
    const axisColisao = Math.max(check.colisao, totalWallOverflow);
    if (axisColisao > worstColisao) {
      worstColisao = axisColisao;
      worstEspacoDisp = check.espacoDisp;
      worstNecessario = check.necessario;
    } else if (worstColisao === 0 && worstEspacoDisp === 0) {
      worstEspacoDisp = check.espacoDisp;
      worstNecessario = check.necessario;
    }
  }

  if (worstColisao <= 0) {
    return {
      hasCollision: false,
      colisaoMm: 0,
      espacoDisponivelMm: worstEspacoDisp,
      recolhimentoNecessarioMm: worstNecessario,
    };
  }

  // Verifica se inverter o sentido lateral (Direita <-> Esquerda) resolve a colisão
  let sugestaoSentido: SentidoAberturaPorta | undefined;
  if (sentidoAberturaPorta === 'Direita' || sentidoAberturaPorta === 'Esquerda') {
    const oposto: SentidoAberturaPorta =
      sentidoAberturaPorta === 'Direita' ? 'Esquerda' : 'Direita';
    const opostoCabe = axesToCheck.every((axis) => {
      const c = evaluateAxis(oposto, axis.espacoNeg, axis.espacoPos);
      return c.colisao === 0 && larguraOcupadaPortaMm <= axis.wallSize;
    });
    if (opostoCabe) {
      sugestaoSentido = oposto;
    }
  }

  const ladoTexto =
    sentidoAberturaPorta === 'Central'
      ? `Abertura Central precisa de ${worstNecessario} mm de cada lado`
      : `Abertura para ${sentidoAberturaPorta} precisa de ${worstNecessario} mm de recolhimento`;

  const alertaTexto = `COLISÃO COM A PAREDE DO POÇO! ${ladoTexto}, mas há apenas ${worstEspacoDisp} mm disponíveis até a parede (ultrapassa ${worstColisao} mm). Revise o sentido de abertura da porta ou o lado da arcada.`;

  return {
    hasCollision: true,
    colisaoMm: worstColisao,
    espacoDisponivelMm: worstEspacoDisp,
    recolhimentoNecessarioMm: worstNecessario,
    sugestaoSentido,
    alertaTexto,
  };
}

export interface ElevatorConfigState {
  larguraCabine: string;
  profundidadeCabine: string;
  ladoPorta: LadoInstalacaoPorta;
  aberturaPorta: string;
  acionamento: Acionamento;
  arcada: Arcada;
  posicao: Posicao;
  tipoPorta: TipoPorta;
  sentidoAberturaPorta?: SentidoAberturaPorta;
  tipoEntrada: TipoEntrada;
  ladoArcada: LadoArcada;
  incluirPortaPavimento?: boolean;
  // Custom clearances overrides
  customMenorFolga?: number;
  customFolgaFrontal?: number;
  customFolgaFundo?: number;
  customPortaPavimento?: number;
  customFolgaEntrePortas?: number;
  // Rules overrides
  baseChassisHidraulicoL?: number;
  baseChassisHidraulicoSuspensao?: number;
  baseChassisEletricoL?: number;
  baseChassisEletricoSuspensaoLateral?: number;
  baseChassisEletricoSuspensaoFundo?: number;
  basePorta2FL?: number;
  basePorta3FL?: number;
  basePorta2FC?: number;
  basePorta4FC?: number;
}

export interface ShaftConfigState {
  larguraPoco: number;
  profundidadePoco: number;
  acionamento: Acionamento;
  arcada: Arcada;
  posicao: Posicao;
  tipoPorta: TipoPorta;
  sentidoAberturaPorta?: SentidoAberturaPorta;
  tipoEntrada: TipoEntrada;
  ladoArcada: LadoArcada;
  ladoPorta: LadoInstalacaoPorta;
  incluirPortaPavimento?: boolean;
  selectedCabinKey?: string | null;
  aberturaPorta?: string;
}

export const INITIAL_SHAFT_STATE: ShaftConfigState = {
  larguraPoco: 1600,
  profundidadePoco: 1700,
  acionamento: 'Elétrico',
  arcada: 'L',
  posicao: 'Centralizado',
  tipoPorta: '2 Folhas Lateral',
  sentidoAberturaPorta: 'Direita',
  tipoEntrada: 'Unilateral',
  ladoArcada: 'Lateral',
  ladoPorta: 'Largura',
  incluirPortaPavimento: false,
  selectedCabinKey: null,
  aberturaPorta: '800',
};

export interface CalculateElevatorOptions {
  forcedLarguraPoco?: number;
  forcedProfundidadePoco?: number;
  isCalculadoPorPoco?: boolean;
}

export interface ElevatorCalculationResults {
  larguraPoco: number;
  profundidadePoco: number;
  larguraPocoMinima?: number;
  profundidadePocoMinima?: number;
  sobraLarguraPoco?: number;
  sobraProfundidadePoco?: number;
  isCalculadoPorPoco?: boolean;
  larguraPocoInformada?: number;
  profundidadePocoInformada?: number;
  folgaPorta: number;
  espacoChassis: number;
  menorFolga: number;
  folgaFrontal: number;
  folgaFrontalBase: number;
  folgaPortaNormalFormula: string;
  folgaEsquerda: number;
  folgaDireita: number;
  folgaFrontalParede: number;
  folgaFundoParede: number;
  hasFrontDoor: boolean;
  hasRearDoor: boolean;
  hasRightDoor: boolean;
  hasLeftDoor: boolean;
  incluirPortaPavimento: boolean;
  portaPavimentoMm: number;
  folgaEntrePortasMm: number;
  adicionalPortaPavimentoMm: number;
  tipoSuporte: string;
  qtdSuporte: number;
  // Métricas ABNT NBR 16858-1
  areaCabineM2: number;
  numeroPassageiros: number;
  cargaUtilKg: number;
  cargaMinimaInterpoladaKg: number;
  areaMaxPermitidaM2: number;
  normaCarga: string;
  // Validação da Porta x Lado da Cabine e Largura Ocupada pela Porta
  ladoFacePortaMm: number;
  nomeLadoPorta: string;
  isPortaMenorQueLado: boolean;
  diferencaPortaLadoMm: number;
  montanteFrontalMm: number;
  maxAberturaSugeridaMm: number;
  erroValidacaoPorta?: string;
  sentidoAberturaPorta: SentidoAberturaPorta;
  larguraOcupadaPortaMm: number;
  larguraOcupadaPortaFormula: string;
  paredePocoPortaMm: number;
  isLarguraPortaCompativelPoco: boolean;
  isColisaoParedePorta: boolean;
  colisaoParedePortaMm: number;
  espacoDisponivelRecolhimentoMm: number;
  recolhimentoNecessarioMm: number;
  sugestaoSentidoPorta?: SentidoAberturaPorta;
  sobraLarguraPortaPocoMm: number;
  alertaLarguraOcupadaPorta?: string;
  isForaDaNorma?: boolean;
  alertaNormativo?: string;
}

// Tabela 6 da ABNT NBR 16858-1: Carga nominal (kg) e Área útil máxima da cabina (m²)
export const TABELA_6_NBR_16858_1: ReadonlyArray<{ cargaKg: number; areaMaxM2: number }> = [
  { cargaKg: 100, areaMaxM2: 0.37 },
  { cargaKg: 180, areaMaxM2: 0.58 },
  { cargaKg: 225, areaMaxM2: 0.70 },
  { cargaKg: 300, areaMaxM2: 0.90 },
  { cargaKg: 375, areaMaxM2: 1.10 },
  { cargaKg: 400, areaMaxM2: 1.17 },
  { cargaKg: 450, areaMaxM2: 1.30 },
  { cargaKg: 525, areaMaxM2: 1.45 },
  { cargaKg: 600, areaMaxM2: 1.60 },
  { cargaKg: 630, areaMaxM2: 1.66 },
  { cargaKg: 675, areaMaxM2: 1.75 },
  { cargaKg: 750, areaMaxM2: 1.90 },
  { cargaKg: 800, areaMaxM2: 2.00 },
  { cargaKg: 825, areaMaxM2: 2.05 },
  { cargaKg: 900, areaMaxM2: 2.20 },
  { cargaKg: 975, areaMaxM2: 2.35 },
  { cargaKg: 1000, areaMaxM2: 2.40 },
  { cargaKg: 1050, areaMaxM2: 2.50 },
  { cargaKg: 1125, areaMaxM2: 2.65 },
  { cargaKg: 1200, areaMaxM2: 2.80 },
  { cargaKg: 1250, areaMaxM2: 2.90 },
  { cargaKg: 1275, areaMaxM2: 2.95 },
  { cargaKg: 1350, areaMaxM2: 3.10 },
  { cargaKg: 1425, areaMaxM2: 3.25 },
  { cargaKg: 1500, areaMaxM2: 3.40 },
  { cargaKg: 1600, areaMaxM2: 3.56 },
  { cargaKg: 2000, areaMaxM2: 4.20 },
  { cargaKg: 2500, areaMaxM2: 5.00 },
];

// Tabela 7 da ABNT NBR 16858-1: Número de passageiros e Área útil mínima da cabina (m²)
export const TABELA_7_NBR_16858_1: ReadonlyArray<{ passageiros: number; areaMinM2: number }> = [
  { passageiros: 1, areaMinM2: 0.28 },
  { passageiros: 2, areaMinM2: 0.49 },
  { passageiros: 3, areaMinM2: 0.60 },
  { passageiros: 4, areaMinM2: 0.79 },
  { passageiros: 5, areaMinM2: 0.98 },
  { passageiros: 6, areaMinM2: 1.17 },
  { passageiros: 7, areaMinM2: 1.31 },
  { passageiros: 8, areaMinM2: 1.45 },
  { passageiros: 9, areaMinM2: 1.59 },
  { passageiros: 10, areaMinM2: 1.73 },
  { passageiros: 11, areaMinM2: 1.87 },
  { passageiros: 12, areaMinM2: 2.01 },
  { passageiros: 13, areaMinM2: 2.15 },
  { passageiros: 14, areaMinM2: 2.29 },
  { passageiros: 15, areaMinM2: 2.43 },
  { passageiros: 16, areaMinM2: 2.57 },
  { passageiros: 17, areaMinM2: 2.71 },
  { passageiros: 18, areaMinM2: 2.85 },
  { passageiros: 19, areaMinM2: 2.99 },
  { passageiros: 20, areaMinM2: 3.13 },
];

/**
 * Calcula a capacidade de passageiros conforme ABNT NBR 16858-1 (Tabela 7)
 */
export function calcularPassageirosNBR(areaM2: number): number {
  if (areaM2 < 0.28) {
    return 1;
  }

  // Se for maior que 20 passageiros (3.13 m²): adiciona 0,115 m² por pessoa
  if (areaM2 >= 3.13) {
    return 20 + Math.floor((areaM2 - 3.13) / 0.115);
  }

  // Itera pela Tabela 7
  let maxPass = 1;
  for (const item of TABELA_7_NBR_16858_1) {
    if (areaM2 >= item.areaMinM2) {
      maxPass = item.passageiros;
    } else {
      break;
    }
  }
  return maxPass;
}

/**
 * Calcula a carga útil nominal e interpolada conforme ABNT NBR 16858-1 (Tabela 6)
 */
export function calcularCargaUtilNBR(
  areaM2: number,
  passageiros: number
): { cargaNominalPadrao: number; cargaInterpolada: number; areaMaxPermitida: number } {
  // Carga mínima baseada em 75 kg por passageiro (item 5.4.2.2)
  const cargaPorPessoas = passageiros * 75;

  let cargaInterpolada = 100;
  let cargaNominalPadrao = 100;
  let areaMaxPermitida = 0.37;

  if (areaM2 <= TABELA_6_NBR_16858_1[0].areaMaxM2) {
    cargaInterpolada = TABELA_6_NBR_16858_1[0].cargaKg;
    cargaNominalPadrao = TABELA_6_NBR_16858_1[0].cargaKg;
    areaMaxPermitida = TABELA_6_NBR_16858_1[0].areaMaxM2;
  } else if (areaM2 > 5.00) {
    // Acima de 2500 kg: adicionar 0,16 m² para cada 100 kg extras
    const excessoArea = areaM2 - 5.00;
    const excessoKg = (excessoArea / 0.16) * 100;
    cargaInterpolada = Math.round(2500 + excessoKg);
    cargaNominalPadrao = Math.ceil((2500 + excessoKg) / 100) * 100;
    areaMaxPermitida = 5.00 + ((cargaNominalPadrao - 2500) / 100) * 0.16;
  } else {
    // Encontrar o intervalo na Tabela 6 para interpolação
    for (let i = 0; i < TABELA_6_NBR_16858_1.length - 1; i++) {
      const atual = TABELA_6_NBR_16858_1[i];
      const proximo = TABELA_6_NBR_16858_1[i + 1];

      if (areaM2 >= atual.areaMaxM2 && areaM2 <= proximo.areaMaxM2) {
        const fator = (areaM2 - atual.areaMaxM2) / (proximo.areaMaxM2 - atual.areaMaxM2);
        cargaInterpolada = Math.round(atual.cargaKg + fator * (proximo.cargaKg - atual.cargaKg));
        // O patamar comercial normatizado para garantir que a cabine não exceda a área máxima permitida
        cargaNominalPadrao = proximo.cargaKg;
        areaMaxPermitida = proximo.areaMaxM2;
        break;
      }
    }
  }

  // A carga útil nunca pode ser inferior ao número de passageiros x 75 kg
  if (cargaNominalPadrao < cargaPorPessoas) {
    cargaNominalPadrao = cargaPorPessoas;
    // Buscar nova área máxima permitida para essa carga
    const match = TABELA_6_NBR_16858_1.find((t) => t.cargaKg >= cargaNominalPadrao);
    if (match) {
      areaMaxPermitida = match.areaMaxM2;
    }
  }

  return {
    cargaNominalPadrao,
    cargaInterpolada: Math.max(cargaInterpolada, cargaPorPessoas),
    areaMaxPermitida,
  };
}

export const INITIAL_STATE: ElevatorConfigState = {
  larguraCabine: '800',
  profundidadeCabine: '1250',
  ladoPorta: 'Largura',
  aberturaPorta: '700',
  acionamento: 'Elétrico',
  arcada: 'L',
  posicao: 'Centralizado',
  tipoPorta: '2 Folhas Lateral',
  sentidoAberturaPorta: 'Direita',
  tipoEntrada: 'Unilateral',
  ladoArcada: 'Lateral',
  incluirPortaPavimento: false,
};

export interface ElevatorPreset {
  id: string;
  nome: string;
  descricao: string;
  largura: string;
  profundidade: string;
  ladoPorta: LadoInstalacaoPorta;
  aberturaPorta: string;
  acionamento: Acionamento;
  arcada: Arcada;
  tipoPorta: TipoPorta;
}

export const ELEVATOR_PRESETS: ElevatorPreset[] = [
  {
    id: 'padrao-residencial',
    nome: 'Residencial / Homelift (5 Pass. / 375 kg)',
    descricao: 'Cabine compacta 800 x 1250 mm com porta 700 mm (1,00 m² - NBR 16858-1)',
    largura: '800',
    profundidade: '1250',
    ladoPorta: 'Largura',
    aberturaPorta: '700',
    acionamento: 'Elétrico',
    arcada: 'L',
    tipoPorta: '2 Folhas Lateral',
  },
  {
    id: 'comercial-padrao',
    nome: 'Comercial Padrão (6 Pass. / 450 kg)',
    descricao: 'Cabine 1000 x 1300 mm com porta 800 mm (1,30 m²)',
    largura: '1000',
    profundidade: '1300',
    ladoPorta: 'Largura',
    aberturaPorta: '800',
    acionamento: 'Elétrico',
    arcada: 'Suspensão',
    tipoPorta: '2 Folhas Central',
  },
  {
    id: 'acessibilidade-nbr',
    nome: 'Acessibilidade NBR 313 (8 Pass. / 600 kg)',
    descricao: 'Cabine 1100 x 1400 mm com vão livre 900 mm (1,54 m²)',
    largura: '1100',
    profundidade: '1400',
    ladoPorta: 'Largura',
    aberturaPorta: '900',
    acionamento: 'Elétrico',
    arcada: 'L',
    tipoPorta: '2 Folhas Lateral',
  },
  {
    id: 'hospitalar-maca',
    nome: 'Hospitalar Maca (18 Pass. / 1350 kg)',
    descricao: 'Cabine 1300 x 2200 mm com vão livre 1100 mm (2,86 m²)',
    largura: '1300',
    profundidade: '2200',
    ladoPorta: 'Largura',
    aberturaPorta: '1100',
    acionamento: 'Hidráulico',
    arcada: 'Suspensão',
    tipoPorta: '4 Folhas Central',
  },
];

/**
 * Retorna a maior abertura padronizada que seja menor ou igual ao lado da cabine.
 * Faixa técnica padrão: de 500 mm até 1200 mm.
 */
export function getMaiorAberturaValida(ladoMm: number): string {
  const aberturasNumericas = [500, 600, 650, 700, 800, 900, 1000, 1100, 1200];
  const validas = aberturasNumericas.filter((a) => a <= ladoMm);
  if (validas.length > 0) {
    return String(validas[validas.length - 1]);
  }
  const menorAbertura = Math.max(400, Math.floor(ladoMm / 50) * 50);
  return String(menorAbertura);
}

export function calculateElevator(
  state: ElevatorConfigState,
  options?: CalculateElevatorOptions
): ElevatorCalculationResults {
  const largura = parseInt(state.larguraCabine, 10) || 800;
  const profundidade = parseInt(state.profundidadeCabine, 10) || 1250;
  
  const isForaDaNorma = largura < 800 || profundidade < 1200;
  const alertaNormativo = isForaDaNorma
    ? `Atenção: Dimensões da cabine (${largura} × ${profundidade} mm) inferiores ao mínimo recomendado pela norma ABNT NBR 16858-1 / NM 313 (mínimo padrão de 800 × 1200 mm para residencial / 1100 × 1400 mm para acessibilidade). Projeto especial sob medida para espaço físico restrito.`
    : undefined;
  
  const aberturaMm = parseInt(state.aberturaPorta, 10) || 700;
  const doorOccupied = calculateLarguraOcupadaPorta(
    aberturaMm,
    state.tipoPorta,
    state.sentidoAberturaPorta
  );
  const folgaPorta = doorOccupied.recolhimentoMm;
  const larguraOcupadaPortaMm = doorOccupied.larguraOcupadaMm;
  const larguraOcupadaPortaFormula = doorOccupied.formulaTexto;
  const sentidoAberturaPorta = doorOccupied.sentidoEfetivo;

  const ladoInstalacao: LadoInstalacaoPorta = state.ladoPorta || 'Largura';
  const incluirPortaPavimento = state.incluirPortaPavimento ?? false;

  const clearances = calculateShaftClearances({
    acionamento: state.acionamento,
    arcada: state.arcada,
    ladoArcada: state.ladoArcada,
    tipoEntrada: state.tipoEntrada,
    tipoPorta: state.tipoPorta,
    ladoPorta: ladoInstalacao,
    incluirPortaPavimento,
    customMenorFolga: state.customMenorFolga,
    customFolgaFrontal: state.customFolgaFrontal,
    customFolgaFundo: state.customFolgaFundo,
    customPortaPavimento: state.customPortaPavimento,
    customFolgaEntrePortas: state.customFolgaEntrePortas,
    baseChassisHidraulicoL: state.baseChassisHidraulicoL,
    baseChassisHidraulicoSuspensao: state.baseChassisHidraulicoSuspensao,
    baseChassisEletricoL: state.baseChassisEletricoL,
    baseChassisEletricoSuspensaoLateral: state.baseChassisEletricoSuspensaoLateral,
    baseChassisEletricoSuspensaoFundo: state.baseChassisEletricoSuspensaoFundo,
  });

  const {
    espacoChassis,
    menorFolga,
    folgaFrontal,
    folgaFrontalBase,
    folgaPortaNormalFormula,
    folgaEsquerda,
    folgaDireita,
    folgaFrontalParede,
    folgaFundoParede,
    hasFrontDoor,
    hasRearDoor,
    hasRightDoor,
    hasLeftDoor,
    portaPavimentoMm,
    folgaEntrePortasMm,
    adicionalPortaPavimentoMm,
  } = clearances;

  const larguraPocoCalculada = largura + clearances.espacoFixoLargura;
  const profundidadePocoCalculada = profundidade + clearances.espacoFixoProfundidade;

  const isPorPoco = Boolean(options?.isCalculadoPorPoco && options?.forcedLarguraPoco && options?.forcedProfundidadePoco);
  const larguraPoco = isPorPoco ? options!.forcedLarguraPoco! : larguraPocoCalculada;
  const profundidadePoco = isPorPoco ? options!.forcedProfundidadePoco! : profundidadePocoCalculada;
  const sobraLarguraPoco = isPorPoco ? Math.max(0, larguraPoco - larguraPocoCalculada) : undefined;
  const sobraProfundidadePoco = isPorPoco ? Math.max(0, profundidadePoco - profundidadePocoCalculada) : undefined;

  const tipoSuporte =
    state.arcada === 'Suspensão' ? 'Braket Suspensão' : 'Suporte Guia Tipo L';
  const qtdSuporte = state.arcada === 'Suspensão' ? 4 : 6;

  // Cálculo da área útil da cabine (m²)
  const areaCabineM2 = Number(((largura * profundidade) / 1_000_000).toFixed(2));

  // Cálculo de passageiros e carga útil com base na ABNT NBR 16858-1 (Tabelas 6 e 7)
  const numeroPassageiros = calcularPassageirosNBR(areaCabineM2);
  const cargaNBR = calcularCargaUtilNBR(areaCabineM2, numeroPassageiros);

  // Validação: O limite da porta é igual à largura da face da cabine onde ela vai instalada (porta <= face)
  const ladoFacePortaMm = ladoInstalacao === 'Profundidade' ? profundidade : largura;
  const nomeLadoPorta =
    ladoInstalacao === 'Profundidade'
      ? `Profundidade (${profundidade} mm)`
      : `Largura (${largura} mm)`;

  // Se entrada for adjacente, tem portas na largura E na profundidade
  const ladoEfetivoPortaMm =
    state.tipoEntrada === 'Adjacente'
      ? Math.min(largura, profundidade)
      : ladoFacePortaMm;

  const aberturaNum = parseInt(state.aberturaPorta, 10) || 700;
  const isPortaMenorQueLado = aberturaNum <= ladoEfetivoPortaMm;
  const diferencaPortaLadoMm = ladoEfetivoPortaMm - aberturaNum;
  const montanteFrontalMm = Math.max(0, Math.round(diferencaPortaLadoMm / 2));
  const maxAberturaSugeridaMm = parseInt(getMaiorAberturaValida(ladoEfetivoPortaMm), 10);

  const erroValidacaoPorta = !isPortaMenorQueLado
    ? `A porta (${aberturaNum} mm) excede o limite da face da cabine (${ladoEfetivoPortaMm} mm). A abertura máxima permitida é de até ${ladoEfetivoPortaMm} mm.`
    : undefined;

  const paredePocoPortaMm =
    state.tipoEntrada === 'Adjacente'
      ? Math.min(larguraPoco, profundidadePoco)
      : ladoInstalacao === 'Profundidade'
      ? profundidadePoco
      : larguraPoco;
  const sobraLarguraPortaPocoMm = paredePocoPortaMm - larguraOcupadaPortaMm;

  const doorWallCollision = checkDoorWallCollision({
    larguraCabine: largura,
    profundidadeCabine: profundidade,
    larguraPoco,
    profundidadePoco,
    aberturaMm,
    larguraOcupadaPortaMm,
    recolhimentoMm: folgaPorta,
    sentidoAberturaPorta,
    ladoArcada: state.ladoArcada,
    folgaEsquerda,
    folgaDireita,
    folgaFrontalParede,
    folgaFundoParede,
    hasFrontDoor,
    hasRearDoor,
    hasRightDoor,
    hasLeftDoor,
    incluirPortaPavimento,
  });

  const isColisaoParedePorta = doorWallCollision.hasCollision;
  const isLarguraPortaCompativelPoco = !isColisaoParedePorta;
  const alertaLarguraOcupadaPorta = doorWallCollision.alertaTexto;

  return {
    larguraPoco,
    profundidadePoco,
    larguraPocoMinima: larguraPocoCalculada,
    profundidadePocoMinima: profundidadePocoCalculada,
    sobraLarguraPoco,
    sobraProfundidadePoco,
    isCalculadoPorPoco: isPorPoco,
    larguraPocoInformada: isPorPoco ? options!.forcedLarguraPoco : undefined,
    profundidadePocoInformada: isPorPoco ? options!.forcedProfundidadePoco : undefined,
    folgaPorta,
    espacoChassis,
    menorFolga,
    folgaFrontal,
    folgaFrontalBase,
    folgaPortaNormalFormula,
    folgaEsquerda,
    folgaDireita,
    folgaFrontalParede,
    folgaFundoParede,
    hasFrontDoor,
    hasRearDoor,
    hasRightDoor,
    hasLeftDoor,
    incluirPortaPavimento,
    portaPavimentoMm,
    folgaEntrePortasMm,
    adicionalPortaPavimentoMm,
    tipoSuporte,
    qtdSuporte,
    areaCabineM2,
    numeroPassageiros,
    cargaUtilKg: cargaNBR.cargaNominalPadrao,
    cargaMinimaInterpoladaKg: cargaNBR.cargaInterpolada,
    areaMaxPermitidaM2: cargaNBR.areaMaxPermitida,
    normaCarga: 'ABNT NBR 16858-1:2020',
    ladoFacePortaMm: ladoEfetivoPortaMm,
    nomeLadoPorta,
    isPortaMenorQueLado,
    diferencaPortaLadoMm,
    montanteFrontalMm,
    maxAberturaSugeridaMm,
    erroValidacaoPorta,
    sentidoAberturaPorta,
    larguraOcupadaPortaMm,
    larguraOcupadaPortaFormula,
    paredePocoPortaMm,
    isLarguraPortaCompativelPoco,
    isColisaoParedePorta,
    colisaoParedePortaMm: doorWallCollision.colisaoMm,
    espacoDisponivelRecolhimentoMm: doorWallCollision.espacoDisponivelMm,
    recolhimentoNecessarioMm: doorWallCollision.recolhimentoNecessarioMm,
    sugestaoSentidoPorta: doorWallCollision.sugestaoSentido,
    sobraLarguraPortaPocoMm,
    alertaLarguraOcupadaPorta,
    isForaDaNorma,
    alertaNormativo,
  };
}

// ============================================================================
// DIMENSIONAMENTO INVERSO: CÁLCULO DE CABINES POSSÍVEIS A PARTIR DO POÇO
// TODAS AS MEDIDAS DE CABINE SÃO OBRIGATORIAMENTE MÚLTIPLOS DE 50 (SEM QUEBRADOS)
// ============================================================================

export interface PossibleCabinOption {
  larguraCabine: number; // Múltiplo estrito de 50
  profundidadeCabine: number; // Múltiplo estrito de 50
  areaCabineM2: number;
  numeroPassageiros: number;
  cargaUtilKg: number;
  maxAberturaPorta: string;
  larguraPocoMinima: number;
  profundidadePocoMinima: number;
  sobraLarguraPoco: number; // LP_informado - larguraPocoMinima
  sobraProfundidadePoco: number; // PP_informado - profundidadePocoMinima
  isMaxAproveitamento: boolean;
  proporcao: 'Quadrada' | 'Profunda' | 'Larga';
  tag?: string;
  isForaDaNorma?: boolean;
  alertaNormativo?: string;
}

export interface ShaftToCabinsInput {
  larguraPoco: number;
  profundidadePoco: number;
  acionamento?: Acionamento;
  arcada?: Arcada;
  ladoArcada?: LadoArcada;
  tipoEntrada?: TipoEntrada;
  tipoPorta?: TipoPorta;
  ladoPorta?: LadoInstalacaoPorta;
  incluirPortaPavimento?: boolean;
  customMenorFolga?: number;
  customFolgaFrontal?: number;
  customFolgaFundo?: number;
  customPortaPavimento?: number;
  customFolgaEntrePortas?: number;
  baseChassisHidraulicoL?: number;
  baseChassisHidraulicoSuspensao?: number;
  baseChassisEletricoL?: number;
  baseChassisEletricoSuspensaoLateral?: number;
  baseChassisEletricoSuspensaoFundo?: number;
}

export interface ShaftToCabinsResult {
  larguraPocoInformada: number;
  profundidadePocoInformada: number;
  larguraCabineMax: number; // Múltiplo de 50
  profundidadeCabineMax: number; // Múltiplo de 50
  cabineMaxima: PossibleCabinOption;
  cabinesPossiveis: PossibleCabinOption[];
  espacoChassis: number;
  menorFolga: number;
  folgaFrontal: number;
  folgaPortaNormalFormula: string;
  folgaFundoPadrao: number;
  incluirPortaPavimento: boolean;
  portaPavimentoMm: number;
  folgaEntrePortasMm: number;
  adicionalPortaPavimentoMm: number;
  isForaDaNorma: boolean;
  alertaNormativo?: string;
  isPocoInsuficiente: boolean;
  motivoInsuficiente?: string;
}

export function calculateShaftClearances({
  acionamento = 'Elétrico',
  arcada = 'L',
  ladoArcada = 'Lateral',
  tipoEntrada = 'Unilateral',
  tipoPorta = '2 Folhas Lateral',
  ladoPorta = 'Largura',
  incluirPortaPavimento = false,
  customMenorFolga,
  customFolgaFrontal,
  customFolgaFundo,
  customPortaPavimento,
  customFolgaEntrePortas,
  baseChassisHidraulicoL,
  baseChassisHidraulicoSuspensao,
  baseChassisEletricoL,
  baseChassisEletricoSuspensaoLateral,
  baseChassisEletricoSuspensaoFundo,
}: {
  acionamento?: Acionamento;
  arcada?: Arcada;
  ladoArcada?: LadoArcada;
  tipoEntrada?: TipoEntrada;
  tipoPorta?: TipoPorta;
  ladoPorta?: LadoInstalacaoPorta;
  incluirPortaPavimento?: boolean;
  customMenorFolga?: number;
  customFolgaFrontal?: number;
  customFolgaFundo?: number;
  customPortaPavimento?: number;
  customFolgaEntrePortas?: number;
  baseChassisHidraulicoL?: number;
  baseChassisHidraulicoSuspensao?: number;
  baseChassisEletricoL?: number;
  baseChassisEletricoSuspensaoLateral?: number;
  baseChassisEletricoSuspensaoFundo?: number;
}) {
  let espacoChassis = 400;
  if (acionamento === 'Hidráulico' && arcada === 'L') {
    espacoChassis = baseChassisHidraulicoL ?? 320;
  } else if (acionamento === 'Hidráulico') {
    espacoChassis = baseChassisHidraulicoSuspensao ?? 280;
  } else if (arcada === 'L') {
    espacoChassis = baseChassisEletricoL ?? 450;
  } else if (ladoArcada === 'Lateral') {
    espacoChassis = baseChassisEletricoSuspensaoLateral ?? 420;
  } else {
    espacoChassis = baseChassisEletricoSuspensaoFundo ?? 400;
  }

  const menorFolga = customMenorFolga ?? 125;
  const portaNormalBreakdown = getFolgaPortaNormalPorTipo(tipoPorta);
  const folgaFrontalBase = customFolgaFrontal ?? portaNormalBreakdown.totalMm;
  const folgaPortaNormalFormula =
    customFolgaFrontal !== undefined ? `${customFolgaFrontal} mm` : portaNormalBreakdown.formula;
  const folgaFundoPadrao = customFolgaFundo ?? 120;

  const portaPavimentoMm = customPortaPavimento ?? DEFAULT_PORTA_PAVIMENTO_MM;
  const folgaEntrePortasMm = customFolgaEntrePortas ?? DEFAULT_FOLGA_ENTRE_PORTAS_MM;
  const folgaPortaPavimentoTotal = portaPavimentoMm + folgaEntrePortasMm;
  const adicionalPortaPavimentoMm = incluirPortaPavimento ? folgaPortaPavimentoTotal : 0;
  const folgaPortaAtiva = incluirPortaPavimento ? folgaPortaPavimentoTotal : folgaFrontalBase;

  const isDoorOnDepth = ladoPorta === 'Profundidade';

  // Quais lados do poço possuem porta
  const hasFrontDoor = !isDoorOnDepth || tipoEntrada === 'Adjacente';
  const hasRightDoor = isDoorOnDepth || tipoEntrada === 'Adjacente';
  const hasRearDoor = !isDoorOnDepth && tipoEntrada === 'Oposta';
  const hasLeftDoor = isDoorOnDepth && tipoEntrada === 'Oposta';

  // No lado que tiver porta (frontal, oposta ou adjacente), retira-se a folga normal
  // da parede (menorFolga / folgaFundoPadrao) e aplica-se a folga da porta ativa (210 ou 120 mm).
  const folgaEsquerda =
    ladoArcada === 'Lateral'
      ? espacoChassis + (hasLeftDoor ? folgaPortaAtiva : 0)
      : hasLeftDoor
      ? folgaPortaAtiva
      : menorFolga;

  const folgaDireita = hasRightDoor ? folgaPortaAtiva : menorFolga;

  const folgaFrontalParede = hasFrontDoor ? folgaPortaAtiva : folgaFundoPadrao;

  const folgaFundoParede =
    ladoArcada === 'Fundo'
      ? espacoChassis + (hasRearDoor ? folgaPortaAtiva : 0)
      : hasRearDoor
      ? folgaPortaAtiva
      : folgaFundoPadrao;

  const espacoFixoLargura = folgaEsquerda + folgaDireita;
  const espacoFixoProfundidade = folgaFrontalParede + folgaFundoParede;

  const folgaFrontal = folgaPortaAtiva;
  const folgaEntradaOposta = tipoEntrada === 'Oposta' ? folgaPortaAtiva : 0;
  const folgaEntradaAdjacente = tipoEntrada === 'Adjacente' ? folgaPortaAtiva : 0;

  return {
    espacoChassis,
    menorFolga,
    folgaFrontal,
    folgaFrontalBase,
    folgaPortaNormalFormula,
    folgaFundoPadrao,
    folgaEsquerda,
    folgaDireita,
    folgaFrontalParede,
    folgaFundoParede,
    hasFrontDoor,
    hasRearDoor,
    hasRightDoor,
    hasLeftDoor,
    folgaEntradaOposta,
    folgaEntradaAdjacente,
    incluirPortaPavimento,
    portaPavimentoMm,
    folgaEntrePortasMm,
    adicionalPortaPavimentoMm,
    espacoFixoLargura,
    espacoFixoProfundidade,
  };
}

/**
 * Calcula todas as dimensões de cabine possíveis para uma determinada medida de poço.
 * Garante que TODAS as medidas de cabine (largura e profundidade) sejam estritamente
 * múltiplos de 50 mm (arredondamento seguro para baixo, sem números quebrados).
 * Mesmo quando as dimensões forem inferiores às normas ABNT NBR 16858-1 / NM 313,
 * a cabine é SEMPRE dimensionada para caber no poço informado, emitindo um alerta normativo.
 */
export function calculatePossibleCabinsFromShaft(
  input: ShaftToCabinsInput
): ShaftToCabinsResult {
  const lp = Math.max(0, input.larguraPoco);
  const pp = Math.max(0, input.profundidadePoco);

  const acionamento = input.acionamento || 'Elétrico';
  const arcada = input.arcada || 'L';
  const ladoArcada = input.ladoArcada || 'Lateral';
  const tipoEntrada = input.tipoEntrada || 'Unilateral';
  const tipoPorta = input.tipoPorta || '2 Folhas Lateral';
  const ladoPorta = input.ladoPorta || 'Largura';
  const incluirPortaPavimento = input.incluirPortaPavimento ?? false;

  const clearances = calculateShaftClearances({
    acionamento,
    arcada,
    ladoArcada,
    tipoEntrada,
    tipoPorta,
    ladoPorta,
    incluirPortaPavimento,
    customMenorFolga: input.customMenorFolga,
    customFolgaFrontal: input.customFolgaFrontal,
    customFolgaFundo: input.customFolgaFundo,
    customPortaPavimento: input.customPortaPavimento,
    customFolgaEntrePortas: input.customFolgaEntrePortas,
    baseChassisHidraulicoL: input.baseChassisHidraulicoL,
    baseChassisHidraulicoSuspensao: input.baseChassisHidraulicoSuspensao,
    baseChassisEletricoL: input.baseChassisEletricoL,
    baseChassisEletricoSuspensaoLateral: input.baseChassisEletricoSuspensaoLateral,
    baseChassisEletricoSuspensaoFundo: input.baseChassisEletricoSuspensaoFundo,
  });

  // Espaço livre máximo bruto disponível após dedução do chassi e folgas
  const rawMaxW = lp - clearances.espacoFixoLargura;
  const rawMaxD = pp - clearances.espacoFixoProfundidade;

  // Arredonda para baixo para o múltiplo de 50 mm mais próximo (sem número quebrado!)
  // Garante uma cabine mínima de 300 mm mesmo em poços hiper-compactos
  const larguraCabineMax = Math.max(300, Math.floor(rawMaxW / 50) * 50);
  const profundidadeCabineMax = Math.max(300, Math.floor(rawMaxD / 50) * 50);

  // Verificação normativa ABNT NBR 16858-1 / NBR NM 313:
  // Mínimo para residencial/homelift recomendado: 800 x 1200 mm
  // Mínimo para acessibilidade cadeirante: 1100 x 1400 mm
  const isForaDaNorma = larguraCabineMax < 800 || profundidadeCabineMax < 1200;
  const isPocoMuitoApertado = rawMaxW < 450 || rawMaxD < 500;

  const alertaNormativo = isForaDaNorma
    ? `Atenção: Dimensões da cabine (${larguraCabineMax} × ${profundidadeCabineMax} mm) abaixo do mínimo recomendado pela norma ABNT NBR 16858-1 / NM 313 (mínimo normativo padrão: 800 × 1200 mm). Dimensionamento sob medida executado para atender ao espaço físico real informado da obra.`
    : undefined;

  // Gera opções viáveis em múltiplos de 50 mm que cabem no poço
  const pairsSet = new Set<string>();
  const addPair = (w: number, d: number) => {
    const w50 = Math.floor(w / 50) * 50;
    const d50 = Math.floor(d / 50) * 50;
    if (w50 >= 300 && w50 <= larguraCabineMax && d50 >= 300 && d50 <= profundidadeCabineMax) {
      pairsSet.add(`${w50}x${d50}`);
    }
  };

  // 1. Cabine de Máximo Aproveitamento
  addPair(larguraCabineMax, profundidadeCabineMax);

  // 2. Variações sistemáticas a partir do máximo com passo de 50 mm
  const minW = Math.max(400, larguraCabineMax - 400);
  const minD = Math.max(500, profundidadeCabineMax - 500);

  for (let w = larguraCabineMax; w >= minW; w -= 50) {
    for (let d = profundidadeCabineMax; d >= minD; d -= 50) {
      addPair(w, d);
    }
  }

  // 3. Adiciona tamanhos padronizados de mercado caso caibam no poço
  const standardSizes = [
    [500, 800],
    [600, 800],
    [600, 900],
    [700, 900],
    [700, 1000],
    [800, 1000],
    [800, 1200],
    [850, 1200],
    [900, 1200],
    [900, 1300],
    [950, 1300],
    [1000, 1250],
    [1000, 1300],
    [1000, 1400],
    [1050, 1300],
    [1050, 1400],
    [1100, 1400], // NBR 313 Acessibilidade
    [1100, 1450],
    [1200, 1400],
    [1200, 1500],
    [1200, 2100], // Maca
    [1300, 2100], // Maca
  ];

  for (const [sw, sd] of standardSizes) {
    if (sw <= larguraCabineMax && sd <= profundidadeCabineMax) {
      addPair(sw, sd);
    }
  }

  // Converte para objetos estruturados
  const cabinesPossiveis: PossibleCabinOption[] = [];

  pairsSet.forEach((pairKey) => {
    const [wStr, dStr] = pairKey.split('x');
    const w = parseInt(wStr, 10);
    const d = parseInt(dStr, 10);

    const areaM2 = Number(((w * d) / 1_000_000).toFixed(2));
    const passageiros = calcularPassageirosNBR(areaM2);
    const carga = calcularCargaUtilNBR(areaM2, passageiros).cargaNominalPadrao;

    // Porta compatível (sempre menor que a face de instalação)
    const ladoFace = ladoPorta === 'Profundidade' ? d : w;
    const ladoEfetivo = tipoEntrada === 'Adjacente' ? Math.min(w, d) : ladoFace;
    const maxAbertura = getMaiorAberturaValida(ladoEfetivo);

    // Poço mínimo exigido por esta cabine
    const lpMin = w + clearances.espacoFixoLargura;
    const ppMin = d + clearances.espacoFixoProfundidade;

    const sobraLP = Math.max(0, lp - lpMin);
    const sobraPP = Math.max(0, pp - ppMin);

    const isMax = w === larguraCabineMax && d === profundidadeCabineMax;

    let proporcao: 'Quadrada' | 'Profunda' | 'Larga' = 'Quadrada';
    if (d > w + 100) proporcao = 'Profunda';
    else if (w > d + 100) proporcao = 'Larga';

    const itemForaNorma = w < 800 || d < 1200;

    let tag: string | undefined = undefined;
    if (isMax) {
      tag = 'Aproveitamento Máximo';
    } else if (w >= 1100 && d >= 1400) {
      tag = 'Acessibilidade Cadeirante (NBR 313)';
    } else if (w >= 1200 && d >= 2100) {
      tag = 'Maca Hospitalar';
    } else if ((w === 1000 && d === 1250) || (w === 1000 && d === 1300)) {
      tag = 'Comercial Padrão (6 Pass.)';
    } else if (w <= 900 && d <= 1200) {
      tag = 'Residencial Compacto';
    } else if (itemForaNorma) {
      tag = 'Sob Medida (Compacto)';
    }

    cabinesPossiveis.push({
      larguraCabine: w,
      profundidadeCabine: d,
      areaCabineM2: areaM2,
      numeroPassageiros: passageiros,
      cargaUtilKg: carga,
      maxAberturaPorta: maxAbertura,
      larguraPocoMinima: lpMin,
      profundidadePocoMinima: ppMin,
      sobraLarguraPoco: sobraLP,
      sobraProfundidadePoco: sobraPP,
      isMaxAproveitamento: isMax,
      proporcao,
      tag,
      isForaDaNorma: itemForaNorma,
      alertaNormativo: itemForaNorma
        ? `Cabine com dimensões (${w} × ${d} mm) inferiores ao padrão normativo ABNT NBR 16858-1 / NM 313 (800 × 1200 mm).`
        : undefined,
    });
  });

  // Ordena: primeiro a máxima, depois por área útil decrescente
  cabinesPossiveis.sort((a, b) => {
    if (a.isMaxAproveitamento) return -1;
    if (b.isMaxAproveitamento) return 1;
    if (b.areaCabineM2 !== a.areaCabineM2) {
      return b.areaCabineM2 - a.areaCabineM2;
    }
    return b.larguraCabine - a.larguraCabine;
  });

  // Garante que SEMPRE há uma cabine máxima para alimentar a planta e os cálculos
  const cabineMaxima: PossibleCabinOption =
    cabinesPossiveis.find((c) => c.isMaxAproveitamento) ||
    cabinesPossiveis[0] || {
      larguraCabine: larguraCabineMax,
      profundidadeCabine: profundidadeCabineMax,
      areaCabineM2: Number(((larguraCabineMax * profundidadeCabineMax) / 1_000_000).toFixed(2)),
      numeroPassageiros: 1,
      cargaUtilKg: 100,
      maxAberturaPorta: '500',
      larguraPocoMinima: lp,
      profundidadePocoMinima: pp,
      sobraLarguraPoco: 0,
      sobraProfundidadePoco: 0,
      isMaxAproveitamento: true,
      proporcao: 'Quadrada',
      isForaDaNorma: true,
      alertaNormativo,
    };

  return {
    larguraPocoInformada: lp,
    profundidadePocoInformada: pp,
    larguraCabineMax,
    profundidadeCabineMax,
    cabineMaxima,
    cabinesPossiveis,
    espacoChassis: clearances.espacoChassis,
    menorFolga: clearances.menorFolga,
    folgaFrontal: clearances.folgaFrontal,
    folgaPortaNormalFormula: clearances.folgaPortaNormalFormula,
    folgaFundoPadrao: clearances.folgaFundoPadrao,
    incluirPortaPavimento: clearances.incluirPortaPavimento,
    portaPavimentoMm: clearances.portaPavimentoMm,
    folgaEntrePortasMm: clearances.folgaEntrePortasMm,
    adicionalPortaPavimentoMm: clearances.adicionalPortaPavimentoMm,
    isForaDaNorma,
    alertaNormativo,
    isPocoInsuficiente: isPocoMuitoApertado,
    motivoInsuficiente: isPocoMuitoApertado
      ? `Atenção: Dimensões de poço informadas (${lp} × ${pp} mm) resultam em espaço interno muito reduzido (${rawMaxW} × ${rawMaxD} mm livre). A cabine foi calculada para ${larguraCabineMax} × ${profundidadeCabineMax} mm.`
      : undefined,
  };
}

