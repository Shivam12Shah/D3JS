import React, { useEffect, useRef, useState } from 'react'
import { useD3 } from '../../hooks/useD3';
import * as d3 from 'd3';
import LinePlot from '../D3/LinePlot';
const CandleChart = () => {
    const [data, setData] = useState([]);

    const ref = useRef();

    const DrawChart = (data,
        width = 640,
        height = 400,
        marginTop = 20,
        marginRight = 20,
        marginBottom = 20,
        marginLeft = 20) => {

            const x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
            const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
            
           

    }

    useEffect(() => {
        console.log(ref?.current?.clientWidth,ref?.current?.clientHeight);
        
        d3.csv("../../../src/data.csv").then((rawData) => {

        
          

    

            DrawChart(rawData)
            setData(rawData)

        })


    }, [])


    return (
       <div className='flex-1' ref={ref}>
         <LinePlot data={data} width={ref?.current?.clientWidth || 400} height={ref?.current?.clientHeight || 640}  />
       </div>
    )
}

export default CandleChart