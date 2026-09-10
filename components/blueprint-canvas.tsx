'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ElevatorConfigState,
  ElevatorCalculationResults,
} from '@/lib/elevator-calculator';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  Compass,
} from 'lucide-react';

interface BlueprintCanvasProps {
  state: ElevatorConfigState;
  results: ElevatorCalculationResults;
}

export function BlueprintCanvas({ state, results }: BlueprintCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const drawBlueprint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Handle high-DPI
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep blueprint background
    ctx.fillStyle = '#081426';
    ctx.fillRect(0, 0, width, height);

    // Apply user zoom from center
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-width / 2, -height / 2);

    // 1. Technical Grid
    const gridSize = 24;
    for (let x = 0; x <= width; x += gridSize) {
      const isMajor = Math.floor(x / gridSize) % 4 === 0;
      ctx.beginPath();
      ctx.strokeStyle = isMajor ? 'rgba(100, 255, 218, 0.16)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      const isMajor = Math.floor(y / gridSize) % 4 === 0;
      ctx.beginPath();
      ctx.strokeStyle = isMajor ? 'rgba(100, 255, 218, 0.16)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Geometry values
    const larguraPoco = results.larguraPoco || 1700;
    const profundidadePoco = results.profundidadePoco || 1545;
    const larguraCabine = parseFloat(state.larguraCabine) || 800;
    const profundidadeCabine = parseFloat(state.profundidadeCabine) || 1250;
    const aberturaPorta = parseFloat(state.aberturaPorta) || 800;
    const espacoChassis = results.espacoChassis || 450;
    const menorFolga = results.menorFolga || 125;

    // Margins and scale
    const leftPadding = 64;
    const rightPadding = 64;
    const topPadding = 64;
    const bottomPadding = 80;
    const availW = width - (leftPadding + rightPadding);
    const availH = height - (topPadding + bottomPadding);

    const scale = Math.min(availW / larguraPoco, availH / profundidadePoco);
    const pocoDrawWidth = larguraPoco * scale;
    const pocoDrawHeight = profundidadePoco * scale;
    const cabineDrawWidth = larguraCabine * scale;
    const cabineDrawHeight = profundidadeCabine * scale;
    const doorDrawWidth = Math.min(aberturaPorta * scale, cabineDrawWidth * 0.96);
    const espChassisScaled = espacoChassis * scale;
    const menorFolgaScaled = menorFolga * scale;

    const pocoLeft = leftPadding + (availW - pocoDrawWidth) / 2;
    const pocoTop = topPadding + (availH - pocoDrawHeight) / 2;
    const wallThickness = 12;

    const isChassisSide = state.ladoArcada === 'Lateral';
    const isElectric = state.acionamento === 'Elétrico';
    const isSuspension = state.arcada === 'Suspensão';
    const isEntranceOpposite = state.tipoEntrada === 'Oposta';
    const isEntranceAdjacent = state.tipoEntrada === 'Adjacente';

    let cbX: number;
    let cbY: number;

    if (isChassisSide) {
      const leftClearance = espChassisScaled;
      const availShaftInteriorX = pocoDrawWidth - cabineDrawWidth;
      cbX = pocoLeft + Math.min(leftClearance, availShaftInteriorX * 0.72);

      const rearClearance = (isEntranceOpposite ? 160 : 120) * scale;
      const availShaftInteriorY = pocoDrawHeight - cabineDrawHeight;
      cbY = pocoTop + Math.min(rearClearance, availShaftInteriorY * 0.5);
    } else {
      const rearClearance = espChassisScaled;
      const availShaftInteriorY = pocoDrawHeight - cabineDrawHeight;
      cbY = pocoTop + Math.min(rearClearance, availShaftInteriorY * 0.72);
      cbX = pocoLeft + (pocoDrawWidth - cabineDrawWidth) / 2;
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
    // Clip to the wall ring
    ctx.rect(
      pocoLeft - wallThickness,
      pocoTop - wallThickness,
      pocoDrawWidth + wallThickness * 2,
      pocoDrawHeight + wallThickness * 2
    );
    ctx.rect(pocoLeft, pocoTop, pocoDrawWidth, pocoDrawHeight);
    ctx.clip('evenodd');

    ctx.strokeStyle = 'rgba(100, 255, 218, 0.18)';
    ctx.lineWidth = 1;
    const hatchStep = 10;
    const totalSpan = pocoDrawWidth + pocoDrawHeight + wallThickness * 4;
    for (let i = -pocoDrawHeight; i < totalSpan; i += hatchStep) {
      ctx.beginPath();
      ctx.moveTo(pocoLeft - wallThickness + i, pocoTop - wallThickness);
      ctx.lineTo(pocoLeft - wallThickness + i + 24, pocoTop - wallThickness + 24);
      ctx.stroke();
    }
    ctx.restore();

    // Wall outlines
    ctx.strokeStyle = '#90CDF4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      pocoLeft - wallThickness,
      pocoTop - wallThickness,
      pocoDrawWidth + wallThickness * 2,
      pocoDrawHeight + wallThickness * 2
    );

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pocoLeft, pocoTop, pocoDrawWidth, pocoDrawHeight);

    // 3. Door Openings in Walls (Cutouts)
    const frontDoorLeft = cbX + (cabineDrawWidth - doorDrawWidth) / 2;

    // Front Wall Cutout (Bottom)
    ctx.fillStyle = '#081426';
    ctx.fillRect(
      frontDoorLeft,
      pocoTop + pocoDrawHeight - 1.5,
      doorDrawWidth,
      wallThickness + 4
    );

    // Rear Wall Cutout (Top) if Opposite entrance
    if (isEntranceOpposite) {
      const rearDoorLeft = cbX + (cabineDrawWidth - doorDrawWidth) / 2;
      ctx.fillStyle = '#081426';
      ctx.fillRect(
        rearDoorLeft,
        pocoTop - wallThickness - 2,
        doorDrawWidth,
        wallThickness + 4
      );
    }

    // Side Wall Cutout (Right) if Adjacent entrance
    const sideDoorTop = cbY + (cabineDrawHeight - doorDrawWidth) / 2;
    if (isEntranceAdjacent) {
      ctx.fillStyle = '#081426';
      ctx.fillRect(
        pocoLeft + pocoDrawWidth - 1.5,
        sideDoorTop,
        wallThickness + 4,
        doorDrawWidth
      );
    }

    // Helper functions for drawing elevator components
    const drawGuideRail = (rx: number, ry: number, angleDeg: number, color = '#ECEFF1') => {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate((angleDeg * Math.PI) / 180);
      ctx.fillStyle = color;
      const rw = 5;
      const rh = 7;
      // T-shape guide rail
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
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // Weight blocks
      const divisions = 3;
      const step = ch / divisions;
      ctx.strokeStyle = `${color}99`;
      ctx.lineWidth = 1;
      for (let i = 1; i < divisions; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + i * step);
        ctx.lineTo(cx + cw, cy + i * step);
        ctx.stroke();
      }

      // Diagonal cross
      ctx.strokeStyle = `${color}CC`;
      ctx.lineWidth = 1.2;
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
      // Cylinder
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Piston Ram
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Center mark
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Support Flange
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
        const cpWidth = Math.max(16, Math.min(spaceX * 0.42, 28));
        const cpHeight = Math.max(40, Math.min(cabineDrawHeight * 0.65, 120));
        const cpLeft = driveCenterX - cpWidth / 2;
        const cpTop = driveCenterY - cpHeight / 2;
        drawCounterweight(cpLeft, cpTop, cpWidth, cpHeight, accentOrange);
        drawGuideRail(driveCenterX, cpTop, 0);
        drawGuideRail(driveCenterX, cpTop + cpHeight, 180);
      } else {
        const pistonRadius = Math.max(10, Math.min(spaceX * 0.28, 22));
        drawHydraulicPiston(driveCenterX, driveCenterY, pistonRadius, hydraulicBlue);
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
        const cpWidth = Math.max(40, Math.min(cabineDrawWidth * 0.65, 140));
        const cpHeight = Math.max(16, Math.min(spaceY * 0.45, 28));
        const cpLeft = driveCenterX - cpWidth / 2;
        const cpTop = driveCenterY - cpHeight / 2;
        drawCounterweight(cpLeft, cpTop, cpWidth, cpHeight, accentOrange);
        drawGuideRail(cpLeft, driveCenterY, -90);
        drawGuideRail(cpLeft + cpWidth, driveCenterY, 90);
      } else {
        const pistonRadius = Math.max(10, Math.min(spaceY * 0.32, 22));
        drawHydraulicPiston(driveCenterX, driveCenterY, pistonRadius, hydraulicBlue);
        drawGuideRail(driveCenterX - pistonRadius - 4, driveCenterY, -90);
        drawGuideRail(driveCenterX + pistonRadius + 4, driveCenterY, 90);
      }
    }

    // 5. Arcada / Sling Structure
    const slingColor = 'rgba(100, 255, 218, 0.85)';
    ctx.strokeStyle = slingColor;
    ctx.lineWidth = 2.5;

    if (isSuspension) {
      // Suspensão: Cross sling passing through cabin center + guide rails
      ctx.beginPath();
      ctx.moveTo(cbX - 4, cbCenterY);
      ctx.lineTo(cbRight + 4, cbCenterY);
      ctx.stroke();

      drawGuideRail(cbX, cbCenterY, -90);
      drawGuideRail(cbRight, cbCenterY, 90);
    } else {
      // Arcada L (Cantilever / Mochila)
      if (isChassisSide) {
        ctx.strokeRect(cbX - 4, cbCenterY - 14, 8, 28);
        ctx.beginPath();
        ctx.moveTo(cbX, cbCenterY - 14);
        ctx.lineTo(cbX + cabineDrawWidth * 0.6, cbCenterY - 14);
        ctx.moveTo(cbX, cbCenterY + 14);
        ctx.lineTo(cbX + cabineDrawWidth * 0.6, cbCenterY + 14);
        ctx.stroke();

        drawGuideRail(cbX, cbCenterY - 14, -90);
        drawGuideRail(cbX, cbCenterY + 14, -90);
      } else {
        ctx.strokeRect(cbCenterX - 14, cbY - 4, 28, 8);
        ctx.beginPath();
        ctx.moveTo(cbCenterX - 14, cbY);
        ctx.lineTo(cbCenterX - 14, cbY + cabineDrawHeight * 0.6);
        ctx.moveTo(cbCenterX + 14, cbY);
        ctx.lineTo(cbCenterX + 14, cbY + cabineDrawHeight * 0.6);
        ctx.stroke();

        drawGuideRail(cbCenterX - 14, cbY, 0);
        drawGuideRail(cbCenterX + 14, cbY, 0);
      }
    }

    // 6. Cabin Walls and Interior
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cbX, cbY, cabineDrawWidth, cabineDrawHeight);

    // Inner cyan finish
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cbX + 2.5, cbY + 2.5, cabineDrawWidth - 5, cabineDrawHeight - 5);

    // Center Crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    const chSize = 8;
    ctx.beginPath();
    ctx.moveTo(cbCenterX - chSize, cbCenterY);
    ctx.lineTo(cbCenterX + chSize, cbCenterY);
    ctx.moveTo(cbCenterX, cbCenterY - chSize);
    ctx.lineTo(cbCenterX, cbCenterY + chSize);
    ctx.stroke();

    // 7. Doors (Sliding Leaves)
    const drawSlidingDoors = (
      doorType: string,
      doorStart: number,
      doorWidth: number,
      cabY: number,
      landY: number,
      isVertical: boolean
    ) => {
      const numLeaves = doorType.includes('4 Folhas')
        ? 4
        : doorType.includes('3 Folhas')
        ? 3
        : 2;
      const isCentral = doorType.includes('Central');

      ctx.save();
      if (!isVertical) {
        // Horizontal doors (Front/Rear)
        if (isCentral) {
          const halfWidth = doorWidth / 2;
          const leafWidth = halfWidth / (numLeaves / 2);
          for (let i = 0; i < numLeaves / 2; i++) {
            const step = i * 2.5;
            const lx1 = doorStart + i * leafWidth;
            const lx2 = lx1 + leafWidth - 1.5;
            // Cabin leaf
            ctx.strokeStyle = '#64FFDA';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lx1, cabY + 2 + step);
            ctx.lineTo(lx2, cabY + 2 + step);
            ctx.stroke();
            // Landing leaf
            ctx.strokeStyle = '#B0BEC5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx1, landY + step);
            ctx.lineTo(lx2, landY + step);
            ctx.stroke();

            // Right half
            const rx2 = doorStart + doorWidth - i * leafWidth;
            const rx1 = rx2 - leafWidth + 1.5;
            ctx.strokeStyle = '#64FFDA';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(rx1, cabY + 2 + step);
            ctx.lineTo(rx2, cabY + 2 + step);
            ctx.stroke();

            ctx.strokeStyle = '#B0BEC5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rx1, landY + step);
            ctx.lineTo(rx2, landY + step);
            ctx.stroke();
          }
        } else {
          // Lateral sliding
          const leafWidth = doorWidth / numLeaves;
          for (let i = 0; i < numLeaves; i++) {
            const step = i * 2.5;
            const x1 = doorStart + i * leafWidth;
            const x2 = x1 + leafWidth - 1.5;
            // Cabin
            ctx.strokeStyle = '#64FFDA';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, cabY + 2 + step);
            ctx.lineTo(x2, cabY + 2 + step);
            ctx.stroke();
            // Landing
            ctx.strokeStyle = '#B0BEC5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, landY + step);
            ctx.lineTo(x2, landY + step);
            ctx.stroke();
          }
        }
      } else {
        // Vertical doors (Adjacent Right)
        const leafHeight = doorWidth / numLeaves;
        for (let i = 0; i < numLeaves; i++) {
          const step = i * 2.5;
          const y1 = doorStart + i * leafHeight;
          const y2 = y1 + leafHeight - 1.5;
          // Cabin
          ctx.strokeStyle = '#64FFDA';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cabY + 2 + step, y1);
          ctx.lineTo(cabY + 2 + step, y2);
          ctx.stroke();
          // Landing
          ctx.strokeStyle = '#B0BEC5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(landY + step, y1);
          ctx.lineTo(landY + step, y2);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    // Front door (bottom)
    drawSlidingDoors(
      state.tipoPorta,
      frontDoorLeft,
      doorDrawWidth,
      cbBottom,
      pocoTop + pocoDrawHeight + wallThickness / 2,
      false
    );

    // Opposite door (top)
    if (isEntranceOpposite) {
      const rearDoorLeft = cbX + (cabineDrawWidth - doorDrawWidth) / 2;
      drawSlidingDoors(
        state.tipoPorta,
        rearDoorLeft,
        doorDrawWidth,
        cbY,
        pocoTop - wallThickness / 2,
        false
      );
    }

    // Adjacent door (right)
    if (isEntranceAdjacent) {
      drawSlidingDoors(
        state.tipoPorta,
        sideDoorTop,
        doorDrawWidth,
        cbRight,
        pocoLeft + pocoDrawWidth + wallThickness / 2,
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
      font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'
    ) => {
      const tick = 4;
      ctx.save();
      ctx.font = font;

      if (isHoriz) {
        const y = y1 + offsetPx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // 45 deg tick marks
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1 - tick, y + tick);
        ctx.lineTo(x1 + tick, y - tick);
        ctx.moveTo(x2 - tick, y + tick);
        ctx.lineTo(x2 + tick, y - tick);
        ctx.stroke();

        // Witness lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Text
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = offsetPx > 0 ? 'top' : 'bottom';
        ctx.fillText(label, (x1 + x2) / 2, y + (offsetPx > 0 ? 2 : -2));
      } else {
        const x = x1 + offsetPx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // 45 deg tick marks
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - tick, y1 + tick);
        ctx.lineTo(x + tick, y1 - tick);
        ctx.moveTo(x - tick, y2 + tick);
        ctx.lineTo(x + tick, y2 - tick);
        ctx.stroke();

        // Witness lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x, y1);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Text
        ctx.fillStyle = color;
        ctx.textAlign = offsetPx > 0 ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + (offsetPx > 0 ? 4 : -4), (y1 + y2) / 2);
      }
      ctx.restore();
    };

    // Dimension lines
    // Shaft Dimensions (LP / PP)
    drawDim(
      pocoLeft,
      pocoTop,
      pocoLeft + pocoDrawWidth,
      pocoTop,
      `LP: ${results.larguraPoco} mm`,
      true,
      -22,
      '#64FFDA',
      'bold 11px ui-monospace, monospace'
    );
    drawDim(
      pocoLeft,
      pocoTop,
      pocoLeft,
      pocoTop + pocoDrawHeight,
      `PP: ${results.profundidadePoco} mm`,
      false,
      -22,
      '#64FFDA',
      'bold 11px ui-monospace, monospace'
    );

    // Cabin Dimensions (LC / PC)
    drawDim(
      cbX,
      cbBottom,
      cbRight,
      cbBottom,
      `LC: ${state.larguraCabine} mm`,
      true,
      18,
      '#FFFFFF'
    );
    drawDim(
      cbRight,
      cbY,
      cbRight,
      cbBottom,
      `PC: ${state.profundidadeCabine} mm`,
      false,
      18,
      '#FFFFFF'
    );

    // Door Opening VA
    drawDim(
      frontDoorLeft,
      cbBottom,
      frontDoorLeft + doorDrawWidth,
      cbBottom,
      `VA: ${state.aberturaPorta} mm`,
      true,
      36,
      '#FFAB40',
      'bold 10px ui-monospace, monospace'
    );

    // Identification Labels
    ctx.save();
    ctx.fillStyle = '#64FFDA';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CABINE', cbCenterX, cbCenterY - 14);

    const driveLabelText = isElectric ? 'C.P. (CONTRAPESO)' : 'PISTÃO HIDRÁULICO';
    ctx.fillStyle = isElectric ? '#FFAB40' : '#00E5FF';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText(driveLabelText, driveCenterX, driveCenterY);
    ctx.restore();

    ctx.restore(); // Restore zoom scale

    // 9. Technical Title Block (Carimbo Arquitetônico - fixed overlay at bottom right)
    const tbWidth = 230;
    const tbHeight = 74;
    const tbLeft = width - tbWidth - 14;
    const tbTop = height - tbHeight - 14;

    ctx.fillStyle = 'rgba(10, 25, 47, 0.94)';
    ctx.fillRect(tbLeft, tbTop, tbWidth, tbHeight);

    ctx.strokeStyle = '#64FFDA';
    ctx.lineWidth = 1;
    ctx.strokeRect(tbLeft, tbTop, tbWidth, tbHeight);

    ctx.fillStyle = '#64FFDA';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PROJETO EXECUTIVO - PLANTA BAIXA', tbLeft + 10, tbTop + 16);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '9.5px ui-monospace, monospace';
    ctx.fillText(
      `${state.acionamento.toUpperCase()} | ARCADA: ${state.arcada.toUpperCase()}`,
      tbLeft + 10,
      tbTop + 32
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(
      `ENTRADA: ${state.tipoEntrada.toUpperCase()} | POSIÇÃO: ${state.posicao}`,
      tbLeft + 10,
      tbTop + 47
    );

    ctx.fillStyle = '#FFAB40';
    ctx.fillText(
      `PORTA: ${state.tipoPorta} (${state.aberturaPorta} mm)`,
      tbLeft + 10,
      tbTop + 62
    );

    // 10. Top Blueprint Title Header & North Indicator
    ctx.fillStyle = '#90CDF4';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ESBOÇO TÉCNICO DO POÇO (PLANTA BAIXA)', 16, 26);

    ctx.fillStyle = 'rgba(144, 205, 244, 0.7)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText(
      `POÇO: ${results.larguraPoco} x ${results.profundidadePoco} mm | CABINE: ${state.larguraCabine} x ${state.profundidadeCabine} mm`,
      16,
      42
    );

    ctx.restore();
  }, [state, results, zoomLevel]);

  useEffect(() => {
    drawBlueprint();
  }, [drawBlueprint]);

  useEffect(() => {
    const handleResize = () => {
      drawBlueprint();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBlueprint]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `planta-baixa-elevador-${results.larguraPoco}x${results.profundidadePoco}.png`;
    a.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      id="blueprint-container"
      className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full h-full min-h-[500px]'
      }`}
    >
      {/* Top action toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-300 tracking-wide">
            CAD VETORIAL EM TEMPO REAL
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            (Escala Proporcional 1:1)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-zoom-in"
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
            title="Aproximar Zoom"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
            title="Afastar Zoom"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-reset"
            type="button"
            onClick={() => setZoomLevel(1)}
            title="Redefinir Zoom"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            id="btn-download-blueprint"
            type="button"
            onClick={handleDownload}
            title="Baixar Desenho Técnico em Alta Resolução (PNG)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/40 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Imagem</span>
          </button>

          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Blueprint Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[460px] bg-[#081426] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
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
            <span>Porta / Vão</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-sm ${
                state.acionamento === 'Elétrico' ? 'bg-amber-500' : 'bg-cyan-400'
              } inline-block`}
            />
            <span>{state.acionamento === 'Elétrico' ? 'Contrapeso' : 'Pistão'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 inline-block" />
            <span>Paredes Poço</span>
          </div>
        </div>
      </div>
    </div>
  );
}
