import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("pb.booted", "1");
    } catch {}
  });

  console.log("Navigating to http://127.0.0.1:8080/...");
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // 1. Click Kaziranga mission card
  console.log("Clicking Kaziranga mission card...");
  const kazirangaCard = page.locator("text=Kaziranga sub-canopy flood");
  await kazirangaCard.click();

  // Wait for 7-layer pipeline execution (~500ms + buffer)
  console.log("Waiting for analysis pipeline to complete...");
  await page.waitForTimeout(2000);

  // Capture analyzed mission state
  await page.screenshot({ path: "screenshots/kaziranga-analyzed.png", fullPage: false });
  console.log("Saved screenshots/kaziranga-analyzed.png");

  // 2. Click on the 128-D Manifold tab
  console.log("Clicking 128-D Manifold tab...");
  const manifoldTab = page.locator("button[role='tab']:has-text('128-D Manifold')");
  await manifoldTab.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/manifold-tab.png", fullPage: false });
  console.log("Saved screenshots/manifold-tab.png");

  // 3. Click on the Dharma Firewall tab
  console.log("Clicking Dharma Firewall tab...");
  const firewallTab = page.locator("button[role='tab']:has-text('Dharma Firewall')");
  await firewallTab.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/firewall-tab.png", fullPage: false });
  console.log("Saved screenshots/firewall-tab.png");

  // 4. Test Physics Violation Injection (Water on 21.8° Slope)
  console.log("Injecting physics violation: Water on 21.8° slope...");
  const slopeViolationBtn = page.locator("button:has-text('Water on 21.8° Slope')");
  await slopeViolationBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/firewall-violation-rejected.png", fullPage: false });
  console.log("Saved screenshots/firewall-violation-rejected.png");

  // 5. Open Kaal-Radar Agent Inspector Modal
  console.log("Opening Kaal-Radar modal...");
  const kaalBtn = page.locator("button:has-text('Kaal-Radar')");
  await kaalBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/agent-modal-kaal.png", fullPage: false });
  console.log("Saved screenshots/agent-modal-kaal.png");

  // Close Agent Modal
  const closeAgentModal = page.locator("button:has-text('Close')");
  await closeAgentModal.click();
  await page.waitForTimeout(400);

  // 6. Open LayerModal for Layer 1 (Prakriti-Veda)
  console.log("Opening Layer 1 Prakriti-Veda modal...");
  const layer1Btn = page.locator("button:has-text('Prakriti-Veda')");
  await layer1Btn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/layer-modal-prakriti.png", fullPage: false });
  console.log("Saved screenshots/layer-modal-prakriti.png");

  await browser.close();
  console.log("Interactive test completed! Console errors count:", consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error("Errors:", consoleErrors);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
