export const state = {
  eventId: null,
  members: [],
  transactions: [],
  currentFilter: "all",
  currentSort: "new",
  currentCat: "tatekae",
  editingTxId: null,
  settleFilter: "all",
};

export function memberName(id) {
  const m = state.members.find((m) => m.id === id);
  return m ? m.name : "?";
}
