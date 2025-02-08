import React, { useEffect, useRef, useState } from 'react'
import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';
import LinePlot from '../D3/LinePlot';
const CandleChart = () => {
    const [data, setData] = useState([]);

    const svgRef = useRef();

    const DrawChart = (data,
        width = 640,
        height = 400,
        marginTop = 20,
        marginRight = 20,
        marginBottom = 20,
        marginLeft = 20) => {

            const x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
            const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
            
            const line = d3.line((d, i) => x(i), y);


    }

    useEffect(() => {
        d3.csv("../../../src/data.csv").then((rawData) => {

            const width = 800;
            const height = 500;
          console.log(rawData);
          

            const svg = d3
                .select(svgRef.current)
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height]);

            DrawChart(rawData)
            setData(rawData)

        })


    }, [])


    return (
        <LinePlot data={data}  />
    )
}

export default CandleChart