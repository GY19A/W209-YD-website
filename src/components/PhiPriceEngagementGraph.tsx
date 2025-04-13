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
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath, Area } from '@visx/shape';
import { 
  useTooltip, 
  TooltipWithBounds, 
  defaultStyles as defaultTooltipStyles 
} from '@visx/tooltip';
import { extent, max, bisector as d3Bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import * as d3 from 'd3';
import { curveMonotoneX } from '@visx/curve';

// Define interfaces for data shapes
interface PriceData {
  date: Date;
  phicoin: number;
}

interface EngagementData {
  Date: string;
  Engagements: number;
  parsedDate: Date;
}

interface TooltipData extends PriceData {
  engagement?: number;
}

// Accessors
const getDate = (d: PriceData | TooltipData) => d.date;
const getPrice = (d: PriceData | TooltipData) => d.phicoin;
const getEngagement = (d: EngagementData) => d.Engagements;
const bisectDate = d3Bisector<PriceData, Date>((d) => d.date).left;

// Colors - Match XEngagementGraph palette
const colors = {
  price: '#f59e0b', // Gold/Orange
  engagement: '#9370DB', // Purple
};

// Tooltip styles - Match XEngagementGraph
const tooltipStyles = {
  ...defaultTooltipStyles,
  background: 'rgba(26, 26, 61, 0.95)',
  color: '#FFD700',
  border: '1px solid #9370DB',
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '12px',
  borderRadius: '8px',
  padding: '8px',
};

interface PhiPriceEngagementGraphProps {
  width: number;
  height: number;
}

function PhiPriceEngagementGraphComponent({ width, height }: PhiPriceEngagementGraphProps): JSX.Element | null {
  const [priceData, setPriceData] = useState<PriceData[] | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3m');

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  // Margins and dimensions
  const margin = {
    top: 60,
    right: 50,
    bottom: 60,
    left: 80,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Fetch and process data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.csv('/pages/new_data/simplified-prices.csv'),
      d3.csv('/pages/new_data/account_overview_analytics_yd.csv'),
    ])
    .then(([priceCsvData, engagementCsvData]) => {
        // Process price data
        const processedPriceData: PriceData[] = priceCsvData
        .map((d: any) => ({
          date: new Date(d.date),
          phicoin: +d.phicoin,
        }))
        .filter(d => !isNaN(d.date.getTime()) && d.phicoin > 0);

        // Process engagement data
        const processedEngagementData: EngagementData[] = engagementCsvData
          .map((d: any) => {
            const dateStr = d.Date?.replace(/["\\]/g, '');
        const dateParts = dateStr?.match(/(\w+), (\w+) (\d{1,2}), (\d{4})/);
            let parsedDate = new Date();
        if (dateParts) {
          const [, , month, day, year] = dateParts;
              parsedDate = new Date(`${month} ${day}, ${year}`);
        }
        return {
              Date: d.Date,
          Engagements: +d.Engagements || 0,
              parsedDate,
            };
          })
          .filter(d => !isNaN(d.parsedDate.getTime()));

        // Sort data by date
        processedPriceData.sort((a, b) => a.date.getTime() - b.date.getTime());
        processedEngagementData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

        setPriceData(processedPriceData);
        setEngagementData(processedEngagementData);
        setError(null);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}`);
        setPriceData(null);
        setEngagementData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    if (!priceData || !engagementData) return { priceData: [], engagementData: [] };

          const now = new Date();
    const monthsToSubtract = parseInt(selectedPeriod.replace('m', ''), 10);
    const startDate = new Date(now);
          startDate.setMonth(now.getMonth() - monthsToSubtract);
          startDate.setHours(0, 0, 0, 0);

    return {
      priceData: priceData.filter(d => d.date >= startDate),
      engagementData: engagementData.filter(d => d.parsedDate >= startDate),
    };
  }, [priceData, engagementData, selectedPeriod]);

  // Scales
  const xScale = useMemo(() => {
    if (!filteredData.priceData.length) return null;
    return scaleTime({
      range: [0, innerWidth],
      domain: extent(filteredData.priceData, getDate) as [Date, Date],
    });
  }, [filteredData.priceData, innerWidth]);

  const yPriceScale = useMemo(() => {
    if (!filteredData.priceData.length) return null;
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, max(filteredData.priceData, getPrice) || 0],
      nice: true,
    });
  }, [filteredData.priceData, innerHeight]);

  // Add radius scale with other scales
  const rScale = useMemo(() => {
    if (!filteredData.engagementData.length) return null;
    return scaleLinear({
      range: [3, 15], // Min and max circle radius
      domain: [0, max(filteredData.engagementData, getEngagement) || 0],
      nice: true,
    });
  }, [filteredData.engagementData]);

  // Tooltip handler
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      if (!xScale || !yPriceScale || !filteredData.priceData.length) return;

      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(filteredData.priceData, x0, 1);
      const d0 = filteredData.priceData[index - 1];
      const d1 = filteredData.priceData[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
      }

      const engagement = filteredData.engagementData.find(
        e => e.parsedDate.toDateString() === d.date.toDateString()
      );

      showTooltip({
        tooltipData: { ...d, engagement: engagement?.Engagements },
        tooltipLeft: xScale(getDate(d)) + margin.left,
        tooltipTop: yPriceScale(getPrice(d)) + margin.top,
      });
    },
    [xScale, yPriceScale, filteredData, showTooltip, margin]
  );

  if (loading) return <div className="flex items-center justify-center h-full text-yellow-400 font-orbitron">Loading data...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-400 font-orbitron">Error: {error}</div>;
  if (!xScale || !yPriceScale || !rScale) return null;

  const timePeriods = ['1m', '3m', '6m', '9m'];

  return (
    <div className="relative font-['Orbitron']">
      <div className="text-gray-300 text-sm mb-4 px-4 text-center font-sans">
        This interactive visualization displays the relationship between YD Price (in USD) and X Engagements over time. The gold line represents the price movement, while purple circles indicate engagement events. The size of each circle corresponds to the engagement level. Use the time period buttons to adjust the view, and hover over data points to see detailed information.
      </div>
      <div className="text-center w-full mb-2 text-xl md:text-2xl lg:text-3xl font-orbitron text-yellow-400">
        YD Price vs. X Engagements
      </div>

      <div className="flex justify-center gap-6 mb-4">
        {timePeriods.map((period) => (
              <button
                key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded transition-colors duration-150 ${
                  selectedPeriod === period
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
            {period}
              </button>
           ))}
        </div>

      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yPriceScale}
            width={innerWidth}
            stroke="rgba(147, 112, 219, 0.1)"
            strokeDasharray="3,3"
          />
          <GridColumns
            scale={xScale}
            height={innerHeight}
            stroke="rgba(147, 112, 219, 0.1)"
            strokeDasharray="3,3"
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="rgba(255, 215, 0, 0.3)"
            tickStroke="rgba(255, 215, 0, 0.3)"
            tickLabelProps={() => ({
              fill: '#FFD700',
              fontSize: 12,
              textAnchor: 'middle',
              fontFamily: "'Orbitron', sans-serif",
            })}
            tickFormat={(value) => timeFormat('%b %d')(value as Date)}
          />

          <AxisLeft
            scale={yPriceScale}
            stroke="rgba(255, 215, 0, 0.3)"
            tickStroke="rgba(255, 215, 0, 0.3)"
            tickLabelProps={() => ({
              fill: '#FFD700',
              fontSize: 12,
              textAnchor: 'end',
              fontFamily: "'Orbitron', sans-serif",
              dx: '-0.25em',
            })}
            tickFormat={(value) => `$${value.toFixed(3)}`}
          />

          <text
            x={-innerHeight / 2}
            y={-margin.left + 15}
            transform="rotate(-90)"
            fontSize={12}
            fontFamily="'Orbitron', sans-serif"
            fill="#FFD700"
            textAnchor="middle"
          >
            Price (USD)
          </text>

          <Area
            data={filteredData.priceData}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yPriceScale(getPrice(d)) ?? 0}
            y1={() => innerHeight}
            curve={curveMonotoneX}
            fill={colors.price}
            opacity={0.2}
          />

          <LinePath
            data={filteredData.priceData}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yPriceScale(getPrice(d)) ?? 0}
            stroke={colors.price}
            strokeWidth={2}
            curve={curveMonotoneX}
          />

          {filteredData.engagementData.map((d, i) => {
            const pricePoint = filteredData.priceData.find(
              p => p.date.toDateString() === d.parsedDate.toDateString(),
            );
            
            if (!pricePoint) return null;
            
            return (
              <circle
                key={i}
                cx={xScale(d.parsedDate)}
                cy={yPriceScale(pricePoint.phicoin)}
                r={rScale(d.Engagements)}
                fill={colors.engagement}
                opacity={0.6}
                stroke="white"
                strokeWidth={1}
              />
            );
          })}

          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {tooltipOpen && tooltipData && (
            <g>
              <line
                x1={tooltipLeft ? tooltipLeft - margin.left : 0}
                x2={tooltipLeft ? tooltipLeft - margin.left : 0}
                y1={0}
                y2={innerHeight}
                stroke="rgba(255, 215, 0, 0.5)"
                strokeWidth={1}
                strokeDasharray="4,2"
                pointerEvents="none"
              />
            </g>
          )}
        </Group>
                  </svg>

      {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#FFD700' }}>
            {timeFormat('%a, %b %d, %Y')(getDate(tooltipData))}
              </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
            <div
              style={{ width: '8px', height: '8px', backgroundColor: colors.price, marginRight: '5px', borderRadius: '2px' }}
            />
            <span style={{ color: '#EAEAEA', marginRight: '4px' }}>Price:</span>
            <span style={{ fontWeight: 600 }}>${getPrice(tooltipData).toFixed(4)}</span>
          </div>
          {tooltipData.engagement !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '8px', height: '8px', backgroundColor: colors.engagement, marginRight: '5px', borderRadius: '2px' }}
              />
              <span style={{ color: '#EAEAEA', marginRight: '4px' }}>Engagements:</span>
              <span style={{ fontWeight: 600 }}>{tooltipData.engagement}</span>
          </div>
      )}
        </TooltipWithBounds>
      )}
    </div>
  );
}

export default function PhiPriceEngagementGraph(): JSX.Element {
  return (
    <div className="w-full h-full data-chart relative flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg">
      <div className="w-full h-[400px]">
        <ParentSize>
          {({ width, height }) => <PhiPriceEngagementGraphComponent width={width} height={height} />}
        </ParentSize>
      </div>
    </div>
  );
} 