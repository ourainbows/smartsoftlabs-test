import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

type provinceState = {
  name: string;
  population: number;
  deaths: number;
};

(() => {
  const csvFilePath = path.resolve(
    __dirname,
    "assets/time_series_covid19_deaths_US.csv"
  );

  const headers = ["Province_State", "Population", "deaths"];

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  parse(
    fileContent,
    {
      delimiter: ",",
      columns: true,
    },
    (error, result: any) => {
      if (error) {
        console.error(error);
      }

      console.log("Result", result);
    }
  );
})();
