class AdAsGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Real GDP (Y)';
        this.yLabel = 'Price Level (PL)';
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.adShift = 50; // Shift of AD curve
        this.asShift = 50; // Shift of AS curve
        this.updateStatus('adas-status', 'Economy at macroeconomic equilibrium.');
    }
    
    reset() {
        this.animateValue(this, 'adShift', 50, 400);
        this.animateValue(this, 'asShift', 50, 400, () => {
            this.updateStatus('adas-status', 'Reset to default equilibrium.');
        });
    }

    shiftAD(dir) {
        const target = this.adShift === 50 ? (dir > 0 ? 70 : 30) : 50;
        this.animateValue(this, 'adShift', target, 500, () => {
            if (target > 50) this.updateStatus('adas-status', '<span class="badge shift">Shift</span> Expansionary policy or increased confidence. AD shifts right. Price Level and Real GDP increase.');
            else if (target < 50) this.updateStatus('adas-status', '<span class="badge shift">Shift</span> Contractionary policy or decreased confidence. AD shifts left. Price Level and Real GDP decrease.');
            else this.updateStatus('adas-status', 'Economy at macroeconomic equilibrium.');
        });
    }

    shiftAS(dir) {
        const target = this.asShift === 50 ? (dir > 0 ? 70 : 30) : 50;
        this.animateValue(this, 'asShift', target, 500, () => {
            if (target > 50) this.updateStatus('adas-status', '<span class="badge shift">Shift</span> Favourable supply shock (e.g. productivity growth). AS shifts right. Price Level falls, Real GDP rises.');
            else if (target < 50) this.updateStatus('adas-status', '<span class="badge shift">Shift</span> Adverse supply shock (e.g. oil price spike). AS shifts left. Stagflation occurs: Price Level rises AND Real GDP falls.');
            else this.updateStatus('adas-status', 'Economy at macroeconomic equilibrium.');
        });
    }
    
    getAdX(y) {
        return this.adShift + (y - 50) / -1;
    }
    
    getAsY(x) {
        // AS Curve: relatively flat at low GDP, steep near full employment
        // Let full employment be near x = 80 + (asShift - 50)
        const shiftX = x - (this.asShift - 50);
        // Exponential curve: y = 20 + e^(0.1 * (shiftX - 50))
        // Tune this to hit (50, 50)
        // 50 = a + e^(b*(50-c))
        // Let's just use a simple rational function: y = a / (b - x) + c
        // Or just points that we interpolate
        return 50;
    }
    
    getAsCurvePoints() {
        let points = [];
        const shiftAmount = this.asShift - 50;
        // Generate an L-shaped curve
        // Keynesian range (flat) -> Intermediate (curved) -> Classical (vertical)
        for (let y = 10; y <= 95; y+=5) {
            // x = asymptote - c / (y - min_y)
            // if y=50, x=50
            const asymptote = 90 + shiftAmount;
            // (50 - asymptote) * (50 - 5) = -c
            // (-40) * 45 = -1800 => c = 1800
            const c = 1800;
            const x = asymptote - c / (y + 5); 
            if (x > 0 && x <= 100) {
                points.push({x: x, y: y});
            }
        }
        return points;
    }
    
    getEquilibrium() {
        // Find intersection of AD and AS points
        const asPoints = this.getAsCurvePoints();
        for (let i = 0; i < asPoints.length - 1; i++) {
            const p1 = asPoints[i];
            const p2 = asPoints[i+1];
            
            const adX1 = this.getAdX(p1.y);
            const adX2 = this.getAdX(p2.y);
            
            // If AD crosses AS between p1 and p2
            if ((adX1 - p1.x) * (adX2 - p2.x) <= 0) {
                // Interpolate
                const t = (adX1 - p1.x) / ((p2.x - adX2) + (adX1 - p1.x));
                return {
                    x: p1.x + t * (p2.x - p1.x),
                    y: p1.y + t * (p2.y - p1.y)
                };
            }
        }
        return {x: 50, y: 50}; // fallback
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw AD
        const adPoints = [
            { x: this.getAdX(90), y: 90 },
            { x: this.getAdX(10), y: 10 }
        ];
        super.drawCurve(adPoints, this.colors.demand);
        super.drawLabel('AD', adPoints[1].x + 5, adPoints[1].y, this.colors.demand);
        
        // Draw AS
        const asPoints = this.getAsCurvePoints();
        super.drawCurve(asPoints, this.colors.supply);
        super.drawLabel('AS', asPoints[asPoints.length-1].x - 5, asPoints[asPoints.length-1].y + 10, this.colors.supply);
        
        // Equilibrium
        const eq = this.getEquilibrium();
        super.drawDashedLineToAxes(eq.x, eq.y, this.colors.equilibrium);
        super.drawPoint(eq.x, eq.y, this.colors.equilibrium);
        
        super.drawLabel('PL', 5, eq.y, this.colors.text, 'right');
        super.drawLabel('Y', eq.x, 5, this.colors.text, 'center');
    }
}
