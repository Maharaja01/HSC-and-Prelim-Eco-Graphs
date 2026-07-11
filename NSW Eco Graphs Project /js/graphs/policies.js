class TransmissionGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.resetState();
        this.draw();
    }
    
    resetState() {
        this.policy = null; // 'increase' or 'decrease'
        this.step = 0; // 0 to 4
        this.updateStatus('Select a policy change to begin.');
    }
    
    reset() {
        this.resetState();
        this.draw();
    }
    
    updateStatus(text) {
        const el = document.getElementById('transmission-status');
        if(el) el.innerHTML = text;
    }
    
    startFlow(type) {
        this.policy = type;
        this.step = 0;
        this.draw();
        
        // Auto advance steps
        const advance = () => {
            if (this.step < 4) {
                this.step++;
                this.draw();
                
                let msg = '';
                const p = this.policy;
                if (this.step === 1) msg = p==='increase' ? '1. RBA increases Cash Rate via DMOs.' : '1. RBA decreases Cash Rate via DMOs.';
                if (this.step === 2) msg = p==='increase' ? '2. Commercial banks pass on higher costs, raising market interest rates.' : '2. Commercial banks pass on lower costs, dropping market interest rates.';
                if (this.step === 3) msg = p==='increase' ? '3. Higher rates reduce borrowing/investment and increase savings.' : '3. Lower rates increase borrowing/investment and decrease savings.';
                if (this.step === 4) msg = p==='increase' ? '4. Aggregate Demand falls, reducing inflation and economic growth (Tightening).' : '4. Aggregate Demand rises, increasing inflation and economic growth (Loosening).';
                
                this.updateStatus(msg);
                setTimeout(advance, 1500);
            }
        };
        
        advance();
    }
    
    drawBox(x, y, text, isActive, color) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.fillStyle = isActive ? color : '#f1f5f9';
        ctx.strokeStyle = isActive ? '#1e293b' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.roundRect(x - 80, y - 30, 160, 60, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = isActive ? '#fff' : '#64748b';
        if (isActive && color === '#f1f5f9') ctx.fillStyle = '#1e293b'; // for active neutral
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        
        // Split text
        const lines = text.split('\n');
        if (lines.length === 1) {
            ctx.fillText(text, x, y + 5);
        } else {
            ctx.fillText(lines[0], x, y - 5);
            ctx.fillText(lines[1], x, y + 15);
        }
    }
    
    drawArrow(x1, y1, x2, y2, isActive) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = isActive ? '#1e293b' : '#cbd5e1';
        ctx.lineWidth = isActive ? 3 : 2;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.fillStyle = isActive ? '#1e293b' : '#cbd5e1';
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const cIncrease = '#ef4444'; // Red for tightening
        const cDecrease = '#10b981'; // Green for loosening
        
        const color = this.policy === 'increase' ? cIncrease : (this.policy === 'decrease' ? cDecrease : '#f1f5f9');
        const dirText = this.policy === 'increase' ? 'Increases' : 'Decreases';
        const adText = this.policy === 'increase' ? 'Falls' : 'Rises';
        
        // 4 steps, arranged horizontally or zig-zag
        const p1 = {x: 100, y: 100};
        const p2 = {x: 300, y: 100};
        const p3 = {x: 500, y: 200};
        const p4 = {x: 300, y: 300};
        
        this.drawBox(p1.x, p1.y, `RBA ${this.policy ? dirText : 'Changes'}\nCash Rate`, this.step >= 1, color);
        
        if (this.step >= 1) this.drawArrow(p1.x + 80, p1.y, p2.x - 80, p2.y, this.step >= 2);
        else this.drawArrow(p1.x + 80, p1.y, p2.x - 80, p2.y, false);
        
        this.drawBox(p2.x, p2.y, `Market Interest\nRates ${this.policy ? dirText : 'Change'}`, this.step >= 2, color);
        
        if (this.step >= 2) this.drawArrow(p2.x + 80, p2.y, p3.x, p3.y - 30, this.step >= 3);
        else this.drawArrow(p2.x + 80, p2.y, p3.x, p3.y - 30, false);
        
        this.drawBox(p3.x, p3.y, `Borrowing & Investment\n${this.policy === 'increase' ? 'Decrease' : (this.policy === 'decrease' ? 'Increase' : 'Respond')}`, this.step >= 3, color);
        
        if (this.step >= 3) this.drawArrow(p3.x - 80, p3.y, p4.x + 80, p4.y, this.step >= 4);
        else this.drawArrow(p3.x - 80, p3.y, p4.x + 80, p4.y, false);
        
        this.drawBox(p4.x, p4.y, `Aggregate Demand\n${this.policy ? adText : 'Responds'}`, this.step >= 4, color);
    }
}

class FiscalPolicyGraph extends AdAsGraph {
    constructor(canvasId) {
        super(canvasId);
    }
    
    resetState() {
        super.resetState();
        this.updateStatus('fiscal-status', 'Budget: Balanced. Economy at equilibrium.');
    }
    
    setPolicy(type) {
        if (type === 'expansionary') {
            this.animateValue(this, 'adShift', 70, 500, () => {
                this.updateStatus('fiscal-status', `<span class="badge shift">Expansionary Fiscal Policy</span> Budget Deficit (G > T). AD shifts right. Used to stimulate economic growth and reduce unemployment.`);
            });
        } else if (type === 'contractionary') {
            this.animateValue(this, 'adShift', 30, 500, () => {
                this.updateStatus('fiscal-status', `<span class="badge shift">Contractionary Fiscal Policy</span> Budget Surplus (T > G). AD shifts left. Used to cool down inflation.`);
            });
        }
    }
}
