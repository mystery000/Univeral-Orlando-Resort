import { JSDOM, VirtualConsole } from "jsdom";
import { ZenRows } from "zenrows";

import dotenv from "dotenv";
dotenv.config();

type Price = {
  date: string;
  price: string;
};
const run = async () => {
  const client = new ZenRows(process.env.ZENROWS_API_KEY);
  const url =
    "https://www.universalorlando.com/web-store/en/us/uotickets/park-tickets";
  const { data } = await client.get(url, {
    js_render: true,
    window_width: 930,
    window_height: 1800,
    js_instructions:
      "%5B%7B%22wait_for%22%3A%22button%23dayIndex1%22%7D%2C%7B%22click%22%3A%22button%23dayIndex1%22%7D%2C%7B%22wait_for%22%3A%22%23one-park-per-day-1-park-1-day-ticket%22%7D%2C%7B%22click%22%3A%22%23one-park-per-day-1-park-1-day-ticket%20%23counter-numberAdults%5C%5C%20%5C%5C(10%5C%5C%2B%5C%5C)%20~%20.guest-number-increase-button%22%7D%2C%7B%22click%22%3A%22%23one-park-per-day-1-park-1-day-ticket%20.purchase-card-btn-select%22%7D%2C%7B%22wait_for%22%3A%22%23purchase-product-step-1%20gds-multi-day-calendar%22%7D%2C%7B%22scroll_y%22%3A1800%7D%2C%7B%22wait%22%3A1500%7D%5D",
  });
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(data, { virtualConsole });
  const priceList = dom.window.document.querySelectorAll("gds-calendar-day");
  const prices: Price[] = Array.from(priceList).map((price) => {
    return {
      date: price.getAttribute("data-date"),
      price:
        price.querySelector(".gds-eyebrow.label-13")?.textContent.trim() || "0",
    };
  });
  console.log(
    prices.filter((price) => price.price !== "0" && price.date !== "0-0-")
  );
};

run();

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
