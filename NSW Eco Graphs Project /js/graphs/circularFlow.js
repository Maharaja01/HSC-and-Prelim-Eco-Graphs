class CircularFlowGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.showLeakages = true;
        this.showInjections = true;
        
        this.sectors = {
            households: { x: 300, y: 70, label: 'Households', color: '#3b82f6' },
            firms: { x: 300, y: 380, label: 'Firms', color: '#10b981' },
            financial: { x: 150, y: 225, label: 'Financial Sector', color: '#8b5cf6' },
            government: { x: 300, y: 225, label: 'Government', color: '#f59e0b' },
            overseas: { x: 450, y: 225, label: 'Overseas Sector', color: '#ec4899' }
        };
        
        // Animation loop for flowing dots
        this.offset = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        
        // Interaction
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.hoveredSector = null;
    }
    
    reset() {
        this.showLeakages = true;
        this.showInjections = true;
        document.getElementById('toggle-leakages').checked = true;
        document.getElementById('toggle-injections').checked = true;
        this.updateStatus('Hover or click on sectors to see their role.');
    }
    
    toggleLeakages(show) {
        this.showLeakages = show;
        this.updateStatus(show ? 'Leakages (Savings, Taxes, Imports) remove money from the circular flow.' : 'Leakages hidden.');
    }
    
    toggleInjections(show) {
        this.showInjections = show;
        this.updateStatus(show ? 'Injections (Investment, Govt Spending, Exports) add money into the circular flow.' : 'Injections hidden.');
    }
    
    updateStatus(text) {
        const el = document.getElementById('circular-status');
        if(el) el.innerHTML = text;
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let found = null;
        for (const [key, sector] of Object.entries(this.sectors)) {
            const dx = x - sector.x;
            const dy = y - sector.y;
            if (Math.sqrt(dx*dx + dy*dy) < 50) { // 50 is approx radius
                found = key;
                break;
            }
        }
        
        if (found !== this.hoveredSector) {
            this.hoveredSector = found;
            if (found === 'households') this.updateStatus('Households supply resources (labour) and consume goods and services.');
            else if (found === 'firms') this.updateStatus('Firms produce goods and services and pay incomes to households.');
            else if (found === 'financial') this.updateStatus('Financial sector mobilises savings and lends for investment.');
            else if (found === 'government') this.updateStatus('Government collects taxes and provides collective goods/services.');
            else if (found === 'overseas') this.updateStatus('Overseas sector handles exports (injections) and imports (leakages).');
            else this.updateStatus('Hover or click on sectors to see their role.');
        }
    }
    
    drawArrow(x1, y1, x2, y2, label, color, dashed = false) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (dashed) ctx.setLineDash([5, 5]);
        else ctx.setLineDash([]);
        
        // Draw main line
        // Calculate offset to not draw inside circles
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const r = 45; // radius of sector box
        
        const startX = x1 + r * Math.cos(angle);
        const startY = y1 + r * Math.sin(angle);
        const endX = x2 - r * Math.cos(angle);
        const endY = y2 - r * Math.sin(angle);
        
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI/6), endY - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI/6), endY - 10 * Math.sin(angle + Math.PI/6));
        ctx.fill();
        
        // Flowing dots animation
        const length = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
        const dotPos = (this.offset % 50) / 50;
        // Draw multiple dots along the line
        ctx.fillStyle = color;
        for(let i=0; i<3; i++) {
            let p = (dotPos + i/3) % 1;
            ctx.beginPath();
            ctx.arc(startX + (endX - startX)*p, startY + (endY - startY)*p, 3, 0, Math.PI*2);
            ctx.fill();
        }
        
        // Label
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.setLineDash([]);
        
        // Position label slightly offset from center
        const midX = startX + (endX - startX)/2;
        const midY = startY + (endY - startY)/2;
        ctx.fillText(label, midX, midY - 10);
    }
    
    drawCurvedArrow(x1, y1, x2, y2, cpX, cpY, label, color) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cpX, cpY, x2, y2);
        ctx.stroke();
        
        // Simplistic arrowhead at the end
        const angle = Math.atan2(y2 - cpY, x2 - cpX);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx.fill();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, cpX, cpY);
    }

    animate() {
        this.offset += 1;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Base flows (Income and Consumption)
        // From Firms to Households (Income)
        this.drawCurvedArrow(this.sectors.firms.x - 40, this.sectors.firms.y, this.sectors.households.x - 40, this.sectors.households.y, 150, 225, 'Income (Y)', '#3b82f6');
        // From Households to Firms (Consumption)
        this.drawCurvedArrow(this.sectors.households.x + 40, this.sectors.households.y, this.sectors.firms.x + 40, this.sectors.firms.y, 450, 225, 'Consumption (C)', '#10b981');
        
        // Leakages
        if (this.showLeakages) {
            this.drawArrow(this.sectors.households.x, this.sectors.households.y, this.sectors.financial.x, this.sectors.financial.y, 'Savings (S)', '#ef4444');
            this.drawArrow(this.sectors.households.x, this.sectors.households.y, this.sectors.government.x, this.sectors.government.y, 'Taxation (T)', '#ef4444');
            this.drawArrow(this.sectors.households.x, this.sectors.households.y, this.sectors.overseas.x, this.sectors.overseas.y, 'Imports (M)', '#ef4444');
        }
        
        // Injections
        if (this.showInjections) {
            this.drawArrow(this.sectors.financial.x, this.sectors.financial.y, this.sectors.firms.x, this.sectors.firms.y, 'Investment (I)', '#10b981');
            this.drawArrow(this.sectors.government.x, this.sectors.government.y, this.sectors.firms.x, this.sectors.firms.y, 'Govt Exp (G)', '#10b981');
            this.drawArrow(this.sectors.overseas.x, this.sectors.overseas.y, this.sectors.firms.x, this.sectors.firms.y, 'Exports (X)', '#10b981');
        }
        
        // Draw Sectors
        for (const [key, sector] of Object.entries(this.sectors)) {
            const ctx = this.ctx;
            ctx.beginPath();
            ctx.fillStyle = sector.color;
            ctx.arc(sector.x, sector.y, 40, 0, Math.PI*2);
            ctx.fill();
            if (this.hoveredSector === key) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#334155';
                ctx.stroke();
            }
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            
            // Multiline label hack
            const words = sector.label.split(' ');
            if(words.length > 1) {
                ctx.fillText(words[0], sector.x, sector.y - 4);
                ctx.fillText(words[1], sector.x, sector.y + 10);
            } else {
                ctx.fillText(sector.label, sector.x, sector.y + 4);
            }
        }
        
        requestAnimationFrame(this.animate);
    }
}
