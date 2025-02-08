import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const containerRef = useRef();
  const [data, setData] = useState(null);

  useEffect(() => {
    d3.csv("../src/data.csv", d3.autoType).then((rawData) => {
      rawData.forEach((d) => (d.Date = new Date(d.Date))); // Convert Date to JS Date object
      setData(rawData);
    });
  }, []);

  useEffect(() => {
    if (!data) return;

    // Clear previous plot before rendering new one
    containerRef.current.innerHTML = "";

    // Create scales for the plot
    const xScale = d3.scaleTime().domain(d3.extent(data, (d) => d.Date));
    const yScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.Close));

    // Create the plot
    const plot = Plot.plot({
      width: 1000,
      height: 600,
      x: { type: "time", label: "Date", domain: xScale.domain() },
      y: { label: "Closing Price", domain: yScale.domain() },
      color: { scheme: "blues" },
      marks: [
        Plot.ruleX(data, {
          x: "Date",
          y1: "High", // Wick goes from High to Low
          y2: "Low",
          stroke: (d) => (d.Close > d.Open ? "green" : "red"), // Color wick based on price movement
          strokeWidth: 2,
        }),      
      ],
    });

    containerRef.current.append(plot);

    // Add SVG for marker and lines
    const svg = d3.select(containerRef.current).append("svg")
      .attr("width", 1000)
      .attr("height", 600)
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0);

    const marker = svg.append("circle")
      .attr("r", 5)
      .attr("fill", "red")
      .style("display", "none");

    const verticalLine = svg.append("line")
      .attr("stroke", "black")
      .style("display", "none");

    const horizontalLine = svg.append("line")
      .attr("stroke", "black")
      .style("display", "none");

    // Add mouse event listener
    d3.select(containerRef.current).on("mousemove", function(event) {
      const [mouseX, mouseY] = d3.pointer(event);
      const xDate = xScale.invert(mouseX);
      const yValue = yScale.invert(mouseY);

      marker.attr("cx", mouseX)
        .attr("cy", mouseY)
        .style("display", "block");

      verticalLine.attr("x1", mouseX)
        .attr("x2", mouseX)
        .attr("y1", 0)
        .attr("y2", 600)
        .style("display", "block");

      horizontalLine.attr("x1", 0)
        .attr("x2", 1000)
        .attr("y1", mouseY)
        .attr("y2", mouseY)
        .style("display", "block");
    });

    return () => plot.remove();
  }, [data]);

  return <div ref={containerRef} style={{ position: "relative" }} />;
}