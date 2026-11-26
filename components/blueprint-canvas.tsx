'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ElevatorConfigState,
  ElevatorCalculationResults,
} from '@/lib/elevator-calculator';
import { generateElevatorPdf } from '@/lib/elevator-pdf';
import {
  CompanySettings,
  DEFAULT_COMPANY_SETTINGS,
  loadCompanySettingsFromStorage,
} from '@/lib/company-settings';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
  Copy,
  Check,
  X,
  Eye,
  FileImage,
  Printer,
  Sparkles,
  FileDown,
  Loader2,
  Building2,
  AlertTriangle,
} from 'lucide-react';

interface BlueprintCanvasProps {
  state: ElevatorConfigState;
  results: ElevatorCalculationResults;
  activeTab?: string;
  onOpenBlueprintTab?: () => void;
}

export function BlueprintCanvas({
  state,
  results,
  activeTab,
}: BlueprintCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Configurações da Empresa e Imagem do Logo para o Canvas
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Carrega configurações da empresa e escuta atualizações
  useEffect(() => {
    const loadSettings = () => {
      const current = loadCompanySettingsFromStorage();
      setCompanySettings(current);
    };
    loadSettings();

    window.addEventListener('company-settings-updated', loadSettings);
    return () => window.removeEventListener('company-settings-updated', loadSettings);
  }, []);

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdfClick = async () => {
    setIsGeneratingPdf(true);
    try {
      let dataUrl: string | undefined = undefined;
      try {
        const offCanvas = document.createElement('canvas');
        const exportW = 2400;
        const exportH = 1600;
        offCanvas.width = exportW;
        offCanvas.height = exportH;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          renderBlueprintToContext(offCtx, exportW, exportH, 1, true);
          dataUrl = offCanvas.toDataURL('image/png', 0.95);
        }
      } catch (err) {
        console.warn('Fallback to screen canvas for PDF:', err);
        if (canvasRef.current) {
          dataUrl = canvasRef.current.toDataURL('image/png');
        }
      }

      await generateElevatorPdf({
        state,
        results,
        blueprintDataUrl: dataUrl,
        companySettings,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Core drawing routine that can render to any canvas (on-screen or high-res offscreen)
  const renderBlueprintToContext = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      currentZoom = 1,
      isHighResExport = false
    ) => {
      // Background
      ctx.fillStyle = '#081426';
      ctx.fillRect(0, 0, width, height);

      // Save base state
      ctx.save();

      // Apply zoom if interactive
      if (currentZoom !== 1) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(currentZoom, currentZoom);
        ctx.translate(-width / 2, -height / 2);
      }

      // 1. Technical Grid
      const gridSize = isHighResExport ? 48 : 24;
      for (let x = 0; x <= width; x += gridSize) {
        const isMajor = Math.floor(x / gridSize) % 4 === 0;
        ctx.beginPath();
        ctx.strokeStyle = isMajor
          ? 'rgba(100, 255, 218, 0.16)'
          : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isMajor
          ? isHighResExport
            ? 2.5
            : 1.5
          : isHighResExport
          ? 1.5
          : 0.8;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        const isMajor = Math.floor(y / gridSize) % 4 === 0;
        ctx.beginPath();
        ctx.strokeStyle = isMajor
          ? 'rgba(100, 255, 218, 0.16)'
          : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isMajor
          ? isHighResExport
            ? 2.5
            : 1.5
          : isHighResExport
          ? 1.5
          : 0.8;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Geometry values with safe fallbacks
      const larguraPoco = Number(results.larguraPoco) || 1700;
      const profundidadePoco = Number(results.profundidadePoco) || 1545;
      const larguraCabine = parseFloat(state.larguraCabine) || 800;
      const profundidadeCabine = parseFloat(state.profundidadeCabine) || 1250;
      const aberturaPorta = parseFloat(state.aberturaPorta) || 800;
      const espacoChassis = Number(results.espacoChassis) || 450;
      const menorFolga = Number(results.menorFolga) || 125;
      const numeroPassageiros = results.numeroPassageiros ?? 5;
      const cargaUtilKg = results.cargaUtilKg ?? 375;
      const areaCabineM2 = results.areaCabineM2 ?? 1.0;

      // Margins & Scale calculation
      const isCompact = width < 600 && !isHighResExport;
      const leftPadding = isHighResExport ? 160 : isCompact ? 36 : 64;
      const rightPadding = isHighResExport ? 160 : isCompact ? 36 : 64;
      const topPadding = isHighResExport ? 150 : isCompact ? 54 : 68;
      const bottomPadding = isHighResExport ? 180 : isCompact ? 60 : 86;

      const availW = Math.max(width - (leftPadding + rightPadding), 100);
      const availH = Math.max(height - (topPadding + bottomPadding), 100);

      const scale = Math.min(availW / larguraPoco, availH / profundidadePoco);
      const pocoDrawWidth = larguraPoco * scale;
      const pocoDrawHeight = profundidadePoco * scale;
      const cabineDrawWidth = larguraCabine * scale;
      const cabineDrawHeight = profundidadeCabine * scale;
      const isDoorOnDepth = (state.ladoPorta || 'Largura') === 'Profundidade';
      const ladoFaceMm = isDoorOnDepth ? profundidadeCabine : larguraCabine;
      const ladoEfetivoMm =
        state.tipoEntrada === 'Adjacente'
          ? Math.min(larguraCabine, profundidadeCabine)
          : ladoFaceMm;
      const ladoFaceDraw = isDoorOnDepth ? cabineDrawHeight : cabineDrawWidth;
      const isPortaMenor = aberturaPorta <= ladoEfetivoMm;

      const doorDrawWidth = Math.min(
        aberturaPorta * scale,
        ladoFaceDraw - (isHighResExport ? 8 : 4)
      );
      const espChassisScaled = espacoChassis * scale;

      const pocoLeft = leftPadding + (availW - pocoDrawWidth) / 2;
      const pocoTop = topPadding + (availH - pocoDrawHeight) / 2;
      const wallThickness = isHighResExport ? 22 : isCompact ? 10 : 12;

      const isChassisSide = state.ladoArcada === 'Lateral';
      const isElectric = state.acionamento === 'Elétrico';
      const isSuspension = state.arcada === 'Suspensão';
      const isEntranceOpposite = state.tipoEntrada === 'Oposta';
      const isEntranceAdjacent = state.tipoEntrada === 'Adjacente';

      let cbX: number;
      let cbY: number;

      const folgaFrontalMm = results.folgaFrontal || 210;
      const incluirPortaPavimento = results.incluirPortaPavimento ?? false;
      const portaPavimentoMm = results.portaPavimentoMm ?? 90;
      const folgaEntrePortasMm = results.folgaEntrePortasMm ?? 30;
      const portaPavDraw = incluirPortaPavimento ? portaPavimentoMm * scale : 0;
      const folgaPortasDraw = incluirPortaPavimento ? folgaEntrePortasMm * scale : 0;

      const hasFrontDoor = results.hasFrontDoor ?? (!isDoorOnDepth || isEntranceAdjacent);
      const hasRearDoor = results.hasRearDoor ?? (!isDoorOnDepth && isEntranceOpposite);
      const hasRightDoor = results.hasRightDoor ?? (isDoorOnDepth || isEntranceAdjacent);
      const hasLeftDoor = results.hasLeftDoor ?? (isDoorOnDepth && isEntranceOpposite);

      const folgaEsqScaled = (results.folgaEsquerda ?? espacoChassis) * scale;
      const folgaDirScaled = (results.folgaDireita ?? menorFolga) * scale;
      const folgaFrenteScaled = (results.folgaFrontalParede ?? folgaFrontalMm) * scale;
      const folgaFundoScaled = (results.folgaFundoParede ?? (state.customFolgaFundo ?? 120)) * scale;

      if (isChassisSide) {
        // Chassis na lateral esquerda
        cbX = pocoLeft + folgaEsqScaled;
        if (cbX + cabineDrawWidth > pocoLeft + pocoDrawWidth) {
          cbX = pocoLeft + Math.max(0, (pocoDrawWidth - cabineDrawWidth) / 2);
        }

        // Posição Y: alinha pela parede frontal quando há porta frontal
        if (hasFrontDoor) {
          const targetCbBottom = pocoTop + pocoDrawHeight - folgaFrenteScaled;
          cbY = targetCbBottom - cabineDrawHeight;
        } else {
          cbY = pocoTop + (pocoDrawHeight - cabineDrawHeight) / 2;
        }
        if (cbY < pocoTop) {
          cbY = pocoTop + Math.max(0, (pocoDrawHeight - cabineDrawHeight) / 2);
        }
      } else {
        // Chassis no fundo (parede traseira / superior)
        if (hasRightDoor && !hasLeftDoor) {
          cbX = pocoLeft + pocoDrawWidth - folgaDirScaled - cabineDrawWidth;
          if (cbX < pocoLeft) {
            cbX = pocoLeft + Math.max(0, (pocoDrawWidth - cabineDrawWidth) / 2);
          }
        } else if (hasLeftDoor && !hasRightDoor) {
          cbX = pocoLeft + folgaEsqScaled;
          if (cbX + cabineDrawWidth > pocoLeft + pocoDrawWidth) {
            cbX = pocoLeft + Math.max(0, (pocoDrawWidth - cabineDrawWidth) / 2);
          }
        } else {
          cbX = pocoLeft + (pocoDrawWidth - cabineDrawWidth) / 2;
        }
        cbY = pocoTop + folgaFundoScaled;
        if (cbY + cabineDrawHeight > pocoTop + pocoDrawHeight) {
          cbY = pocoTop + Math.max(0, (pocoDrawHeight - cabineDrawHeight) / 2);
        }
      }

      const cbRight = cbX + cabineDrawWidth;
      const cbBottom = cbY + cabineDrawHeight;
      const cbCenterX = cbX + cabineDrawWidth / 2;
      const cbCenterY = cbY + cabineDrawHeight / 2;

      // 2. Concrete Walls with Hatching
      ctx.fillStyle = 'rgba(100, 255, 218, 0.08)';
      ctx.fillRect(
        pocoLeft - wallThickness,
        pocoTop - wallThickness,
        pocoDrawWidth + wallThickness * 2,
        pocoDrawHeight + wallThickness * 2
      );

      ctx.fillStyle = '#081426';
      ctx.fillRect(pocoLeft, pocoTop, pocoDrawWidth, pocoDrawHeight);

      // Hatching lines on concrete walls
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        pocoLeft - wallThickness,
        pocoTop - wallThickness,
        pocoDrawWidth + wallThickness * 2,
        pocoDrawHeight + wallThickness * 2
      );
      ctx.rect(pocoLeft, pocoTop, pocoDrawWidth, pocoDrawHeight);
      ctx.clip('evenodd');

      ctx.strokeStyle = 'rgba(100, 255, 218, 0.18)';
      ctx.lineWidth = isHighResExport ? 1.8 : 1;
      const hatchStep = isHighResExport ? 18 : 10;
      const totalSpan = pocoDrawWidth + pocoDrawHeight + wallThickness * 4;
      for (let i = -pocoDrawHeight; i < totalSpan; i += hatchStep) {
        ctx.beginPath();
        ctx.moveTo(pocoLeft - wallThickness + i, pocoTop - wallThickness);
        ctx.lineTo(
          pocoLeft - wallThickness + i + (isHighResExport ? 40 : 24),
          pocoTop - wallThickness + (isHighResExport ? 40 : 24)
        );
        ctx.stroke();
      }
      ctx.restore();

      // Wall outlines
      ctx.strokeStyle = '#90CDF4';
      ctx.lineWidth = isHighResExport ? 2.5 : 1.5;
      ctx.strokeRect(
        pocoLeft - wallThickness,
        pocoTop - wallThickness,
        pocoDrawWidth + wallThickness * 2,
        pocoDrawHeight + wallThickness * 2
      );

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = isHighResExport ? 4 : 2.5;
      ctx.strokeRect(pocoLeft, pocoTop, pocoDrawWidth, pocoDrawHeight);

      // 3. Door Openings in Walls (Cutouts)
      const frontDoorLeft = cbX + (cabineDrawWidth - doorDrawWidth) / 2;
      const sideDoorTop = cbY + (cabineDrawHeight - doorDrawWidth) / 2;

      // Front Wall Cutout (Bottom)
      if (hasFrontDoor) {
        ctx.fillStyle = '#081426';
        ctx.fillRect(
          frontDoorLeft,
          pocoTop + pocoDrawHeight - 1.5,
          doorDrawWidth,
          wallThickness + 6
        );
      }

      // Rear Wall Cutout (Top)
      if (hasRearDoor) {
        ctx.fillStyle = '#081426';
        ctx.fillRect(
          frontDoorLeft,
          pocoTop - wallThickness - 3,
          doorDrawWidth,
          wallThickness + 6
        );
      }

      // Right Side Wall Cutout
      if (hasRightDoor) {
        ctx.fillStyle = '#081426';
        ctx.fillRect(
          pocoLeft + pocoDrawWidth - 1.5,
          sideDoorTop,
          wallThickness + 6,
          doorDrawWidth
        );
      }

      // Left Side Wall Cutout
      if (hasLeftDoor) {
        ctx.fillStyle = '#081426';
        ctx.fillRect(
          pocoLeft - wallThickness - 3,
          sideDoorTop,
          wallThickness + 6,
          doorDrawWidth
        );
      }

      // Helper functions for components
      const drawGuideRail = (
        rx: number,
        ry: number,
        angleDeg: number,
        color = '#ECEFF1'
      ) => {
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate((angleDeg * Math.PI) / 180);
        ctx.fillStyle = color;
        const rw = isHighResExport ? 9 : 5;
        const rh = isHighResExport ? 13 : 7;
        ctx.fillRect(-rw / 2, 0, rw, rh);
        ctx.fillRect(-rw, rh, rw * 2, rh / 2.2);
        ctx.restore();
      };

      const drawCounterweight = (
        cx: number,
        cy: number,
        cw: number,
        ch: number,
        color: string
      ) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = isHighResExport ? 3.5 : 2;
        ctx.strokeRect(cx, cy, cw, ch);

        const divisions = 3;
        const step = ch / divisions;
        ctx.strokeStyle = `${color}99`;
        ctx.lineWidth = isHighResExport ? 2 : 1;
        for (let i = 1; i < divisions; i++) {
          ctx.beginPath();
          ctx.moveTo(cx, cy + i * step);
          ctx.lineTo(cx + cw, cy + i * step);
          ctx.stroke();
        }

        // Diagonal cross
        ctx.strokeStyle = `${color}CC`;
        ctx.lineWidth = isHighResExport ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + cw, cy + ch);
        ctx.moveTo(cx + cw, cy);
        ctx.lineTo(cx, cy + ch);
        ctx.stroke();
      };

      const drawHydraulicPiston = (
        centerX: number,
        centerY: number,
        radius: number,
        color: string
      ) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = isHighResExport ? 3.5 : 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `${color}88`;
        ctx.lineWidth = isHighResExport ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, isHighResExport ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX - radius * 1.3, centerY);
        ctx.lineTo(centerX + radius * 1.3, centerY);
        ctx.stroke();
      };

      // 4. Drive Elements: Counterweight vs Hydraulic
      const accentOrange = '#FFAB40';
      const hydraulicBlue = '#00E5FF';
      let driveCenterX = 0;
      let driveCenterY = 0;

      if (isChassisSide) {
        const spaceX = cbX - pocoLeft;
        driveCenterX = pocoLeft + spaceX / 2;
        driveCenterY =
          state.posicao === 'Deslocado'
            ? pocoTop + pocoDrawHeight * 0.28
            : cbCenterY;

        if (isElectric) {
          const cpWidth = Math.max(
            isHighResExport ? 28 : 16,
            Math.min(spaceX * 0.42, isHighResExport ? 52 : 28)
          );
          const cpHeight = Math.max(
            isHighResExport ? 70 : 40,
            Math.min(cabineDrawHeight * 0.65, isHighResExport ? 200 : 120)
          );
          const cpLeft = driveCenterX - cpWidth / 2;
          const cpTop = driveCenterY - cpHeight / 2;
          drawCounterweight(cpLeft, cpTop, cpWidth, cpHeight, accentOrange);
          drawGuideRail(driveCenterX, cpTop, 0);
          drawGuideRail(driveCenterX, cpTop + cpHeight, 180);
        } else {
          const pistonRadius = Math.max(
            isHighResExport ? 18 : 10,
            Math.min(spaceX * 0.28, isHighResExport ? 38 : 22)
          );
          drawHydraulicPiston(
            driveCenterX,
            driveCenterY,
            pistonRadius,
            hydraulicBlue
          );
          drawGuideRail(driveCenterX, driveCenterY - pistonRadius - 4, 0);
          drawGuideRail(driveCenterX, driveCenterY + pistonRadius + 4, 180);
        }
      } else {
        const spaceY = cbY - pocoTop;
        driveCenterY = pocoTop + spaceY / 2;
        driveCenterX =
          state.posicao === 'Deslocado'
            ? pocoLeft + pocoDrawWidth * 0.25
            : cbCenterX;

        if (isElectric) {
          const cpWidth = Math.max(
            isHighResExport ? 70 : 40,
            Math.min(cabineDrawWidth * 0.65, isHighResExport ? 240 : 140)
          );
          const cpHeight = Math.max(
            isHighResExport ? 28 : 16,
            Math.min(spaceY * 0.45, isHighResExport ? 50 : 28)
          );
          const cpLeft = driveCenterX - cpWidth / 2;
          const cpTop = driveCenterY - cpHeight / 2;
          drawCounterweight(cpLeft, cpTop, cpWidth, cpHeight, accentOrange);
          drawGuideRail(cpLeft, driveCenterY, -90);
          drawGuideRail(cpLeft + cpWidth, driveCenterY, 90);
        } else {
          const pistonRadius = Math.max(
            isHighResExport ? 18 : 10,
            Math.min(spaceY * 0.32, isHighResExport ? 38 : 22)
          );
          drawHydraulicPiston(
            driveCenterX,
            driveCenterY,
            pistonRadius,
            hydraulicBlue
          );
          drawGuideRail(driveCenterX - pistonRadius - 4, driveCenterY, -90);
          drawGuideRail(driveCenterX + pistonRadius + 4, driveCenterY, 90);
        }
      }

      // 5. Arcada / Sling Structure
      const slingColor = 'rgba(100, 255, 218, 0.85)';
      ctx.strokeStyle = slingColor;
      ctx.lineWidth = isHighResExport ? 4.5 : 2.5;

      if (isSuspension) {
        ctx.beginPath();
        ctx.moveTo(cbX - 4, cbCenterY);
        ctx.lineTo(cbRight + 4, cbCenterY);
        ctx.stroke();

        drawGuideRail(cbX, cbCenterY, -90);
        drawGuideRail(cbRight, cbCenterY, 90);
      } else {
        if (isChassisSide) {
          ctx.strokeRect(
            cbX - 4,
            cbCenterY - (isHighResExport ? 24 : 14),
            isHighResExport ? 14 : 8,
            isHighResExport ? 48 : 28
          );
          ctx.beginPath();
          ctx.moveTo(cbX, cbCenterY - (isHighResExport ? 24 : 14));
          ctx.lineTo(
            cbX + cabineDrawWidth * 0.6,
            cbCenterY - (isHighResExport ? 24 : 14)
          );
          ctx.moveTo(cbX, cbCenterY + (isHighResExport ? 24 : 14));
          ctx.lineTo(
            cbX + cabineDrawWidth * 0.6,
            cbCenterY + (isHighResExport ? 24 : 14)
          );
          ctx.stroke();

          drawGuideRail(cbX, cbCenterY - (isHighResExport ? 24 : 14), -90);
          drawGuideRail(cbX, cbCenterY + (isHighResExport ? 24 : 14), -90);
        } else {
          ctx.strokeRect(
            cbCenterX - (isHighResExport ? 24 : 14),
            cbY - 4,
            isHighResExport ? 48 : 28,
            isHighResExport ? 14 : 8
          );
          ctx.beginPath();
          ctx.moveTo(cbCenterX - (isHighResExport ? 24 : 14), cbY);
          ctx.lineTo(
            cbCenterX - (isHighResExport ? 24 : 14),
            cbY + cabineDrawHeight * 0.6
          );
          ctx.moveTo(cbCenterX + (isHighResExport ? 24 : 14), cbY);
          ctx.lineTo(
            cbCenterX + (isHighResExport ? 24 : 14),
            cbY + cabineDrawHeight * 0.6
          );
          ctx.stroke();

          drawGuideRail(cbCenterX - (isHighResExport ? 24 : 14), cbY, 0);
          drawGuideRail(cbCenterX + (isHighResExport ? 24 : 14), cbY, 0);
        }
      }

      // 6. Cabin Walls and Interior (per-wall openings for any active door)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = isHighResExport ? 4.5 : 2.5;

      const horizMontanteDraw = Math.max(0, (cabineDrawWidth - doorDrawWidth) / 2);
      const vertMontanteDraw = Math.max(0, (cabineDrawHeight - doorDrawWidth) / 2);
      const mThick = isHighResExport ? 8 : 4;

      // Bottom (Front) cabin wall
      ctx.beginPath();
      if (hasFrontDoor) {
        ctx.moveTo(cbX, cbBottom);
        ctx.lineTo(frontDoorLeft, cbBottom);
        ctx.moveTo(frontDoorLeft + doorDrawWidth, cbBottom);
        ctx.lineTo(cbRight, cbBottom);
      } else {
        ctx.moveTo(cbX, cbBottom);
        ctx.lineTo(cbRight, cbBottom);
      }
      ctx.stroke();
      if (hasFrontDoor && horizMontanteDraw > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(cbX, cbBottom - mThick, horizMontanteDraw, mThick);
        ctx.fillRect(cbRight - horizMontanteDraw, cbBottom - mThick, horizMontanteDraw, mThick);
      }

      // Top (Rear) cabin wall
      ctx.beginPath();
      if (hasRearDoor) {
        ctx.moveTo(cbX, cbY);
        ctx.lineTo(frontDoorLeft, cbY);
        ctx.moveTo(frontDoorLeft + doorDrawWidth, cbY);
        ctx.lineTo(cbRight, cbY);
      } else {
        ctx.moveTo(cbX, cbY);
        ctx.lineTo(cbRight, cbY);
      }
      ctx.stroke();
      if (hasRearDoor && horizMontanteDraw > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(cbX, cbY, horizMontanteDraw, mThick);
        ctx.fillRect(cbRight - horizMontanteDraw, cbY, horizMontanteDraw, mThick);
      }

      // Right cabin wall
      ctx.beginPath();
      if (hasRightDoor) {
        ctx.moveTo(cbRight, cbY);
        ctx.lineTo(cbRight, sideDoorTop);
        ctx.moveTo(cbRight, sideDoorTop + doorDrawWidth);
        ctx.lineTo(cbRight, cbBottom);
      } else {
        ctx.moveTo(cbRight, cbY);
        ctx.lineTo(cbRight, cbBottom);
      }
      ctx.stroke();
      if (hasRightDoor && vertMontanteDraw > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(cbRight - mThick, cbY, mThick, vertMontanteDraw);
        ctx.fillRect(cbRight - mThick, cbBottom - vertMontanteDraw, mThick, vertMontanteDraw);
      }

      // Left cabin wall
      ctx.beginPath();
      if (hasLeftDoor) {
        ctx.moveTo(cbX, cbY);
        ctx.lineTo(cbX, sideDoorTop);
        ctx.moveTo(cbX, sideDoorTop + doorDrawWidth);
        ctx.lineTo(cbX, cbBottom);
      } else {
        ctx.moveTo(cbX, cbY);
        ctx.lineTo(cbX, cbBottom);
      }
      ctx.stroke();
      if (hasLeftDoor && vertMontanteDraw > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(cbX, cbY, mThick, vertMontanteDraw);
        ctx.fillRect(cbX, cbBottom - vertMontanteDraw, mThick, vertMontanteDraw);
      }

      // Inner cyan finish
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.55)';
      ctx.lineWidth = isHighResExport ? 2 : 1;
      ctx.strokeRect(
        cbX + (isHighResExport ? 4 : 2.5),
        cbY + (isHighResExport ? 4 : 2.5),
        cabineDrawWidth - (isHighResExport ? 8 : 5),
        cabineDrawHeight - (isHighResExport ? 8 : 5)
      );

      // Center Crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = isHighResExport ? 2 : 1;
      const chSize = isHighResExport ? 14 : 8;
      ctx.beginPath();
      ctx.moveTo(cbCenterX - chSize, cbCenterY);
      ctx.lineTo(cbCenterX + chSize, cbCenterY);
      ctx.moveTo(cbCenterX, cbCenterY - chSize);
      ctx.lineTo(cbCenterX, cbCenterY + chSize);
      ctx.stroke();

      const landingDoorStrokeColor = incluirPortaPavimento ? '#FBBF24' : '#B0BEC5';

      // 7. Doors (Sliding Leaves) & Landing Door Sill Zone (90 + 30 mm)
      const drawLandingDoorZone = (
        zoneX: number,
        zoneY: number,
        zoneW: number,
        zoneH: number,
        gapLine: { x1: number; y1: number; x2: number; y2: number },
        labelText?: string,
        labelPos?: { x: number; y: number; align?: CanvasTextAlign }
      ) => {
        if (!incluirPortaPavimento || zoneW <= 0 || zoneH <= 0) return;
        ctx.save();
        // Faixa da porta de pavimento (90 mm) no interior do poço
        ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
        ctx.fillRect(zoneX, zoneY, zoneW, zoneH);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)';
        ctx.lineWidth = isHighResExport ? 2 : 1;
        ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);

        // Linha tracejada da folga entre portas (30 mm)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = isHighResExport ? 1.5 : 0.9;
        ctx.setLineDash(isHighResExport ? [6, 4] : [3, 2]);
        ctx.beginPath();
        ctx.moveTo(gapLine.x1, gapLine.y1);
        ctx.lineTo(gapLine.x2, gapLine.y2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (labelText && labelPos) {
          ctx.fillStyle = '#FBBF24';
          ctx.font = isHighResExport
            ? 'bold 14px ui-monospace, monospace'
            : 'bold 8.5px ui-monospace, monospace';
          ctx.textAlign = labelPos.align ?? 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, labelPos.x, labelPos.y);
        }
        ctx.restore();
      };

      const sentidoAbertura = results.sentidoAberturaPorta || 'Direita';
      const recolhimentoDraw = !incluirPortaPavimento ? results.folgaPorta * scale : 0;

      const drawSlidingDoors = (
        doorType: string,
        doorStart: number,
        doorWidth: number,
        cabY: number,
        landY: number,
        isVertical: boolean
      ) => {
        const numLeaves = doorType.includes('6 Folhas')
          ? 6
          : doorType.includes('4 Folhas')
          ? 4
          : doorType.includes('3 Folhas')
          ? 3
          : 2;
        const isCentral = doorType.includes('Central') || sentidoAbertura === 'Central';
        const isLeftOpen = !isCentral && sentidoAbertura === 'Esquerda';

        ctx.save();
        const leafThick = isHighResExport ? 4 : 2.5;
        const stepDist = isHighResExport ? 4.2 : 2.3;

        // Draw door retraction pocket / occupied width envelope (when Porta Normal)
        if (!incluirPortaPavimento && recolhimentoDraw > 0) {
          const bandThick = Math.max(isHighResExport ? 16 : 8, Math.abs(landY - cabY) * 0.55);

          const drawPocketRect = (rx: number, ry: number, rw: number, rh: number) => {
            const eps = 0.5;
            const collidesWall = !isVertical
              ? rx < pocoLeft - eps || rx + rw > pocoLeft + pocoDrawWidth + eps
              : ry < pocoTop - eps || ry + rh > pocoTop + pocoDrawHeight + eps;

            ctx.fillStyle = collidesWall
              ? 'rgba(239, 68, 68, 0.34)'
              : 'rgba(56, 189, 248, 0.14)';
            ctx.strokeStyle = collidesWall ? '#EF4444' : '#38BDF8';
            ctx.lineWidth = collidesWall
              ? isHighResExport
                ? 2.8
                : 1.8
              : isHighResExport
              ? 1.5
              : 1;
            ctx.setLineDash(isHighResExport ? [6, 4] : [3, 2]);
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeRect(rx, ry, rw, rh);
            ctx.setLineDash([]);

            if (collidesWall) {
              ctx.fillStyle = '#FCA5A5';
              ctx.font = isHighResExport
                ? 'bold 13px ui-monospace, monospace'
                : 'bold 7.5px ui-monospace, monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✕ COLISÃO', rx + rw / 2, ry + rh / 2);
            }
          };

          if (!isVertical) {
            const bandY = Math.min(cabY, landY) + Math.abs(landY - cabY) * 0.18;
            if (isCentral) {
              const halfPocket = recolhimentoDraw / 2;
              drawPocketRect(doorStart - halfPocket, bandY, halfPocket, bandThick);
              drawPocketRect(doorStart + doorWidth, bandY, halfPocket, bandThick);
            } else if (isLeftOpen) {
              drawPocketRect(doorStart - recolhimentoDraw, bandY, recolhimentoDraw, bandThick);
            } else {
              drawPocketRect(doorStart + doorWidth, bandY, recolhimentoDraw, bandThick);
            }
          } else {
            const bandX = Math.min(cabY, landY) + Math.abs(landY - cabY) * 0.18;
            if (isCentral) {
              const halfPocket = recolhimentoDraw / 2;
              drawPocketRect(bandX, doorStart - halfPocket, bandThick, halfPocket);
              drawPocketRect(bandX, doorStart + doorWidth, bandThick, halfPocket);
            } else if (isLeftOpen) {
              drawPocketRect(bandX, doorStart - recolhimentoDraw, bandThick, recolhimentoDraw);
            } else {
              drawPocketRect(bandX, doorStart + doorWidth, bandThick, recolhimentoDraw);
            }
          }
        }

        if (!isVertical) {
          if (isCentral) {
            const halfWidth = doorWidth / 2;
            const perSide = Math.max(1, Math.floor(numLeaves / 2));
            const leafWidth = halfWidth / perSide;
            for (let i = 0; i < perSide; i++) {
              const step = i * stepDist;
              const lx1 = doorStart + i * leafWidth;
              const lx2 = lx1 + leafWidth - (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(lx1, cabY + 2 + step);
              ctx.lineTo(lx2, cabY + 2 + step);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(lx1, landY + step);
              ctx.lineTo(lx2, landY + step);
              ctx.stroke();

              const rx2 = doorStart + doorWidth - i * leafWidth;
              const rx1 = rx2 - leafWidth + (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.beginPath();
              ctx.moveTo(rx1, cabY + 2 + step);
              ctx.lineTo(rx2, cabY + 2 + step);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(rx1, landY + step);
              ctx.lineTo(rx2, landY + step);
              ctx.stroke();
            }
          } else {
            const leafWidth = doorWidth / numLeaves;
            for (let i = 0; i < numLeaves; i++) {
              const step = (isLeftOpen ? numLeaves - 1 - i : i) * stepDist;
              const x1 = doorStart + i * leafWidth;
              const x2 = x1 + leafWidth - (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(x1, cabY + 2 + step);
              ctx.lineTo(x2, cabY + 2 + step);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(x1, landY + step);
              ctx.lineTo(x2, landY + step);
              ctx.stroke();
            }
          }

          // Directional opening indicator text
          const dirText = isCentral ? '← →' : isLeftOpen ? '← ESQ' : 'DIR →';
          ctx.fillStyle = '#38BDF8';
          ctx.font = isHighResExport
            ? 'bold 14px ui-monospace, monospace'
            : 'bold 8.5px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const midY = (cabY + landY) / 2;
          ctx.fillText(dirText, doorStart + doorWidth / 2, midY);
        } else {
          if (isCentral) {
            const halfHeight = doorWidth / 2;
            const perSide = Math.max(1, Math.floor(numLeaves / 2));
            const leafHeight = halfHeight / perSide;
            for (let i = 0; i < perSide; i++) {
              const step = i * stepDist;
              const ty1 = doorStart + i * leafHeight;
              const ty2 = ty1 + leafHeight - (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(cabY + 2 + step, ty1);
              ctx.lineTo(cabY + 2 + step, ty2);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(landY + step, ty1);
              ctx.lineTo(landY + step, ty2);
              ctx.stroke();

              const by2 = doorStart + doorWidth - i * leafHeight;
              const by1 = by2 - leafHeight + (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.beginPath();
              ctx.moveTo(cabY + 2 + step, by1);
              ctx.lineTo(cabY + 2 + step, by2);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(landY + step, by1);
              ctx.lineTo(landY + step, by2);
              ctx.stroke();
            }
          } else {
            const leafHeight = doorWidth / numLeaves;
            for (let i = 0; i < numLeaves; i++) {
              const step = (isLeftOpen ? numLeaves - 1 - i : i) * stepDist;
              const y1 = doorStart + i * leafHeight;
              const y2 = y1 + leafHeight - (isHighResExport ? 2.5 : 1.5);
              ctx.strokeStyle = '#64FFDA';
              ctx.lineWidth = leafThick;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(cabY + 2 + step, y1);
              ctx.lineTo(cabY + 2 + step, y2);
              ctx.stroke();

              ctx.strokeStyle = landingDoorStrokeColor;
              ctx.lineWidth = leafThick * 0.85;
              ctx.beginPath();
              ctx.moveTo(landY + step, y1);
              ctx.lineTo(landY + step, y2);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      };

      // Door rendering on every active door wall
      if (hasFrontDoor) {
        const frontLandY = incluirPortaPavimento
          ? pocoTop + pocoDrawHeight - portaPavDraw * 0.55
          : pocoTop + pocoDrawHeight + wallThickness / 2;
        if (incluirPortaPavimento) {
          const bandLeft = Math.max(pocoLeft + 2, cbX - (isHighResExport ? 10 : 5));
          const bandRight = Math.min(pocoLeft + pocoDrawWidth - 2, cbRight + (isHighResExport ? 10 : 5));
          const bandTop = pocoTop + pocoDrawHeight - portaPavDraw;
          drawLandingDoorZone(
            bandLeft,
            bandTop,
            bandRight - bandLeft,
            portaPavDraw,
            {
              x1: bandLeft,
              y1: bandTop - folgaPortasDraw,
              x2: bandRight,
              y2: bandTop - folgaPortasDraw,
            },
            `P.PAV ${portaPavimentoMm}+${folgaEntrePortasMm}mm`,
            {
              x: pocoLeft + (isHighResExport ? 10 : 5),
              y: bandTop + portaPavDraw / 2,
              align: 'left',
            }
          );
        }
        drawSlidingDoors(
          state.tipoPorta,
          frontDoorLeft,
          doorDrawWidth,
          cbBottom,
          frontLandY,
          false
        );
      }

      if (hasRearDoor) {
        const rearLandY = incluirPortaPavimento
          ? pocoTop + portaPavDraw * 0.45
          : pocoTop - wallThickness / 2;
        if (incluirPortaPavimento) {
          const bandLeft = Math.max(pocoLeft + 2, cbX - (isHighResExport ? 10 : 5));
          const bandRight = Math.min(pocoLeft + pocoDrawWidth - 2, cbRight + (isHighResExport ? 10 : 5));
          drawLandingDoorZone(
            bandLeft,
            pocoTop,
            bandRight - bandLeft,
            portaPavDraw,
            {
              x1: bandLeft,
              y1: pocoTop + portaPavDraw + folgaPortasDraw,
              x2: bandRight,
              y2: pocoTop + portaPavDraw + folgaPortasDraw,
            }
          );
        }
        drawSlidingDoors(
          state.tipoPorta,
          frontDoorLeft,
          doorDrawWidth,
          cbY,
          rearLandY,
          false
        );
      }

      if (hasRightDoor) {
        const sideLandX = incluirPortaPavimento
          ? pocoLeft + pocoDrawWidth - portaPavDraw * 0.55
          : pocoLeft + pocoDrawWidth + wallThickness / 2;
        if (incluirPortaPavimento) {
          const bandTop = Math.max(pocoTop + 2, cbY - (isHighResExport ? 10 : 5));
          const bandBottom = Math.min(pocoTop + pocoDrawHeight - 2, cbBottom + (isHighResExport ? 10 : 5));
          const bandLeft = pocoLeft + pocoDrawWidth - portaPavDraw;
          drawLandingDoorZone(
            bandLeft,
            bandTop,
            portaPavDraw,
            bandBottom - bandTop,
            {
              x1: bandLeft - folgaPortasDraw,
              y1: bandTop,
              x2: bandLeft - folgaPortasDraw,
              y2: bandBottom,
            },
            !hasFrontDoor ? `P.PAV ${portaPavimentoMm}+${folgaEntrePortasMm}` : undefined,
            !hasFrontDoor
              ? {
                  x: pocoLeft + pocoDrawWidth - (isHighResExport ? 6 : 3),
                  y: pocoTop + (isHighResExport ? 16 : 9),
                  align: 'right',
                }
              : undefined
          );
        }
        drawSlidingDoors(
          state.tipoPorta,
          sideDoorTop,
          doorDrawWidth,
          cbRight,
          sideLandX,
          true
        );
      }

      if (hasLeftDoor) {
        const leftLandX = incluirPortaPavimento
          ? pocoLeft + portaPavDraw * 0.45
          : pocoLeft - wallThickness / 2;
        if (incluirPortaPavimento) {
          const bandTop = Math.max(pocoTop + 2, cbY - (isHighResExport ? 10 : 5));
          const bandBottom = Math.min(pocoTop + pocoDrawHeight - 2, cbBottom + (isHighResExport ? 10 : 5));
          drawLandingDoorZone(
            pocoLeft,
            bandTop,
            portaPavDraw,
            bandBottom - bandTop,
            {
              x1: pocoLeft + portaPavDraw + folgaPortasDraw,
              y1: bandTop,
              x2: pocoLeft + portaPavDraw + folgaPortasDraw,
              y2: bandBottom,
            }
          );
        }
        drawSlidingDoors(
          state.tipoPorta,
          sideDoorTop,
          doorDrawWidth,
          cbX,
          leftLandX,
          true
        );
      }

      // 8. Technical Cotas & Dimensions
      const drawDim = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        label: string,
        isHoriz: boolean,
        offsetPx: number,
        color = '#FFFFFF',
        font = isHighResExport
          ? 'bold 18px ui-monospace, monospace'
          : '10px ui-monospace, monospace'
      ) => {
        const tick = isHighResExport ? 7 : 4;
        ctx.save();
        ctx.font = font;

        if (isHoriz) {
          const y = y1 + offsetPx;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = isHighResExport ? 1.8 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();

          ctx.strokeStyle = color;
          ctx.lineWidth = isHighResExport ? 2.8 : 1.5;
          ctx.beginPath();
          ctx.moveTo(x1 - tick, y + tick);
          ctx.lineTo(x1 + tick, y - tick);
          ctx.moveTo(x2 - tick, y + tick);
          ctx.lineTo(x2 + tick, y - tick);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isHighResExport ? 1.2 : 0.8;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1, y);
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2, y);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = offsetPx > 0 ? 'top' : 'bottom';
          ctx.fillText(label, (x1 + x2) / 2, y + (offsetPx > 0 ? 3 : -3));
        } else {
          const x = x1 + offsetPx;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = isHighResExport ? 1.8 : 1;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          ctx.strokeStyle = color;
          ctx.lineWidth = isHighResExport ? 2.8 : 1.5;
          ctx.beginPath();
          ctx.moveTo(x - tick, y1 + tick);
          ctx.lineTo(x + tick, y1 - tick);
          ctx.moveTo(x - tick, y2 + tick);
          ctx.lineTo(x + tick, y2 - tick);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isHighResExport ? 1.2 : 0.8;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x, y1);
          ctx.moveTo(x2, y2);
          ctx.lineTo(x, y2);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.textAlign = offsetPx > 0 ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, x + (offsetPx > 0 ? 5 : -5), (y1 + y2) / 2);
        }
        ctx.restore();
      };

      const cotaOffset = isHighResExport ? -38 : isCompact ? -18 : -22;
      const cotaOffsetPos = isHighResExport ? 34 : isCompact ? 14 : 18;

      // Shaft Dimensions
      drawDim(
        pocoLeft,
        pocoTop,
        pocoLeft + pocoDrawWidth,
        pocoTop,
        `LP: ${larguraPoco} mm`,
        true,
        cotaOffset,
        '#64FFDA',
        isHighResExport
          ? 'bold 20px ui-monospace, monospace'
          : 'bold 11px ui-monospace, monospace'
      );
      drawDim(
        pocoLeft,
        pocoTop,
        pocoLeft,
        pocoTop + pocoDrawHeight,
        `PP: ${profundidadePoco} mm`,
        false,
        cotaOffset,
        '#64FFDA',
        isHighResExport
          ? 'bold 20px ui-monospace, monospace'
          : 'bold 11px ui-monospace, monospace'
      );

      // Cabin Dimensions
      drawDim(
        cbX,
        cbBottom,
        cbRight,
        cbBottom,
        `LC: ${state.larguraCabine} mm`,
        true,
        cotaOffsetPos,
        '#FFFFFF',
        isHighResExport
          ? 'bold 17px ui-monospace, monospace'
          : '10px ui-monospace, monospace'
      );
      drawDim(
        cbRight,
        cbY,
        cbRight,
        cbBottom,
        `PC: ${state.profundidadeCabine} mm`,
        false,
        cotaOffsetPos,
        '#FFFFFF',
        isHighResExport
          ? 'bold 17px ui-monospace, monospace'
          : '10px ui-monospace, monospace'
      );

      // Door Opening
      if (!isDoorOnDepth) {
        drawDim(
          frontDoorLeft,
          cbBottom,
          frontDoorLeft + doorDrawWidth,
          cbBottom,
          `VA: ${state.aberturaPorta} mm`,
          true,
          isHighResExport ? 68 : isCompact ? 28 : 36,
          isPortaMenor ? '#FFAB40' : '#EF4444',
          isHighResExport
            ? 'bold 17px ui-monospace, monospace'
            : 'bold 10px ui-monospace, monospace'
        );
      } else {
        drawDim(
          cbRight,
          sideDoorTop,
          cbRight,
          sideDoorTop + doorDrawWidth,
          `VA: ${state.aberturaPorta} mm`,
          false,
          isHighResExport ? 68 : isCompact ? 28 : 36,
          isPortaMenor ? '#FFAB40' : '#EF4444',
          isHighResExport
            ? 'bold 17px ui-monospace, monospace'
            : 'bold 10px ui-monospace, monospace'
        );
      }

      // Cabin Center Text
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#64FFDA';
      ctx.font = isHighResExport
        ? 'bold 20px system-ui, sans-serif'
        : 'bold 11px system-ui, sans-serif';
      ctx.fillText(
        'CABINE',
        cbCenterX,
        cbCenterY - (isHighResExport ? 30 : 18)
      );

      ctx.fillStyle = '#A7F3D0';
      ctx.font = isHighResExport
        ? 'bold 17px ui-monospace, monospace'
        : 'bold 9.5px ui-monospace, monospace';
      ctx.fillText(
        `${numeroPassageiros} PASS. | ${cargaUtilKg} kg`,
        cbCenterX,
        cbCenterY - (isHighResExport ? 8 : 4)
      );

      ctx.fillStyle = '#94A3B8';
      ctx.font = isHighResExport
        ? '14px ui-monospace, monospace'
        : '8px ui-monospace, monospace';
      ctx.fillText(
        `Área: ${areaCabineM2.toFixed(2)} m² (NBR 16858-1)`,
        cbCenterX,
        cbCenterY + (isHighResExport ? 15 : 9)
      );

      const driveLabelText = isElectric
        ? 'C.P. (CONTRAPESO)'
        : 'PISTÃO HIDRÁULICO';
      ctx.fillStyle = isElectric ? '#FFAB40' : '#00E5FF';
      ctx.font = isHighResExport
        ? 'bold 15px system-ui, sans-serif'
        : 'bold 9px system-ui, sans-serif';
      ctx.fillText(driveLabelText, driveCenterX, driveCenterY);
      ctx.restore();

      // Marca d'água com o Logotipo da Empresa no fundo da planta baixa
      if (companySettings.enableWatermark && logoImageRef.current) {
        ctx.save();
        const logoImg = logoImageRef.current;
        const opacity = Math.max(0.04, Math.min(0.28, companySettings.watermarkOpacity || 0.12));
        ctx.globalAlpha = opacity;

        const maxWm = isHighResExport ? 760 : Math.min(width, height) * 0.5;
        const aspect = logoImg.width / (logoImg.height || 1);
        let wmW = maxWm;
        let wmH = maxWm / aspect;
        if (wmH > maxWm) {
          wmH = maxWm;
          wmW = maxWm * aspect;
        }
        const wmX = (width - wmW) / 2;
        const wmY = (height - wmH) / 2;
        ctx.drawImage(logoImg, wmX, wmY, wmW, wmH);
        ctx.restore();
      }

      ctx.restore(); // Restore zoom scale

      // 9. Technical Title Block (Carimbo Arquitetônico)
      const tbWidth = isHighResExport ? 500 : isCompact ? 230 : 285;
      const tbHeight = isHighResExport ? 180 : isCompact ? 88 : 104;
      const tbLeft = width - tbWidth - (isHighResExport ? 30 : 14);
      const tbTop = height - tbHeight - (isHighResExport ? 30 : 14);

      ctx.fillStyle = 'rgba(10, 25, 47, 0.95)';
      ctx.fillRect(tbLeft, tbTop, tbWidth, tbHeight);

      ctx.strokeStyle = isPortaMenor ? '#64FFDA' : '#EF4444';
      ctx.lineWidth = isHighResExport ? 2.5 : 1.5;
      ctx.strokeRect(tbLeft, tbTop, tbWidth, tbHeight);

      // Miniatura do logo da empresa no canto do carimbo (se houver)
      if (logoImageRef.current) {
        try {
          const logoThumb = logoImageRef.current;
          const maxThumbW = isHighResExport ? 80 : 38;
          const maxThumbH = isHighResExport ? 40 : 20;
          const tAspect = logoThumb.width / (logoThumb.height || 1);
          let tw = maxThumbW;
          let th = maxThumbW / tAspect;
          if (th > maxThumbH) {
            th = maxThumbH;
            tw = maxThumbH * tAspect;
          }
          const tx = tbLeft + tbWidth - tw - (isHighResExport ? 12 : 6);
          const ty = tbTop + (isHighResExport ? 10 : 5);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(tx - 2, ty - 2, tw + 4, th + 4);
          ctx.drawImage(logoThumb, tx, ty, tw, th);
        } catch {
          // ignore
        }
      }

      ctx.fillStyle = '#64FFDA';
      ctx.font = isHighResExport
        ? 'bold 18px system-ui, sans-serif'
        : isCompact
        ? 'bold 9px system-ui, sans-serif'
        : 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const companyHeader = companySettings.companyName
        ? companySettings.companyName.toUpperCase().substring(0, 26)
        : 'PROJETO EXECUTIVO - PLANTA BAIXA';
      ctx.fillText(
        companyHeader,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 26 : isCompact ? 13 : 15)
      );

      ctx.fillStyle = '#A7F3D0';
      ctx.font = isHighResExport
        ? 'bold 16px ui-monospace, monospace'
        : isCompact
        ? 'bold 8.5px ui-monospace, monospace'
        : 'bold 9.5px ui-monospace, monospace';
      ctx.fillText(
        `LOTAÇÃO: ${numeroPassageiros} PASS. | CARGA: ${cargaUtilKg} kg`,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 52 : isCompact ? 26 : 30)
      );

      ctx.fillStyle = '#38BDF8';
      ctx.font = isHighResExport
        ? '15px ui-monospace, monospace'
        : isCompact
        ? '8px ui-monospace, monospace'
        : '9px ui-monospace, monospace';
      ctx.fillText(
        `NORMA: ABNT NBR 16858-1:2020`,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 76 : isCompact ? 39 : 44)
      );

      ctx.fillStyle = '#E2E8F0';
      ctx.font = isHighResExport
        ? '14px ui-monospace, monospace'
        : isCompact
        ? '8px ui-monospace, monospace'
        : '9px ui-monospace, monospace';
      ctx.fillText(
        `${state.acionamento.toUpperCase()} | ARCADA: ${state.arcada.toUpperCase()}`,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 100 : isCompact ? 52 : 58)
      );

      const montanteMm = Math.max(0, Math.round((ladoEfetivoMm - aberturaPorta) / 2));
      ctx.fillStyle = isPortaMenor && !results.isColisaoParedePorta ? '#FFAB40' : '#EF4444';
      const pavSuffix = incluirPortaPavimento
        ? ` | P.Pav ${folgaFrontalMm}mm (${portaPavimentoMm}+${folgaEntrePortasMm})`
        : ` | Ocup. ${results.larguraOcupadaPortaMm}mm | Folga ${folgaFrontalMm}mm`;
      ctx.fillText(
        `PORTA: ${state.tipoPorta} (${results.sentidoAberturaPorta}, ${state.aberturaPorta}mm)${pavSuffix}`,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 124 : isCompact ? 64 : 72)
      );

      ctx.fillStyle = isPortaMenor ? '#6EE7B7' : '#F87171';
      ctx.fillText(
        `MONTANTES: 2x ${montanteMm} mm ${isPortaMenor ? '(✓ Conforme: Porta ≤ Face)' : '(⚠️ NÃO CONFORME: Porta > Face)'}`,
        tbLeft + (isHighResExport ? 16 : 8),
        tbTop + (isHighResExport ? 148 : isCompact ? 76 : 86)
      );

      // Red warning alert banner on drawing if door is invalid (> face) or collides with shaft wall
      if (!isPortaMenor || results.isColisaoParedePorta) {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.96)';
        const warnW = isHighResExport ? 1060 : isCompact ? 320 : 540;
        const warnH = isHighResExport ? 46 : isCompact ? 24 : 28;
        ctx.fillRect(
          isHighResExport ? 30 : 14,
          isHighResExport ? 125 : 74,
          warnW,
          warnH
        );
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = isHighResExport ? 2 : 1;
        ctx.strokeRect(
          isHighResExport ? 30 : 14,
          isHighResExport ? 125 : 74,
          warnW,
          warnH
        );
        ctx.fillStyle = '#FFFFFF';
        ctx.font = isHighResExport
          ? 'bold 16px system-ui, sans-serif'
          : isCompact
          ? 'bold 7.5px system-ui, sans-serif'
          : 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
          !isPortaMenor
            ? `⚠️ ATENÇÃO: Abertura da porta (${state.aberturaPorta} mm) não pode ser maior que a face da cabine (${ladoEfetivoMm} mm)!`
            : `⚠️ COLISÃO COM A PAREDE (${results.colisaoParedePortaMm} mm): Revise o sentido de abertura da porta ou o lado da arcada!`,
          isHighResExport ? 42 : 20,
          isHighResExport ? 153 : isCompact ? 89 : 92
        );
      }

      // 10. Top Blueprint Title Header
      ctx.fillStyle = '#90CDF4';
      ctx.font = isHighResExport
        ? 'bold 24px system-ui, sans-serif'
        : isCompact
        ? 'bold 11px system-ui, sans-serif'
        : 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        'ESBOÇO TÉCNICO DO POÇO (PLANTA BAIXA)',
        isHighResExport ? 30 : 14,
        isHighResExport ? 40 : 22
      );

      ctx.fillStyle = 'rgba(144, 205, 244, 0.85)';
      ctx.font = isHighResExport
        ? '17px ui-monospace, monospace'
        : isCompact
        ? '8.5px ui-monospace, monospace'
        : '10px ui-monospace, monospace';
      ctx.fillText(
        `POÇO: ${larguraPoco} x ${profundidadePoco} mm | CABINE: ${state.larguraCabine} x ${state.profundidadeCabine} mm (${areaCabineM2.toFixed(
          2
        )} m²)`,
        isHighResExport ? 30 : 14,
        isHighResExport ? 68 : 36
      );

      ctx.fillStyle = '#34D399';
      ctx.font = isHighResExport
        ? 'bold 16px ui-monospace, monospace'
        : isCompact
        ? 'bold 8.5px ui-monospace, monospace'
        : 'bold 9.5px ui-monospace, monospace';
      ctx.fillText(
        `LOTAÇÃO: ${numeroPassageiros} PASSAGEIROS | CARGA ÚTIL: ${cargaUtilKg} kg (ABNT NBR 16858-1)`,
        isHighResExport ? 30 : 14,
        isHighResExport ? 94 : 50
      );

      if (results.isForaDaNorma) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = isHighResExport
          ? 'bold 14px system-ui, sans-serif'
          : isCompact
          ? 'bold 7.5px system-ui, sans-serif'
          : 'bold 8.5px system-ui, sans-serif';
        ctx.fillText(
          `⚠️ DIMENSÕES SOB MEDIDA (Abaixo do padrão normativo ABNT NBR 16858-1 de 800x1200 mm)`,
          isHighResExport ? 30 : 14,
          isHighResExport ? 118 : 62
        );
      }
    },
    [state, results, companySettings]
  );

  // On-screen redraw function with full resilience
  const drawBlueprint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width), 280);
    // Subtract toolbar height approx 46px
    const height = Math.max(Math.floor(rect.height) - 46, 360);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    try {
      renderBlueprintToContext(ctx, width, height, zoomLevel, false);
    } catch (e) {
      console.error('Error drawing elevator blueprint:', e);
    } finally {
      ctx.restore();
    }
  }, [renderBlueprintToContext, zoomLevel]);

  // Carrega o logotipo como HTMLImageElement para desenho síncrono no Canvas
  useEffect(() => {
    if (companySettings.logoDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        logoImageRef.current = img;
        drawBlueprint();
      };
      img.onerror = () => {
        logoImageRef.current = null;
        drawBlueprint();
      };
      img.src = companySettings.logoDataUrl;
    } else {
      logoImageRef.current = null;
      drawBlueprint();
    }
  }, [companySettings.logoDataUrl, drawBlueprint]);

  // Handle ResizeObserver & initial layout tick
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const triggerDraw = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        drawBlueprint();
      });
    };

    // Draw immediately and after tick
    triggerDraw();
    const timer = setTimeout(triggerDraw, 60);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
          triggerDraw();
        }
      }
    });

    observer.observe(container);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [drawBlueprint, activeTab]);

  // Sempre redesenha imediatamente quando drawBlueprint for atualizado (mudança de dimensões/estado/resultados)
  useEffect(() => {
    drawBlueprint();
  }, [drawBlueprint]);

  // Re-draw on window resize
  useEffect(() => {
    const handleResize = () => {
      drawBlueprint();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBlueprint]);

  // High-resolution export generator (2400 x 1600 px)
  const generateHighResExport = useCallback((): Promise<{
    url: string;
    blob: Blob;
  }> => {
    return new Promise((resolve, reject) => {
      try {
        const offCanvas = document.createElement('canvas');
        const exportW = 2400;
        const exportH = 1600;
        offCanvas.width = exportW;
        offCanvas.height = exportH;

        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        renderBlueprintToContext(offCtx, exportW, exportH, 1, true);

        offCanvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar imagem'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ url, blob });
          },
          'image/png',
          1.0
        );
      } catch (err) {
        reject(err);
      }
    });
  }, [renderBlueprintToContext]);

  // Direct trigger to download blob to disk
  const triggerDownloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  // User clicked Download: opens modal and attempts automatic download
  const handleDownloadClick = async () => {
    setIsGeneratingExport(true);
    setExportModalOpen(true);

    try {
      const { url, blob } = await generateHighResExport();
      setExportImageUrl(url);
      setExportBlob(blob);

      const filename = `planta-baixa-elevador-${results.larguraPoco}x${results.profundidadePoco}-nbr16858-1.png`;

      // Attempt automatic download
      try {
        triggerDownloadFile(blob, filename);
      } catch {
        // Automatic download may be blocked by iframe; modal allows manual save
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
    } finally {
      setIsGeneratingExport(false);
    }
  };

  const handleCopyImage = async () => {
    if (!exportBlob) return;
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function'
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': exportBlob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      }
    } catch {
      // Clipboard write might not be supported in all browsers
    }
  };

  const handlePrint = () => {
    if (!exportImageUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Planta Baixa - Elevador ${results.larguraPoco}x${results.profundidadePoco} mm</title>
          <style>
            body { margin: 0; padding: 20px; background: #081426; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
            @media print {
              body { background: white; padding: 0; }
              img { width: 100%; }
            }
          </style>
        </head>
        <body>
          <img src="${exportImageUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div
        ref={containerRef}
        id="blueprint-container"
        className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
          isFullscreen
            ? 'fixed inset-2 sm:inset-4 z-50 rounded-2xl'
            : 'w-full h-full min-h-[400px]'
        }`}
      >
        {/* Top action toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-cyan-300 tracking-wide truncate">
              CAD VETORIAL EM TEMPO REAL
            </span>
            <span className="hidden md:inline text-[10px] text-slate-400 font-mono">
              (ABNT NBR 16858-1)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-zoom-in"
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
              title="Aproximar Zoom"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-out"
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
              title="Afastar Zoom"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Redefinir Zoom"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-[1px] bg-slate-800 mx-0.5" />

            {/* Prominent PDF Report Button */}
            <button
              id="btn-download-pdf-blueprint"
              type="button"
              onClick={handleDownloadPdfClick}
              disabled={isGeneratingPdf}
              title="Gerar e Baixar Relatório Técnico Completo em PDF (NBR 16858-1)"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Gerando...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3 h-3" />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Prominent Download Image Button */}
            <button
              id="btn-download-blueprint"
              type="button"
              onClick={handleDownloadClick}
              title="Baixar Desenho Técnico em Alta Resolução (PNG)"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm rounded transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Desenho</span>
            </button>

            <button
              id="btn-toggle-fullscreen"
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Alerta Normativo se a cabine estiver fora da norma (dimensões reduzidas sob medida) */}
        {results.isForaDaNorma && (
          <div className="bg-amber-950/80 border-b border-amber-600/50 px-3 py-1 flex items-center justify-between text-amber-200 text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>ABNT NBR 16858-1:</strong> Cabine ({state.larguraCabine}×{state.profundidadeCabine}mm) sob medida para o poço.
              </span>
            </div>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-mono text-[9px] uppercase font-bold border border-amber-500/40 shrink-0 ml-1.5">
              Sob Medida
            </span>
          </div>
        )}

        {/* Interactive Blueprint Canvas */}
        <div className="relative flex-1 w-full h-full min-h-[360px] bg-[#081426] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            id="elevator-blueprint-canvas"
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Legend pills at bottom-left */}
          <div className="absolute bottom-3 left-3 hidden md:flex items-center gap-2 bg-slate-950/85 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono pointer-events-none">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
              <span>Cabine</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
              <span>
                {results.incluirPortaPavimento
                  ? `P. Pav (${results.folgaFrontal}mm: ${results.portaPavimentoMm}+${results.folgaEntrePortasMm})`
                  : `Porta Normal (${results.folgaFrontal}mm: ${results.folgaPortaNormalFormula})`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2.5 h-2.5 rounded-sm ${
                  state.acionamento === 'Elétrico'
                    ? 'bg-amber-500'
                    : 'bg-cyan-400'
                } inline-block`}
              />
              <span>
                {state.acionamento === 'Elétrico' ? 'Contrapeso' : 'Pistão'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 inline-block" />
              <span>Paredes Poço</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export / Download Modal (solves sandbox iframe download blocks & mobile downloads) */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Planta Baixa Técnica de Engenharia
                  </h3>
                  <p className="text-xs text-slate-400">
                    Resolução Ultra-HD (2400 × 1600 px) • Norma ABNT NBR
                    16858-1:2020
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image Preview */}
            <div className="p-5 bg-slate-950/60 flex flex-col items-center justify-center min-h-[300px]">
              {isGeneratingExport ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-slate-300">
                    Gerando desenho técnico em alta resolução...
                  </span>
                </div>
              ) : exportImageUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative w-full max-h-[460px] overflow-auto rounded-xl border border-slate-800 bg-[#081426] flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exportImageUrl}
                      alt="Planta Baixa do Elevador"
                      className="max-w-full max-h-[440px] object-contain rounded shadow-lg"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    💡 Dica: Se o download não iniciar automaticamente, você
                    pode clicar com o botão direito na imagem acima (ou segurar
                    no celular) e selecionar{' '}
                    <strong className="text-slate-200">
                      &quot;Salvar imagem como...&quot;
                    </strong>
                    .
                  </p>
                </div>
              ) : (
                <span className="text-sm text-rose-400">
                  Falha ao gerar o desenho. Tente novamente.
                </span>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>
                  Poço: {results.larguraPoco}x{results.profundidadePoco} mm
                </span>
                <span>•</span>
                <span>
                  {results.numeroPassageiros} Pass. ({results.cargaUtilKg} kg)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {exportBlob && (
                  <button
                    type="button"
                    onClick={handleCopyImage}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Copiar Imagem</span>
                      </>
                    )}
                  </button>
                )}

                {exportImageUrl && (
                  <a
                    href={exportImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Abrir em Nova Aba</span>
                  </a>
                )}

                {exportBlob && (
                  <button
                    type="button"
                    onClick={() => {
                      const filename = `planta-baixa-elevador-${results.larguraPoco}x${results.profundidadePoco}-nbr16858-1.png`;
                      triggerDownloadFile(exportBlob, filename);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Imagem PNG</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPdfClick}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Baixar Relatório em PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
