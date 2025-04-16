import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { GridRows, GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleLinear, scaleTime, scaleOrdinal } from '@visx/scale';
import { LinePath, Circle } from '@visx/shape';
import { useTooltip, TooltipWithBounds, defaultStyles as defaultTooltipStyles } from '@visx/tooltip';
import { extent, max, bisector as d3Bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import * as d3 from 'd3'; // Keep d3 for csv loading/parsing for now

// Define types
// interface RawXEngagementData { // No longer directly used, but kept for reference if needed
//   Date: string;
//   Impressions: string;
//   Likes: string;
//   Engagements: string;
//   Replies: string;
//   Reposts: string;
//   'Profile visits': string;
//   'New follows': string;
// }

interface ParsedXEngagementData {
  Date: string;
  parsedDate: Date;
  Impressions: number;
  Likes: number;
  Engagements: number;
  Replies: number;
  Reposts: number;
  ProfileVisits: number;
  NewFollows: number;
}

// Interface for tooltip data, extending base data
interface TooltipData extends ParsedXEngagementData {
  metricData: { metric: MetricKey; value: number; color: string; isVisible: boolean }[];
}

type MetricKey = 'Engagements' | 'Impressions' | 'Likes';
const metrics: MetricKey[] = ['Engagements', 'Impressions', 'Likes'];

// Accessors
const getDate = (d: ParsedXEngagementData | TooltipData) => d.parsedDate;
const getValue = (d: ParsedXEngagementData | TooltipData, metric: MetricKey) => d[metric];
const bisectDate = d3Bisector<ParsedXEngagementData, Date>((d) => d.parsedDate).left;

// Colors - Align with BitcoinDominanceChart palette where possible
const colors = {
  Engagements: '#9370DB', // Purple (Keep)
  Impressions: '#f59e0b', // Gold/Orange (Match BTC Dominance color)
  Likes: '#4f46e5', // Indigo (Match Alt Index color)
};

const colorScale = scaleOrdinal<MetricKey, string>({
  domain: metrics,
  range: [colors.Engagements, colors.Impressions, colors.Likes], // Use updated colors
});

// Tooltip styles - Match BitcoinDominanceChart
const tooltipStyles = {
  ...defaultTooltipStyles,
  background: 'rgba(26, 26, 61, 0.95)', // Match BTC Tooltip
  color: '#FFD700', // Match BTC Tooltip (Gold text)
  border: '1px solid #9370DB', // Keep purple border for now
  fontFamily: 'Orbitron, sans-serif', // Match BTC Tooltip
  fontSize: '12px', // Keep size
  borderRadius: '8px', // Match BTC Tooltip
  padding: '8px', // Slightly adjust padding
};

interface XEngagementGraphProps {
  width: number;
  height: number;
}

function XEngagementGraphComponent({ width, height }: XEngagementGraphProps): JSX.Element | null {
  const [data, setData] = useState<ParsedXEngagementData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(new Set(metrics)); // Re-introduce state

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  // Margins and dimensions
  const margin = { // Keep adjusted margins
    top: 60,
    right: 50,
    bottom: 60, // Match BTC Bottom margin
    left: 80, // Match BTC Left margin
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Fetch and process data
  useEffect(() => {
    setLoading(true);
    d3.csv('/pages/new_data/account_overview_analytics_yd.csv')
      .then(csvData => {
        if (!csvData || csvData.length === 0) {
          throw new Error('No data loaded from CSV');
        }

        const processedData: ParsedXEngagementData[] = csvData.map((d: any): ParsedXEngagementData => {
          // Parse date (format: "Day, Month DD, YYYY")
          const dateParts = d.Date.replace(/"/g, '').match(/\w+, (\w+) (\d+), (\d+)/);
          let parsedDate = new Date(); // Default/fallback date
          if (dateParts) {
            const month = dateParts[1];
            const day = parseInt(dateParts[2], 10);
            const year = parseInt(dateParts[3], 10);
            parsedDate = new Date(`${month} ${day}, ${year}`);
          }

          return {
            Date: d.Date?.replace(/"/g, '') || 'N/A',
            parsedDate,
            Impressions: +d.Impressions || 0,
            Likes: +d.Likes || 0,
            Engagements: +d.Engagements || 0,
            Replies: +d.Replies || 0,
            Reposts: +d.Reposts || 0,
            ProfileVisits: +d['Profile visits'] || 0,
            NewFollows: +d['New follows'] || 0,
          };
        }).filter(d => !isNaN(d.parsedDate.getTime())); // Filter out invalid dates

        // Sort data by date
        processedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
        setData(processedData);
        setError(null);
      })
      .catch(err => {
        console.error('Error loading X engagement data:', err);
        setError(`Error loading data: ${err.message}`);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Run only once on mount

  // Scales
  const xScale = useMemo(() => {
    if (!data) return null;
    return scaleTime({
      range: [0, innerWidth],
      domain: extent(data, getDate) as [Date, Date],
    });
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    if (!data) return null;
    // Calculate max based on *visible* data points
    const yMax = max(data.flatMap(d =>
      Array.from(visibleMetrics).map(metric => getValue(d, metric))
    )) || 0;
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, yMax * 1.1], // Add padding to top
      nice: true,
    });
  }, [data, innerHeight, visibleMetrics]); // Add visibleMetrics dependency back

  // Tooltip handler
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      if (!xScale || !yScale || !data) return;

      const point = localPoint(event);
      if (!point) return;
      const { x } = point;
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0; // Default to d0
      if (d1 && getDate(d1) && (x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf())) {
        d = d1;
      }

      if (d) {
        // Include all metrics, but mark visibility
        const tooltipMetricData = metrics.map(metric => ({
          metric,
          value: getValue(d, metric),
          color: colorScale(metric),
          isVisible: visibleMetrics.has(metric), // Mark visibility
        }));

        showTooltip({
          tooltipData: { ...d, metricData: tooltipMetricData },
          tooltipLeft: xScale(getDate(d)) + margin.left, // Position tooltip near the point
          tooltipTop: yScale(Math.max(...tooltipMetricData.filter(m => m.isVisible).map(m => m.value))) + margin.top - 15,
        });
      }
    },
    [xScale, yScale, data, showTooltip, margin.left, margin.top, colorScale, visibleMetrics] // Add visibleMetrics dependency back
  );

  if (loading) return <div className="flex items-center justify-center h-full text-yellow-400 font-orbitron">Loading data...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-400 font-orbitron">Error: {error}</div>;
  if (!data || !xScale || !yScale || width <= 0 || height <= 0) return null; // Don't render if no data or dimensions

  // Toggle metric visibility
  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metric)) {
        newSet.delete(metric);
      } else {
        newSet.add(metric);
      }
      // Ensure at least one metric is always visible (optional, prevents blank chart)
      // if (newSet.size === 0) {
      //   return prev; // Or re-add the one just removed
      // }
      return newSet;
    });
  };

  return (
    <div className="relative font-['Orbitron']">
      <div className="text-gray-300 text-sm mb-4 px-4 text-center font-sans">
        {/* This visualization displays the analytics from YD's X account. Use the checkbox to toggle lines on and off. Hover over the line to get more details. */}
      </div>

      {/* Title - Match BTC Title style */}
      <div className="text-center w-full mb-2 text-xl md:text-2xl lg:text-3xl font-orbitron text-yellow-400">
        YellowDuckieCoin X Analytics
      </div>

      {/* Interactive Legend with Checkboxes */}
      <div className="flex justify-center gap-6 mb-4">
        {metrics.map((metric) => (
          <div
            key={metric}
            className="flex items-center gap-2"
          >
            {/* Checkbox Input */}
            <input
              type="checkbox"
              id={`checkbox-${metric}`}
              checked={visibleMetrics.has(metric)}
              onChange={() => toggleMetric(metric)}
              className="cursor-pointer h-4 w-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
              style={{ accentColor: colorScale(metric) }} // Match accent to line color
            />
            {/* Label containing color swatch and text */}
            <label
              htmlFor={`checkbox-${metric}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className="w-4 h-0.5 rounded-full" // Use small line like BTC chart
                style={{ backgroundColor: colorScale(metric) }}
              />
              <span className="text-sm font-orbitron text-yellow-400/80"> {/* Match BTC label style */}
                {metric}
              </span>
            </label>
          </div>
        ))}
      </div>

      <svg width={width} height={height}>
        {/* Main chart group */}
        <Group left={margin.left} top={margin.top}>
          {/* Grid Lines - Match BTC Grid style */}
          <GridRows scale={yScale} width={innerWidth} stroke="rgba(147, 112, 219, 0.1)" strokeDasharray="3,3" />
          <GridColumns scale={xScale} height={innerHeight} stroke="rgba(147, 112, 219, 0.1)" strokeDasharray="3,3" />

          {/* Axes - Match BTC Axis style */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={width > 520 ? 10 : 5} // Adjust ticks based on width
            stroke="rgba(255, 215, 0, 0.3)" // Match BTC Axis stroke (Gold)
            tickStroke="rgba(255, 215, 0, 0.3)" // Match BTC Tick stroke (Gold)
            tickLabelProps={() => ({
              fill: '#FFD700', // Match BTC Label fill (Gold)
              fontSize: 12, // Match BTC font size (adjust slightly for space if needed)
              textAnchor: 'middle',
              fontFamily: "'Orbitron', sans-serif",
              dy: '0.33em',
            })}
            tickFormat={(value) => timeFormat('%b %d')(value as Date)}
          />
          <AxisLeft
            scale={yScale}
            numTicks={5}
            stroke="rgba(255, 215, 0, 0.3)" // Match BTC Axis stroke (Gold)
            tickStroke="rgba(255, 215, 0, 0.3)" // Match BTC Tick stroke (Gold)
            tickLabelProps={() => ({
              fill: '#FFD700', // Match BTC Label fill (Gold)
              fontSize: 12, // Match BTC font size (adjust slightly for space if needed)
              textAnchor: 'end',
              fontFamily: "'Orbitron', sans-serif",
              dx: '-0.25em',
              dy: '0.33em',
            })}
          />
           {/* Y Axis Label */}
           <text
              x={-innerHeight / 2}
              y={-margin.left + 15}
              transform="rotate(-90)"
              dy=".33em"
              fontSize={12}
              fontFamily="'Orbitron', sans-serif"
              fill="#FFD700"
              textAnchor="middle"
            >
              Count
            </text>

          {/* Data Lines */}
          {metrics.map((metric) => (
            // Only render LinePath if the metric is visible
            visibleMetrics.has(metric) && (
              <LinePath<ParsedXEngagementData>
                key={`line-${metric}`}
                data={data}
                x={(d) => xScale(getDate(d)) ?? 0}
                y={(d) => yScale(getValue(d, metric)) ?? 0}
                stroke={colorScale(metric)}
                strokeWidth={2.5}
                curve={d3.curveMonotoneX} // Use d3 curve function
              />
            )
          ))}

            {/* Tooltip Interaction Area */}
           <rect
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                stroke="transparent" // Ensure no stroke
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => hideTooltip()}
            />

            {/* Highlight Point on Hover - Use slightly different style from BTC */}
            {tooltipOpen && tooltipData && (
                <g>
                     <line
                         x1={tooltipLeft ? tooltipLeft - margin.left : 0}
                         x2={tooltipLeft ? tooltipLeft - margin.left : 0}
                         y1={0}
                         y2={innerHeight}
                         stroke="rgba(255, 215, 0, 0.5)" // Lighter gold line
                         strokeWidth={1}
                         pointerEvents="none"
                         strokeDasharray="4,2"
                     />
                    {tooltipData.metricData.filter(item => item.isVisible).map((item, index, visibleArray) => ( // Filter visible items
                          <Circle
                            key={`tooltip-point-${item.metric}`}
                            cx={tooltipLeft ? tooltipLeft - margin.left : 0}
                            cy={yScale(item.value)}
                            r={5}
                            fill={item.color}
                            stroke="white"
                            strokeWidth={2}
                            pointerEvents="none"
                        />
                    ))}

                </g>
            )}
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#FFD700', fontSize: '13px' }}> {/* Match BTC header */}
            {timeFormat('%a, %b %d, %Y')(getDate(tooltipData))}
          </div>
          {tooltipData.metricData.filter(item => item.isVisible).map((item, index, visibleArray) => ( // Filter visible items
             <div key={item.metric} style={{ display: 'flex', alignItems: 'center', marginBottom: index === visibleArray.length - 1 ? 0 : '3px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: item.color, marginRight: '5px', borderRadius: '2px' }}></div>
                <span style={{ color: '#EAEAEA', marginRight: '4px', fontSize: '11px' }}>{item.metric}:</span> {/* Grayer label */}
                <span style={{ fontWeight: 600 }}>{item.value}</span> {/* Bold value */}
             </div>
           ))}
           <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px'}}> {/* Subdued color */}
                Replies: {tooltipData.Replies}<br />
                Reposts: {tooltipData.Reposts}<br />
                Follows: {tooltipData.NewFollows}
            </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

// Wrapper component - Match BTC Container style
export default function XEngagementGraph(): JSX.Element {
  return (
    <div className="w-full h-full XEngagementGraph data-chart relative flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg">
      {/* Inner container to control chart height, similar to BitcoinDominanceChart */}
      <div className="w-full h-[400px]">
        <ParentSize>
          {({ width, height }) => <XEngagementGraphComponent width={width} height={height} />}
        </ParentSize>
      </div>
    </div>
  );
} 