import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { ProvinceState } from "./models/provinceState";

const groupedByProvince = (data: any[]): ProvinceState[] => {
  const dataGrouped: ProvinceState[] = [];

  data.forEach((item) => {
    const provinceName = item.Province_State;
    const poblation = item.Population;
    const accumulatedDeaths = item["4/27/21"];

    const province: ProvinceState | undefined = dataGrouped.find(
      (state) => state.province === provinceName
    );

    if (province) {
      province.accumulatedDeaths += accumulatedDeaths;
      province.population += poblation;
    } else {
      dataGrouped.push({
        province: provinceName,
        accumulatedDeaths,
        population: poblation,
      });
    }
  });

  return dataGrouped;
};

const stateWithMostDeaths = (data: ProvinceState[]): ProvinceState => {
  const mostDeaths = data.reduce((prev, current) =>
    prev.accumulatedDeaths > current.accumulatedDeaths ? prev : current
  );
  return mostDeaths;
};

const stateWithLeastDeaths = (data: ProvinceState[]): ProvinceState => {
  const leastDeaths = data.reduce((prev, current) =>
    prev.accumulatedDeaths < current.accumulatedDeaths ? prev : current
  );
  return leastDeaths;
};

(() => {
  const csvFilePath = path.resolve(
    __dirname,
    "assets/time_series_covid19_deaths_US.csv"
  );

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

      const mostDeaths = stateWithMostDeaths(grouped);
      const leastDeaths = stateWithLeastDeaths(grouped);
    }
  );
})();
