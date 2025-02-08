import  { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TradingChart = () => {
  const svgRef = useRef(null);
  const buttonRef = useRef(null);
  const [data, setData] = useState(null); // State to hold the loaded data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await d3.csv("data.csv");
        setData(csvData); // Store the loaded data in state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Fetch data only once on component mount

  useEffect(() => {
    if (!data) return; // Don't run if data is not yet loaded

    const dim = {
      width: 960,
      height: 500,
      margin: { top: 20, right: 50, bottom: 30, left: 50 },
      ohlc: { height: 305 },
      indicator: { height: 65, padding: 5 },
    };
    dim.plot = {
      width: dim.width - dim.margin.left - dim.margin.right,
      height: dim.height - dim.margin.top - dim.margin.bottom,
    };
    dim.indicator.top = dim.ohlc.height + dim.indicator.padding;
    dim.indicator.bottom =
      dim.indicator.top + dim.indicator.height + dim.indicator.padding;

    var indicatorTop = d3
      .scaleLinear()
      .range([dim.indicator.top, dim.indicator.bottom]);

    var parseDate = d3.timeParse("%d-%b-%y");

    var zoom = d3.zoom().on("zoom", zoomed);

    var x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([dim.margin.left,dim.width - dim.margin.right]);

    var y = d3.scaleLinear().range([dim.ohlc.height, 0]);

    var yPercent = y.copy(); // Same as y at this stage, will get a different domain later

    var yInit, yPercentInit, zoomableInit;

    var yVolume = d3.scaleLinear().range([y(0), y(0.2)]);

    var candlestick = techan.plot.candlestick().xScale(x).yScale(y);

    var tradearrow = techan.plot
      .tradearrow()
      .xScale(x)
      .yScale(y)
      .y(function (d) {
        // Display the buy and sell arrows a bit above and below the price, so the price is still visible
        if (d.type === "buy") return y(d.low) + 5;
        if (d.type === "sell") return y(d.high) - 5;
        else return y(d.price);
      });

    var sma0 = techan.plot.sma().xScale(x).yScale(y);

    var sma1 = techan.plot.sma().xScale(x).yScale(y);

    var ema2 = techan.plot.ema().xScale(x).yScale(y);

    var volume = techan.plot
      .volume()
      .accessor(candlestick.accessor()) // Set the accessor to a ohlc accessor so we get highlighted bars
      .xScale(x)
      .yScale(yVolume);

    var trendline = techan.plot.trendline().xScale(x).yScale(y);

    var supstance = techan.plot.supstance().xScale(x).yScale(y);

    var xAxis = d3.axisBottom(x);

    var timeAnnotation = techan.plot
      .axisannotation()
      .axis(xAxis)
      .orient("bottom")
      .format(d3.timeFormat("%Y-%m-%d"))
      .width(65)
      .translate([0, dim.plot.height]);

    var yAxis = d3.axisRight(y);

    var ohlcAnnotation = techan.plot
      .axisannotation()
      .axis(yAxis)
      .orient("right")
      .format(d3.format(",.2f"))
      .translate([x(1), 0]);

    var closeAnnotation = techan.plot
      .axisannotation()
      .axis(yAxis)
      .orient("right")
      .accessor(candlestick.accessor())
      .format(d3.format(",.2f"))
      .translate([x(1), 0]);

    var percentAxis = d3.axisLeft(yPercent).tickFormat(d3.format("+.1%"));

    var percentAnnotation = techan.plot
      .axisannotation()
      .axis(percentAxis)
      .orient("left");

    var volumeAxis = d3
      .axisRight(yVolume)
      .ticks(3)
      .tickFormat(d3.format(",.3s"));

    var volumeAnnotation = techan.plot
      .axisannotation()
      .axis(volumeAxis)
      .orient("right")
      .width(35);

    var macdScale = d3
      .scaleLinear()
      .range([indicatorTop(0) + dim.indicator.height, indicatorTop(0)]);

    var rsiScale = macdScale
      .copy()
      .range([indicatorTop(1) + dim.indicator.height, indicatorTop(1)]);

    var macd = techan.plot.macd().xScale(x).yScale(macdScale);

    var macdAxis = d3.axisRight(macdScale).ticks(3);

    var macdAnnotation = techan.plot
      .axisannotation()
      .axis(macdAxis)
      .orient("right")
      .format(d3.format(",.2f"))
      .translate([x(1), 0]);

    var macdAxisLeft = d3.axisLeft(macdScale).ticks(3);

    var macdAnnotationLeft = techan.plot
      .axisannotation()
      .axis(macdAxisLeft)
      .orient("left")
      .format(d3.format(",.2f"));

    var rsi = techan.plot.rsi().xScale(x).yScale(rsiScale);

    var rsiAxis = d3.axisRight(rsiScale).ticks(3);
    var rsiAnnotation = techan.plot
      .axisannotation()
      .axis(rsiAxis)
      .orient("right")
      .format(d3.format(",.2f"))
      .translate([x(1), 0]);

    var rsiAxisLeft = d3.axisLeft(rsiScale).ticks(3);

    var rsiAnnotationLeft = techan.plot
      .axisannotation()
      .axis(rsiAxisLeft)
      .orient("left")
      .format(d3.format(",.2f"));

    var ohlcCrosshair = techan.plot
      .crosshair()
      .xScale(timeAnnotation.axis().scale())
      .yScale(ohlcAnnotation.axis().scale())
      .xAnnotation(timeAnnotation)
      .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
      .verticalWireRange([0, dim.plot.height]);

    var macdCrosshair = techan.plot
      .crosshair()
      .xScale(timeAnnotation.axis().scale())
      .yScale(macdAnnotation.axis().scale())
      .xAnnotation(timeAnnotation)
      .yAnnotation([macdAnnotation, macdAnnotationLeft])
      .verticalWireRange([0, dim.plot.height]);

    var rsiCrosshair = techan.plot
      .crosshair()
      .xScale(timeAnnotation.axis().scale())
      .yScale(rsiAnnotation.axis().scale())
      .xAnnotation(timeAnnotation)
      .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
      .verticalWireRange([0, dim.plot.height]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", dim.width)
      .attr("height", dim.height);

    const defs = svg.append("defs");

    defs
      .append("clipPath")
      .attr("id", "ohlcClip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", dim.plot.width)
      .attr("height", dim.ohlc.height);

    defs
      .selectAll("indicatorClip")
      .data([0, 1])
      .enter()
      .append("clipPath")
      .attr("id", function (d, i) {
        return "indicatorClip-" + i;
      })
      .append("rect")
      .attr("x", 0)
      .attr("y", function (d, i) {
        return indicatorTop(i);
      })
      .attr("width", dim.plot.width)
      .attr("height", dim.indicator.height);

    const svgGroup = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + dim.margin.left + "," + dim.margin.top + ")"
      );

    svgGroup
      .append("text")
      .attr("class", "symbol")
      .attr("x", 20)
      .text("Facebook, Inc. (FB)");

    svgGroup
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + dim.plot.height + ")");

    const ohlcSelection = svgGroup
      .append("g")
      .attr("class", "ohlc")
      .attr("transform", "translate(0,0)");

    ohlcSelection
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + x(1) + ",0)")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -12)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

    ohlcSelection.append("g").attr("class", "close annotation up");

    ohlcSelection
      .append("g")
      .attr("class", "volume")
      .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection
      .append("g")
      .attr("class", "candlestick")
      .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection
      .append("g")
      .attr("class", "indicator sma ma-0")
      .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection
      .append("g")
      .attr("class", "indicator sma ma-1")
      .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection
      .append("g")
      .attr("class", "indicator ema ma-2")
      .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g").attr("class", "percent axis");

    ohlcSelection.append("g").attr("class", "volume axis");

    const indicatorSelection = svgGroup
      .selectAll("svg > g.indicator")
      .data(["macd", "rsi"])
      .enter()
      .append("g")
      .attr("class", function (d) {
        return d + " indicator";
      });

    indicatorSelection
      .append("g")
      .attr("class", "axis right")
      .attr("transform", "translate(" + x(1) + ",0)");

    indicatorSelection
      .append("g")
      .attr("class", "axis left")
      .attr("transform", "translate(" + x(0) + ",0)");

    indicatorSelection
      .append("g")
      .attr("class", "indicator-plot")
      .attr("clip-path", function (d, i) {
        return "url(#indicatorClip-" + i + ")";
      });

    // Add trendlines and other interactions last to be above zoom pane
    svgGroup.append("g").attr("class", "crosshair ohlc");

    svgGroup
      .append("g")
      .attr("class", "tradearrow")
      .attr("clip-path", "url(#ohlcClip)");

    svgGroup.append("g").attr("class", "crosshair macd");

    svgGroup.append("g").attr("class", "crosshair rsi");

    svgGroup
      .append("g")
      .attr("class", "trendlines analysis")
      .attr("clip-path", "url(#ohlcClip)");
    svgGroup
      .append("g")
      .attr("class", "supstances analysis")
      .attr("clip-path", "url(#ohlcClip)");

    d3.select(buttonRef.current).on("click", reset);

    const accessor = candlestick.accessor();
    const indicatorPreRoll = 33; // Don't show where indicators don't have data

    const processedData = data
      .map(function (d) {
        return {
          date: parseDate(d.Date),
          open: +d.Open,
          high: +d.High,
          low: +d.Low,
          close: +d.Close,
          volume: +d.Volume,
        };
      })
      .sort(function (a, b) {
        return d3.ascending(accessor.d(a), accessor.d(b));
      });

    x.domain(techan.scale.plot.time(processedData).domain());
    y.domain(
      techan.scale.plot.ohlc(processedData.slice(indicatorPreRoll)).domain()
    );
    yPercent.domain(
      techan.scale.plot
        .percent(y, accessor(processedData[indicatorPreRoll]))
        .domain()
    );
    yVolume.domain(techan.scale.plot.volume(processedData).domain());

    var trendlineData = [
      {
        start: { date: new Date(2014, 2, 11), value: 72.5 },
        end: { date: new Date(2014, 5, 9), value: 63.34 },
      },
      {
        start: { date: new Date(2013, 10, 21), value: 43 },
        end: { date: new Date(2014, 2, 17), value: 70.5 },
      },
    ];

    var supstanceData = [
      {
        start: new Date(2014, 2, 11),
        end: new Date(2014, 5, 9),
        value: 63.64,
      },
      {
        start: new Date(2013, 10, 21),
        end: new Date(2014, 2, 17),
        value: 55.5,
      },
    ];

    var trades = [
      {
        date: processedData[67].date,
        type: "buy",
        price: processedData[67].low,
        low: processedData[67].low,
        high: processedData[67].high,
      },
      {
        date: processedData[100].date,
        type: "sell",
        price: processedData[100].high,
        low: processedData[100].low,
        high: processedData[100].high,
      },
      {
        date: processedData[130].date,
        type: "buy",
        price: processedData[130].low,
        low: processedData[130].low,
        high: processedData[130].high,
      },
      {
        date: processedData[170].date,
        type: "sell",
        price: processedData[170].low,
        low: processedData[170].low,
        high: processedData[170].high,
      },
    ];
    var macdData = techan.indicator.macd()(processedData);
    macdScale.domain(techan.scale.plot.macd(macdData).domain());
    var rsiData = techan.indicator.rsi()(processedData);
    rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());

    svgGroup.select("g.candlestick").datum(processedData).call(candlestick);
    svgGroup
      .select("g.close.annotation")
      .datum([processedData[processedData.length - 1]])
      .call(closeAnnotation);
    svgGroup.select("g.volume").datum(processedData).call(volume);
    svgGroup
      .select("g.sma.ma-0")
      .datum(techan.indicator.sma().period(10)(processedData))
      .call(sma0);
    svgGroup
      .select("g.sma.ma-1")
      .datum(techan.indicator.sma().period(20)(processedData))
      .call(sma1);
    svgGroup
      .select("g.ema.ma-2")
      .datum(techan.indicator.ema().period(50)(processedData))
      .call(ema2);
    svgGroup.select("g.macd .indicator-plot").datum(macdData).call(macd);
    svgGroup.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);

    svgGroup.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
    svgGroup.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
    svgGroup.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
    svgGroup
      .select("g.trendlines")
      .datum(trendlineData)
      .call(trendline)
      .call(trendline.drag);
    svgGroup
      .select("g.supstances")
      .datum(supstanceData)
      .call(supstance)
      .call(supstance.drag);

    svgGroup.select("g.tradearrow").datum(trades).call(tradearrow);

    svgGroup.select("g.x.axis").call(xAxis);
    ohlcSelection.select("g.axis").call(yAxis);
    ohlcSelection.select("g.percent.axis").call(percentAxis);
    ohlcSelection.select("g.volume.axis").call(volumeAxis);
    indicatorSelection.select("g.axis.right").each(function (d) {
      if (d === "macd") d3.select(this).call(macdAxis);
      else d3.select(this).call(rsiAxis);
    });
    indicatorSelection.select("g.axis.left").each(function (d) {
      if (d === "macd") d3.select(this).call(macdAxisLeft);
      else d3.select(this).call(rsiAxisLeft);
    });

    // Store init values so we can reset them on reset
    yInit = y.domain();
    yPercentInit = yPercent.domain();
    zoomableInit = x.zoomable().domain();

    function reset() {
      zoom.scale(1);
      zoom.translate([0, 0]);
      x.domain(zoomableInit);
      y.domain(yInit);
      yPercent.domain(yPercentInit);

      const svg = d3.select(svgRef.current);

      svg.select("g.candlestick").call(candlestick);
      svg
        .select("g.close.annotation")
        .datum([processedData[processedData.length - 1]])
        .call(closeAnnotation);
      svg.select("g.volume").call(volume);
      svg.select("g.sma.ma-0").call(sma0);
      svg.select("g.sma.ma-1").call(sma1);
      svg.select("g.ema.ma-2").call(ema2);
      svg.select("g.macd .indicator-plot").call(macd);
      svg.select("g.rsi .indicator-plot").call(rsi);

      svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
      svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
      svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
      svg.select("g.trendlines").call(trendline).call(trendline.drag);
      svg.select("g.supstances").call(supstance).call(supstance.drag);
      svg.select("g.tradearrow").call(tradearrow);

      svg.select("g.x.axis").call(xAxis);
      const ohlcSelection = svg.select("g.ohlc");
      ohlcSelection.select("g.axis").call(yAxis);
      ohlcSelection.select("g.percent.axis").call(percentAxis);
      ohlcSelection.select("g.volume.axis").call(volumeAxis);
      const indicatorSelection = svg.selectAll("g.indicator");
      indicatorSelection.select("g.axis.right").each(function (d) {
        if (d === "macd") d3.select(this).call(macdAxis);
        else d3.select(this).call(rsiAxis);
      });
      indicatorSelection.select("g.axis.left").each(function (d) {
        if (d === "macd") d3.select(this).call(macdAxisLeft);
        else d3.select(this).call(rsiAxisLeft);
      });
    }

    function zoomed() {
      x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
      y.domain(d3.event.transform.rescaleY(yInit).domain());
      yPercent.domain(d3.event.transform.rescaleY(yPercentInit).domain());

      const svg = d3.select(svgRef.current);

      svg.select("g.candlestick").call(candlestick);
      svg
        .select("g.close.annotation")
        .datum([processedData[processedData.length - 1]])
        .call(closeAnnotation);
      svg.select("g.volume").call(volume);
      svg.select("g.sma.ma-0").call(sma0);
      svg.select("g.sma.ma-1").call(sma1);
      svg.select("g.ema.ma-2").call(ema2);
      svg.select("g.macd .indicator-plot").call(macd);
      svg.select("g.rsi .indicator-plot").call(rsi);

      svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
      svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
      svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
      svg.select("g.trendlines").call(trendline).call(trendline.drag);
      svg.select("g.supstances").call(supstance).call(supstance.drag);
      svg.select("g.tradearrow").call(tradearrow);

      svg.select("g.x.axis").call(xAxis);
      const ohlcSelection = svg.select("g.ohlc");
      ohlcSelection.select("g.axis").call(yAxis);
      ohlcSelection.select("g.percent.axis").call(percentAxis);
      ohlcSelection.select("g.volume.axis").call(volumeAxis);
      const indicatorSelection = svg.selectAll("g.indicator");
      indicatorSelection.select("g.axis.right").each(function (d) {
        if (d === "macd") d3.select(this).call(macdAxis);
        else d3.select(this).call(rsiAxis);
      });
      indicatorSelection.select("g.axis.left").each(function (d) {
        if (d === "macd") d3.select(this).call(macdAxisLeft);
        else d3.select(this).call(rsiAxisLeft);
      });
    }
  }, [data]); // Re-run when data is loaded

  return (
    <div>
      <button ref={buttonRef}>Reset</button>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TradingChart;
