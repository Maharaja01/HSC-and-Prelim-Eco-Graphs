class LorenzCurveGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId, {
            xLabel: 'Cumulative % of Population',
            yLabel: 'Cumulative % of Income',
            xRange: [0, 100],
            yRange: [0, 100]
        });
        
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.inequality = 30; // 0 to 100 (bow amount)
        const slider = document.getElementById('lorenz-slider');
        if (slider) slider.value = 30;
        
        this.updateStatus('lorenz-status', 'Gini Coefficient: ~0.30. Adjust slider to see inequality change.');
    }
    
    reset() {
        this.animateValue(this, 'inequality', 30, 400, () => {
            const slider = document.getElementById('lorenz-slider');
            if (slider) slider.value = 30;
            this.updateFeedback();
        });
    }

    setInequality(val) {
        this.inequality = parseFloat(val);
        this.draw();
        this.updateFeedback();
    }
    
    updateFeedback() {
        // Approximate Gini
        const gini = (this.inequality / 100).toFixed(2);
        this.updateStatus('lorenz-status', `<strong>Gini Coefficient: ~${gini}</strong>. ${this.inequality > 50 ? 'High inequality.' : 'Moderate/Low inequality.'}`);
    }
    
    getCurvePoints() {
        let points = [];
        for (let x = 0; x <= 100; x += 2) {
            let t = x / 100;
            // Equality line is y = x
            // Lorenz curve bows below it.
            // y = x * (1 - bow*(1-x)) or something similar.
            // Let's use a power function: y = x^a where a >= 1
            // Mapping inequality (0-100) to 'a': 
            // 0 -> a=1 (line)
            // 100 -> a=5 (very bowed)
            const a = 1 + (this.inequality / 100) * 4;
            let y = Math.pow(t, a) * 100;
            points.push({x: x, y: y});
        }
        return points;
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        // Line of Perfect Equality
        const eqPoints = [{x: 0, y: 0}, {x: 100, y: 100}];
        super.drawLine(eqPoints[0].x, eqPoints[0].y, eqPoints[1].x, eqPoints[1].y, this.colors.equilibrium, 2, [5,5]);
        
        // Rotate text for diagonal line
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.xToPx(50), this.yToPx(55));
        // angle is approx -atan((height)/(width))
        const dx = this.xToPx(100) - this.xToPx(0);
        const dy = this.yToPx(100) - this.yToPx(0); // negative
        ctx.rotate(Math.atan2(dy, dx));
        ctx.fillStyle = this.colors.equilibrium;
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Line of Perfect Equality', 0, 0);
        ctx.restore();
        
        // Lorenz Curve
        const lPoints = this.getCurvePoints();
        super.drawCurve(lPoints, this.colors.demand, 3);
        
        // Label Area A and B
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 16px Inter';
        ctx.fillText('A', this.xToPx(60), this.yToPx(50));
        ctx.fillText('B', this.xToPx(75), this.yToPx(20));
        
        // Fill Area A (between Equality line and Lorenz curve)
        ctx.beginPath();
        ctx.moveTo(this.xToPx(0), this.yToPx(0));
        for (let p of lPoints) {
            ctx.lineTo(this.xToPx(p.x), this.yToPx(p.y));
        }
        ctx.lineTo(this.xToPx(100), this.yToPx(100)); // It should already be there
        ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
        ctx.fill();
    }
}
