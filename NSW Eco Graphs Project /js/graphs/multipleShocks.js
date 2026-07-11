class MultipleShocksGraph extends DemandSupplyGraph {
    constructor(canvasId) {
        super(canvasId);
    }
    
    resetState() {
        super.resetState();
        this.baseDShift = 50;
        this.baseSShift = 50;
    }
    
    reset() {
        this.animateValue(this, 'dShift', 50, 400);
        this.animateValue(this, 'sShift', 50, 400, () => {
            this.baseDShift = 50;
            this.baseSShift = 50;
            this.updateStatus('shocks-status', 'Reset to default equilibrium.');
        });
    }

    shift(curve, dir) {
        if (curve === 'demand') {
            const target = this.dShift === 50 ? (dir > 0 ? 70 : 30) : 50;
            this.animateValue(this, 'dShift', target, 500, () => this.evaluateShocks());
        } else {
            const target = this.sShift === 50 ? (dir > 0 ? 70 : 30) : 50;
            this.animateValue(this, 'sShift', target, 500, () => this.evaluateShocks());
        }
    }
    
    evaluateShocks() {
        const eq = this.getEquilibrium();
        let msg = 'Market at equilibrium.';
        
        if (this.dShift !== 50 && this.sShift !== 50) {
            // Both shifted
            if (this.dShift > 50 && this.sShift > 50) msg = 'Both D and S increased. Quantity definitely increases. Effect on Price is ambiguous.';
            else if (this.dShift < 50 && this.sShift < 50) msg = 'Both D and S decreased. Quantity definitely decreases. Effect on Price is ambiguous.';
            else if (this.dShift > 50 && this.sShift < 50) msg = 'D increased, S decreased. Price definitely increases. Effect on Quantity is ambiguous.';
            else if (this.dShift < 50 && this.sShift > 50) msg = 'D decreased, S increased. Price definitely decreases. Effect on Quantity is ambiguous.';
            
            msg = `<span class="badge shift">Simultaneous Shift</span> ` + msg;
        } else if (this.dShift !== 50) {
            msg = this.dShift > 50 ? 'Demand increased.' : 'Demand decreased.';
        } else if (this.sShift !== 50) {
            msg = this.sShift > 50 ? 'Supply increased.' : 'Supply decreased.';
        }
        
        this.updateStatus('shocks-status', msg);
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Base curves (faded) if shifted
        if (this.dShift !== 50 || this.sShift !== 50) {
            const baseDPoints = [{ x: 50 + (90 - 50)/-1, y: 90 }, { x: 50 + (10 - 50)/-1, y: 10 }];
            const baseSPoints = [{ x: 50 + (10 - 50)/1, y: 10 }, { x: 50 + (90 - 50)/1, y: 90 }];
            
            super.drawCurve(baseDPoints, 'rgba(14, 165, 233, 0.2)');
            super.drawCurve(baseSPoints, 'rgba(245, 158, 11, 0.2)');
            super.drawPoint(50, 50, 'rgba(0,0,0,0.2)', 3);
        }
        
        // Current curves
        const dPoints = [{ x: this.getDemandX(90), y: 90 }, { x: this.getDemandX(10), y: 10 }];
        const sPoints = [{ x: this.getSupplyX(10), y: 10 }, { x: this.getSupplyX(90), y: 90 }];
        
        super.drawCurve(dPoints, this.colors.demand);
        super.drawCurve(sPoints, this.colors.supply);
        super.drawLabel('D', dPoints[1].x + 5, dPoints[1].y, this.colors.demand);
        super.drawLabel('S', sPoints[1].x + 5, sPoints[1].y, this.colors.supply);
        
        const eq = this.getEquilibrium();
        super.drawDashedLineToAxes(eq.x, eq.y, this.colors.equilibrium);
        super.drawPoint(eq.x, eq.y, this.colors.equilibrium);
        super.drawLabel('Pe', 5, eq.y, this.colors.text, 'right');
        super.drawLabel('Qe', eq.x, 5, this.colors.text, 'center');
    }
}
