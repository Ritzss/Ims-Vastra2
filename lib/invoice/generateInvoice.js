import fs from "fs/promises";
import path from "path";

// import puppeteer from "puppeteer-core";
// import chromium from "@sparticuz/chromium";

import invoiceTemplate from "./template";
import { Puppeteer } from "puppeteer-core";
import Chromium from "@sparticuz/chromium";

async function getExecutablePath() {
  if (process.env.VERCEL) {
    return await Chromium.executablePath();
  }

  if (process.env.VERCEL) {
  Chromium.setGraphicsMode = false;
}

  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(
      process.env.LOCALAPPDATA || "",
      "Google\\Chrome\\Application\\chrome.exe"
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
  const executablePath = await getExecutablePath();

  const browser = await Puppeteer.launch({
    executablePath,

    headless: true,

    args: process.env.VERCEL
      ? Chromium.args
      : [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],

    defaultViewport: process.env.VERCEL
      ? Chromium.defaultViewport
      : null,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(invoiceTemplate(order), {
      waitUntil: "networkidle0",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}