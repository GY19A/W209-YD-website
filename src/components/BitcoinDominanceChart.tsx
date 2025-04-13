import React, { useState, useMemo } from 'react';
import { bisector } from 'd3-array';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { Grid } from '@visx/grid';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom, AxisRight } from '@visx/axis';
import {
  useTooltip,
  TooltipWithBounds,
  defaultStyles,
} from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { useChartData } from '../hooks/useChartData';
import { TimePeriod } from '../types/chart';

interface TooltipData {
  date: Date;
  btcDominance: number;
  altIndex: number;
}

const TIME_PERIODS: TimePeriod[] = ['1m', '3m', '6m', '12m'];

// Chart configuration
const margin = {
  top: 40,
  right: 80,
  bottom: 60,
  left: 80,
};

// Tooltip styles
const tooltipStyles = {
  ...defaultStyles,
  background: 'rgba(26, 26, 61, 0.95)',
  border: '1px solid #9370DB',
  borderRadius: '8px',
  color: '#FFD700',
  fontFamily: 'Orbitron, sans-serif',
};

// Legend configuration
const legendItems = [
  { label: 'BTC Dominance', color: '#f59e0b' },
  { label: 'Altcoin Index', color: '#4f46e5' },
];

// Accessors
const getDate = (d: TooltipData) => new Date(d.date);
const bisectDate = bisector<TooltipData, Date>((d) => new Date(d.date)).left;

function BitcoinDominanceChart(): React.ReactElement {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');
  const { chartData, loading, error } = useChartData(selectedPeriod);
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<TooltipData>();

  // Combine data for easier tooltip handling
  const combinedData = useMemo(() => {
    if (!chartData.dominanceData.length || !chartData.altIndexData.length) return [];
    return chartData.dominanceData.map((item, i) => ({
      date: item.date,
      btcDominance: item.value,
      altIndex: chartData.altIndexData[i]?.value || 0,
    })) as TooltipData[];
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <div className="text-yellow-400 text-xl font-orbitron">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <div className="text-red-400 text-xl font-orbitron">
          Error:
          {' '}
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="flex flex-col gap-4">
      <div className="text-gray-300 text-sm mb-4 px-4 text-center font-sans">
        This visualization displays the relationship between Bitcoin Market Dominance and the Altcoin Index over time. Use the time period buttons to adjust the view, and hover over data points to see detailed information.
      </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-orbitron text-yellow-400 text-center">
          Bitcoin Market Dominance vs Altcoin Index
        </h2>
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

      <div className="w-full h-[400px]">
        <div className="flex justify-center gap-6 mb-4">
          {legendItems.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-4 h-0.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-orbitron text-yellow-400/80">
                {label}
              </span>
            </div>
          ))}
        </div>
        <ParentSize>
          {({ width, height }) => {
            // Bounds
            const xMax = width - margin.left - margin.right;
            const yMax = height - margin.top - margin.bottom;

            // Scales
            const xScale = scaleTime({
              range: [0, xMax],
              domain: [
                Math.min(...combinedData.map((d) => new Date(d.date).getTime())),
                Math.max(...combinedData.map((d) => new Date(d.date).getTime())),
              ],
            });

            const yDominanceScale = scaleLinear({
              range: [yMax, 0],
              domain: [0, 100],
              nice: true,
            });

            const yAltScale = scaleLinear({
              range: [yMax, 0],
              domain: [
                Math.min(...combinedData.map((d) => d.altIndex)),
                Math.max(...combinedData.map((d) => d.altIndex)),
              ],
              nice: true,
            });

            const handleTooltip = (
              event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>,
            ) => {
              const { x } = localPoint(event) || { x: 0 };
              const x0 = xScale.invert(x - margin.left);
              const index = bisectDate(combinedData, x0, 1);
              const d0 = combinedData[index - 1];
              const d1 = combinedData[index];
              let d = d0;

              if (d1 && getDate(d1)) {
                d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf()
                  ? d1
                  : d0;
              }

              showTooltip({
                tooltipData: d,
                tooltipLeft: x,
                tooltipTop: yDominanceScale(d.btcDominance),
              });
            };

            return (
              <div style={{ position: 'relative' }}>
                <svg width={width} height={height}>
                  <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="transparent"
                    onMouseMove={handleTooltip}
                    onMouseLeave={() => hideTooltip()}
                  />
                  <Group left={margin.left} top={margin.top}>
                    <Grid
                      xScale={xScale}
                      yScale={yDominanceScale}
                      width={xMax}
                      height={yMax}
                      stroke="rgba(147, 112, 219, 0.1)"
                      strokeDasharray="3,3"
                    />
                    <LinePath
                      data={combinedData}
                      x={(d) => xScale(new Date(d.date))}
                      y={(d) => yDominanceScale(d.btcDominance)}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      curve={curveMonotoneX}
                    />
                    <LinePath
                      data={combinedData}
                      x={(d) => xScale(new Date(d.date))}
                      y={(d) => yAltScale(d.altIndex)}
                      stroke="#4f46e5"
                      strokeWidth={2}
                      curve={curveMonotoneX}
                    />
                    <AxisBottom
                      top={yMax}
                      scale={xScale}
                      stroke="rgba(255, 215, 0, 0.3)"
                      tickStroke="rgba(255, 215, 0, 0.3)"
                      tickLabelProps={{
                        fill: '#FFD700',
                        fontFamily: 'Orbitron',
                        fontSize: 14,
                        textAnchor: 'middle',
                      }}
                    />
                    <AxisLeft
                      scale={yDominanceScale}
                      stroke="rgba(255, 215, 0, 0.3)"
                      tickStroke="rgba(255, 215, 0, 0.3)"
                      tickFormat={(d) => `${d}%`}
                      tickLabelProps={{
                        fill: '#FFD700',
                        fontFamily: 'Orbitron',
                        fontSize: 14,
                        textAnchor: 'end',
                        dx: -4,
                      }}
                    />
                    <AxisRight
                      left={xMax}
                      scale={yAltScale}
                      stroke="rgba(79, 70, 229, 0.3)"
                      tickStroke="rgba(79, 70, 229, 0.3)"
                      tickLabelProps={{
                        fill: '#4f46e5',
                        fontFamily: 'Orbitron',
                        fontSize: 14,
                        textAnchor: 'start',
                        dx: 4,
                      }}
                    />
                  </Group>
                </svg>
                {tooltipData && (
                  <TooltipWithBounds
                    key={Math.random()}
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={tooltipStyles}
                  >
                    <div className="font-orbitron">
                      <div className="text-sm mb-1">
                        {new Date(tooltipData.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>
                          BTC:
                          {' '}
                          {tooltipData.btcDominance.toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>
                          Alt:
                          {' '}
                          {tooltipData.altIndex.toFixed(2)}
                        </span>
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
  );
}

export default BitcoinDominanceChart;
