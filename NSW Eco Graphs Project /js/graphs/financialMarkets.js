class LoanableFundsGraph extends DemandSupplyGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Quantity of Funds';
        this.yLabel = 'Interest Rate (r)';
        this.draw();
    }
    
    resetState() {
        super.resetState();
        this.updateStatus('loanable-status', 'Equilibrium interest rate.');
    }
    
    shiftDemand(dir) {
        super.shiftDemand(dir);
        setTimeout(() => {
            this.updateStatus('loanable-status', `<span class="badge shift">Shift</span> Demand for funds (investment/borrowing) increased. Interest rates rise.`);
        }, 550);
    }
    
    shiftSupply(dir) {
        super.shiftSupply(dir);
        setTimeout(() => {
            this.updateStatus('loanable-status', `<span class="badge shift">Shift</span> Supply of funds (savings) increased. Interest rates fall.`);
        }, 550);
    }
}

class MoneyMarketGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Quantity of Money';
        this.yLabel = 'Interest Rate (Cash Rate)';
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.moneySupplyX = 50;
        this.moneyDemandShift = 50;
        this.updateStatus('money-status', 'Move the slider to see how RBA operations affect the cash rate.');
        
        const slider = document.getElementById('money-supply-slider');
        if (slider) slider.value = 50;
    }
    
    reset() {
        this.animateValue(this, 'moneySupplyX', 50, 400, () => {
            const slider = document.getElementById('money-supply-slider');
            if (slider) slider.value = 50;
            this.updateStatus('money-status', 'Reset to default.');
        });
    }

    setMoneySupply(val) {
        this.moneySupplyX = parseFloat(val);
        this.draw();
        
        if (this.moneySupplyX > 50) {
            this.updateStatus('money-status', `<span class="badge shift">Shift</span> RBA buys bonds, increasing money supply (shifting right). Cash rate falls.`);
        } else if (this.moneySupplyX < 50) {
            this.updateStatus('money-status', `<span class="badge shift">Shift</span> RBA sells bonds, decreasing money supply (shifting left). Cash rate rises.`);
        } else {
            this.updateStatus('money-status', 'Move the slider to see how RBA operations affect the cash rate.');
        }
    }
    
    getDemandX(y) {
        return this.moneyDemandShift + (y - 50) / -1;
    }
    
    getEquilibrium() {
        // Supply is vertical at moneySupplyX
        const x = this.moneySupplyX;
        // Demand: x = moneyDemandShift + (y - 50) / -1
        // y - 50 = -1 * (x - moneyDemandShift)
        const y = 50 - (x - this.moneyDemandShift);
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
        super.drawLabel('MD', dPoints[1].x + 5, dPoints[1].y, this.colors.demand);
        
        // Draw Supply (Vertical)
        super.drawLine(this.moneySupplyX, 10, this.moneySupplyX, 90, this.colors.supply, 3);
        super.drawLabel('MS', this.moneySupplyX, 5, this.colors.supply, 'center');
        
        // Equilibrium
        const eq = this.getEquilibrium();
        super.drawDashedLineToAxes(eq.x, eq.y, this.colors.equilibrium);
        super.drawPoint(eq.x, eq.y, this.colors.equilibrium);
        
        super.drawLabel('r', 5, eq.y, this.colors.text, 'right');
    }
}

class ForexGraph extends DemandSupplyGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Quantity of AUD';
        this.yLabel = 'Exchange Rate (USD/AUD)';
        this.draw();
    }
    
    resetState() {
        super.resetState();
        this.updateStatus('forex-status', 'Equilibrium floating exchange rate.');
    }
    
    shiftDemand(dir) {
        super.shiftDemand(dir);
        setTimeout(() => {
            if (dir > 0) {
                this.updateStatus('forex-status', `<span class="badge shift">Shift</span> Demand for AUD increases. AUD Appreciates.`);
            } else {
                this.updateStatus('forex-status', `<span class="badge shift">Shift</span> Demand for AUD decreases. AUD Depreciates.`);
            }
        }, 550);
    }
    
    shiftSupply(dir) {
        super.shiftSupply(dir);
        setTimeout(() => {
            if (dir > 0) {
                this.updateStatus('forex-status', `<span class="badge shift">Shift</span> Supply of AUD increases (e.g. Aussies investing overseas). AUD Depreciates.`);
            } else {
                this.updateStatus('forex-status', `<span class="badge shift">Shift</span> Supply of AUD decreases. AUD Appreciates.`);
            }
        }, 550);
    }
}
