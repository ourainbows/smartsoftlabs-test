export interface ProvinceState {
  province: string;
  population: number;
  accumulatedDeaths: number;
}

export interface ProvinceStateDTO extends ProvinceState {
  deathsPercentage: number;
}