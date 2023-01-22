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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeYelpHeaders = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
function scrapeYelpHeaders(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // contain all urls
        const headers = [];
        let browser = null;
        try {
            browser = yield puppeteer_1.default.launch({
                defaultViewport: null,
                args: ["--start-maximized"],
            });
            const page = yield browser.newPage();
            // block images
            yield page.setRequestInterception(true);
            page.on("request", (req) => {
                if (req.resourceType() === "image" ||
                    req.resourceType() === "stylesheet") {
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
            const baseUrl = url;
            yield page.goto(baseUrl);
            const heading = yield page.evaluate(() => {
                var _a;
                return (_a = document.querySelector("h1")) === null || _a === void 0 ? void 0 : _a.textContent;
            });
            console.log(heading);
            if (heading === null || heading === void 0 ? void 0 : heading.includes("find the page you")) {
                throw new Error("page unavailable");
            }
            // page to scrape
            const totalPages = yield page.evaluate(() => {
                var _a, _b, _c;
                return (((_c = (_b = (_a = document
                    .querySelector('#main-content ul li [class*="pagination"]')) === null || _a === void 0 ? void 0 : _a.lastChild) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.split("of")[1]) || "0");
            });
            console.log("total pages to scrape: ", totalPages);
            for (let i = 0; i < Number(totalPages); i++) {
                const pageUrl = `${baseUrl}&start=${i * 10}`;
                console.log(`page (${i + 1} of ${totalPages})`);
                yield page.goto(pageUrl);
                const pageHeaders = yield getHeaders(page);
                headers.push(...pageHeaders);
            }
            // totalPages technique worked
            if (headers.length > 0) {
                // remove duplicates
                const uniqueHeaders = [...new Set(headers)];
                fs_1.default.writeFileSync("temp/headers.json", JSON.stringify(uniqueHeaders));
                return;
            }
            // if total pages technique didn't work, use while loop
            let pageNum = 0;
            while (true) {
                const unavailable = yield page.evaluate(() => {
                    var _a, _b;
                    return (_b = (_a = document
                        .querySelector("h3")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.includes("requested is unavailable");
                });
                if (unavailable) {
                    break;
                }
                // otherwise scrape
                const pageUrl = `${baseUrl}&start=${pageNum * 10}`;
                console.log("pageUrl: ", pageUrl);
                yield page.goto(pageUrl);
                const pageHeaders = yield getHeaders(page);
                headers.push(...pageHeaders);
                pageNum++;
            }
        }
        catch (err) {
            if (err instanceof Error && err.message.includes("page unavailable")) {
                throw new Error("there is some problem with the url");
            }
        }
        finally {
            if (browser) {
                yield browser.close();
            }
        }
        // if got any error save what we have
        const uniqueHeaders = [...new Set(headers)];
        fs_1.default.writeFileSync("temp/headers.json", JSON.stringify(uniqueHeaders));
    });
}
exports.scrapeYelpHeaders = scrapeYelpHeaders;
function getHeaders(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            const linkElements = Array.from(document.querySelectorAll("#main-content ul h3 a"));
            return linkElements.map((el) => el.href);
        });
    });
}
