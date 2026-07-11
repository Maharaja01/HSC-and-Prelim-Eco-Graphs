// Global graph instances
let ppfGraph, circularFlow, dsGraph, pedGraph, pesGraph, interventionGraph, shocksGraph, labourGraph, loanableGraph, moneyGraph, forexGraph;
let forexExtendedGraph, jcurveGraph, adasGraph, businessCycleGraph, phillipsGraph, lorenzGraph, transmissionGraph, fiscalGraph;

document.addEventListener('DOMContentLoaded', () => {
    // Year 11
    if (typeof PPFGraph !== 'undefined') ppfGraph = new PPFGraph('canvas-ppf');
    if (typeof CircularFlowGraph !== 'undefined') circularFlow = new CircularFlowGraph('canvas-circular');
    if (typeof DemandSupplyGraph !== 'undefined') dsGraph = new DemandSupplyGraph('canvas-ds');
    if (typeof PEDGraph !== 'undefined') pedGraph = new PEDGraph('canvas-ped');
    if (typeof PESGraph !== 'undefined') pesGraph = new PESGraph('canvas-pes');
    if (typeof InterventionGraph !== 'undefined') interventionGraph = new InterventionGraph('canvas-intervention');
    if (typeof MultipleShocksGraph !== 'undefined') shocksGraph = new MultipleShocksGraph('canvas-shocks');
    if (typeof LabourMarketGraph !== 'undefined') labourGraph = new LabourMarketGraph('canvas-labour');
    if (typeof LoanableFundsGraph !== 'undefined') loanableGraph = new LoanableFundsGraph('canvas-loanable');
    if (typeof MoneyMarketGraph !== 'undefined') moneyGraph = new MoneyMarketGraph('canvas-money');
    if (typeof ForexGraph !== 'undefined') forexGraph = new ForexGraph('canvas-forex');

    // Year 12
    if (typeof ForexExtendedGraph !== 'undefined') forexExtendedGraph = new ForexExtendedGraph('canvas-forex-ext');
    if (typeof JCurveGraph !== 'undefined') jcurveGraph = new JCurveGraph('canvas-jcurve');
    if (typeof AdAsGraph !== 'undefined') adasGraph = new AdAsGraph('canvas-adas');
    if (typeof BusinessCycleGraph !== 'undefined') businessCycleGraph = new BusinessCycleGraph('canvas-cycle');
    if (typeof PhillipsCurveGraph !== 'undefined') phillipsGraph = new PhillipsCurveGraph('canvas-phillips');
    if (typeof LorenzCurveGraph !== 'undefined') lorenzGraph = new LorenzCurveGraph('canvas-lorenz');
    if (typeof TransmissionGraph !== 'undefined') transmissionGraph = new TransmissionGraph('canvas-transmission');
    if (typeof FiscalPolicyGraph !== 'undefined') fiscalGraph = new FiscalPolicyGraph('canvas-fiscal');
});
