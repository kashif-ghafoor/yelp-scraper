import fs from "fs";
import puppeteer, { Browser, Page } from "puppeteer";
import { Restaurant } from "./types";

export async function scrapeRestaurants() {
  let browser: Browser | null = null;
  const restaurants: Restaurant[] = [];

  try {
    const urls: string[] = JSON.parse(
      fs.readFileSync("temp/headers.json", "utf-8")
    );

    browser = await puppeteer.launch();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const restaurant = await scrapePage(url, browser);
      restaurants.push(restaurant);
      console.log(`scraped ${i + 1} of ${urls.length}`);

      // save to file every 10 restaurants
      if (i % 10 === 0) {
        fs.writeFileSync("temp/restaurants.json", JSON.stringify(restaurants));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (browser) {
      await browser.close();
    }
    fs.writeFileSync("temp/restaurants.json", JSON.stringify(restaurants));
  }
}

async function scrapePage(url: string, browser: Browser) {
  const page = await browser.newPage();

  await page.goto(url);

  const { name, ...rest } = await extractData(page);

  await page.close();

  return {
    name,
    url,
    ...rest,
  };
}

async function extractData(page: Page) {
  return await page.evaluate(() => {
    const name = document.querySelector("h1")?.textContent ?? "";

    const type =
      document.querySelector(
        '[data-testid="photoHeader"] [class*=arrange-unit] button'
      )?.previousElementSibling?.textContent ?? "";

    const address =
      document.querySelector("#location-and-hours address")?.textContent ?? "";

    // for now only getting reviews from first page
    // also getting only text of reviews
    const reviews = Array.from(
      document.querySelectorAll('#reviews ul p[class*="comment"]')
    ).map((review) => review.textContent as string);

    const ratingStr =
      document
        .querySelector('[data-testid="review-summary"] [class*="five-stars"]')
        ?.getAttribute("aria-label") ?? "";

    const rating = parseInt(ratingStr); // either will be anumber or NaN

    return {
      name,
      type,
      address,
      reviews,
      rating,
    };
  });
}

// restaurant names,
// type of restaurant,
// address,
// reviews,
// ratings
// Miami city
