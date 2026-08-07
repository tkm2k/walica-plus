/**
 * balances: [{id, name, bal}]  bal>0=受け取る, bal<0=支払う
 * 貪欲法：最大の債務者→最大の債権者へ順に送金
 */
export function settle(balances) {
  const debtors = balances
    .filter((b) => b.bal < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.bal - b.bal);
  const creditors = balances
    .filter((b) => b.bal > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.bal - a.bal);
  const res = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].bal, creditors[j].bal);
    if (pay > 0) res.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].bal += pay;
    creditors[j].bal -= pay;
    if (debtors[i].bal === 0) i++;
    if (creditors[j].bal === 0) j++;
  }
  return res;
}

/**
 * 立替の分割：端数は先頭の対象者から1円ずつ負担。
 * 支払者の行(+amount)と各対象者の行(-負担額)を別々に持つ。
 */
export function splitTatekae(amount, payerId, targetIds) {
  const n = targetIds.length;
  const base = Math.floor(amount / n);
  const rem = amount - base * n;
  const lines = targetIds.map((id, idx) => ({
    member_id: id,
    delta: -(base + (idx < rem ? 1 : 0)),
  }));
  lines.push({ member_id: payerId, delta: amount });
  return lines;
}

export function calcBalances(members, transactions, filter = "all") {
  const bal = {};
  members.forEach((m) => (bal[m.id] = 0));
  transactions
    .filter((t) => filter === "all" || t.category === filter)
    .forEach((tx) =>
      tx.lines.forEach((l) => {
        bal[l.member_id] = (bal[l.member_id] || 0) + l.delta;
      })
    );
  return members.map((m) => ({ id: m.id, name: m.name, bal: bal[m.id] || 0 }));
}
