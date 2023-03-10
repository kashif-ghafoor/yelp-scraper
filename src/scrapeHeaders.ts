import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

export async function scrapeYelpHeaders(url: string) {
  // contain all urls
  const headers: string[] = [];

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // block images
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() === "image" ||
        req.resourceType() === "stylesheet"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const baseUrl = url;

    await page.goto(baseUrl);

    const heading = await page.evaluate(() => {
      return document.querySelector("h1")?.textContent;
    });

    console.log(heading);

    if (heading?.includes("find the page you")) {
      throw new Error("page unavailable");
    }

    // page to scrape
    const totalPages = await page.evaluate(() => {
      return (
        document
          .querySelector('#main-content ul li [class*="pagination"]')
          ?.lastChild?.textContent?.split("of")[1] || "0"
      );
    });

    console.log("total pages to scrape: ", totalPages);

    for (let i = 0; i < Number(totalPages); i++) {
      const pageUrl = `${baseUrl}&start=${i * 10}`;
      console.log(`page (${i + 1} of ${totalPages})`);
      await page.goto(pageUrl);
      const pageHeaders = await getHeaders(page);
      headers.push(...pageHeaders);
    }

    // totalPages technique worked
    if (headers.length > 0) {
      // remove duplicates
      const uniqueHeaders = [...new Set(headers)];
      fs.writeFileSync("temp/headers.json", JSON.stringify(uniqueHeaders));
      return;
    }

    // if total pages technique didn't work, use while loop
    let pageNum = 0;
    while (true) {
      const unavailable = await page.evaluate(() => {
        return document
          .querySelector("h3")
          ?.textContent?.includes("requested is unavailable");
      });
      if (unavailable) {
        break;
      }
      // otherwise scrape
      const pageUrl = `${baseUrl}&start=${pageNum * 10}`;
      console.log("pageUrl: ", pageUrl);
      await page.goto(pageUrl);
      const pageHeaders = await getHeaders(page);
      headers.push(...pageHeaders);
      pageNum++;
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("page unavailable")) {
      throw new Error("there is some problem with the url");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // if got any error save what we have
  const uniqueHeaders = [...new Set(headers)];
  fs.writeFileSync("temp/headers.json", JSON.stringify(uniqueHeaders));
}

async function getHeaders(page: Page) {
  return await page.evaluate(() => {
    const linkElements: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll("#main-content ul h3 a")
    );
    return linkElements.map((el) => el.href);
  });
}
