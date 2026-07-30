// lib/invoice/generateInvoice.js

import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import invoiceTemplate from "./template";

async function getChromePath() {
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
      console.log("✅ Using system Chrome:", chromePath);
      return chromePath;
    } catch {}
  }

  const chromePath = await puppeteer.executablePath();
  console.log("⚠ Using Puppeteer Chrome:", chromePath);
  return chromePath;
}

export default async function generateInvoice(order) {
  const executablePath = await getChromePath();

  console.log("Launching browser...");
  console.log("Executable:", executablePath);
  console.log("Node:", process.execPath);
  console.log("Platform:", process.platform, process.arch);

  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    console.log("✅ Browser launched");
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

    console.log("✅ PDF generated");

    return pdf;
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}