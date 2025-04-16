import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback 
} from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { GridRows, GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleLinear, scaleTime, scaleSqrt } from '@visx/scale';
import { LinePath, Bar } from '@visx/shape';
import { 
  useTooltip, 
  TooltipWithBounds, 
  defaultStyles as defaultTooltipStyles 
} from '@visx/tooltip';
import { extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import * as d3 from 'd3';
import { curveMonotoneX } from '@visx/curve';

// Define interfaces for data shapes
interface EngagementData {
  date: Date;
  impressions: number;
  transactionCount: number;
}

interface TooltipData {
  date: Date;
  impressions: number;
  transactionCount: number;
}

// Accessors
const getDate = (d: EngagementData | TooltipData) => d.date;

// Colors
const colors = {
  impressions: '#9370DB', // Purple
  background: 'rgba(26, 26, 61, 0.95)',
  grid: 'rgba(255, 255, 255, 0.1)',
  tooltip: '#FFD700',
};

// Tooltip styles
const tooltipStyles = {
  ...defaultTooltipStyles,
  background: colors.background,
  color: colors.tooltip,
  border: `1px solid ${colors.impressions}`,
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '12px',
  borderRadius: '8px',
  padding: '8px',
};

// Time periods
const TIME_PERIODS = ['1w', '1m', '3m', 'all'];

function ActivityXEngagementGraph(): JSX.Element {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3m');
  const [maxTransactionCount, setMaxTransactionCount] = useState<number>(1);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  // Fetch and process data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.csv('/pages/new_data/account_overview_analytics_yd.csv'),
      d3.csv('/pages/new_data/solscan_transactions.csv'),
    ])
      .then(([engagementCsvData, transactionCsvData]) => {
        if (!engagementCsvData || engagementCsvData.length === 0) {
          throw new Error('No engagement data loaded from CSV');
        }
        if (!transactionCsvData) {
            console.warn('No transaction data loaded or file is empty.');
            transactionCsvData = [];
        }

        // Process transaction data
        const transactionCounts = new Map<string, number>();
        transactionCsvData.forEach((d) => {
          if (d.Time) {
            try {
              const date = new Date(d.Time);
              if (!Number.isNaN(date.getTime())) {
                  const dateString = date.toISOString().split('T')[0];
                  transactionCounts.set(dateString, (transactionCounts.get(dateString) || 0) + 1);
              } else {
                  console.warn(`Invalid date format in transaction data: ${d.Time}`);
              }
            } catch (e) {
              console.warn(`Error parsing date in transaction data: ${d.Time}`, e);
            }
          }
        });

        // Calculate max transaction count for scaling circle size
        const maxCount = Math.max(...Array.from(transactionCounts.values()), 1);
        setMaxTransactionCount(maxCount);
        console.log('Transaction counts by date:', transactionCounts);
        console.log('Max transaction count:', maxCount);

        // Process engagement data and merge
        const processedData = engagementCsvData
          .map((d) => {
            // Parse date (format: "Day, Month DD, YYYY")
            const dateParts = d.Date?.replace(/"/g, '').match(/\w+, (\w+) (\d+), (\d+)/);
            let parsedDate: Date | null = null;
            if (dateParts) {
              const month = dateParts[1];
              const day = parseInt(dateParts[2], 10);
              const year = parseInt(dateParts[3], 10);
              parsedDate = new Date(`${month} ${day}, ${year}`);
            }

            if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
              console.warn(`Invalid or missing date in engagement data: ${d.Date}`);
              return null;
            }

            const dateString = parsedDate.toISOString().split('T')[0];
            const transactionCount = transactionCounts.get(dateString) || 0;

            return {
              date: parsedDate,
              impressions: Number(d.Impressions) || 0,
              transactionCount: transactionCount,
            };
          })
          .filter((d): d is EngagementData => d !== null);

        // Sort data by date
        processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
        console.log('Processed and merged data:', processedData);
        setEngagementData(processedData);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading or processing data:', err);
        setError(`Error loading data: ${err.message}`);
        setEngagementData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    if (!engagementData.length) {
      console.log('No engagement data available');
      return [];
    }

    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    const filtered = engagementData.filter((d) => d.date >= startDate);
    console.log('Filtered data for period', selectedPeriod, ':', filtered);
    return filtered;
  }, [engagementData, selectedPeriod]);

  // Handle tooltip display
  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>,
      xScale: any,
      yScale: any,
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = d3.bisectLeft(
        filteredData.map((d) => d.date),
        x0,
      );
      const d0 = filteredData[index - 1];
      const d1 = filteredData[index];
      let d = d0;
      if (d1 && d1.date && d0 && d0.date) {
        d = x0.valueOf() - d0.date.valueOf() > d1.date.valueOf() - x0.valueOf() ? d1 : d0;
      } else if (d1 && d1.date) {
        d = d1;
      }

      if (d) {
        showTooltip({
          tooltipData: d,
          tooltipLeft: xScale(d.date),
          tooltipTop: yScale(d.impressions),
        });
      }
    },
    [showTooltip, filteredData]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-yellow-400 text-xl font-orbitron">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-red-400 text-xl font-orbitron">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900" style={{height:'540px'}}>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-orbitron text-yellow-400 text-center">
          X Impressions Over Time
        </h2>
        <div className="text-gray-300 text-sm mb-4 px-4 text-center font-sans">
          {/* This visualization shows X social media impressions over time, with circles \
          representing the number of transactions on the day. */}
        </div>
        <div className="flex justify-center gap-2 md:gap-4 p-4 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl shadow-lg">
          {TIME_PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              className={`
                px-4 py-2 font-orbitron rounded-lg transition-all duration-300
                ${
                  period === selectedPeriod
                    ? 'bg-purple-400/30 text-yellow-400'
                    : 'text-yellow-400/80 hover:bg-purple-400/20'
                }
              `}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: colors.impressions }} />
              <span className="text-sm font-orbitron text-yellow-400/80">X Impressions</span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ParentSize>
              {({ width, height }) => {
                if (!filteredData.length) return null;

                // Adjusted margins for better spacing
                const margin = {
                  top: 20,
                  right: 30,
                  bottom: 50,
                  left: 60,
                };
                
                // Dimensions
                const innerWidth = Math.max(width - margin.left - margin.right, 0);
                const innerHeight = Math.max(height - margin.top - margin.bottom, 0);

                if (innerWidth <= 0 || innerHeight <= 0) return null;

                // Sort data chronologically
                const sortedData = [...filteredData].sort((a, b) => 
                  a.date.getTime() - b.date.getTime()
                );

                // Calculate domain for y-axis with some padding
                const maxValue = Math.max(...sortedData.map((d) => d.impressions));
                const yDomain = [0, maxValue * 1.1];

                // Scales
                const xScale = scaleTime({
                  range: [0, innerWidth],
                  domain: extent(sortedData, getDate) as [Date, Date],
                  nice: true,
                });

                const yScale = scaleLinear({
                  range: [innerHeight, 0],
                  domain: yDomain,
                  nice: true,
                });

                // Add scale for circle radius
                const radiusScale = scaleSqrt({
                  domain: [0, maxTransactionCount],
                  range: [0, 12],
                });

                // Format for tooltip and axes
                const dateFormat = timeFormat('%b %d, %Y');
                const valueFormat = (value: number) => value.toLocaleString();

                return (
                  <div className="relative">
                    <svg width={width} height={height} className="overflow-visible">
                      <Group left={margin.left} top={margin.top}>
                        {/* Background */}
                        <rect
                          x={0}
                          y={0}
                          width={innerWidth}
                          height={innerHeight}
                          fill="transparent"
                        />

                        {/* Grid */}
                        <GridRows
                          scale={yScale}
                          width={innerWidth}
                          stroke={colors.grid}
                          strokeOpacity={0.2}
                          strokeDasharray="2,2"
                          numTicks={5}
                        />
                        <GridColumns
                          scale={xScale}
                          height={innerHeight}
                          stroke={colors.grid}
                          strokeOpacity={0.2}
                          strokeDasharray="2,2"
                          numTicks={5}
                        />

                        {/* Line */}
                        <LinePath
                          data={sortedData}
                          x={(d) => xScale(getDate(d))}
                          y={(d) => yScale(d.impressions)}
                          stroke={colors.impressions}
                          strokeWidth={2}
                          curve={curveMonotoneX}
                        />

                        {/* Transaction Circles */}
                        <g>
                          {sortedData.map((d, i) => {
                            if (d.transactionCount > 0) {
                              const cx = xScale(getDate(d));
                              const cy = yScale(d.impressions);
                              const radius = radiusScale(d.transactionCount);
                              return (
                                <circle
                                  key={`circle-${i}`}
                                  cx={cx}
                                  cy={cy}
                                  r={radius}
                                  fill={colors.tooltip}
                                  stroke={colors.background}
                                  strokeWidth={1}
                                  pointerEvents="none"
                                />
                              );
                            }
                            return null;
                          })}
                        </g>

                        {/* Axes */}
                        <AxisLeft
                          scale={yScale}
                          stroke={colors.impressions}
                          tickStroke={colors.impressions}
                          tickLabelProps={() => ({
                            fill: colors.impressions,
                            fontSize: 12,
                            textAnchor: 'end',
                            dy: '0.33em',
                            dx: -4,
                          })}
                          label="Impressions"
                          labelProps={{
                            fill: colors.impressions,
                            fontSize: 14,
                            textAnchor: 'middle',
                            dx: -45,
                          }}
                          numTicks={5}
                        />

                        <AxisBottom
                          top={innerHeight}
                          scale={xScale}
                          stroke={colors.tooltip}
                          tickStroke={colors.tooltip}
                          tickLabelProps={() => ({
                            fill: colors.tooltip,
                            fontSize: 12,
                            textAnchor: 'middle',
                            dy: 10,
                          })}
                          numTicks={5}
                        />

                        {/* Tooltip overlay */}
                        <Bar
                          x={0}
                          y={0}
                          width={innerWidth}
                          height={innerHeight}
                          fill="transparent"
                          onTouchStart={(e) => handleTooltip(e, xScale, yScale)}
                          onTouchMove={(e) => handleTooltip(e, xScale, yScale)}
                          onMouseMove={(e) => handleTooltip(e, xScale, yScale)}
                          onMouseLeave={() => hideTooltip()}
                        />

                        {/* Tooltip indicators */}
                        {tooltipData && (
                          <g>
                            <line
                              x1={tooltipLeft}
                              x2={tooltipLeft}
                              y1={0}
                              y2={innerHeight}
                              stroke={colors.tooltip}
                              strokeWidth={1}
                              strokeDasharray="4,4"
                              pointerEvents="none"
                            />
                            <circle
                              cx={tooltipLeft}
                              cy={yScale(tooltipData.impressions)}
                              r={4}
                              fill={colors.impressions}
                              stroke="white"
                              strokeWidth={2}
                              pointerEvents="none"
                            />
                            {tooltipData.transactionCount > 0 && (
                               <circle
                                 cx={tooltipLeft}
                                 cy={yScale(tooltipData.impressions)}
                                 r={radiusScale(tooltipData.transactionCount)}
                                 fill={colors.tooltip}
                                 stroke={colors.background}
                                 strokeWidth={1}
                                 opacity={0.7}
                                 pointerEvents="none"
                               />
                            )}
                          </g>
                        )}
                      </Group>
                    </svg>

                    {/* Tooltip */}
                    {tooltipOpen && tooltipData && (
                      <TooltipWithBounds
                        key={Math.random()}
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                          ...tooltipStyles,
                        }}
                      >
                        <div className="font-orbitron">
                          <div className="text-yellow-400 font-bold">
                            {dateFormat(tooltipData.date)}
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            <div style={{ color: colors.impressions }}>
                              Impressions: {valueFormat(tooltipData.impressions)}
                            </div>
                            {tooltipData.transactionCount > 0 && (
                              <div style={{ color: colors.tooltip }}>
                                Transactions: {tooltipData.transactionCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipWithBounds>
                    )}
                  </div>
                );
              }}
            </ParentSize>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityXEngagementGraph;
