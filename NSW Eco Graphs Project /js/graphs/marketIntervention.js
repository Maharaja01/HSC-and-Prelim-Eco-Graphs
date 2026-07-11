class InterventionGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.mode = 'none'; // 'none', 'ceiling', 'floor'
        this.regPrice = 50;
        document.getElementById('intervention-slider-container').style.display = 'none';
        this.updateStatus('intervention-status', 'Free market equilibrium.');
    }
    
    reset() {
        this.resetState();
        this.draw();
    }
    
    setMode(mode) {
        this.mode = mode;
        const container = document.getElementById('intervention-slider-container');
        const slider = document.getElementById('intervention-slider');
        
        if (mode === 'none') {
            container.style.display = 'none';
            this.updateStatus('intervention-status', 'Free market equilibrium.');
        } else {
            container.style.display = 'block';
            if (mode === 'ceiling') {
                this.regPrice = 30; // below eq
                slider.value = 30;
                this.updateFeedback();
            } else {
                this.regPrice = 70; // above eq
                slider.value = 70;
                this.updateFeedback();
            }
        }
        this.draw();
    }
    
    setInterventionPrice(val) {
        this.regPrice = parseFloat(val);
        this.draw();
        this.updateFeedback();
    }
    
    updateFeedback() {
        const qd = 50 + (this.regPrice - 50) / -1;
        const qs = 50 + (this.regPrice - 50) / 1;
        
        if (this.mode === 'ceiling') {
            if (this.regPrice < 50) {
                this.updateStatus('intervention-status', `Effective Price Ceiling. Shortage of ${Math.round(qd - qs)} units.`);
            } else {
                this.updateStatus('intervention-status', `Ineffective Price Ceiling (set above equilibrium). Market stays at Pe=50.`);
            }
        } else if (this.mode === 'floor') {
            if (this.regPrice > 50) {
                this.updateStatus('intervention-status', `Effective Price Floor. Surplus of ${Math.round(qs - qd)} units.`);
            } else {
                this.updateStatus('intervention-status', `Ineffective Price Floor (set below equilibrium). Market stays at Pe=50.`);
            }
        }
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Eq is 50,50
        const dPoints = [{ x: 10, y: 90 }, { x: 90, y: 10 }];
        const sPoints = [{ x: 10, y: 10 }, { x: 90, y: 90 }];
        
        super.drawCurve(dPoints, this.colors.demand);
        super.drawCurve(sPoints, this.colors.supply);
        super.drawLabel('D', 95, 10, this.colors.demand);
        super.drawLabel('S', 95, 90, this.colors.supply);
        
        // Draw equilibrium
        super.drawDashedLineToAxes(50, 50, 'rgba(0,0,0,0.2)');
        super.drawPoint(50, 50, this.colors.equilibrium, 4);
        super.drawLabel('Pe', 5, 50, this.colors.text, 'right');
        
        if (this.mode !== 'none') {
            const ctx = this.ctx;
            const yPx = this.yToPx(this.regPrice);
            
            // Draw horizontal line for intervention
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.moveTo(this.padding.left, yPx);
            ctx.lineTo(this.width - this.padding.right, yPx);
            ctx.stroke();
            
            super.drawLabel(this.mode === 'ceiling' ? 'Ceiling' : 'Floor', this.width - this.padding.right - 20, this.regPrice + 5, '#ef4444');
            super.drawLabel('Preg', 5, this.regPrice, '#ef4444', 'right');
            
            const isEffective = (this.mode === 'ceiling' && this.regPrice < 50) || (this.mode === 'floor' && this.regPrice > 50);
            
            if (isEffective) {
                const qd = 50 + (this.regPrice - 50) / -1;
                const qs = 50 + (this.regPrice - 50) / 1;
                
                super.drawDashedLineToAxes(qd, this.regPrice, this.colors.demand);
                super.drawDashedLineToAxes(qs, this.regPrice, this.colors.supply);
                super.drawPoint(qd, this.regPrice, this.colors.demand, 5);
                super.drawPoint(qs, this.regPrice, this.colors.supply, 5);
                
                super.drawLabel('Qd', qd, 5, this.colors.demand, 'center');
                super.drawLabel('Qs', qs, 5, this.colors.supply, 'center');
                
                // Draw arrow showing gap
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444';
                ctx.setLineDash([]);
                ctx.moveTo(this.xToPx(Math.min(qd, qs)), this.yToPx(this.regPrice - 2));
                ctx.lineTo(this.xToPx(Math.max(qd, qs)), this.yToPx(this.regPrice - 2));
                ctx.stroke();
            }
        }
    }
}
