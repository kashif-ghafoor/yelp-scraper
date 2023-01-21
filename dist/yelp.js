"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const scrapeHeaders_1 = require("./scrapeHeaders");
const scrapeRestaurants_1 = require("./scrapeRestaurants");
const google_spreadsheet_1 = require("google-spreadsheet");
const fs_1 = __importDefault(require("fs"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const private_key = process.env.GOOGLE_PRIVATE_KEY;
        const sheet_id = process.env.GOOGLE_SHEET_ID;
        console.log("client_email: ", client_email);
        console.log("private_key: ", private_key);
        console.log("sheet_id: ", sheet_id);
        if (!client_email || !private_key || !sheet_id) {
            console.error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY or GOOGLE_SHEET_ID in .env file");
            return;
        }
        console.log("scraping search Results (headers) ...");
        yield (0, scrapeHeaders_1.scrapeYelpHeaders)();
        console.log("scraping restaurants ...");
        yield (0, scrapeRestaurants_1.scrapeRestaurants)();
        try {
            // read restaurants data from temp/restaurants.json
            const restaurants = JSON.parse(fs_1.default.readFileSync("temp/restaurants.json", "utf-8"));
            console.log("total restaurants: ", restaurants.length);
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(sheet_id);
            yield doc.useServiceAccountAuth({
                client_email,
                private_key,
            });
            const info = yield doc.loadInfo();
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
            yield sheet.addRows(rows);
        }
        catch (err) {
            console.error(err);
        }
    });
}
main();
