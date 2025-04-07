// X Engagement Graph
document.addEventListener('DOMContentLoaded', function() {
    // Load the data
    d3.csv('new_data/account_overview_analytics_yd.csv').then(data => {
        createXEngagementGraph(data);
    }).catch(error => {
        console.error('Error loading X engagement data:', error);
        document.getElementById('xEngagementGraph').innerHTML = '<p>Error loading data</p>';
    });

    function createXEngagementGraph(data) {
        // Parse the data
        data.forEach(d => {
            // Parse date (format: "Day, Month DD, YYYY")
            const dateParts = d.Date.replace(/"/g, '').match(/\w+, (\w+) (\d+), (\d+)/);
            if (dateParts) {
                const month = dateParts[1];
                const day = parseInt(dateParts[2]);
                const year = parseInt(dateParts[3]);
                d.parsedDate = new Date(`${month} ${day}, ${year}`);
            }
            
            // Convert numeric values
            d.Impressions = +d.Impressions;
            d.Likes = +d.Likes;
            d.Engagements = +d.Engagements;
            d.Replies = +d.Replies;
            d.Reposts = +d.Reposts;
            d.ProfileVisits = +d['Profile visits'];
            d.NewFollows = +d['New follows'];
        });

        // Sort data by date
        data.sort((a, b) => a.parsedDate - b.parsedDate);

        // Set up dimensions
        const container = document.getElementById('xEngagementGraph');
        const margin = {top: 40, right: 80, bottom: 90, left: 60};
        const width = container.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Add centered title
        d3.select('#xEngagementGraph')
            .append('div')
            .style('text-align', 'center')
            .style('width', '100%')
            .style('margin-bottom', '20px')
            .style('font-size', '28px')
            .style('font-weight', 'bold')
            .style('font-family', "'Orbitron', sans-serif")
            .style('color', '#FFD700')
            .style('text-shadow', '0 0 5px rgba(255, 215, 0, 0.3)')
            .text('YellowDuckieCoin X Analytics');

        // Create checkbox controls div
        const controlsDiv = d3.select('#xEngagementGraph')
            .append('div')
            .attr('class', 'metric-controls')
            .style('position', 'absolute')
            .style('top', '10px')
            .style('right', '20px')
            .style('background', 'linear-gradient(45deg, #1a1a3d, #2a2a4d)')
            .style('padding', '10px')
            .style('border-radius', '10px')
            .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)');

        const graphContainer = d3.select('#xEngagementGraph')
            .style('background', 'linear-gradient(45deg, #1a1a3d, #2a2a4d)')
            .style('border-radius', '15px')
            // .style('padding', '20px')
            .style('box-shadow', '0 4px 20px rgba(147, 112, 219, 0.2)');

        const svg = d3.select('#xEngagementGraph')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Add source link
        svg.append('a')
            .attr('href', 'https://x.com/YellowDuckieNet')
            .attr('target', '_blank')
            .append('text')
            .attr('x', width - 10)
            .attr('y', height + 50)
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text('https://x.com/YellowDuckieNet');

        // Set up scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.parsedDate))
            .range([0, width]);

        // Initial y scale
        const y = d3.scaleLinear()
            .range([height, 0]);

        // Create axes
        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeDay.every(5))
            .tickFormat(d3.timeFormat('%b %d'));

        const yAxis = d3.axisLeft(y);

        // Add X axis
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // Add Y axis
        svg.append('g')
            .attr('class', 'y-axis');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left + 15)
            .attr('x', -height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-family', "'Orbitron', sans-serif")
            .style('fill', '#FFD700')
            .text('Count');

        // Define line colors
        const colors = {
            Engagements: '#9370DB', // Purple
            Impressions: '#FFD700', // Gold
            Likes: '#00FFFF'        // Cyan
        };

        // Create line generators for each metric
        const createLine = (metric) => {
            return d3.line()
                .x(d => x(d.parsedDate))
                .y(d => y(d[metric]))
                .curve(d3.curveMonotoneX);
        };

        // Add lines for each metric
        const metrics = ['Engagements', 'Impressions', 'Likes'];
        const paths = {};
        const visibleMetrics = new Set(metrics); // Track which metrics are visible

        // Function to update y scale based on visible metrics
        function updateYScale(filteredData = data) {
            const yMax = d3.max(filteredData, d => {
                return Math.max(...Array.from(visibleMetrics).map(metric => d[metric]));
            }) * 1.1;
            
            y.domain([0, yMax]);
            svg.select('.y-axis')
                .transition()
                .duration(750)
                .call(yAxis);
        }

        // Add grid lines
        function addGrid() {
            // Add Y-axis grid lines
            svg.append('g')
                .attr('class', 'grid-lines')
                .selectAll('line.horizontal')
                .data(y.ticks(5))
                .enter()
                .append('line')
                .attr('class', 'horizontal')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', d => y(d))
                .attr('y2', d => y(d))
                .style('stroke', '#9370DB')
                .style('stroke-width', '0.5')
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.2);

            // Add X-axis grid lines
            svg.append('g')
                .attr('class', 'grid-lines')
                .selectAll('line.vertical')
                .data(x.ticks(10))
                .enter()
                .append('line')
                .attr('class', 'vertical')
                .attr('y1', 0)
                .attr('y2', height)
                .attr('x1', d => x(d))
                .attr('x2', d => x(d))
                .style('stroke', '#9370DB')
                .style('stroke-width', '0.5')
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.2);
        }

        // Call after setting up x and y scales
        updateYScale();
        addGrid();

        // Modify axis styles
        svg.selectAll('.x-axis text, .y-axis text')
            .style('font-family', "'Orbitron', sans-serif")
            .style('fill', '#EAEAEA')
            .style('font-size', '12px');

        svg.selectAll('.x-axis line, .y-axis line, .x-axis path, .y-axis path')
            .style('stroke', '#9370DB')
            .style('opacity', 0.4);

        // Add subtle glow effect to chart area
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('stroke', '#9370DB')
            .attr('stroke-width', 1)
            .attr('opacity', 0.3)
            .attr('rx', 8)
            .attr('ry', 8);

        metrics.forEach(metric => {
            // Add the line path
            paths[metric] = svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', colors[metric])
                .attr('stroke-width', 2.5)
                .attr('d', createLine(metric));
            
            // Add gradient area under the line
            const areaGenerator = d3.area()
                .x(d => x(d.parsedDate))
                .y0(height)
                .y1(d => y(d[metric]))
                .curve(d3.curveMonotoneX);

            // Create gradient
            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', `area-gradient-${metric}`)
                .attr('gradientUnits', 'userSpaceOnUse')
                .attr('x1', 0).attr('y1', 0)
                .attr('x2', 0).attr('y2', height);

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', `${colors[metric]}` + '70'); // 70 = 44% opacity

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', `${colors[metric]}` + '1A'); // 1A = 10% opacity

            // Add the area with reduced opacity
            svg.append('path')
                .datum(data)
                .attr('class', `area-${metric}`)
                .attr('fill', `url(#area-gradient-${metric})`)
                .attr('opacity', 0.5)
                .attr('d', areaGenerator);

            // Add checkbox control
            const controlDiv = controlsDiv.append('div')
                .style('margin', '5px')
                .style('color', 'white')
                .style('background-color', 'rgba(0,0,0,0.7)')
                .style('padding', '5px')
                .style('border-radius', '4px');

            controlDiv.append('input')
                .attr('type', 'checkbox')
                .attr('id', `checkbox-${metric}`)
                .attr('checked', true)
                .style('cursor', 'pointer')
                .style('accent-color', '#FFD700');

            controlDiv.append('label')
                .attr('for', `checkbox-${metric}`)
                .style('margin-left', '5px')
                .style('color', colors[metric])
                .style('font-family', "'Orbitron', sans-serif")
                .style('text-shadow', '0 0 5px rgba(255, 215, 0, 0.2)')
                .text(metric);
        });

        // Add dots for data points for each metric
        metrics.forEach(metric => {
            svg.selectAll(`.dot-${metric}`)
                .data(data)
                .enter()
                .append('circle')
                .attr('class', `dot dot-${metric}`)
                .attr('cx', d => x(d.parsedDate))
                .attr('cy', d => y(d[metric]))
                .attr('r', 4)
                .attr('fill', colors[metric])
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5);
        });

        // Create tooltip
        const tooltip = d3.select('#xEngagementGraph')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(26, 26, 61, 0.95)')
            .style('color', '#EAEAEA')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('border', '1px solid #9370DB')
            .style('pointer-events', 'none')
            .style('font-family', "'Orbitron', sans-serif")
            .style('font-size', '12px')
            .style('box-shadow', '0 0 15px rgba(147, 112, 219, 0.3)')
            .style('z-index', 10);

        // Add hover effects to all dots
        svg.selectAll('.dot').on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 7)
                .attr('stroke-width', 2);

            tooltip.transition()
                .duration(200)
                .style('opacity', 1);

            tooltip.html(`
                <strong>Date:</strong> ${d.Date.replace(/"/g, '')}<br>
                <strong>Engagements:</strong> ${d.Engagements}<br>
                <strong>Impressions:</strong> ${d.Impressions}<br>
                <strong>Likes:</strong> ${d.Likes}<br>
                <strong>Replies:</strong> ${d.Replies}<br>
                <strong>Reposts:</strong> ${d.Reposts}<br>
                <strong>New Follows:</strong> ${d.NewFollows}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 4)
                .attr('stroke-width', 1.5);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    }
});