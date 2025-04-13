export interface DataPoint {
  date: Date;
  value: number;
  timestamp: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
}

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartData {
  dominanceData: DataPoint[];
  altIndexData: DataPoint[];
}

export type TimePeriod = '1m' | '3m' | '6m' | '12m'; 