const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// EDIT YOUR BUSINESS INFO
// =====================
const BRAND = {
  name: "GERMATEK",
  slogan: "Imagine your home reinvented",
  whatsappNumber: "23057667195",
  email: "info@germatek.mu",
  coverage: "Mauritius"
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Nav builder (adds active highlight + aria-current)
function navLink(href, label, activePath) {
  const isActive = activePath === href;
  return `<a href="${href}" class="${isActive ? "active" : ""}" ${isActive ? 'aria-current="page"' : ""}>${label}</a>`;
}

// =====================
// PAGE TEMPLATE (now supports active nav highlight)
// =====================
const page = ({ title, heroImage, heading, sub, bodyHtml, activePath }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | ${escapeHtml(BRAND.name)}</title>
  <meta name="description" content="${escapeHtml(BRAND.name)} — Automatic garage doors, gate automation, WPC flush doors and modern home solutions." />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="header">
    <div class="container nav">
      <<a class="brand" href="/" aria-label="${escapeHtml(BRAND.name)} home">
  <img class="brand-logo" src="/images/logo.jpg" alt="${escapeHtml(BRAND.name)} logo" />
  <div class="brandtxt">
    <div class="brand-name">${escapeHtml(BRAND.name)}</div>
    <div class="brand-tag">${escapeHtml(BRAND.slogan)}</div>
  </div>
</a>


      <nav class="menu" aria-label="Primary">
        ${navLink("/", "Home", activePath)}
        ${navLink("/about", "About", activePath)}
        ${navLink("/product", "Product", activePath)}
        ${navLink("/services", "Services", activePath)}
        ${navLink("/offers", "Offers", activePath)}
        ${navLink("/plan", "Plan", activePath)}
        ${navLink("/help", "Help", activePath)}
        ${navLink("/quotation", "Quotation", activePath)}
        <a class="btn small ${activePath === "/contact" ? "activeBtn" : ""}" href="/contact" ${activePath === "/contact" ? 'aria-current="page"' : ""}>Contact</a>
      </nav>

      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">☰</button>
    </div>

    <div class="mobile-menu" id="mobileMenu" aria-label="Mobile menu">
      ${navLink("/", "Home", activePath)}
      ${navLink("/about", "About", activePath)}
      ${navLink("/product", "Product", activePath)}
      ${navLink("/services", "Services", activePath)}
      ${navLink("/offers", "Offers", activePath)}
      ${navLink("/plan", "Plan", activePath)}
      ${navLink("/help", "Help", activePath)}
      ${navLink("/quotation", "Quotation", activePath)}
      ${navLink("/contact", "Contact", activePath)}
    </div>
  </header>

  <main>
    <section class="hero" style="background-image:url('${heroImage}')">
      <div class="hero-overlay"></div>
      <div class="container hero-inner">
        <p class="pill">Premium • Modern • Reliable</p>
        <h1>${escapeHtml(heading)}</h1>
        <p class="sub">${escapeHtml(sub)}</p>
        <div class="hero-cta">
          <a class="btn" href="/quotation">Get a quotation</a>
          <a class="btn ghost" href="/product">Explore products</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${bodyHtml}
      </div>
    </section>

    <section class="band">
      <div class="container bandIn">
        <div>
          <h2 class="h2">Ready to upgrade your home?</h2>
          <p class="muted">Send dimensions + photos. We’ll confirm the best option and finalize the quote.</p>
        </div>
        <div class="bandBtns">
          <a class="btn small" href="/quotation">Start quotation</a>
          <a class="btn ghost small" id="bandWhats" href="#">WhatsApp Germatek</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container foot">
      <div>
        <div class="brand-name">${escapeHtml(BRAND.name)}</div>
        <div class="muted">${escapeHtml(BRAND.slogan)}</div>
        <div class="muted small">Coverage: ${escapeHtml(BRAND.coverage)} • Email: ${escapeHtml(BRAND.email)}</div>
      </div>
      <div class="muted">© <span id="year"></span> ${escapeHtml(BRAND.name)}</div>
    </div>
  </footer>

  <script>
    window.__BRAND__ = ${JSON.stringify({ whatsappNumber: BRAND.whatsappNumber })};
  </script>
  <script src="/app.js"></script>
</body>
</html>`;

// =====================
// PRICING ESTIMATOR (MUR)
// =====================
function estimateQuote({ product, width_m, height_m, qty }) {
  const w = Number(width_m);
  const h = Number(height_m);
  const q = Number(qty);

  if (!product || !isFinite(w) || !isFinite(h) || !isFinite(q) || w <= 0 || h <= 0 || q <= 0) {
    return { error: "Invalid input. Please check dimensions and quantity." };
  }

  const area = w * h;

  const rules = {
    garage: { base: 65000, per_m2: 13500, label: "Automatic Garage Door" },
    sliding_gate: { base: 42000, per_m2: 4500, label: "Sliding Gate Opener" },
    swing_gate: { base: 45000, per_m2: 4200, label: "Swing Gate Opener" },
    wpc_doors: { base: 16000, per_m2: 0, label: "WPC Flush Door (per door)" },
    inox: { base: 15000, per_m2: 22000, label: "Stainless Steel / Inox Works" },
    other: { base: 0, per_m2: 0, label: "Other" }
  };

  const r = rules[product] || rules.other;

  let unit;
  if (product === "wpc_doors") unit = r.base;
  else unit = r.base + (r.per_m2 * area);

  const subtotal = unit * q;
  const MIN_JOB = 18000;
  const finalSubtotal = Math.max(subtotal, MIN_JOB);

  const low = Math.round(finalSubtotal * 0.90);
  const high = Math.round(finalSubtotal * 1.10);

  return {
    productLabel: r.label,
    area: Number(area.toFixed(2)),
    qty: q,
    unit_estimate: Math.round(unit),
    low,
    high,
    currency: "MUR"
  };
}

// =====================
// ROUTES
// =====================
app.get("/api/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get("/", (req, res) => res.send(page({
  title: "Home",
  activePath: req.path,
  heroImage: "/images/hero-home.jpg",
  heading: "Imagine your home reinvented.",
  sub: "Smart automation and modern finishes designed to enhance comfort, security, and everyday living.",
  bodyHtml: `
    <div class="grid3">
      <div class="card hoverCard">
        <img class="img hoverImg" src="/images/home-garage.jpg" alt="Automatic garage door">
        <h3>Automatic Garage Doors</h3>
        <p class="muted">Smooth, secure garage door systems installed with precision and care.</p>
      </div>
      <div class="card hoverCard">
        <img class="img hoverImg" src="/images/home-gate.jpg" alt="Gate opener">
        <h3>Sliding & Swing Gate Openers</h3>
        <p class="muted">Reliable gate automation built for durability, convenience, and daily use.</p>
      </div>
      <div class="card hoverCard">
        <img class="img hoverImg" src="/images/home-wpc.jpg" alt="WPC flush door">
        <h3>WPC Flush Doors</h3>
        <p class="muted">Modern interior doors combining clean design, long-lasting durability, and low maintenance.</p>
      </div>
    </div>

    <div class="card spacer">
      <h2 class="h2">Designed for real homes. Built to last.</h2>
      <p class="muted">
        At Germatek, we focus on solutions that combine modern design, reliable performance, and clean professional installation.
        From your first message to final handover, we keep things simple, clear, and well-finished.
      </p>
      <ul class="checklist">
        <li>Clean and professional installation</li>
        <li>Clear and transparent quotations</li>
        <li>Dependable after-sales support</li>
      </ul>
      <a class="btn small" href="/quotation">Start a quotation</a>
    </div>
  `
})));

app.get("/about", (req, res) => res.send(page({
  title: "About",
  activePath: req.path,
  heroImage: "/images/about.png",
  heading: "Built on trust. Driven by quality.",
  sub: "Germatek delivers modern automation and finishing solutions with a strong focus on reliability and clean workmanship.",
  bodyHtml: `
    <div class="split">
      <div>
        <h2 class="h2">The Germatek story</h2>
        <p class="muted">
          Germatek was created with one clear goal: to bring reliable automation and modern finishing solutions to homes and businesses.
          We believe good automation should make everyday life easier — not complicated.
        </p>
        <p class="muted">
          What started as a passion for smart home improvement grew into a brand focused on quality parts, neat installation,
          and practical solutions that last.
        </p>
        <ul class="checklist">
          <li>Clear advice and guidance</li>
          <li>Neat installation and finishing</li>
          <li>Reliable products and support</li>
        </ul>
      </div>

      <div class="card">
        <h3>Our promise</h3>
        <p class="muted">
          Honest advice, quality products, clean installation, and dependable after-sales support — every project, every time.
        </p>
        <div class="offer">
          <div>
            <h3>Fast quotation</h3>
            <p class="muted">Use the quotation page and send photos via WhatsApp.</p>
          </div>
          <a class="btn small" href="/quotation">Quotation</a>
        </div>
      </div>
    </div>
  `
})));

app.get("/product", (req, res) => res.send(page({
  title: "Product",
  activePath: req.path,
  heroImage: "/images/hero-products.jpg",
  heading: "Products built for modern living.",
  sub: "Explore our core solutions. Replace images anytime inside /public/images.",
  bodyHtml: `
    <div class="card">
      <h2 class="h2">Automatic Garage Doors</h2>
      <div class="grid2">
        <img class="img hoverImg" src="/images/garage-1.jpg" alt="Garage door 1">
        <img class="img hoverImg" src="/images/garage-2.jpg" alt="Garage door 2">
      </div>
      <p class="muted">Modern automatic garage doors designed for safety, smooth operation, and a clean architectural finish.</p>
    </div>

    <div class="card spacer">
      <h2 class="h2">Sliding & Swing Gate Openers</h2>
      <div class="grid2">
        <img class="img hoverImg" src="/images/gate-1.jpg" alt="Gate opener 1">
        <img class="img hoverImg" src="/images/gate-2.jpg" alt="Gate opener 2">
      </div>
      <p class="muted">Strong and reliable gate automation systems suitable for residential and light commercial use.</p>
    </div>

    <div class="card spacer">
      <h2 class="h2">WPC Flush Doors</h2>
      <div class="grid2">
        <img class="img hoverImg" src="/images/wpc-1.jpg" alt="WPC flush door 1">
        <img class="img hoverImg" src="/images/wpc-2.jpg" alt="WPC flush door 2">
      </div>
      <p class="muted">Elegant interior doors offering modern design, durability, and low maintenance.</p>
    </div>
  `
})));

app.get("/services", (req, res) => res.send(page({
  title: "Services",
  activePath: req.path,
  heroImage: "/images/hero-services.jpg",
  heading: "Professional services you can rely on.",
  sub: "From consultation to installation and after-sales support — we handle it all.",
  bodyHtml: `
    <div class="grid3">
      <div class="card hoverCard"><h3>Consultation</h3><p class="muted">We assess your needs and recommend the most suitable solution for your space and budget.</p></div>
      <div class="card hoverCard"><h3>Installation</h3><p class="muted">Clean installation, proper alignment, testing, and professional finishing — no shortcuts.</p></div>
      <div class="card hoverCard"><h3>After-sales</h3><p class="muted">Support, adjustments, and guidance after installation when you need it.</p></div>
    </div>

    <div class="card spacer">
      <h2 class="h2">For a faster quotation</h2>
      <p class="muted">Share: dimensions (width/height), location, product type, and photos of the opening or gate.</p>
      <a class="btn small" href="/quotation">Go to quotation</a>
    </div>
  `
})));

app.get("/offers", (req, res) => res.send(page({
  title: "Offers",
  activePath: req.path,
  heroImage: "/images/hero-offers.jpg",
  heading: "Offers & promotions.",
  sub: "Seasonal deals and limited-time promotions — check back regularly for updates.",
  bodyHtml: `
    <div class="card">
      <h2 class="h2">Current Offers</h2>
      <p class="muted">Promotions may vary by region and product availability.</p>

      <div class="offer">
        <div>
          <h3>Example Offer</h3>
          <p class="muted">Free site visit within selected regions (limited time).</p>
        </div>
        <a class="btn small" href="/contact">Claim</a>
      </div>
    </div>
  `
})));

app.get("/plan", (req, res) => res.send(page({
  title: "Plan",
  activePath: req.path,
  heroImage: "/images/hero-plan.jpg",
  heading: "Plan your project with confidence.",
  sub: "A simple and transparent process from request to installation.",
  bodyHtml: `
    <div class="timeline">
      <div class="step"><div class="step-num">1</div><div><h3>Tell us your requirements</h3><p class="muted">Garage doors, gate automation, WPC doors, inox works and accessories.</p></div></div>
      <div class="step"><div class="step-num">2</div><div><h3>Share dimensions and details</h3><p class="muted">Measurements, location, photos — to quote accurately and quickly.</p></div></div>
      <div class="step"><div class="step-num">3</div><div><h3>Receive your quotation</h3><p class="muted">Clear scope, estimated timeline, and pricing.</p></div></div>
      <div class="step"><div class="step-num">4</div><div><h3>Installation and handover</h3><p class="muted">Professional installation, testing, and guidance for use and maintenance.</p></div></div>
    </div>
  `
})));

app.get("/help", (req, res) => res.send(page({
  title: "Help",
  activePath: req.path,
  heroImage: "/images/hero-help.jpg",
  heading: "Help & FAQs.",
  sub: "Clear answers to common questions about quotations, installations, and support.",
  bodyHtml: `
    <div class="card">
      <h2 class="h2">FAQs</h2>

      <details class="faq">
        <summary>Do you provide after-sales support?</summary>
        <p class="muted">Yes — we support our installations and advise on maintenance, accessories, and spare parts.</p>
      </details>

      <details class="faq">
        <summary>What happens during power cuts?</summary>
        <p class="muted">Most systems include a manual release option. Backup solutions can also be discussed.</p>
      </details>

      <details class="faq">
        <summary>How can I get a fast quotation?</summary>
        <p class="muted">Use the Quotation page and send photos via WhatsApp for quick confirmation.</p>
      </details>
    </div>
  `
})));

app.get("/contact", (req, res) => res.send(page({
  title: "Contact",
  activePath: req.path,
  heroImage: "/images/hero-contact.jpg",
  heading: "Contact Germatek.",
  sub: "Get in touch for quotations, advice, or support. The fastest option is WhatsApp.",
  bodyHtml: `
    <div class="split">
      <div class="card">
        <h2 class="h2">WhatsApp</h2>
        <p class="muted">Tap below to message Germatek instantly.</p>
        <a class="btn" id="whatsBtn" href="#">WhatsApp Germatek</a>
        <p class="muted small">Fastest response via WhatsApp. Our team usually replies within business hours. <b>Germatek</b>.</p>
      </div>

      <form class="card form" id="contactForm">
        <h2 class="h2">Contact Request (Test)</h2>
        <label>Full name <input required name="name" placeholder="Your name" /></label>
        <label>Phone / WhatsApp <input required name="phone" placeholder="+230..." /></label>
        <label>Message <textarea name="message" rows="4" placeholder="Location, product, measurements, quantity…"></textarea></label>
        <button class="btn" type="submit">Submit (Test)</button>
        <p class="muted" id="formStatus" aria-live="polite"></p>
      </form>
    </div>
  `
})));

app.get("/quotation", (req, res) => res.send(page({
  title: "Quotation",
  activePath: req.path,
  heroImage: "/images/hero-quotation.jpg",
  heading: "Get an estimated quotation.",
  sub: "Enter dimensions and requirements to receive an estimated price range. Final pricing is confirmed after photos or a site visit.",
  bodyHtml: `
    <div class="split">
      <form class="card form" id="quoteCalcForm">
        <h2 class="h2">Quotation Details</h2>

        <label>Full name <input required name="name" placeholder="Your name" /></label>
        <label>Phone / WhatsApp <input required name="phone" placeholder="+230..." /></label>
        <label>Location / Region <input name="location" placeholder="e.g. Port Louis" /></label>

        <label>Product type
          <select required name="product">
            <option value="">Select…</option>
            <option value="garage">Automatic Garage Door</option>
            <option value="sliding_gate">Sliding Gate Opener</option>
            <option value="swing_gate">Swing Gate Opener</option>
            <option value="wpc_doors">WPC Flush Doors</option>
            <option value="inox">Stainless Steel / Inox Works</option>
            <option value="other">Other</option>
          </select>
        </label>

        <div class="row">
          <label>Width (meters)
            <input required type="number" step="0.01" min="0" name="width_m" placeholder="e.g. 3.50" />
          </label>
          <label>Height (meters)
            <input required type="number" step="0.01" min="0" name="height_m" placeholder="e.g. 2.20" />
          </label>
        </div>

        <div class="row">
          <label>Quantity
            <input required type="number" min="1" name="qty" value="1" />
          </label>
          <label>Finish / Notes
            <input name="finish" placeholder="e.g. black hardware, white oak…" />
          </label>
        </div>

        <label>Extra details
          <textarea name="message" rows="4" placeholder="Mention gate type, power supply, photos available, etc."></textarea>
        </label>

        <button class="btn" type="submit">Get Estimate</button>
        <p class="muted" id="quoteStatus" aria-live="polite"></p>

        <div class="card spacer">
          <h3>Instant Estimate</h3>
          <p class="muted" id="quoteResult">Fill the form and click “Get Estimate”.</p>
          <a class="btn ghost small" id="quoteWhatsBtn" href="#">Send details via WhatsApp</a>
        </div>
      </form>

      <div class="card">
        <h2 class="h2">How it works</h2>
        <ol class="muted">
          <li>Enter your dimensions and select a product.</li>
          <li>You receive an estimate range instantly.</li>
          <li>Send photos via WhatsApp for final confirmation.</li>
        </ol>
        <p class="muted small">This estimator provides a range. Final price depends on model, accessories, and site conditions.</p>
      </div>
    </div>
  `
})));

app.post("/api/quote", (req, res) => {
  const estimate = estimateQuote(req.body);
  if (estimate.error) return res.status(400).json(estimate);
  res.json({ ok: true, estimate });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Germatek running on http://localhost:${PORT}`)
);
