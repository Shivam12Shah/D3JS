// StockChart.jsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useStockChart from './useStockChart';

const StockChart = () => {
  const svgRef = useRef(null);
  const { dimensions, xScale, yScale, yVolumeScale, calculateIndicators } = useStockChart();

  useEffect(() => {
    if (!svgRef.current) return;

    // Load data and initialize chart
    const loadData = async () => {
      const response = await fetch('data.csv');
      const text = await response.text();
      const data = d3.csvParse(text, d3.autoType);
      
      const processedData = data.map(d => ({
        date: d.Date,
        open: d.Open,
        high: d.High,
        low: d.Low,
        close: d.Close,
        volume: d.Volume
      })).sort((a, b) => d3.ascending(a.date, b.date));

      const { x, y, yVolume } = calculateIndicators(processedData);
      
      // Draw chart elements
      drawChart(processedData, x, y, yVolume);
    };

    loadData();
  }, [calculateIndicators]);

  const drawChart = (data, x, y, yVolume) => {
    const svg = d3.select(svgRef.current);
    
    // Clear existing elements
    svg.selectAll('*').remove();

    // Draw axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisRight(y);
    const volumeAxis = d3.axisRight(yVolume).ticks(3);

    svg.append('g')
      .attr('transform', `translate(0,${dimensions.height - dimensions.margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${dimensions.width - dimensions.margin.right},0)`)
      .call(yAxis);

    // Draw candlesticks
    svg.selectAll('.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', d => `candle ${d.close > d.open ? 'up' : 'down'}`)
      .attr('x', d => x(d.date))
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.open) - y(d.close)))
      .attr('fill', d => d.close > d.open ? '#00aa00' : '#ff0000');

    // Draw wicks
    svg.selectAll('.wick')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'wick')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2)
      .attr('x2', d => x(d.date) + x.bandwidth() / 2)
      .attr('y1', d => y(d.high))
      .attr('y2', d => y(d.low))
      .attr('stroke', '#000');

    // Draw volume bars
    svg.selectAll('.volume')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'volume')
      .attr('x', d => x(d.date))
      .attr('y', d => yVolume(d.volume))
      .attr('width', x.bandwidth())
      .attr('height', d => dimensions.height - dimensions.margin.bottom - yVolume(d.volume))
      .attr('fill', '#ddd');
  };

  return (
    <div>
      <button onClick={() => window.location.reload()} style={{ position: 'absolute', right: 110, top: 25 }}>
        Reset
      </button>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ font: '10px sans-serif' }}
      />
    </div>
  );
};

export default StockChart;