import * as d3 from "d3";
import { useRef, useEffect } from "react";
import PropTypes from 'prop-types';

export default function CandlestickChart({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40
}) {
  const gx = useRef();
  const gy = useRef();
  const svgRef = useRef();

  const parsedData = data.map(d => ({
    Date: new Date(d.Date),
    Open: d.Open,
    High: d.High,
    Low: d.Low,
    Close: d.Close
  }));

  const x = d3.scaleTime()
    .domain(d3.extent(parsedData, d => d.Date))
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
    .domain([d3.min(parsedData, d => d.Low), d3.max(parsedData, d => d.High)])
    .range([height - marginBottom, marginTop]);

  useEffect(() => {
    d3.select(gx.current).call(d3.axisBottom(x));
    d3.select(gy.current).call(d3.axisLeft(y));
  }, [x, y]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const candleWidth = (width - marginLeft - marginRight) / parsedData.length * 0.8;

    const candles = svg.select(".candles").selectAll("g.candle").data(parsedData);

    const enterCandles = candles.enter()
      .append("g")
      .attr("class", "candle");

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
  }, [parsedData, x, y]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 5])
      .translateExtent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        d3.select(gx.current).call(d3.axisBottom(newX));

        svg.select(".candles").selectAll("g.candle")
          .attr("transform", d => `translate(${newX(d.Date)}, 0)`);
      });

    svg.call(zoomBehavior);
  }, [x]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <g className="candles" />
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
