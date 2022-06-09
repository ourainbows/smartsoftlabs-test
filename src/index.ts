import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

interface ProvinceState {
  name: string;
  population: number;
  accumulatedDeaths: number;
};

const groupedByProvince = (data: any): ProvinceState[] => {
  const grouped: ProvinceState[] = data.reduce((acc: ProvinceState[], curr: any) => {
    const province = curr.Province_State;
    const population = curr.Population;
    const deaths = curr["4/27/21"];
    if (acc[province]) {
      acc[province].population += population;
      acc[province].accumulatedDeaths += deaths;
    } else {
      acc[province] = {
        name: province,
        population: population,
        accumulatedDeaths: deaths,
      };
    }
    return acc;
  });
  return grouped;
};

(() => {
  const csvFilePath = path.resolve(
    __dirname,
    "assets/time_series_covid19_deaths_US.csv"
  );

  //const headers = ["Province_State", "Population", "4/27/21"];

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  parse(
    fileContent,
    {
      delimiter: ",",
      columns: true,
      cast: (columnValue, context) => {
        if (context.column === "Population") {
          return parseInt(columnValue);
        }
        if (context.column === "4/27/21") {
          return parseInt(columnValue);
        }

        return columnValue;
      },
    },
    (error, result: any) => {
      if (error) {
        console.error(error);
      }

      const grouped = groupedByProvince(result);
      console.log(grouped);
    }
  );
})();
