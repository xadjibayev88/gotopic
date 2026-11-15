/* Interfeys tili: o'zbekcha (asl), русский, English.
   Sahifa matni o'zgartirilmaydi: ko'rinadigan matn tugunlari i18n/strings.json bo'yicha almashtiriladi (raqamlar saqlanadi).
   Tarjimasi yo'q matn asl holicha qoladi. Til localStorage'da (gt-lang) saqlanadi. */
(() => {
  "use strict";
  const LANGS = { uz: "O'zbekcha", ru: "Русский", en: "English" };
  const saved = (() => { try { return localStorage.getItem("gt-lang"); } catch (_) { return null; } })();
  const guess = (navigator.language || "").slice(0, 2);
  const lang = LANGS[saved] ? saved : (guess === "ru" || guess === "en" ? guess : "uz");
  const norm = t => t.replace(/[ʻ’‘`]/g, "'").replace(/\s+/g, " ").trim();
  const api = { lang, langs: LANGS, set(next) { if (!LANGS[next]) return; try { localStorage.setItem("gt-lang", next); } catch (_) {} location.reload(); } };
  window.GoTopicI18n = api;
  document.documentElement.lang = lang;
  if (lang === "uz") return addSwitch();

  let map = null;
  const NUM = /\d+(?:[.,]\d+)?/g;
  function translate(text) {
    const key = norm(text); if (!key) return null;
    const nums = key.match(NUM) || [];
    const hit = map.get(key.replace(NUM, "#"));
    if (!hit) return null;
    let i = 0;
    const out = hit.replace(/#/g, () => nums[i++] ?? "");
    const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0];
    return lead + out + tail;
  }
  const ATTRS = ["placeholder", "aria-label", "title"];
  function walk(root) {
    if (!map || !root) return;
    if (root.nodeType === 3) { const t = translate(root.nodeValue); if (t !== null && t !== root.nodeValue) root.nodeValue = t; return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(root.tagName)) return;
    for (const a of ATTRS) { const v = root.getAttribute && root.getAttribute(a); if (v) { const t = translate(v); if (t !== null && t !== v) root.setAttribute(a, t); } }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = w.nextNode())) {
      if (n.nodeType === 3) { const p = n.parentElement; if (p && /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName)) continue; const t = translate(n.nodeValue); if (t !== null && t !== n.nodeValue) n.nodeValue = t; }
      else for (const a of ATTRS) { const v = n.getAttribute(a); if (v) { const t = translate(v); if (t !== null && t !== v) n.setAttribute(a, t); } }
    }
  }
  const obs = new MutationObserver(list => { for (const m of list) { if (m.type === "characterData") walk(m.target); else if (m.type === "attributes") walk(m.target); else m.addedNodes.forEach(walk); } });
  fetch("i18n/strings.json", { cache: "force-cache" }).then(r => r.json()).then(d => {
    map = new Map(); d.uz.forEach((k, i) => { const v = d[lang] && d[lang][i]; if (v) map.set(norm(k), v); });
    walk(document.body);
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }).catch(() => {});
  addSwitch();

  function addSwitch() {
    const mount = () => {
      if (document.getElementById("gt-lang")) return;
      const sel = document.createElement("select");
      sel.id = "gt-lang"; sel.setAttribute("aria-label", "Til / Язык / Language");
      sel.innerHTML = Object.entries(LANGS).map(([k, v]) => `<option value="${k}"${k === lang ? " selected" : ""}>${k.toUpperCase()} · ${v}</option>`).join("");
      sel.addEventListener("change", () => api.set(sel.value));
      const drawer = document.querySelector("#drawer .dfoot");
      if (drawer) drawer.prepend(sel);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  }
})();
