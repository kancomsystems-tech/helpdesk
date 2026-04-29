const { chromium } = require("playwright");

const BASE_URL = process.env.BASE_URL || "http://178.104.193.7:8003";
const USER = process.env.USERNAME || "Administrator";
const PASS = process.env.PASSWORD || "admin";
const TICKET_URL = process.env.TICKET_URL || `${BASE_URL}/app/helpdesk/tickets`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const result = {
    baseUrl: BASE_URL,
    ticketUrl: TICKET_URL,
    apiLogin: false,
    finalUrl: "",
    bodySample: "",
    hasActivity: false,
    hasReply: false,
    hasEmails: false,
    hasComments: false,
    screenshot: "tools/kancom_probe/probe_tabs.png"
  };

  try {
    const loginResp = await page.request.post(`${BASE_URL}/api/method/login`, {
      form: {
        usr: USER,
        pwd: PASS
      }
    });

    result.apiLogin = loginResp.ok();

    await page.goto(TICKET_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    result.finalUrl = page.url();

    const bodyText = await page.locator("body").innerText();
    result.bodySample = bodyText.slice(0, 2000);

    result.hasActivity = bodyText.includes("Activity");
    result.hasReply = bodyText.includes("Reply");
    result.hasEmails = bodyText.includes("Emails");
    result.hasComments = bodyText.includes("Comments");

    await page.screenshot({ path: result.screenshot, fullPage: true });

    console.log(JSON.stringify(result, null, 2));

    if (!result.apiLogin || !result.hasActivity || !result.hasReply) {
      process.exit(2);
    }

    process.exit(0);
  } catch (e) {
    result.error = String(e);
    try {
      await page.screenshot({ path: result.screenshot, fullPage: true });
    } catch {}
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
