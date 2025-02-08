// useStockChart.js
import { useMemo } from 'react';
import * as d3 from 'd3';

const useStockChart = () => {
  const dimensions = useMemo(() => ({
    width: 960,
    height: 500,
    margin: { top: 20, right: 50, bottom: 30, left: 50 }
  }), []);

  const calculateIndicators = useMemo(() => (data) => {
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
      .nice()
      .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume)])
      .range([dimensions.height - dimensions.margin.bottom, dimensions.height - dimensions.margin.bottom - 50]);

    // SMA calculation example
    const sma = (period) => {
      return data.map((d, i) => {
        if (i < period) return null;
        const sum = data.slice(i - period, i).reduce((acc, val) => acc + val.close, 0);
        return sum / period;
      });
    };

    return { x, y, yVolume, sma20: sma(20), sma50: sma(50) };
  }, [dimensions]);

  return { dimensions, ...calculateIndicators };
};

export default useStockChart;