import { useEffect, useState } from "react"
import CandlestickChart from "./components/CandlestickChart"
import * as d3 from "d3";
const App = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    d3.csv("./src/data.csv").then((rawData) => {
     
      const parsedData = rawData.map((row) => {
        return {
          date: new Date(row.Date),
          open: +row.Open,
          high: +row.High,
          low: +row.Low,
          close: +row.Close
        };
      });
      console.log(rawData);
      console.log(parsedData);
      setData(parsedData);
    });
  }, []);

  return (
    <div>
      <CandlestickChart data={data} dataUrl="./src/data.csv" />
    </div>
  )
}

export default App