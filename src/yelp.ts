import * as dotenv from "dotenv";
dotenv.config();
import { scrapeYelpHeaders } from "./scrapeHeaders";
import { scrapeRestaurants } from "./scrapeRestaurants";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Restaurant } from "./types";
import fs from "fs";

async function main() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY;

  if (!client_email || !private_key) {
    console.error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env file"
    );
    return;
  }
  console.log("scraping search Results (headers) ...");
  await scrapeYelpHeaders();

  console.log("scraping restaurants ...");
  await scrapeRestaurants();

  try {
    // read restaurants data from temp/restaurants.json
    const restaurants: Restaurant[] = JSON.parse(
      fs.readFileSync("temp/restaurants.json", "utf-8")
    );

    console.log("total restaurants: ", restaurants.length);

    const doc = new GoogleSpreadsheet(
      "1Al_1bz4uxM5n7weYe0phYw9DATtsTbyOBKdjPS5o-Sw"
    );

    await doc.useServiceAccountAuth({
      client_email,
      private_key,
    });

    const info = await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    // sheet.setHeaderRow(["Name", "URL", "Type", "Address", "Reviews", "Rating"]);
    console.log("formatting data for sheets");

    const rows = restaurants.map((el) => {
      return {
        Name: el.name,
        URL: el.url,
        Type: el.type,
        Address: el.address,
        Reviews: el.reviews.join(","),
        Rating: el.rating,
      };
    });

    console.log("pushing data to google sheets ...");
    await sheet.addRows(rows);
  } catch (err) {
    console.error(err);
  }
}

main();
