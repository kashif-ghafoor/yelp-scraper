import { scrapeYelpHeaders } from "./scrapeHeaders";
import { scrapeRestaurants } from "./scrapeRestaurants";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Restaurant } from "./types";
import fs from "fs";

async function main() {
  //   await scrapeYelpHeaders();

  //   await scrapeRestaurants();

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
      client_email: "puppeteer-google@yelp-puppeteer.iam.gserviceaccount.com",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDkNOCGKODMqQMj\nkwiC+QYsI8v18sRdYP6wh5TkAi4ta+D4ZQriMb+0swagcvapHRd9rV4OEQ4VcPBT\nRSiTdjoX0pbHm0L4xIZ+Ls/K84XcJe0oabv9m+XrqOdmK5v9tPJhdumnmAVLM+68\nNipBO1QnxXBx794Fbg8UQY8Z8VWukNok6IGvDZijB12EJDc1hgTL5MlxDHngTFfo\ndzoNOruhZNyq8vU+M4geTFRxTYIXpEhr+57tqsjigoEtLlWHCPCQNVF7mmp2m0Uo\nmXsZVMRm06d+P+UtrvHeET87KbujFTOmaD62MwIYYFtvFb0OvNtlZaYvQe2fA8vR\n3yAowCGvAgMBAAECggEAWgTxvHpLku/oqRPK+783zBmizzYgd6VXUlNpTDf/9zLi\n35kcHfX55VHpf0laO4OaTJ0iyPG5WIPgiThytRih+du8VqjMVk1PsF7O4QQG/byI\nPLTYz0W8AKX0Ab2aHw5Nvlyl9tJk5DFsLxo+uNSqcbXUkV1Je2La1+a0iEtGvUDv\ni1y1E99tYdCX19riEEmu8BUaglLt9AFDU9XHXjX/ZR+2s9lQEW+02Cs33vOqneRS\nZU+wrxFVcq5i9xV69UIrwD3+VsYx6fLBtnUW4AgncnKc4UYsf/fvaL/4+nnWKI0Z\n/Gxm6kScoQzAo5qTuYKHUu0SVBL7IMFWrtfechXIYQKBgQD/9bGAAIyCkwIsQdOJ\n/rujNsltqvE43yEGcsU+9ioQS2y5JTbqdcHkP2BmCJ4fSk00ZJsx8dE7ClkOR18c\nfLjg3ioAZ5uiUqVa7i3Vj/7BBSO1KyvazOJTFcCkOK/xbbpanKni8PvxgDc1OkeI\nYEqMtvZwtKhAwFJoIASxq11oswKBgQDkPhDv2fOWJjjT2qDoXC9a3vCNzpu/De5x\nsQUrfmTxkr1wNjyoKo9xpXyB+YEQ88W++EO6bw46+tyrDNxQQ6gvCvOatKYCPz7N\nBgc4y7FHrugUquc5VZ/8X9RfBAhC1kxJKLwRUQsbyZ68IH5HftAYhR3+7KoU7Z8O\nNuDV7pbJFQKBgQDk1+Qkz1jQ/WK58viQriFQ4ZDh7i3RbRz3yPE1Q52ECAti1TTu\nFu6NhWRIlXfZ/fJc334p/0vT/4Jz07fjnlclJTxkND3fuQiB7eUoxZ89L70nIzwI\nWZoYMqCTsuMLddFhZiQ19MMsvjed7Uc7VOwSNxrK1ZqAmfKTidzohI/1JQKBgQCa\nMNvcTU9j1jp51K7ziqNrLkUwZ62L6mt1XvNxKJglIs7bqahcqzPwwK1WWSo6O5UR\nqEKJBlGEwsikvbFwf+R0s19S2kt0JSnV9AaY9fKzzJN4suQ2NYQ5SLv93ImALamn\nmt9Ci4+HnDOiQAlPX3pRtkxHVbapIMZdIfHOVLqE6QKBgQCH48MHMPLS+nZdK5Aj\nZA8ewPHrjf6JLwiiNDlpvPd8fxt4GIpjFsYpgHupahY+sEvTOqweEYKBK+3ApFJM\nfog6jI+i0FRpHfr1NeHpZYOUNfENJfdbyGgYycMB3qPCHbPxzw3ntCcLdjuoi0Gg\nbec1ZPDHjJDEoyj6FJdlgdui+w==\n-----END PRIVATE KEY-----\n",
    });

    const info = await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    sheet.setHeaderRow(["Name", "URL", "Type", "Address", "Reviews", "Rating"]);

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

    await sheet.addRows(rows);
  } catch (err) {
    console.error(err);
  }
}

main();
