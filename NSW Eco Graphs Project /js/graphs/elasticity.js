class PEDGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.elasticity = 5; // 1 to 10
        this.price = 50;
        this.pivotX = 50;
        this.pivotY = 50; // Curve always passes through (50, 50)
        
        const slider = document.getElementById('ped-slider');
        if(slider) slider.value = 5;
        const pSlider = document.getElementById('ped-price');
        if(pSlider) pSlider.value = 50;
    }
    
    reset() {
        this.resetState();
        this.draw();
        this.updateStatus('ped-status', 'Reset to default elasticity and price.');
    }
    
    getSlope() {
        // Elasticity 1 (inelastic) -> steep slope (e.g. -10)
        // Elasticity 10 (elastic) -> flat slope (e.g. -0.1)
        // Map 1-10 to -10 to -0.1 logarithmically or simply:
        return - (11 - this.elasticity) / this.elasticity;
    }
    
    getDemandX(y) {
        return this.pivotX + (y - this.pivotY) / this.getSlope();
    }

    setElasticity(val) {
        this.elasticity = parseFloat(val);
        this.draw();
        this.updateFeedback();
    }

    setPrice(val) {
        this.price = parseFloat(val);
        this.draw();
        this.updateFeedback();
    }
    
    updateFeedback() {
        const q = this.getDemandX(this.price);
        const tr = (this.price * q).toFixed(0);
        let type = this.elasticity > 5 ? 'Relatively Elastic' : (this.elasticity < 5 ? 'Relatively Inelastic' : 'Unit Elastic');
        
        this.updateStatus('ped-status', `<strong>${type}</strong>. Price: $${this.price}, Quantity: ${Math.round(q)}. Total Revenue: $${tr}`);
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw Demand Curve
        const dPoints = [
            { x: this.getDemandX(90), y: 90 },
            { x: this.getDemandX(10), y: 10 }
        ];
        
        // Clamp to avoid drawing way outside
        if (dPoints[0].x < 0) dPoints[0] = { x: 0, y: this.pivotY + (0 - this.pivotX) * this.getSlope() };
        if (dPoints[1].x > 100) dPoints[1] = { x: 100, y: this.pivotY + (100 - this.pivotX) * this.getSlope() };
        
        super.drawCurve(dPoints, this.colors.demand);
        super.drawLabel('D', Math.min(100, dPoints[1].x) - 5, Math.max(0, dPoints[1].y), this.colors.demand);
        
        // Total revenue box
        const q = this.getDemandX(this.price);
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
        
        // Box from (0,0) to (q, price)
        const pxX = this.xToPx(q);
        const pxY = this.yToPx(this.price);
        const pxOriginX = this.xToPx(0);
        const pxOriginY = this.yToPx(0);
        
        ctx.fillRect(pxOriginX, pxY, pxX - pxOriginX, pxOriginY - pxY);
        
        // Point and lines
        super.drawDashedLineToAxes(q, this.price, this.colors.demand);
        super.drawPoint(q, this.price, this.colors.demand);
        super.drawLabel('P', 5, this.price, this.colors.text, 'right');
        super.drawLabel('Q', q, 5, this.colors.text, 'center');
        
        // Label TR
        ctx.fillStyle = this.colors.text;
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('TR Area', pxOriginX + (pxX - pxOriginX)/2, pxY + (pxOriginY - pxY)/2);
    }
}

class PESGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.elasticity = 5; // 1 to 10
        this.pivotX = 50;
        this.pivotY = 50;
        
        const slider = document.getElementById('pes-slider');
        if(slider) slider.value = 5;
    }
    
    reset() {
        this.resetState();
        this.draw();
        this.updateStatus('pes-status', 'Reset to default elasticity.');
    }
    
    getSlope() {
        return (11 - this.elasticity) / this.elasticity;
    }
    
    getSupplyX(y) {
        return this.pivotX + (y - this.pivotY) / this.getSlope();
    }

    setElasticity(val) {
        this.elasticity = parseFloat(val);
        this.draw();
        
        let type = this.elasticity > 5 ? 'Relatively Elastic' : (this.elasticity < 5 ? 'Relatively Inelastic' : 'Unit Elastic');
        this.updateStatus('pes-status', `<strong>${type}</strong>. See how the steepness changes the responsiveness of quantity to a price change.`);
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw Supply Curve
        let sPoints = [
            { x: this.getSupplyX(10), y: 10 },
            { x: this.getSupplyX(90), y: 90 }
        ];
        
        if (sPoints[0].x < 0) sPoints[0] = { x: 0, y: this.pivotY + (0 - this.pivotX) * this.getSlope() };
        if (sPoints[1].x > 100) sPoints[1] = { x: 100, y: this.pivotY + (100 - this.pivotX) * this.getSlope() };
        
        super.drawCurve(sPoints, this.colors.supply);
        super.drawLabel('S', sPoints[1].x + 5, sPoints[1].y, this.colors.supply);
        
        // Two points to show responsiveness
        const p1 = 40;
        const q1 = this.getSupplyX(p1);
        const p2 = 60;
        const q2 = this.getSupplyX(p2);
        
        super.drawDashedLineToAxes(q1, p1, this.colors.supply);
        super.drawPoint(q1, p1, this.colors.supply);
        
        super.drawDashedLineToAxes(q2, p2, this.colors.supply);
        super.drawPoint(q2, p2, this.colors.supply);
        
        super.drawLabel('P1', 5, p1, this.colors.text, 'right');
        super.drawLabel('P2', 5, p2, this.colors.text, 'right');
        super.drawLabel('Q1', q1, 5, this.colors.text, 'center');
        super.drawLabel('Q2', q2, 5, this.colors.text, 'center');
        
        // Draw arrow for quantity change
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = '#ec4899'; // shift color
        ctx.lineWidth = 2;
        // Draw arrow from q1 to q2 below x-axis
        const yPx = this.yToPx(-5);
        ctx.moveTo(this.xToPx(q1), yPx);
        ctx.lineTo(this.xToPx(q2), yPx);
        ctx.stroke();
    }
}
