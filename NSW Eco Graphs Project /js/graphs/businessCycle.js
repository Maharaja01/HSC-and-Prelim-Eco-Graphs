class BusinessCycleGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId, {
            xLabel: 'Time',
            yLabel: 'Real GDP',
            xRange: [0, 100],
            yRange: [0, 100]
        });
        
        this.resetState();
        this.draw();
        
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', () => this.updateStatus('cycle-status', 'Hover along the curve to see the phases (Expansion, Peak, Contraction, Trough).'));
    }
    
    resetState() {
        this.hoverX = -1;
    }
    
    reset() {
        this.resetState();
        this.draw();
    }
    
    getTrendY(x) {
        // Upward sloping trend line
        return 20 + x * 0.6;
    }
    
    getCycleY(x) {
        // Sine wave around the trend
        const trend = this.getTrendY(x);
        // Amplitude = 20, frequency = 2 pi / 40
        const cycle = 20 * Math.sin((x - 10) * Math.PI / 25);
        return trend + cycle;
    }
    
    getPhase(x) {
        // Derivative of sine wave is cosine.
        // Math.cos((x - 10) * Math.PI / 25)
        // If cos > 0 -> expansion
        // If cos < 0 -> contraction
        // Near peaks and troughs:
        const angle = ((x - 10) % 50 + 50) % 50; // 0 to 50
        if (angle > 10 && angle < 15) return 'Peak';
        if (angle >= 15 && angle <= 35) return 'Contraction (Recession)';
        if (angle > 35 && angle < 40) return 'Trough';
        return 'Expansion (Upswing)';
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const pxX = e.clientX - rect.left;
        const x = this.pxToX(pxX);
        
        if (x >= 0 && x <= 100) {
            this.hoverX = x;
            this.draw();
            
            const phase = this.getPhase(x);
            let msg = '';
            if (phase.includes('Expansion')) msg = '<strong>Expansion:</strong> Increasing economic activity, rising employment and inflation.';
            else if (phase.includes('Contraction')) msg = '<strong>Contraction:</strong> Decreasing economic activity, rising unemployment, falling inflation.';
            else if (phase.includes('Peak')) msg = '<strong>Peak:</strong> Maximum capacity, bottlenecks, high inflation.';
            else if (phase.includes('Trough')) msg = '<strong>Trough:</strong> Lowest point, high unemployment, spare capacity.';
            
            this.updateStatus('cycle-status', msg);
        }
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw Trend Line
        const trendPoints = [{x: 0, y: this.getTrendY(0)}, {x: 100, y: this.getTrendY(100)}];
        super.drawLine(trendPoints[0].x, trendPoints[0].y, trendPoints[1].x, trendPoints[1].y, 'rgba(0,0,0,0.3)', 2, [5,5]);
        super.drawLabel('Long-term Trend', 85, this.getTrendY(85) - 10, 'rgba(0,0,0,0.5)');
        
        // Draw Cycle Curve
        let cyclePoints = [];
        for (let x = 0; x <= 100; x += 1) {
            cyclePoints.push({x: x, y: this.getCycleY(x)});
        }
        super.drawCurve(cyclePoints, this.colors.primary || '#2563eb');
        
        // Highlight point if hovering
        if (this.hoverX >= 0) {
            const y = this.getCycleY(this.hoverX);
            super.drawDashedLineToAxes(this.hoverX, y, this.colors.other);
            super.drawPoint(this.hoverX, y, '#ef4444');
            
            const phase = this.getPhase(this.hoverX);
            super.drawLabel(phase, this.hoverX, y + (y > this.getTrendY(this.hoverX) ? 15 : -15), '#ef4444');
        }
    }
}
