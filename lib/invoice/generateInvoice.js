// lib/invoice/generateInvoice.js

import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import invoiceTemplate from "./template";
import Chromium from "@sparticuz/chromium";

async function getChromePath() {
  // Vercel / Linux
  if (process.env.VERCEL) {
    return await Chromium.executablePath();
  }

  // Windows local
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(
      process.env.LOCALAPPDATA || "",
      "Google\\Chrome\\Application\\chrome.exe",
    ),
  ];

  for (const chromePath of possiblePaths) {
    try {
      await fs.access(chromePath);
      return chromePath;
    } catch {}
  }

  throw new Error("Chrome not found.");
}

export default async function generateInvoice(order) {
  const executablePath = await getChromePath();

  // console.log("Launching browser...");
  // console.log("Executable:", executablePath);
  // console.log("Node:", process.execPath);
  // console.log("Platform:", process.platform, process.arch);

  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,

      args: process.env.VERCEL
        ? chromium.args
        : [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],

      defaultViewport: process.env.VERCEL ? chromium.defaultViewport : null,
    });

    // console.log("✅ Browser launched");
  } catch (err) {
    console.error("❌ Puppeteer launch failed");
    console.error(err);
    throw err;
  }

  try {
    const page = await browser.newPage();

    await page.setContent(invoiceTemplate(order), {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    // console.log("✅ PDF generated");

    return pdf;
  } finally {
    await browser.close();
    // console.log("Browser closed");
  }
}
