import { $, esc, yen, toast } from "../utils.js";
import { state } from "../state.js";
import { settle, calcBalances } from "../logic/settlement.js";

let app;

export function setup(appRef) {
  app = appRef;

  $("settle-chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.settleFilter = b.dataset.f;
    [...$("settle-chips").children].forEach((c) => c.classList.toggle("active", c === b));
    render();
  });

  $("btn-copy-settle").onclick = () => {
    const text = buildSettleText();
    navigator.clipboard
      .writeText(text)
      .then(() => toast("コピーしました"))
      .catch(() => toast("コピーに失敗しました"));
  };

  if (navigator.share) $("btn-share-settle").classList.remove("hidden");
  $("btn-share-settle").onclick = () => {
    navigator.share({ text: buildSettleText() }).catch(() => {});
  };
}

function buildSettleText() {
  const evName = $("header-event").textContent;
  const balances = calcBalances(state.members, state.transactions);
  const plan = settle(balances);
  if (plan.length === 0) return `【${evName} - 精算】\n精算の必要はありません 🎉`;
  const lines = plan.map((p) => `${p.from} → ${p.to}：${yen(p.amount)}`);
  return `【${evName} - 精算】\n${lines.join("\n")}\n\n▼ 詳細はこちら\n${location.href}`;
}

export function render() {
  const balances = calcBalances(state.members, state.transactions);
  const fBalances = calcBalances(state.members, state.transactions, state.settleFilter);
  fBalances.sort((a, b) => b.bal - a.bal);

  $("balance-list").innerHTML = fBalances
    .map(
      (b) => `
    <div class="balance-row">
      <span>${esc(b.name)}</span>
      <span class="${b.bal > 0 ? "plus" : b.bal < 0 ? "minus" : ""}">
        ${b.bal > 0 ? "+" : ""}${b.bal.toLocaleString()}円 ${b.bal > 0 ? "（受け取る）" : b.bal < 0 ? "（支払う）" : ""}
      </span>
    </div>`
    )
    .join("");

  const plan = settle(balances);
  $("settle-list").innerHTML =
    plan.length === 0
      ? '<div class="empty">精算の必要はありません 🎉</div>'
      : plan
          .map(
            (p) => `
      <div class="settle-row">
        <span>${esc(p.from)}<span class="arrow">→</span>${esc(p.to)}</span>
        <span class="amt">${yen(p.amount)}</span>
      </div>`
          )
          .join("");
}
