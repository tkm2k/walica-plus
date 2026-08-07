export const $ = (id) => document.getElementById(id);

export const yen = (n) => "¥" + Math.abs(n).toLocaleString();

export const CAT_LABEL = {
  tatekae: "📘 立替",
  loan: "🤝 貸し借り",
  gamble: "🎲 勝ち負け",
};

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

export function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

export function normalizeNumStr(v) {
  return v
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
}

export function setupAmountInput(el) {
  el.addEventListener("input", () => {
    const pos = el.selectionStart;
    const before = el.value;
    el.value = normalizeNumStr(el.value);
    const diff = before.length - el.value.length;
    el.setSelectionRange(pos - diff, pos - diff);
  });
  el.addEventListener("blur", () => {
    const n = parseInt(normalizeNumStr(el.value));
    if (n) el.value = n.toLocaleString();
  });
  el.addEventListener("focus", () => {
    el.value = normalizeNumStr(el.value);
  });
}

export function fmtCreatedAt(iso, short) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours());
  const mi = String(d.getMinutes()).padStart(2, "0");
  if (short) return `(${mm}/${dd} ${hh}:${mi})`;
  return `${d.getFullYear()}/${mm}/${dd} ${hh}:${mi}に作成`;
}
