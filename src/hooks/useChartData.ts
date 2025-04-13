import { useState, useEffect } from 'react';
import { DataPoint, ChartData, TimePeriod } from '../types/chart';

const validateAndParseDate = (timestamp: string): Date | null => {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
};

const filterDataByPeriod = (data: DataPoint[], timePeriod: TimePeriod): DataPoint[] => {
  const now = new Date();
  let monthsBack: number;
  
  switch (timePeriod) {
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
  
  return data.filter((d) => d.timestamp >= cutoffTimestamp);
};

const processData = (rawData: any, valueKey: string): DataPoint[] => {
  return rawData.data.points
    .map((point: any) => {
      const date = validateAndParseDate(point.timestamp);
      const value = valueKey === 'dominance' ? point[valueKey][0] : parseFloat(point[valueKey]);
      return date ? {
        date,
        value,
        timestamp: parseInt(point.timestamp, 10),
      } : null;
    })
    .filter((item: any) => item !== null)
    .sort((a: any, b: any) => a.timestamp - b.timestamp);
};

export const useChartData = (timePeriod: TimePeriod) => {
  const [chartData, setChartData] = useState<ChartData>({
    dominanceData: [],
    altIndexData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dominanceResponse, altIndexResponse] = await Promise.all([
          fetch('/pages/new_data/cmc_btc_d.json'),
          fetch('/pages/new_data/cmc_alt_index.json'),
        ]);

        const [dominanceData, altIndexData] = await Promise.all([
          dominanceResponse.json(),
          altIndexResponse.json(),
        ]);

        const processedDominanceData = processData(dominanceData, 'dominance');
        const processedAltIndexData = processData(altIndexData, 'altcoinIndex');

        setChartData({
          dominanceData: filterDataByPeriod(processedDominanceData, timePeriod),
          altIndexData: filterDataByPeriod(processedAltIndexData, timePeriod),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  return { chartData, loading, error };
}; 