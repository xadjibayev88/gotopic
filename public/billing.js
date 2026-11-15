/* Tariflar sahifasi (#tariflar): Pro (oylik) va Topic (yillik).
   Saytda: Payme / Click (Uzcard, Humo, Visa) va USDT TRC20.
   Android ilovada (Google Play qoidasi): tashqi to'lov tugmalari ko'rsatilmaydi, faqat joriy tarif holati. */
(() => {
  "use strict";
  const api = window.GoTopicAPI;
  if (!api) return;
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform()) || !!window.AndroidAdMob;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sum = n => Number(n).toLocaleString("ru-RU").replace(/,/g, " ");
  const FEATURES = {
    pro: ["AI ustoz bilan kuniga 5 baravar ko'p suhbat", "Reklamasiz", "Barcha TOPIK 1–6 mashqlari", "Haftalik liga va reyting"],
    topic: ["Pro'dagi hamma imkoniyatlar", "12 oy — oylikdan 2 oy arzonroq", "TOPIK imtihoniga to'liq yil tayyorgarlik", "Yangi mashqlar birinchi bo'lib"],
  };
  const METHOD = {
    payme: "Payme · Uzcard / Humo / Visa",
    click: "Click · Uzcard / Humo / Visa",
    usdt: "USDT (TRC20)",
  };
  let plans = null, timer = null;

  const root = document.createElement("div");
  root.id = "gt-billing"; root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Tariflar");
  document.body.appendChild(root);

  function billingState() { return api.status?.billing || { plan: "free", expiresAt: null }; }
  function paid() { return billingState().plan !== "free"; }
  function applyPaid() {
    window.GoTopicPaid = paid();
    if (window.GoTopicPaid) window.GoTopicAds?.off?.();
    if (native && !paid()) document.querySelectorAll("[data-billing-link]").forEach(a => a.hidden = true);
  }

  function statusHtml() {
    const b = billingState();
    if (b.plan === "free") return "";
    const until = new Date(b.expiresAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
    return `<div class="gb-status">✅ Sizda <b>${b.plan === "topic" ? "Topic" : "Pro"}</b> tarifi faol — ${esc(until)} gacha.</div>`;
  }

  function render() {
    if (!plans) { root.innerHTML = `<div class="gb-wrap"><p>Yuklanmoqda…</p></div>`; return; }
    const cards = plans.plans.map(p => {
      const methods = native ? "" : (plans.providers.length
        ? plans.providers.map(m => `<button class="gb-btn${m === "usdt" ? " alt" : ""}" data-buy="${p.id}" data-method="${m}">${esc(METHOD[m])}</button>`).join("")
        : `<p class="gb-uzs">To'lov tez orada ochiladi.</p>`);
      return `<article class="gb-card${p.id === "topic" ? " best" : ""}">
        ${p.id === "topic" ? `<span class="gb-badge">Eng foydali</span>` : ""}
        <h2>${esc(p.name)}</h2>
        ${native ? "" : `<div class="gb-price">$${p.usd}<small> / ${esc(p.period)}</small></div><div class="gb-uzs">≈ ${sum(p.uzs)} so'm</div>`}
        <ul>${FEATURES[p.id].map(f => `<li>${esc(f)}</li>`).join("")}</ul>
        <div class="gb-methods">${methods}</div>
      </article>`;
    }).join("");
    root.innerHTML = `<div class="gb-wrap">
      <div class="gb-top"><h1>Tariflar</h1><button class="gb-x" data-close aria-label="Yopish">×</button></div>
      <p class="gb-lead">Bepul tarifda ham darslar ochiq. Pro va Topic AI ustoz bilan ko'proq mashq va reklamasiz o'qish uchun.</p>
      ${statusHtml()}
      <div class="gb-grid">${cards}</div>
      <div id="gb-pay"></div>
      ${native ? "" : `<p class="gb-note">To'lovdan keyin tarif shu hisobga darhol ulanadi va muddati tugaganda o'zi to'xtaydi (avtomatik yechib olinmaydi). USDT faqat TRC20 tarmog'ida. Savollar: <a href="privacy.html#contact">aloqa</a>.</p>`}
    </div>`;
  }

  function usdtHtml(o, state) {
    return `<div class="gb-modal">
      <h3 style="margin:0 0 6px">USDT (TRC20) bilan to'lov</h3>
      <p style="margin:0 0 8px">Aynan shu summani yuboring (hamyonga tushadigan summa aniq shunday bo'lsin, aks holda to'lov aniqlanmaydi):</p>
      <div class="gb-amount">${esc(o.amountUsdt)} USDT</div>
      <p style="margin:10px 0 0">Manzil (faqat <b>TRON / TRC20</b> tarmog'i):</p>
      <div class="gb-addr"><span id="gb-addr">${esc(o.address)}</span><button class="gb-btn alt" data-copy>Nusxa</button></div>
      <p style="margin:6px 0 12px;opacity:.8">Muddat: ${esc(new Date(o.expiresAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }))} gacha. Tasdiq 1–3 daqiqa oladi.</p>
      <button class="gb-btn" data-check="${o.id}">To'ladim, tekshirish</button>
      <p id="gb-msg" style="margin:10px 0 0">${esc(state || "")}</p>
    </div>`;
  }

  async function buy(plan, method, btn) {
    if (!api.user) { api.login(); return; }
    btn.disabled = true;
    try {
      const response = await api.request("/api/billing/orders", { method: "POST", body: JSON.stringify({ plan, provider: method }) });
      const order = await response.json();
      if (!response.ok) throw new Error(order?.error?.message || "To'lovni boshlab bo'lmadi");
      if (order.payUrl) { location.assign(order.payUrl); return; }
      const box = document.getElementById("gb-pay");
      box.innerHTML = usdtHtml(order, "");
      box.scrollIntoView({ behavior: "smooth", block: "start" });
      clearInterval(timer);
      timer = setInterval(() => check(order.id, true), 20000);
    } catch (error) {
      toast(error.message);
    } finally { btn.disabled = false; }
  }

  async function check(id, silent) {
    const msg = document.getElementById("gb-msg");
    if (!silent && msg) msg.textContent = "Tekshirilmoqda…";
    try {
      const response = await api.request(`/api/billing/orders/${id}/check`, { method: "POST", body: "{}" });
      const result = await response.json();
      if (result.status === "paid") {
        clearInterval(timer);
        await api.init(); applyPaid(); render();
        toast("To'lov qabul qilindi. Tarif faollashtirildi!");
      } else if (result.status === "expired") {
        clearInterval(timer); if (msg) msg.textContent = "Muddat tugadi. Qaytadan buyurtma bering.";
      } else if (msg && !silent) msg.textContent = "Hali ko'rinmadi. Tarmoq tasdig'idan keyin avtomatik tekshiriladi.";
    } catch (_) { if (msg && !silent) msg.textContent = "Tekshirib bo'lmadi, birozdan keyin qayta urining."; }
  }

  function toast(text) {
    const t = document.getElementById("toast");
    if (!t) return alert(text);
    t.textContent = text; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 3500);
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.close !== undefined) { history.length > 1 ? history.back() : (location.hash = "#bosh"); return; }
    if (b.dataset.buy) { buy(b.dataset.buy, b.dataset.method, b); return; }
    if (b.dataset.check) { check(Number(b.dataset.check), false); return; }
    if (b.dataset.copy !== undefined) { navigator.clipboard?.writeText(document.getElementById("gb-addr").textContent).then(() => toast("Manzil nusxalandi")); }
  });

  async function open() {
    root.hidden = false; document.documentElement.style.overflow = "hidden"; render();
    try {
      if (!plans) plans = await (await api.request("/api/billing/plans")).json();
      if (api.user) await api.init();
    } catch (_) { plans = plans || { plans: [], providers: [] }; }
    applyPaid(); render();
  }
  function close() { root.hidden = true; document.documentElement.style.overflow = ""; clearInterval(timer); }
  const sync = () => (location.hash === "#tariflar" ? open() : (!root.hidden && close()));
  addEventListener("hashchange", sync);

  // Sessiya yuklangach: obunachilarda reklamani o'chirish.
  const wait = setInterval(() => { if (api.status) { clearInterval(wait); applyPaid(); sync(); } }, 300);
  setTimeout(() => clearInterval(wait), 20000);
})();
