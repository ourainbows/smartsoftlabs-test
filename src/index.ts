import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

import { ProvinceState, ProvinceStateDTO } from "./models/provinceState";

/* 
    Function to group data by province
    @param data: any -> response from csv-parse
    @returns: ProvinceState[] -> array of ProvinceState 
*/
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

/* 
    Fucntion to get the state with most deaths
    @param data: ProvinceState[] -> array of ProvinceState
    @returns: ProvinceState -> ProvinceState with most deaths
 */
const stateWithMostDeaths = (data: ProvinceState[]): ProvinceState => {
  const mostDeaths = data.reduce((prev, current) =>
    prev.accumulatedDeaths > current.accumulatedDeaths ? prev : current
  );
  return mostDeaths;
};

/* 
    Function to get the state with least deaths
    @param data: ProvinceState[] -> array of ProvinceState
    @returns: ProvinceState -> ProvinceState with least deaths
 */
const stateWithLeastDeaths = (data: ProvinceState[]): ProvinceState => {
  const leastDeaths = data.reduce((prev, current) =>
    prev.accumulatedDeaths < current.accumulatedDeaths ? prev : current
  );
  return leastDeaths;
};

/* 
    Function to get the percentage of deaths per person
    @param data: ProvinceState[] -> array of ProvinceState
    @returns: ProvinceStateDTO[] -> array of ProvinceStateDTO
 */
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

/* 
    Function to get the state with more percentage of deaths
    @param data: ProvinceStateDTO[] -> array of ProvinceStateDTO
    @returns: ProvinceStateDTO -> ProvinceStateDTO with more deaths
 */
const mostAffectedState = (data: ProvinceStateDTO[]): ProvinceState => {
  const mostAffected = data.reduce((prev, current) =>
    prev.deathsPercentage > current.deathsPercentage ? prev : current
  );
  return mostAffected;
};

/* 
    Initialize the program
*/
const init = (): void => {
    
  // Read the file and parse it
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

        // Call the functions

        const data = groupedByProvince(response);
        const mostDeaths = stateWithMostDeaths(data);
        const leastDeaths = stateWithLeastDeaths(data);
        const percentageData = percentageVsPopulation(data);
        const mostAffected = mostAffectedState(percentageData);

        // Print the results

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
