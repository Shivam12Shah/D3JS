import * as d3 from "d3";
import { useRef, useEffect } from "react";
import PropTypes from "prop-types";

export default function CandlestickChart({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 40,
  marginBottom = 40,
  marginLeft = 50
}) {
  const gx = useRef();
  const gy = useRef();
  const svgRef = useRef();
  const volumeRef = useRef();

  const parsedData = data.map(d => ({
    Date: new Date(d.Date),
    Open: d.Open,
    High: d.High,
    Low: d.Low,
    Close: d.Close,
    Volume: d.Volume
  }));

  const x = d3.scaleTime()
    .domain(d3.extent(parsedData, d => d.Date))
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
    .domain([d3.min(parsedData, d => d.Low), d3.max(parsedData, d => d.High)])
    .range([height - marginBottom, marginTop]);

  const yVolume = d3.scaleLinear()
    .domain([0, d3.max(parsedData, d => d.Volume)])
    .range([height - marginBottom, height - marginBottom- 40]);

  useEffect(() => {
    d3.select(gx.current).call(d3.axisBottom(x));
    d3.select(gy.current).call(d3.axisLeft(y));
  }, [x, y]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const candleWidth = (width - marginLeft) / parsedData.length * 0.5;

    const candles = svg.select(".candles").selectAll("g.candle").data(parsedData);

    const enterCandles = candles.enter().append("g").attr("class", "candle"); 
    enterCandles.append("line").attr("class", "wick");
    enterCandles.append("rect");

    candles.merge(enterCandles)
      .attr("transform", d => `translate(${x(d.Date)}, 0)`)
      .each(function(d) {
        const group = d3.select(this);
        const isBullish = d.Close > d.Open;
        group.select(".wick")
          .attr("y1", y(d.High))
          .attr("y2", y(d.Low))
          .attr("stroke", isBullish ? "green" : "red");
        group.select("rect")
          .attr("x", -candleWidth / 2)
          .attr("width", candleWidth)
          .attr("y", y(Math.max(d.Open, d.Close)))
          .attr("height", Math.abs(y(d.Open) - y(d.Close)))
          .attr("fill", isBullish ? "green" : "red");
      });

    const volumeBars = svg.select(".volume").selectAll("rect").data(parsedData);
    volumeBars.enter()
      .append("rect")
      .merge(volumeBars)
      .attr("x", d => x(d.Date) - candleWidth / 2)
      .attr("width", candleWidth)
      .attr("y", d => yVolume(d.Volume))
      .attr("height", d => height - marginBottom - yVolume(d.Volume))
      .attr("fill", d => d.Close > d.Open ? "#aaaa" : "#aaaa");
  }, [parsedData, x, y, yVolume]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
  
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 5]) // Limit zoom scale
      .translateExtent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]]) // Prevents overflowing
      .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);
        d3.select(gx.current).call(d3.axisBottom(newX));
        d3.select(gy.current).call(d3.axisLeft(newY));
  
        const originalCandleWidth = (width - marginLeft) / parsedData.length * 0.5;
        const currentCandleWidth = originalCandleWidth * event.transform.k;
  
        // Update candles with clamped positions
        svg.select(".candles").selectAll("g.candle")
          .attr("transform", d => `translate(${Math.max(marginLeft, Math.min(newX(d.Date), width - marginRight))}, 0)`)
          .select("rect")
          .attr("x", -currentCandleWidth / 2)
          .attr("width", currentCandleWidth);
  
        // Update volume bars with clamped positions
        svg.select(".volume").selectAll("rect")
          .attr("x", d => Math.max(marginLeft, Math.min(newX(d.Date) - currentCandleWidth / 2, width - marginRight)))
          .attr("width", currentCandleWidth);
      });
  
    svg.call(zoomBehavior);
  }, [x, y, yVolume]);
  

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const crosshair = svg.append("g").attr("class", "crosshair").style("display", "none");

    crosshair.append("line").attr("class", "crosshair-x").attr("stroke", "#dadada");
    crosshair.append("line").attr("class", "crosshair-y").attr("stroke", "#dadada");

    svg.on("mousemove", function(event) {
      const [mouseX, mouseY] = d3.pointer(event);
      crosshair.style("display", null);
      crosshair.select(".crosshair-x").attr("x1", mouseX).attr("x2", mouseX).attr("y1", marginTop).attr("y2", height - marginBottom);
      crosshair.select(".crosshair-y").attr("y1", mouseY).attr("y2", mouseY).attr("x1", marginLeft).attr("x2", width - marginRight);
    }).on("mouseleave", () => {
      crosshair.style("display", "none");
    });
  }, []);

  return (
    <svg ref={svgRef} width={width} height={height} >
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <g ref={gx} transform={`translate(0,${height-30})`} />
      <g className="candles"  />
      <g className="volume" ref={volumeRef} />
    </svg>
  );
}

CandlestickChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  marginTop: PropTypes.number,
  marginRight: PropTypes.number,
  marginBottom: PropTypes.number,
  marginLeft: PropTypes.number
};
