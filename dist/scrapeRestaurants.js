"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeRestaurants = void 0;
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
function scrapeRestaurants() {
    return __awaiter(this, void 0, void 0, function* () {
        let browser = null;
        const restaurants = [];
        try {
            const urls = JSON.parse(fs_1.default.readFileSync("temp/headers.json", "utf-8"));
            browser = yield puppeteer_1.default.launch({
                defaultViewport: null,
                args: ["--start-maximized"],
            });
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const restaurant = yield scrapePage(url, browser);
                if (!restaurant) {
                    console.log(`skipping ${url}`);
                    continue;
                }
                restaurants.push(restaurant);
                console.log(`scraped ${i + 1} of ${urls.length}`);
                // save to file every 10 restaurants
                if (i % 10 === 0) {
                    fs_1.default.writeFileSync("temp/restaurants.json", JSON.stringify(restaurants));
                }
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            if (browser) {
                yield browser.close();
            }
            fs_1.default.writeFileSync("temp/restaurants.json", JSON.stringify(restaurants));
        }
    });
}
exports.scrapeRestaurants = scrapeRestaurants;
function scrapePage(url, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        try {
            yield page.goto(url);
            const _a = yield extractData(page), { name } = _a, rest = __rest(_a, ["name"]);
            yield page.close();
            return Object.assign({ name,
                url }, rest);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            yield page.close();
        }
    });
}
function extractData(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const name = (_b = (_a = document.querySelector("h1")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
            const type = (_e = (_d = (_c = document.querySelector('[data-testid="photoHeader"] [class*=arrange-unit] button')) === null || _c === void 0 ? void 0 : _c.previousElementSibling) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : "";
            const address = (_g = (_f = document.querySelector("#location-and-hours address")) === null || _f === void 0 ? void 0 : _f.textContent) !== null && _g !== void 0 ? _g : "";
            // for now only getting reviews from first page
            // also getting only text of reviews
            const reviews = Array.from(document.querySelectorAll('#reviews ul p[class*="comment"]')).map((review) => review.textContent);
            const ratingStr = (_j = (_h = document
                .querySelector('[data-testid="review-summary"] [class*="five-stars"]')) === null || _h === void 0 ? void 0 : _h.getAttribute("aria-label")) !== null && _j !== void 0 ? _j : "";
            const rating = parseInt(ratingStr); // either will be anumber or NaN
            return {
                name,
                type,
                address,
                reviews,
                rating,
            };
        });
    });
}
// restaurant names,
// type of restaurant,
// address,
// reviews,
// ratings
// Miami city
