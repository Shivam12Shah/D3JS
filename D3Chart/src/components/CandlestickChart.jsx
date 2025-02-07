import  { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CandlestickChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Set up dimensions
    const width = 1000;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
      .range([height - margin.bottom, margin.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Calculate candle width
    const candleWidth = (width - margin.left - margin.right) / data.length * 0.8;

    // Draw candlesticks
    svg.selectAll('g.candle')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'candle')
      .attr('transform', d => `translate(${xScale(d.date)}, 0)`)
      .each(function(d) {
        const group = d3.select(this);
        const isBullish = d.close > d.open;
        
        // Draw wick
        group.append('line')
          .attr('class', 'wick')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', yScale(d.high))
          .attr('y2', yScale(d.low))
          .attr('stroke', isBullish ? 'green' : 'red');

        // Draw candle body
        group.append('rect')
          .attr('x', -candleWidth / 2)
          .attr('y', yScale(Math.max(d.open, d.close)))
          .attr('width', candleWidth)
          .attr('height', Math.abs(yScale(d.open) - yScale(d.close)))
          .attr('fill', isBullish ? 'green' : 'red');
      });

  }, [data]);

  return <svg ref={svgRef}></svg>;
};


export default CandlestickChart;