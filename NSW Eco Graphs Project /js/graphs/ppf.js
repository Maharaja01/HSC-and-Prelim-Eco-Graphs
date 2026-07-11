class PPFGraph extends BaseGraph {
    constructor(canvasId) {
        super(canvasId, {
            xLabel: 'Consumer Goods',
            yLabel: 'Capital Goods',
            xRange: [0, 120],
            yRange: [0, 120]
        });
        
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.radius = 90;
        this.pointT = 0.5; // Parameter along the curve (0 to 1)
        this.pointInsideR = 0; // if > 0, point is inside curve
        this.isDragging = false;
        this.updateStatus('ppf-status', 'Drag the point on the curve to see the opportunity cost in action.');
    }
    
    reset() {
        this.animateValue(this, 'radius', 90, 500, () => {
            this.pointInsideR = 0;
            this.pointT = 0.5;
            this.draw();
            this.updateStatus('ppf-status', 'Reset to default position.');
        });
    }

    getCurvePoints(r) {
        let points = [];
        for(let t=0; t<=1; t+=0.05) {
            // Elliptical/circular curve: x^2 + y^2 = r^2
            // Let x = r * cos(theta), y = r * sin(theta) where theta goes from pi/2 to 0
            let theta = (1 - t) * (Math.PI / 2);
            points.push({
                x: r * Math.cos(theta),
                y: r * Math.sin(theta)
            });
        }
        return points;
    }
    
    getPointCoords() {
        let r = this.pointInsideR > 0 ? this.pointInsideR : this.radius;
        let theta = (1 - this.pointT) * (Math.PI / 2);
        return {
            x: r * Math.cos(theta),
            y: r * Math.sin(theta)
        };
    }

    draw() {
        super.clear();
        super.drawAxes();
        
        const curveColor = this.colors.demand;
        const curvePoints = this.getCurvePoints(this.radius);
        super.drawCurve(curvePoints, curveColor, 3);
        super.drawLabel('PPF', curvePoints[curvePoints.length-2].x + 5, curvePoints[curvePoints.length-2].y + 10, curveColor);
        
        // Draw point
        const pt = this.getPointCoords();
        super.drawDashedLineToAxes(pt.x, pt.y, this.colors.other);
        super.drawPoint(pt.x, pt.y, this.colors.equilibrium);
        
        // Labels for coordinates
        super.drawLabel(Math.round(pt.x), pt.x, 5, this.colors.text, 'center');
        super.drawLabel(Math.round(pt.y), 5, pt.y, this.colors.text, 'right');
    }

    shiftOutward() {
        this.pointInsideR = 0;
        this.animateValue(this, 'radius', 110, 500, () => {
            this.updateStatus('ppf-status', '<span class="badge shift">Shift of the curve</span> Economic growth has increased the productive capacity, shifting the PPF outward.');
        });
    }

    shiftInward() {
        this.pointInsideR = 0;
        this.animateValue(this, 'radius', 70, 500, () => {
            this.updateStatus('ppf-status', '<span class="badge shift">Shift of the curve</span> A natural disaster destroyed resources, shifting the PPF inward.');
        });
    }
    
    pointInside() {
        // Move point to an inefficient position inside the curve
        this.animateValue(this, 'pointInsideR', 50, 500, () => {
            this.updateStatus('ppf-status', 'Point inside the curve represents unemployment or inefficient use of resources.');
        });
    }

    onDragStart(x, y) {
        const pt = this.getPointCoords();
        // Check if click is near point
        const pxX = this.xToPx(x);
        const pxY = this.yToPx(y);
        const ptPxX = this.xToPx(pt.x);
        const ptPxY = this.yToPx(pt.y);
        
        const dist = Math.sqrt(Math.pow(pxX - ptPxX, 2) + Math.pow(pxY - ptPxY, 2));
        if(dist < 20) {
            this.isDragging = true;
        }
    }

    onDragMove(x, y) {
        if(this.isDragging) {
            // Find closest t for the given x, y
            // We want theta = atan2(y, x)
            let theta = Math.atan2(y, x);
            // bound theta between 0 and pi/2
            theta = Math.max(0, Math.min(Math.PI/2, theta));
            this.pointT = 1 - (theta / (Math.PI / 2));
            
            // if we were inside, dragging snaps us back to the frontier usually, 
            // but let's keep the current radius if pointInsideR is set
            this.draw();
            this.updateStatus('ppf-status', '<span class="badge movement">Movement along the curve</span> Reallocating resources changes the combination of goods. Notice the opportunity cost.');
        }
    }

    onDragEnd() {
        this.isDragging = false;
    }
}
