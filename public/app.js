document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger?.addEventListener("click", () => {
  const open = mobileMenu.style.display !== "flex";
  mobileMenu.style.display = open ? "flex" : "none";
  hamburger.setAttribute("aria-expanded", open ? "true" : "false");
});

// WhatsApp helper
const WHATS = window.__BRAND__?.whatsappNumber || "2300000000";
const wa = (text) => `https://wa.me/${WHATS}?text=${encodeURIComponent(text)}`;

// Band WhatsApp button
const bandWhats = document.getElementById("bandWhats");
if (bandWhats) {
  bandWhats.href = wa("Hi Germatek, I’d like a quotation. My location is ___ and I’m interested in (garage door / gate opener / WPC door). Dimensions: ___. Photos available.");
}

// Contact page WhatsApp button
const whatsBtn = document.getElementById("whatsBtn");
if (whatsBtn) {
  whatsBtn.href = wa("Hi Germatek, I’d like a quotation. My location is ___ and I’m interested in (garage door / gate opener / WPC door). Dimensions: ___. Photos available.");
}

// Contact form (test) -> builds WhatsApp message
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  formStatus.textContent = "✅ Submitted (test). You can also send details via WhatsApp.";

  if (whatsBtn) {
    const msg =
`Hi Germatek, I’d like assistance:

Name: ${data.name}
Phone: ${data.phone}
Message: ${data.message || "-"}

Location: ___
Photos available: Yes`;
    whatsBtn.href = wa(msg);
  }
});

// Quotation page logic
const quoteForm = document.getElementById("quoteCalcForm");
const quoteStatus = document.getElementById("quoteStatus");
const quoteResult = document.getElementById("quoteResult");
const quoteWhatsBtn = document.getElementById("quoteWhatsBtn");

quoteForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(quoteForm).entries());
  quoteStatus.textContent = "Calculating…";

  try {
    const r = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || "Failed");

    const est = json.estimate;
    quoteResult.textContent =
      `Estimated range: ${est.currency} ${est.low.toLocaleString()} – ${est.high.toLocaleString()} (area: ${est.area} m², qty: ${est.qty}).`;

    quoteStatus.textContent = "✅ Estimate ready. Send via WhatsApp for final confirmation.";

    const msg =
`Hi Germatek, I’d like a quotation:

Name: ${data.name}
Phone: ${data.phone}
Location: ${data.location || "-"}

Product: ${data.product}
Width: ${data.width_m} m
Height: ${data.height_m} m
Quantity: ${data.qty}
Finish/Notes: ${data.finish || "-"}
Extra: ${data.message || "-"}

Estimated range shown on site: ${est.currency} ${est.low} - ${est.high}
Photos available: Yes`;

    if (quoteWhatsBtn) quoteWhatsBtn.href = wa(msg);

  } catch (err) {
    quoteStatus.textContent = "❌ Could not calculate. Please re-check inputs.";
    if (quoteResult) quoteResult.textContent = "Try again.";
  }
});
