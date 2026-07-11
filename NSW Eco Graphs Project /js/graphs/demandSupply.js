class DemandSupplyGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.resetState();
        this.draw();
    }
    
    resetState() {
        // Curve positions represented by horizontal intercepts/shifts
        this.dShift = 50; // Base x for demand at y=50
        this.sShift = 50; // Base x for supply at y=50
        
        // Slope
        this.dSlope = -1;
        this.sSlope = 1;
        
        // Current price (for movement along curve)
        this.currentPrice = 50;
        
        this.updateStatus('ds-status', 'Market is at equilibrium.');
        
        const slider = document.getElementById('ds-price-slider');
        if (slider) slider.value = 50;
    }
    
    reset() {
        this.animateValue(this, 'dShift', 50, 400);
        this.animateValue(this, 'sShift', 50, 400);
        this.animateValue(this, 'currentPrice', 50, 400, () => {
            const slider = document.getElementById('ds-price-slider');
            if (slider) slider.value = 50;
            this.updateStatus('ds-status', 'Reset to default equilibrium.');
        });
    }

    getDemandX(y) {
        // (x - dShift) = (y - 50) / dSlope
        return this.dShift + (y - 50) / this.dSlope;
    }
    
    getSupplyX(y) {
        return this.sShift + (y - 50) / this.sSlope;
    }
    
    getEquilibrium() {
        // dShift + (y - 50) / dSlope = sShift + (y - 50) / sSlope
        // (y - 50) * (1/sSlope - 1/dSlope) = dShift - sShift
        const y = 50 + (this.dShift - this.sShift) / (1/this.sSlope - 1/this.dSlope);
        const x = this.getDemandX(y);
        return { x, y };
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw Demand
        const dPoints = [
            { x: this.getDemandX(90), y: 90 },
            { x: this.getDemandX(10), y: 10 }
        ];
        super.drawCurve(dPoints, this.colors.demand);
        super.drawLabel('D', dPoints[1].x + 5, dPoints[1].y, this.colors.demand);
        
        // Draw Supply
        const sPoints = [
            { x: this.getSupplyX(10), y: 10 },
            { x: this.getSupplyX(90), y: 90 }
        ];
        super.drawCurve(sPoints, this.colors.supply);
        super.drawLabel('S', sPoints[1].x + 5, sPoints[1].y, this.colors.supply);
        
        // Equilibrium
        const eq = this.getEquilibrium();
        
        // If currentPrice != eq.y, we show the disequilibrium
        if (Math.abs(this.currentPrice - eq.y) > 0.5) {
            // Draw horizontal line at current price
            const qd = this.getDemandX(this.currentPrice);
            const qs = this.getSupplyX(this.currentPrice);
            
            super.drawLine(0, this.currentPrice, Math.max(qd, qs), this.currentPrice, this.colors.other, 1, [5,5]);
            super.drawPoint(qd, this.currentPrice, this.colors.demand, 5);
            super.drawPoint(qs, this.currentPrice, this.colors.supply, 5);
            
            super.drawLabel('P1', 5, this.currentPrice, this.colors.text, 'right');
            super.drawLabel('Qd', qd, 5, this.colors.demand, 'center');
            super.drawLabel('Qs', qs, 5, this.colors.supply, 'center');
            
            // Highlight equilibrium faintly
            super.drawPoint(eq.x, eq.y, 'rgba(16, 185, 129, 0.3)', 4);
        } else {
            // Normal equilibrium
            super.drawDashedLineToAxes(eq.x, eq.y, this.colors.equilibrium);
            super.drawPoint(eq.x, eq.y, this.colors.equilibrium);
            
            super.drawLabel('Pe', 5, eq.y, this.colors.text, 'right');
            super.drawLabel('Qe', eq.x, 5, this.colors.text, 'center');
        }
    }

    shiftDemand(dir) {
        // dir = 1 (right) or -1 (left)
        const target = dir > 0 ? 70 : 30;
        this.animateValue(this, 'dShift', target, 500, () => {
            // Update current price to new eq automatically after shift
            const eq = this.getEquilibrium();
            this.animateValue(this, 'currentPrice', eq.y, 300);
            
            const msg = dir > 0 ? 'Demand increased (shifted right).' : 'Demand decreased (shifted left).';
            this.updateStatus('ds-status', `<span class="badge shift">Shift of the curve</span> ${msg} Equilibrium price and quantity changed.`);
            
            const slider = document.getElementById('ds-price-slider');
            if(slider) slider.value = eq.y;
        });
    }

    shiftSupply(dir) {
        const target = dir > 0 ? 70 : 30;
        this.animateValue(this, 'sShift', target, 500, () => {
            const eq = this.getEquilibrium();
            this.animateValue(this, 'currentPrice', eq.y, 300);
            
            const msg = dir > 0 ? 'Supply increased (shifted right).' : 'Supply decreased (shifted left).';
            this.updateStatus('ds-status', `<span class="badge shift">Shift of the curve</span> ${msg} Equilibrium price and quantity changed.`);
            
            const slider = document.getElementById('ds-price-slider');
            if(slider) slider.value = eq.y;
        });
    }
    
    setPrice(val) {
        this.currentPrice = parseFloat(val);
        this.draw();
        
        const eq = this.getEquilibrium();
        if (Math.abs(this.currentPrice - eq.y) > 0.5) {
            const qd = this.getDemandX(this.currentPrice);
            const qs = this.getSupplyX(this.currentPrice);
            if (this.currentPrice > eq.y) {
                this.updateStatus('ds-status', `<span class="badge movement">Movement along the curve</span> Price is above equilibrium. Quantity Supplied (${Math.round(qs)}) > Quantity Demanded (${Math.round(qd)}). This creates a surplus.`);
            } else {
                this.updateStatus('ds-status', `<span class="badge movement">Movement along the curve</span> Price is below equilibrium. Quantity Demanded (${Math.round(qd)}) > Quantity Supplied (${Math.round(qs)}). This creates a shortage.`);
            }
        } else {
            this.updateStatus('ds-status', 'Market is at equilibrium.');
        }
    }
}
