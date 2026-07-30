import fs from "fs/promises";
import path from "path";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import invoiceTemplate from "./template";

async function getExecutablePath() {
  if (process.env.VERCEL) {
    return await chromium.executablePath();
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

  const browser = await puppeteer.launch({
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

    defaultViewport: process.env.VERCEL
      ? chromium.defaultViewport
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