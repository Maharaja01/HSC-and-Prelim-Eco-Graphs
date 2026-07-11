class LabourMarketGraph extends DemandSupplyGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Quantity of Labour (Employment)';
        this.yLabel = 'Wage Rate (W)';
        this.minWage = null;
        this.draw(); // redraw with new labels
    }
    
    resetState() {
        super.resetState();
        this.minWage = null;
        this.updateStatus('labour-status', 'Equilibrium wage and employment level.');
    }
    
    reset() {
        super.reset();
        this.minWage = null;
    }
    
    shiftDemand(dir) {
        this.minWage = null; // Clear min wage if active
        super.shiftDemand(dir);
        setTimeout(() => {
            this.updateStatus('labour-status', `<span class="badge shift">Shift</span> Labour Demand (derived demand) increased. Wages and employment rise.`);
        }, 550);
    }
    
    shiftSupply(dir) {
        this.minWage = null;
        super.shiftSupply(dir);
        setTimeout(() => {
            this.updateStatus('labour-status', `<span class="badge shift">Shift</span> Labour Supply decreased. Wages rise but employment falls.`);
        }, 550);
    }
    
    setMinimumWage() {
        this.minWage = 70;
        this.draw();
        
        const qd = this.getDemandX(this.minWage);
        const qs = this.getSupplyX(this.minWage);
        this.updateStatus('labour-status', `<span class="badge movement">Movement along the curve</span> Minimum wage set above equilibrium. Creates unemployment (surplus of labour). Firms demand ${Math.round(qd)}, workers supply ${Math.round(qs)}.`);
    }
    
    draw() {
        super.draw();
        if (this.minWage !== null) {
            const ctx = this.ctx;
            const yPx = this.yToPx(this.minWage);
            
            // Draw horizontal line for min wage
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.moveTo(this.padding.left, yPx);
            ctx.lineTo(this.width - this.padding.right, yPx);
            ctx.stroke();
            
            super.drawLabel('Min Wage', this.width - this.padding.right - 20, this.minWage + 5, '#ef4444');
            super.drawLabel('Wmin', 5, this.minWage, '#ef4444', 'right');
            
            const qd = this.getDemandX(this.minWage);
            const qs = this.getSupplyX(this.minWage);
            
            super.drawDashedLineToAxes(qd, this.minWage, this.colors.demand);
            super.drawDashedLineToAxes(qs, this.minWage, this.colors.supply);
            super.drawPoint(qd, this.minWage, this.colors.demand, 5);
            super.drawPoint(qs, this.minWage, this.colors.supply, 5);
            
            super.drawLabel('Qd', qd, 5, this.colors.demand, 'center');
            super.drawLabel('Qs', qs, 5, this.colors.supply, 'center');
        }
    }
}
