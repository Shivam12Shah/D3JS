import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CandlestickChart = ({ data }) => {
  const svgRef = useRef();
  const zoomRef = useRef();
  const baseXScaleRef = useRef();
  const baseYScaleRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Clear previous content
    svg.selectAll("*").remove();

    // Create base scales
    baseXScaleRef.current = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([margin.left, width - margin.right]);

    baseYScaleRef.current = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
      .range([height - margin.bottom, margin.top]);

    // Initialize current scales
    const currentXScale = baseXScaleRef.current.copy();
    const currentYScale = baseYScaleRef.current.copy();

    // Create axes
    const xAxis = d3.axisBottom(currentXScale);
    const yAxis = d3.axisLeft(currentYScale);

    // Draw axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Calculate candle width
    const candleWidth =
      ((width - margin.left - margin.right) / data.length) * 1;

    // Draw candlesticks
    const candles = svg.append("g").attr("class", "candles");

    candles
      .selectAll("g.candle")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candle")
      .each(function (d) {
        const group = d3.select(this);
        const isBullish = d.close > d.open;

        // Draw wick
        group
          .append("line")
          .attr("class", "wick")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("stroke", isBullish ? "green" : "red");

        // Draw candle body
        group
          .append("rect")
          .attr("x", -candleWidth / 2)
          .attr("width", candleWidth)
          .attr("fill", isBullish ? "green" : "red");
      });

    // Update function for zoom
    const updateChart = () => {
      // Update axes
      svg.select(".x-axis").call(xAxis.scale(currentXScale));
      svg.select(".y-axis").call(yAxis.scale(currentYScale));

      // Update candle positions
      candles
        .selectAll(".candle")
        .attr("transform", (d) => `translate(${currentXScale(d.date)}, 0)`);

      candles
        .selectAll(".wick")
        .attr("y1", (d) => currentYScale(d.high))
        .attr("y2", (d) => currentYScale(d.low));

      candles
        .selectAll("rect")
        .attr("y", (d) => currentYScale(Math.max(d.open, d.close)))
        .attr("height", (d) =>
          Math.abs(currentYScale(d.open) - currentYScale(d.close))
        );
    };

    // Add crosshair
    const crosshair = svg
      .append("g")
      .attr("class", "crosshair")
      .style("display", "none");

    crosshair
      .append("line")
      .attr("class", "crosshair-line")
      .attr("stroke", "#dadada")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray");

    crosshair
      .append("line")
      .attr("class", "crosshair-line")
      .attr("stroke", "#dadada")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray");

    // Add mouse interaction
    const overlay = svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all");

    // Zoom handler
    const zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        const transform = event.transform;
        currentXScale.domain(
          transform.rescaleX(baseXScaleRef.current).domain()
        );
        currentYScale.domain(
          transform.rescaleY(baseYScaleRef.current).domain()
        );
        updateChart();
      })
      .on("start", () => crosshair.style("display", "none"))
      .on("end", () => crosshair.style("display", null));

    overlay
      .call(zoom)
      .on("mouseover", () => crosshair.style("display", null))
      .on("mouseout", () => crosshair.style("display", "none"))
      .on("mousemove", (event) => {
        const [x, y] = d3.pointer(event);
        crosshair
          .select("line:nth-child(1)")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom);

        crosshair
          .select("line:nth-child(2)")
          .attr("x1", margin.left)
          .attr("x2", width - margin.right)
          .attr("y1", y)
          .attr("y2", y);
      });
    updateChart();
    // Store zoom instance for later access
    zoomRef.current = zoom;
  }, [data]);

  return (
    <svg
      ref={svgRef}
      style={{
        height: 500,

        marginRight: "0px",
        marginLeft: "0px",
      }}
    ></svg>
  );
};

export default CandlestickChart;
