// null is due to the fact that we should know if the data is missing
export type Restaurant = {
  name: string;
  url: string;
  type: string;
  address: string;
  reviews: string[];
  rating: number; // can be NaN
};
