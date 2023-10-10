import dotenv from "dotenv";
import { ZenRows } from "zenrows";
import { JSDOM, VirtualConsole } from "jsdom";
import { Universal_Orlando_ONEPARK_DISCOUNT } from "./config";

dotenv.config();

type OrlandoPrice = {
  date: string;
  price: number;
  parksprice: number;
  ourprice: number;
};

// this function is used to scrape both universal orlando one park and park to park and it makes the calculations
const scrape_universal_orlando = async () => {
  const client = new ZenRows(process.env.ZENROWS_API_KEY);
  const url =
    "https://www.universalorlando.com/web-store/en/us/uotickets/park-tickets";
  const { data } = await client.get(url, {
    js_render: true,
    window_width: 930,
    window_height: 2160,
    js_instructions:
      "%5B%7B%22wait_for%22%3A%22button%23dayIndex1%22%7D%2C%7B%22click%22%3A%22button%23dayIndex1%22%7D%2C%7B%22wait_for%22%3A%22%23one-park-per-day-1-park-1-day-ticket%22%7D%2C%7B%22click%22%3A%22%23one-park-per-day-1-park-1-day-ticket%20%23counter-numberAdults%5C%5C%20%5C%5C(10%5C%5C%2B%5C%5C)%20~%20.guest-number-increase-button%22%7D%2C%7B%22click%22%3A%22%23one-park-per-day-1-park-1-day-ticket%20.purchase-card-btn-select%22%7D%2C%7B%22wait_for%22%3A%22%23purchase-product-step-1%20gds-multi-day-calendar%22%7D%2C%7B%22scroll_y%22%3A2200%7D%2C%7B%22wait%22%3A1500%7D%5D",
  });
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(data, { virtualConsole });
  const priceList = dom.window.document.querySelectorAll("gds-calendar-day");
  const prices: OrlandoPrice[] = Array.from(priceList)
    .map((price) => {
      const originalPrice = Number(
        (
          price.querySelector(".gds-eyebrow.label-13")?.textContent.trim() ||
          "$0"
        ).slice(1)
      );
      const PARKSPRICE = Math.round(originalPrice + originalPrice * 0.065);
      const OURPRICE =
        Math.round((PARKSPRICE - Universal_Orlando_ONEPARK_DISCOUNT) / 5) * 5;

      return {
        date: price.getAttribute("data-date"),
        price: originalPrice,
        parksprice: PARKSPRICE,
        ourprice: OURPRICE,
      };
    })
    .filter(({ price }) => price);
  console.log(prices);
};

scrape_universal_orlando();

// [
//   {"wait_for": "button#dayIndex1"},
//   {"click": "button#dayIndex1"},
//   {"wait_for":"#one-park-per-day-1-park-1-day-ticket"},
//   {"click":"#one-park-per-day-1-park-1-day-ticket #counter-numberAdults\\ \\(10\\+\\) ~ .guest-number-increase-button"},
//   {"click": "#one-park-per-day-1-park-1-day-ticket .purchase-card-btn-select"},
//   {"wait_for": "#purchase-product-step-1 gds-multi-day-calendar"},
//   {"scroll_y": 1800},
//   {"wait": 1500}
// ]
