// Fetch Bitcoin dominance data and Altcoin Index data
Promise.all([
    d3.json('new_data/cmc_btc_d.json'),
    d3.json('new_data/cmc_alt_index.json')
]).then(function([dominanceResponse, altIndexResponse]) {

    const validateAndParseDate = (timestamp) => {
        const date = new Date(parseInt(timestamp) * 1000);
        if (isNaN(date.getTime())) {
            console.error('Invalid timestamp:', timestamp);
            return null;
        }
        return date;
    };

    const allDominanceData = dominanceResponse.data.points
        .map(point => {
            const date = validateAndParseDate(point.timestamp);
            return date ? {
                date: date,
                value: point.dominance[0],
                timestamp: parseInt(point.timestamp)
            } : null;
        })
        .filter(item => item !== null)
        .sort((a, b) => a.timestamp - b.timestamp);

    const allAltIndexData = altIndexResponse.data.points
        .map(point => {
            const date = validateAndParseDate(point.timestamp);
            return date ? {
                date: date,
                value: parseFloat(point.altcoinIndex),
                timestamp: parseInt(point.timestamp)
            } : null;
        })
        .filter(item => item !== null)
        .sort((a, b) => a.timestamp - b.timestamp);

    const startTimestamp = Math.max(
        allDominanceData[0].timestamp,
        allAltIndexData[0].timestamp
    );
    const endTimestamp = Math.min(
        allDominanceData[allDominanceData.length - 1].timestamp,
        allAltIndexData[allAltIndexData.length - 1].timestamp
    );

    const filteredDominanceData = allDominanceData.filter(
        d => d.timestamp >= startTimestamp && d.timestamp <= endTimestamp
    );
    const filteredAltIndexData = allAltIndexData.filter(
        d => d.timestamp >= startTimestamp && d.timestamp <= endTimestamp
    );

    const chartContainer = document.getElementById('bitcoinDominanceChart');
 
    d3.select('#bitcoinDominanceChart')
        .style('background', 'linear-gradient(45deg, #1a1a3d, #2a2a4d)')
        .style('border-radius', '15px')
        // .style('padding', '20px')
        .style('box-shadow', '0 4px 20px rgba(147, 112, 219, 0.2)');

    // Create time filter buttons
    const filterContainer = document.createElement('div');
    filterContainer.className = 'time-selector';
    filterContainer.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 0px;
        padding: 15px;
        background: linear-gradient(45deg, rgba(26, 26, 61, 0.8), rgba(42, 42, 77, 0.8));
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        margin-top: -50px;
    `;
    
    // Time periods
    const timePeriods = ['1m', '3m', '6m', '12m'];
    let selectedPeriod = '3m'; // Default selection
    
    // Create buttons for each time period
    timePeriods.forEach(period => {
        const btn = document.createElement('button');
        btn.className = `time-button ${period === selectedPeriod ? 'active' : ''}`;
        btn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #9370DB;
            background: ${period === selectedPeriod ? 'rgba(147, 112, 219, 0.3)' : 'transparent'};
            color: #FFD700;
            border-radius: 8px;
            font-family: 'Orbitron', sans-serif;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        btn.onmouseover = () => {
            btn.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.5)';
        };
        btn.onmouseout = () => {
            btn.style.boxShadow = 'none';
        };
        btn.textContent = period.toUpperCase();
        btn.addEventListener('click', function() {
            // Update styles for all buttons
            filterContainer.querySelectorAll('.time-button').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
            });
            // Update style for the currently selected button
            btn.classList.add('active');
            btn.style.background = 'rgba(147, 112, 219, 0.3)';
            selectedPeriod = period;
            updateChart(period);
        });
        filterContainer.appendChild(btn);
    });
    
    // Insert filter container before the chart
    chartContainer.parentNode.insertBefore(filterContainer, chartContainer.nextSibling.firstChild);

    // Set up the chart dimensions
    const margin = { top: 30, right: 60, bottom: 70, left: 50 };
    const width = chartContainer.offsetWidth - margin.left - margin.right || 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select('#bitcoinDominanceChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-family', "'Orbitron', sans-serif")
        .style('font-size', '28px')
        .style('font-weight', 'bold')
        .style('fill', '#FFD700')
        .style('text-shadow', '0 0 5px rgba(255, 215, 0, 0.3)')
        .text('Bitcoin Market Dominance vs Altcoin Index');

    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(26, 26, 61, 0.95)')
        .style('color', '#EAEAEA')
        .style('padding', '12px')
        .style('border-radius', '8px')
        .style('border', '1px solid #9370DB')
        .style('font-family', "'Orbitron', sans-serif")
        .style('font-size', '12px')
        .style('box-shadow', '0 0 15px rgba(147, 112, 219, 0.3)')
        .style('z-index', 10);

    // Create scales (will be updated in updateChart)
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]); // For dominance
    const y2 = d3.scaleLinear().range([height, 0]); // For price

    // Add axes groups (will be populated in updateChart)
    const xAxisGroup = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`);

    const yAxisGroup = svg.append('g')
        .attr('class', 'y-axis');
        
    const y2AxisGroup = svg.append('g')
        .attr('class', 'y2-axis')
        .attr('transform', `translate(${width},0)`);
    
    // Add y-axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#f59e0b')
        .text('BTC Dominance (%)');
        
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', width + 45)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#4f46e5')
        .text('Altcoin Index');

    // Add grid lines
    const gridLinesY = svg.append('g')
        .attr('class', 'grid-lines');

    // Create area and line elements (will be updated in updateChart)
    const area = svg.append('path')
        .attr('class', 'area');
    
    const dominanceLine = svg.append('path')
        .attr('class', 'line dominance-line')
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 3);
        
    const priceLine = svg.append('path')
        .attr('class', 'line price-line')
        .attr('fill', 'none')
        .attr('stroke', '#4f46e5')
        .attr('stroke-width', 3);

    // Create area for price line
    const priceArea = svg.append('path')
        .attr('class', 'price-area');

    // Create groups for dots
    const dominanceDotsGroup = svg.append('g')
        .attr('class', 'dominance-dots-group');
        
    const priceDotsGroup = svg.append('g')
        .attr('class', 'price-dots-group');

    function updateChart(period) {
        const now = new Date();
        let monthsBack;
        
        switch(period) {
            case '1m': monthsBack = 1; break;
            case '3m': monthsBack = 3; break;
            case '6m': monthsBack = 6; break;
            case '12m': monthsBack = 12; break;
            default: monthsBack = 3;
        }
        
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
        cutoffDate.setHours(0, 0, 0, 0);  
        
        const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
        
        const periodDominanceData = filteredDominanceData.filter(
            d => d.timestamp >= cutoffTimestamp
        );
        const periodAltIndexData = filteredAltIndexData.filter(
            d => d.timestamp >= cutoffTimestamp
        );

        if (periodDominanceData.length === 0 || periodAltIndexData.length === 0) {
            console.error('No data available for selected period');
            return;
        }

        // Update scales
        x.domain(d3.extent([...periodDominanceData, ...periodAltIndexData], d => d.date));
        
        // Calculate domains with padding
        const minDominance = d3.min(periodDominanceData, d => d.value) * 0.95;
        const maxDominance = d3.max(periodDominanceData, d => d.value) * 1.05;
        y.domain([minDominance, maxDominance]);
        
        const minAltIndex = d3.min(periodAltIndexData, d => d.value) * 0.95;
        const maxAltIndex = d3.max(periodAltIndexData, d => d.value) * 1.05;
        y2.domain([minAltIndex, maxAltIndex]);
        
        // Update axes
        const xAxis = d3.axisBottom(x)
            .ticks(width > 500 ? 8 : 5)
            .tickFormat(d3.timeFormat('%b %d, %Y'));
            
        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => d.toFixed(1) + '%');
            
        const y2Axis = d3.axisRight(y2)
            .ticks(5)
            .tickFormat(d => d.toFixed(1));
            
        xAxisGroup.transition().duration(1000).call(xAxis)
            .selectAll('text')
            .style('font-family', "'Orbitron', sans-serif")
            .style('font-size', '12px')
            .style('fill', '#EAEAEA')
            .style('text-anchor', 'end');
            
        yAxisGroup.transition().duration(1000).call(yAxis)
            .selectAll('text')
            .style('font-family', "'Orbitron', sans-serif")
            .style('font-size', '12px')
            .style('fill', '#EAEAEA');
            
        y2AxisGroup.transition().duration(1000).call(y2Axis)
            .selectAll('text')
            .style('font-family', "'Orbitron', sans-serif")
            .style('font-size', '12px')
            .style('fill', '#EAEAEA');
            
        // Update grid lines
        gridLinesY.selectAll('.grid-line').remove();
        
        y.ticks(5).forEach(tick => {
            gridLinesY.append('line')
                .attr('class', 'grid-line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y(tick))
                .attr('y2', y(tick))
                .attr('stroke', '#9370DB')
                .attr('stroke-opacity', 0.2)
                .attr('stroke-dasharray', '3,3');
        });
        
        // Update area for dominance
        const areaGenerator = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.value))
            .curve(d3.curveMonotoneX);
            
        area.datum(periodDominanceData)
            .transition().duration(1000)
            .attr('fill', 'url(#area-gradient)')
            .attr('d', areaGenerator);

        // Update area for price
        const priceAreaGenerator = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y2(d.value))
            .curve(d3.curveMonotoneX);
            
        priceArea.datum(periodAltIndexData)
            .transition().duration(1000)
            .attr('fill', 'url(#price-area-gradient)')
            .attr('d', priceAreaGenerator);
            
        // Create gradients for areas
        const dominanceGradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'area-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
            
        dominanceGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#FFD700')
            .attr('stop-opacity', 0.3);
            
        dominanceGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#FFD700')
            .attr('stop-opacity', 0.1);

        const priceGradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'price-area-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
            
        priceGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00FFFF')
            .attr('stop-opacity', 0.3);
            
        priceGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#00FFFF')
            .attr('stop-opacity', 0.1);
            
        // Update lines
        const dominanceLineGenerator = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);
            
        const priceLineGenerator = d3.line()
            .x(d => x(d.date))
            .y(d => y2(d.value))
            .curve(d3.curveMonotoneX);
            
        dominanceLine.datum(periodDominanceData)
            .transition().duration(1000)
            .attr('d', dominanceLineGenerator)
            .attr('stroke', '#FFD700')
            .attr('stroke-width', 2.5)
            .style('filter', 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))');
            
        priceLine.datum(periodAltIndexData)
            .transition().duration(1000)
            .attr('d', priceLineGenerator)
            .attr('stroke', '#00FFFF')
            .attr('stroke-width', 2.5)
            .style('filter', 'drop-shadow(0 0 3px rgba(0, 255, 255, 0.5))');
            
        // Update dots
        dominanceDotsGroup.selectAll('.dot').remove();
        priceDotsGroup.selectAll('.dot').remove();
        
        // Only show dots if we have a reasonable number of data points
        if (periodDominanceData.length < 60) {
            // Dominance dots
            dominanceDotsGroup.selectAll('.dot')
                .data(periodDominanceData)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.date))
                .attr('cy', d => y(d.value))
                .attr('r', 0)
                .attr('fill', '#FFD700')
                .attr('stroke', '#1a1a3d')
                .attr('stroke-width', 2)
                .style('filter', 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))')
                .transition().duration(1000)
                .attr('r', 4);
                
            // Alt Index dots
            priceDotsGroup.selectAll('.dot')
                .data(periodAltIndexData)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.date))
                .attr('cy', d => y2(d.value))
                .attr('r', 0)
                .attr('fill', '#00FFFF')
                .attr('stroke', '#1a1a3d')
                .attr('stroke-width', 2)
                .style('filter', 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.5))')
                .transition().duration(1000)
                .attr('r', 4);
                
            // Add hover effects to dots
            dominanceDotsGroup.selectAll('.dot')
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', 7)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 2);
                        
                    tooltip.transition().duration(200)
                        .style('opacity', 0.9);
                        
                    tooltip.html(`<strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong><br>BTC Dominance: <strong>${d.value.toFixed(2)}%</strong>`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', 4)
                        .attr('stroke', 'none');
                        
                    tooltip.transition().duration(500)
                        .style('opacity', 0);
                });
                
            priceDotsGroup.selectAll('.dot')
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', 7)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 2);
                        
                    tooltip.transition().duration(200)
                        .style('opacity', 0.9);
                        
                    tooltip.html(`<strong>${d3.timeFormat('%b %d, %Y')(d.date)}</strong><br>Altcoin Index: <strong>${d.value.toFixed(2)}</strong>`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', 4)
                        .attr('stroke', 'none');
                        
                    tooltip.transition().duration(500)
                        .style('opacity', 0);
                });
        }
        
        // Add overlay for hover effects when dots aren't visible
        const overlay = svg.selectAll('.overlay')
            .data([periodDominanceData]);
            
        overlay.enter()
            .append('rect')
            .attr('class', 'overlay')
            .merge(overlay)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mousemove', function(event) {
                const mouseX = d3.pointer(event)[0];
                const x0 = x.invert(mouseX);
                
                // Find closest data points
                const bisect = d3.bisector(d => d.date).left;
                const dominanceIndex = bisect(periodDominanceData, x0, 1);
                const priceIndex = bisect(periodAltIndexData, x0, 1);
                
                const d0_dominance = periodDominanceData[dominanceIndex - 1];
                const d1_dominance = periodDominanceData[dominanceIndex];
                const d0_price = periodAltIndexData[priceIndex - 1];
                const d1_price = periodAltIndexData[priceIndex];
                
                if (!d0_dominance || !d1_dominance || !d0_price || !d1_price) return;
                
                const d_dominance = x0 - d0_dominance.date > d1_dominance.date - x0 ? d1_dominance : d0_dominance;
                const d_price = x0 - d0_price.date > d1_price.date - x0 ? d1_price : d0_price;
                
                // Show tooltip
                tooltip.transition().duration(200)
                    .style('opacity', 0.9);
                    
                tooltip.html(`<strong>${d3.timeFormat('%b %d, %Y')(d_dominance.date)}</strong><br>` +
                           `BTC Dominance: <strong>${d_dominance.value.toFixed(2)}%</strong><br>` +
                           `Altcoin Index: <strong>${d_price.value.toFixed(2)}</strong>`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
                    
                // Highlight the points
                const highlightDots = svg.selectAll('.highlight-dot')
                    .data([d_dominance, d_price]);
                    
                highlightDots.enter()
                    .append('circle')
                    .attr('class', 'highlight-dot')
                    .merge(highlightDots)
                    .attr('cx', d => x(d.date))
                    .attr('cy', d => d.value ? y(d.value) : y2(d.value))
                    .attr('r', 7)
                    .attr('fill', (d, i) => i === 0 ? '#f59e0b' : '#4f46e5')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
                    
                // Add vertical line at hover position
                const verticalLine = svg.selectAll('.vertical-line')
                    .data([mouseX]);
                    
                verticalLine.enter()
                    .append('line')
                    .attr('class', 'vertical-line')
                    .merge(verticalLine)
                    .attr('x1', d => d)
                    .attr('x2', d => d)
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#64748b')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '5,5');
            })
            .on('mouseout', function() {
                tooltip.transition().duration(500)
                    .style('opacity', 0);
                    
                svg.selectAll('.highlight-dot').remove();
                svg.selectAll('.vertical-line').remove();
            });
    }

    // Initialize chart with default period
    updateChart(selectedPeriod);

    // Handle window resize
    window.addEventListener('resize', function() {
        const newWidth = chartContainer.offsetWidth - margin.left - margin.right;
        if (newWidth > 0) {
            // Update SVG dimensions
            d3.select('#bitcoinDominanceChart svg')
                .attr('width', newWidth + margin.left + margin.right);
                
            // Update x scale range
            x.range([0, newWidth]);
            
            // Update chart
            updateChart(selectedPeriod);
        }
    });

    svg.insert('rect', ':first-child')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('stroke', '#9370DB')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.2)
        .attr('rx', 8)
        .attr('ry', 8);

}).catch(function(error) {
    console.error('Error loading the data:', error);
    d3.select('#bitcoinDominanceChart')
        .append('div')
        .style('color', 'red')
        .style('text-align', 'center')
        .style('padding', '2rem')
        .text('Error loading data. Please check the console for details.');
});