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
export type LadoInstalacaoPorta = 'Largura' | 'Profundidade';

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
export const LADOS_INSTALACAO_PORTA: LadoInstalacaoPorta[] = ['Largura', 'Profundidade'];
export const ABERTURAS_PORTA = [
  '700',
  '800',
  '900',
  '1000',
  '1100',
  '1200',
] as const;

export interface ElevatorConfigState {
  larguraCabine: string;
  profundidadeCabine: string;
  ladoPorta: LadoInstalacaoPorta;
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
  // Métricas ABNT NBR 16858-1
  areaCabineM2: number;
  numeroPassageiros: number;
  cargaUtilKg: number;
  cargaMinimaInterpoladaKg: number;
  areaMaxPermitidaM2: number;
  normaCarga: string;
  // Validação da Porta x Lado da Cabine
  ladoFacePortaMm: number;
  nomeLadoPorta: string;
  isPortaMenorQueLado: boolean;
  diferencaPortaLadoMm: number;
  montanteFrontalMm: number;
  maxAberturaSugeridaMm: number;
  erroValidacaoPorta?: string;
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
  tipoEntrada: 'Unilateral',
  ladoArcada: 'Lateral',
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
 * Retorna a maior abertura padronizada que seja estritamente menor que o lado da cabine.
 * Faixa técnica padrão: de 100 em 100 mm, começando em 700 mm até 1200 mm.
 */
export function getMaiorAberturaValida(ladoMm: number): string {
  const aberturasNumericas = [700, 800, 900, 1000, 1100, 1200];
  const validas = aberturasNumericas.filter((a) => a < ladoMm);
  if (validas.length > 0) {
    return String(validas[validas.length - 1]);
  }
  return '700';
}

export function calculateElevator(state: ElevatorConfigState): ElevatorCalculationResults {
  const largura = parseInt(state.larguraCabine, 10) || 800;
  const profundidade = parseInt(state.profundidadeCabine, 10) || 1250;
  
  const aberturaMm = parseInt(state.aberturaPorta, 10) || 700;
  // Índice de degrau baseado em 700 mm com passos de 100 mm (0 para 700, 1 para 800, etc.)
  const indexAbertura = Math.max(0, Math.round((aberturaMm - 700) / 100));

  let folgaPorta = 450;
  switch (state.tipoPorta) {
    case '2 Folhas Lateral':
      folgaPorta = 450 + indexAbertura * 60;
      break;
    case '3 Folhas Lateral':
      folgaPorta = 320 + indexAbertura * 45;
      break;
    case '2 Folhas Central':
      folgaPorta = 420 + indexAbertura * 50;
      break;
    case '4 Folhas Central':
      folgaPorta = 280 + indexAbertura * 35;
      break;
    default:
      folgaPorta = 450;
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

  // Cálculo da área útil da cabine (m²)
  const areaCabineM2 = Number(((largura * profundidade) / 1_000_000).toFixed(2));

  // Cálculo de passageiros e carga útil com base na ABNT NBR 16858-1 (Tabelas 6 e 7)
  const numeroPassageiros = calcularPassageirosNBR(areaCabineM2);
  const cargaNBR = calcularCargaUtilNBR(areaCabineM2, numeroPassageiros);

  // Validação: A porta SEMPRE tem que ser menor que o lado da cabine onde ela vai instalada
  const ladoInstalacao: LadoInstalacaoPorta = state.ladoPorta || 'Largura';
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
  const isPortaMenorQueLado = aberturaNum < ladoEfetivoPortaMm;
  const diferencaPortaLadoMm = ladoEfetivoPortaMm - aberturaNum;
  const montanteFrontalMm = Math.max(0, Math.round(diferencaPortaLadoMm / 2));
  const maxAberturaSugeridaMm = parseInt(getMaiorAberturaValida(ladoEfetivoPortaMm), 10);

  const erroValidacaoPorta = !isPortaMenorQueLado
    ? `A porta (${aberturaNum} mm) deve ser estritamente menor que a face da cabine (${ladoEfetivoPortaMm} mm). É necessário espaço para os montantes estruturais e marcos de cabine.`
    : undefined;

  return {
    larguraPoco,
    profundidadePoco,
    folgaPorta,
    espacoChassis,
    menorFolga,
    folgaFrontal,
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
  };
}
