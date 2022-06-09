import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { ProvinceState, ProvinceStateDTO } from "./models/provinceState";

let data: any[] = [];

const groupedByProvince = (data: any[]): ProvinceState[] => {
  const dataGrouped: ProvinceState[] = [];

  data.forEach((item) => {
    const provinceName = item.Province_State;
    const population = item.Population;
    const accumulatedDeaths = item["4/27/21"];

    const province: ProvinceState | undefined = dataGrouped.find(
      (state) => state.province === provinceName
    );

    if (province) {
      province.accumulatedDeaths += accumulatedDeaths;
      province.population += population;
    } else {
      dataGrouped.push({
        province: provinceName,
        accumulatedDeaths,
        population,
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

const percentageVsPopulation = (data: ProvinceState[]): ProvinceStateDTO[] => {
  const percentageData: ProvinceStateDTO[] = [];
  data.forEach((item) => {
    const deathsPercentage = item.population
      ? (item.accumulatedDeaths / item.population) * 100
      : 0;

    percentageData.push({
      ...item,
      deathsPercentage,
    });
  });
  return percentageData;
};

const mostAffectedState = (data: ProvinceStateDTO[]): ProvinceState => {
  const mostAffected = data.reduce((prev, current) =>
    prev.deathsPercentage > current.deathsPercentage ? prev : current
  );
  return mostAffected;
};

const init = (): void => {
  (() => {
    const csvFilePath = path.resolve(
      __dirname,
      "assets/time_series_covid19_deaths_US.csv"
    );

    const fileContent = fs.readFileSync(csvFilePath, {
      encoding: "utf-8",
    });

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
      (error, response: any) => {
        if (error) {
          console.error(error);
        }

        const data = groupedByProvince(response);
        const mostDeaths = stateWithMostDeaths(data);
        const leastDeaths = stateWithLeastDeaths(data);
        const percentageData = percentageVsPopulation(data);
        const mostAffected = mostAffectedState(percentageData);

        console.log(
          `1. El estado con más muertes hasta la fecha es ${mostDeaths.province}\n`
        );
        console.log(
          `2. El estado con menos muertes hasta la fecha es ${leastDeaths.province}\n`
        );
        console.log(`3. Porcentaje de muertes por cada habitante\n`);
        percentageData.forEach((item) => {
          console.log(
            `${item.province} tiene un ${item.deathsPercentage}% de muertes`
          );
        });
        console.log(
          `\n4. El estado con más muertes es ${mostAffected.province}\n`
        );
      }
    );
  })();
};

init();
