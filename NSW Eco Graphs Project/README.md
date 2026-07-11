# NSW Economics Interactive Graphs

An interactive study tool for the NSW Preliminary (Year 11) and HSC (Year 12) Economics syllabus. This site provides genuinely interactive, manipulable graphs rather than static images, helping students build visual intuition and correctly distinguish between shifts of a curve vs movements along a curve.

## Requirements & Setup

This project uses **zero build steps** and relies strictly on plain HTML, CSS, and vanilla JavaScript. 
There is no `package.json`, no `node_modules`, and no bundler (Webpack/Vite).

### How to Run

1. Open this folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.
3. Right-click `index.html` and select **Open with Live Server**.
4. The site will open in your default browser.

(Alternatively, you can just open `index.html` directly in any modern web browser, though Live Server is recommended for the best experience).

## Included Graphs

### Year 11 (Preliminary)
* **Introduction to Economics**: Production Possibility Frontier (PPF), Circular Flow of Income.
* **Consumers and Business**: Basic Demand and Supply, Price Elasticity of Demand, Price Elasticity of Supply, Market Intervention (Price Ceilings & Floors).
* **Markets**: Multiple Simultaneous Shocks.
* **Labour Markets**: Labour Market (Demand & Supply of Labour with Minimum Wage).
* **Financial Markets**: Loanable Funds Market, Money Market (RBA Monetary Policy), Foreign Exchange Market (Floating).

### Year 12 (HSC)
* **The Global Economy**: Foreign Exchange Market (Extended with Fixed/Managed Rates), J-Curve.
* **Economic Issues**: Aggregate Demand / Aggregate Supply (AD/AS), Business Cycle, Phillips Curve, Lorenz Curve.
* **Economic Policies**: Monetary Policy Transmission Mechanism, Fiscal Policy on the AD/AS Model.

## Architecture

* `index.html`: Entry point with the UI layout, tabs, sidebars, and canvas containers.
* `style.css`: All styling using standard CSS.
* `js/nav.js`: Handles tab and sidebar topic switching.
* `js/graph-utils.js`: A base `BaseGraph` class providing reusable canvas drawing utilities, coordinate mapping, tweening/animation, and drag interactions.
* `js/graphs/*.js`: Individual graph implementations extending `BaseGraph` (or implementing custom drawing for diagrams like Circular Flow).
* `js/app.js`: Instantiates all graph objects when the DOM is loaded.
