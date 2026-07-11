class ForexExtendedGraph extends InterventionGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Quantity of Currency';
        this.yLabel = 'Exchange Rate';
        this.draw();
    }
    
    setMode(mode) {
        this.mode = mode;
        if (mode === 'floating') {
            this.regPrice = 50;
            this.updateStatus('forex-ext-status', 'Floating exchange rate determined by market forces.');
        } else if (mode === 'fixed_high') {
            this.regPrice = 70; // Above equilibrium
            const qd = 50 + (this.regPrice - 50) / -1;
            const qs = 50 + (this.regPrice - 50) / 1;
            this.updateStatus('forex-ext-status', `Fixed Rate (Overvalued). Surplus of currency (QS: ${Math.round(qs)} > QD: ${Math.round(qd)}). Central bank must buy currency (sell foreign reserves) to maintain this rate.`);
        } else if (mode === 'fixed_low') {
            this.regPrice = 30; // Below equilibrium
            const qd = 50 + (this.regPrice - 50) / -1;
            const qs = 50 + (this.regPrice - 50) / 1;
            this.updateStatus('forex-ext-status', `Fixed Rate (Undervalued). Shortage of currency (QD: ${Math.round(qd)} > QS: ${Math.round(qs)}). Central bank must sell currency (buy foreign reserves) to maintain this rate.`);
        }
        this.draw();
    }
}

class JCurveGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId);
        this.xLabel = 'Time';
        this.yLabel = 'Trade Balance (Net Exports)';
        this.yRange = [-50, 50]; // Trade deficit to surplus
        
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.animationProgress = 1; // 0 to 1
        this.updateStatus('jcurve-status', 'Click Animate to trace the effect of depreciation over time.');
    }
    
    reset() {
        this.resetState();
        this.draw();
    }
    
    getCurvePoints() {
        let points = [];
        // starts at 0, dips to -30, then rises to 40
        // We can use a cubic bezier or just a math function
        // Let's use a function: y = -30 * sin(pi*x/40) + x
        // For x from 0 to 100
        for (let x = 0; x <= 100; x += 2) {
            // scale x to appropriate time
            let t = x / 100;
            // polynomial: starts at 0, dips, then rises
            let y = -80 * t * Math.exp(-3*t) + 40 * t; 
            // tune to make it look like J
            // t=0 -> 0
            // t=0.2 -> -16 * 0.54 + 8 = -8.6 + 8 = -0.6
            // let's just hardcode a curve using bezier formula
            points.push({ x: x, y: this.jCurveFunction(x) });
        }
        return points;
    }
    
    jCurveFunction(x) {
        // x goes 0 to 100
        // starts at 0 (balanced trade)
        // dips to around -20 at x=20
        // crosses 0 at x=40
        // plateaus around 30 at x=100
        let a = 0.005;
        let b = -0.3;
        let c = x;
        // x=20 -> 0.005*8000 - 0.3*400 + 20 = 40 - 120 + 20 = -60
        // Wait, bezier is easier
        const t = x / 100;
        const p0 = {x: 0, y: 0};
        const p1 = {x: 20, y: -80};
        const p2 = {x: 60, y: 50};
        const p3 = {x: 100, y: 40};
        
        const cx = 3 * (p1.x - p0.x);
        const bx = 3 * (p2.x - p1.x) - cx;
        const ax = p3.x - p0.x - cx - bx;
        
        const cy = 3 * (p1.y - p0.y);
        const by = 3 * (p2.y - p1.y) - cy;
        const ay = p3.y - p0.y - cy - by;
        
        const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;
        return y;
    }

    animateCurve() {
        this.animationProgress = 0;
        this.updateStatus('jcurve-status', '1. Valuation Effect: Imports become more expensive immediately, worsening the trade balance.');
        
        this.animateValue(this, 'animationProgress', 1, 3000, () => {
            this.updateStatus('jcurve-status', '2. Volume Effect: Over time, export volumes increase and import volumes decrease, improving the trade balance past its original position.');
        });
        
        // Mid-animation text update
        setTimeout(() => {
            if (this.animationProgress > 0.1 && this.animationProgress < 0.9) {
                this.updateStatus('jcurve-status', 'Trade balance crosses into surplus as volume effect dominates valuation effect.');
            }
        }, 1500);
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Draw zero line (x-axis)
        super.drawLine(0, 0, 100, 0, 'rgba(0,0,0,0.2)', 1, [5,5]);
        
        let allPoints = this.getCurvePoints();
        
        // Trim points based on animation progress
        let visiblePoints = allPoints.filter(p => p.x <= this.animationProgress * 100);
        
        if (visiblePoints.length > 0) {
            super.drawCurve(visiblePoints, this.colors.demand);
            let lastPoint = visiblePoints[visiblePoints.length - 1];
            super.drawPoint(lastPoint.x, lastPoint.y, this.colors.demand, 4);
        }
        
        // Label depreciation event
        super.drawLabel('Depreciation', 0, -5, this.colors.text, 'left');
    }
}
