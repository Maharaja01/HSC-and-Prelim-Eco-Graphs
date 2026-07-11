class PhillipsCurveGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Unemployment Rate (%)';
        this.yLabel = 'Inflation Rate (%)';
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.shiftAmount = 0; // 0 = normal, positive = stagflation, negative = favourable
        this.currentU = 50; // represents position on x-axis (e.g. 5%)
        
        const slider = document.getElementById('phillips-slider');
        if (slider) slider.value = 50;
        
        this.updateStatus('phillips-status', 'Drag slider to see the short-run trade-off between inflation and unemployment.');
    }
    
    reset() {
        this.animateValue(this, 'shiftAmount', 0, 400);
        this.animateValue(this, 'currentU', 50, 400, () => {
            const slider = document.getElementById('phillips-slider');
            if (slider) slider.value = 50;
            this.updateStatus('phillips-status', 'Reset to default.');
        });
    }
    
    getInflation(u, shift = this.shiftAmount) {
        // Base curve: Inflation = 1000 / u - 10 + shift
        return 1000 / (u + 10) - 5 + shift;
    }
    
    getCurvePoints(shift = this.shiftAmount) {
        let points = [];
        for (let u = 5; u <= 95; u += 2) {
            let inf = this.getInflation(u, shift);
            if (inf >= 5 && inf <= 95) {
                points.push({x: u, y: inf});
            }
        }
        return points;
    }

    movePoint(val) {
        this.currentU = parseFloat(val);
        this.draw();
        
        const inf = this.getInflation(this.currentU);
        this.updateStatus('phillips-status', `<span class="badge movement">Movement along the curve</span> As Unemployment changes to ~${(this.currentU/10).toFixed(1)}%, Inflation moves to ~${(inf/10).toFixed(1)}%.`);
    }

    shift(dir) {
        const target = dir > 0 ? 20 : -20;
        this.animateValue(this, 'shiftAmount', target, 500, () => {
            if (target > 0) {
                this.updateStatus('phillips-status', `<span class="badge shift">Shift of the curve</span> Stagflation: The SRPC shifts outward. Both inflation and unemployment are higher at any point.`);
            } else {
                this.updateStatus('phillips-status', `<span class="badge shift">Shift of the curve</span> Favourable Supply Shock: The SRPC shifts inward. Lower inflation and unemployment.`);
            }
        });
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Base curve if shifted
        if (this.shiftAmount !== 0) {
            const basePoints = this.getCurvePoints(0);
            super.drawCurve(basePoints, 'rgba(14, 165, 233, 0.2)');
        }
        
        // Current curve
        const points = this.getCurvePoints();
        if (points.length > 0) {
            super.drawCurve(points, this.colors.demand);
            super.drawLabel('SRPC', points[points.length-1].x - 10, points[points.length-1].y + 15, this.colors.demand);
        }
        
        // Current Point
        const inf = this.getInflation(this.currentU);
        super.drawDashedLineToAxes(this.currentU, inf, this.colors.equilibrium);
        super.drawPoint(this.currentU, inf, this.colors.equilibrium);
        
        super.drawLabel('π1', 5, inf, this.colors.text, 'right');
        super.drawLabel('u1', this.currentU, 5, this.colors.text, 'center');
    }
}
