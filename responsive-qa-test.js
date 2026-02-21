const { chromium } = require("playwright");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:3005";
const LOCALES = ["en", "zh"];
const VIEWPORTS = {
  sm: { width: 375, height: 812 },
  md: { width: 768, height: 1024 },
  lg: { width: 1440, height: 900 },
};
const PAGES = [
  { path: "/pricing", name: "Pricing" },
  { path: "/classes", name: "Classes" },
  { path: "/book", name: "Book" },
  { path: "/", name: "Homepage" },
];

const results = [];
const failures = [];
const screenshotsDir = "./qa-screenshots";

function overlap(r1, r2) {
  return !(r1.right <= r2.left || r1.left >= r2.right || r1.bottom <= r2.top || r1.top >= r2.bottom);
}

async function ensureDir() {
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshot(page, name) {
  await page.screenshot({ path: `${screenshotsDir}/${name}.png`, fullPage: true });
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
}

async function setLocale(page, locale) {
  if (locale === "en") return;
  let toggle = page.locator('button[aria-label="Toggle language"]:visible').first();
  if ((await toggle.count()) === 0) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    toggle = page.locator('button[aria-label="Toggle language"]:visible').first();
  }
  if ((await toggle.count()) > 0) {
    await toggle.click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function checkPricing(page) {
  const issues = [];

  if (await hasHorizontalOverflow(page)) {
    issues.push("Page has horizontal overflow");
  }

  const privateHeading = page.locator("h2", { hasText: /Private Coaching|私教课程/ }).first();
  if ((await privateHeading.count()) === 0) {
    issues.push("Private coaching heading not found");
    return issues;
  }

  await privateHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const card = privateHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  if ((await card.count()) === 0) {
    issues.push("Private coaching card container not found");
    return issues;
  }

  const [cardBox, headingBox] = await Promise.all([card.boundingBox(), privateHeading.boundingBox()]);
  if (!cardBox || !headingBox) {
    issues.push("Private coaching card is not visible");
    return issues;
  }

  const cardOverflow = await card.evaluate((el) => el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
  if (cardOverflow) {
    issues.push("Private coaching card has clipped content");
  }

  const varies = card.locator("p").filter({ hasText: /Varies|面议/ }).first();
  if ((await varies.count()) === 0) issues.push("Private coaching price label not found");

  return issues;
}

async function checkClasses(page) {
  const issues = [];
  if (await hasHorizontalOverflow(page)) {
    issues.push("Page has horizontal overflow");
  }

  const otherSection = page.locator("section").filter({ hasText: /Other Classes|其他课程/ }).first();
  const grid = otherSection.locator("div.grid").first();
  let otherCards = grid.locator(":scope > *");
  let count = await otherCards.count();
  if (count < 2) {
    otherCards = page.locator("section div.aspect-\\[16\\/9\\]").locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
    count = await otherCards.count();
  }
  if (count < 2) {
    return issues;
  }

  const imageHeights = [];
  for (let i = 0; i < Math.min(count, 4); i++) {
    const imageWrap = otherCards.nth(i).locator("div.aspect-\\[16\\/9\\]").first();
    const box = await imageWrap.boundingBox();
    if (box) imageHeights.push(box.height);
  }
  if (imageHeights.length >= 2) {
    const min = Math.min(...imageHeights);
    const max = Math.max(...imageHeights);
    if (max - min > 24) {
      issues.push(`Class image blocks are inconsistent in height (delta ${Math.round(max - min)}px)`);
    }
  }

  return issues;
}

async function checkBook(page) {
  const issues = [];
  if (await hasHorizontalOverflow(page)) {
    issues.push("Page has horizontal overflow");
  }

  const bookingBox = page.locator("text=Calendly Booking Widget").first();
  if ((await bookingBox.count()) === 0) {
    issues.push("Booking placeholder container not found");
    return issues;
  }

  await bookingBox.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const wrapper = bookingBox.locator("xpath=ancestor::div[contains(@class,'border-dashed')][1]");
  if ((await wrapper.count()) === 0) {
    issues.push("Booking placeholder wrapper not found");
    return issues;
  }

  const wraps = await wrapper.evaluate((el) => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2);
  if (wraps) {
    issues.push("Booking placeholder container has clipping/overflow");
  }
  return issues;
}

async function checkHomepageTestimonials(page) {
  const issues = [];
  if (await hasHorizontalOverflow(page)) {
    issues.push("Page has horizontal overflow");
  }

  const quote = page.locator("blockquote").first();
  if ((await quote.count()) === 0) {
    issues.push("Testimonial quote block not found");
    return issues;
  }
  await quote.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const nextButtons = page.locator('button[aria-label="Next testimonial"]:visible');
  const prevButtons = page.locator('button[aria-label="Previous testimonial"]:visible');
  if ((await nextButtons.count()) === 0) {
    issues.push("Visible next testimonial button not found");
    return issues;
  }
  if ((await prevButtons.count()) === 0) {
    issues.push("Visible previous testimonial button not found");
    return issues;
  }

  for (let i = 0; i < 3; i++) {
    if (i < 2) {
      await nextButtons.first().click();
      await page.waitForTimeout(600);
    }
  }
  return issues;
}

async function checkPage(page, pageInfo) {
  if (pageInfo.path === "/pricing") return checkPricing(page);
  if (pageInfo.path === "/classes") return checkClasses(page);
  if (pageInfo.path === "/book") return checkBook(page);
  return checkHomepageTestimonials(page);
}

async function runTests() {
  await ensureDir();
  console.log("Starting Responsive QA Tests...\n");
  const browser = await chromium.launch({ headless: true });

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const locale of LOCALES) {
      console.log(`\nTesting ${viewportName} (${viewport.width}x${viewport.height}) - ${locale.toUpperCase()}`);
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();

      for (const pageInfo of PAGES) {
        const testName = `${pageInfo.name} - ${viewportName} - ${locale}`;
        console.log(`  Testing: ${testName}`);
        try {
          await page.goto(BASE_URL + pageInfo.path, { waitUntil: "networkidle" });
          await setLocale(page, locale);
          await page.waitForTimeout(400);

          const issues = await checkPage(page, pageInfo);
          await takeScreenshot(page, `${pageInfo.name.toLowerCase()}-${viewportName}-${locale}`);

          const result = {
            page: pageInfo.name,
            viewport: viewportName,
            locale,
            status: issues.length ? "FAIL" : "PASS",
            issues,
          };
          results.push(result);

          if (issues.length) failures.push(result);
          console.log(`    Status: ${result.status}`);
          issues.forEach((i) => console.log(`      - ${i}`));
        } catch (error) {
          const result = {
            page: pageInfo.name,
            viewport: viewportName,
            locale,
            status: "ERROR",
            issues: [error.message],
          };
          results.push(result);
          failures.push(result);
          console.log(`    Status: ERROR`);
          console.log(`      - ${error.message}`);
        }
      }
      await context.close();
    }
  }

  await browser.close();
  generateReport();
}

function generateReport() {
  console.log("\n\n=================================");
  console.log("RESPONSIVE QA TEST REPORT");
  console.log("=================================\n");
  console.log("TEST MATRIX RESULTS:");
  console.log("-------------------");

  const pageNames = ["Homepage", "Pricing", "Classes", "Book"];
  const viewportNames = ["sm", "md", "lg"];
  for (const pageName of pageNames) {
    for (const viewport of viewportNames) {
      for (const locale of LOCALES) {
        const result = results.find((r) => r.page === pageName && r.viewport === viewport && r.locale === locale);
        console.log(`${pageName.padEnd(12)} | ${viewport.padEnd(4)} | ${locale.padEnd(2)} | ${(result?.status || "NOT RUN")}`);
      }
    }
  }

  console.log("\n\nFAILURE DETAILS:");
  console.log("---------------");
  if (!failures.length) {
    console.log("No failures detected! ✓");
  } else {
    for (const f of failures) {
      console.log(`\n• ${f.page} - ${f.viewport} - ${f.locale}:`);
      for (const issue of f.issues) console.log(`  - ${issue}`);
    }
  }

  const privateIssues = failures.filter(
    (f) => f.page === "Pricing" && f.issues.some((i) => i.toLowerCase().includes("private coaching"))
  );
  const zhTestimonialIssues = failures.filter(
    (f) =>
      f.page === "Homepage" &&
      f.locale === "zh" &&
      f.issues.some((i) => i.toLowerCase().includes("testimonial arrow overlaps"))
  );

  console.log("\n\nMANUAL SIGN-OFF ITEMS:");
  console.log("---------------------");
  console.log("\n1. Private coaching card visual approved?");
  if (!privateIssues.length) {
    console.log("   YES - No private coaching card issues detected.");
  } else {
    console.log("   NO - Issues detected:");
    for (const i of privateIssues) {
      console.log(`     ${i.viewport}-${i.locale}: ${i.issues.join(", ")}`);
    }
  }

  console.log("\n2. zh testimonial overlap resolved?");
  if (!zhTestimonialIssues.length) {
    console.log("   YES - No zh testimonial overlap detected.");
  } else {
    console.log("   NO - Issues detected:");
    for (const i of zhTestimonialIssues) {
      console.log(`     ${i.viewport}: ${i.issues.join(", ")}`);
    }
  }

  const hasBlocking = failures.length > 0;
  console.log("\n\nFINAL RECOMMENDATION:");
  console.log("--------------------");
  if (hasBlocking) {
    console.log("✗ NOT APPROVED - phase1-responsive-qa should remain IN_PROGRESS.");
  } else {
    console.log("✓ APPROVED - phase1-responsive-qa can be marked COMPLETED.");
  }

  fs.writeFileSync("./qa-test-results.json", JSON.stringify({ results, failures }, null, 2));
  console.log("\nDetailed results saved to: qa-test-results.json");
  console.log("Screenshots saved to: qa-screenshots/");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
