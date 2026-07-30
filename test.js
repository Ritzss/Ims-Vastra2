const puppeteer = require("puppeteer");

(async () => {
  try {
    console.log("Launching...");

    const browser = await puppeteer.launch({
      headless: true,
    });

    console.log("Browser launched!");

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();