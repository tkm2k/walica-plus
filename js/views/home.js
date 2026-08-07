import { $, esc, toast } from "../utils.js";
import { store } from "../db/index.js";
import { loadHistory, removeFromHistory } from "../logic/history.js";

let app;

export function setup(appRef) {
  app = appRef;
  $("btn-add-member-input").onclick = addHomeMemberInput;
  $("btn-create-event").onclick = handleCreateEvent;
}

function addHomeMemberInput() {
  const div = document.createElement("div");
  div.className = "home-member-row";
  div.innerHTML = '<input type="text" placeholder="名前"><button type="button">✕</button>';
  div.querySelector("button").onclick = () => div.remove();
  $("home-members").appendChild(div);
}

async function handleCreateEvent() {
  const name = $("new-event-name").value.trim();
  const names = [...$("home-members").querySelectorAll("input")]
    .map((i) => i.value.trim())
    .filter(Boolean);
  if (!name) return toast("イベント名を入力してください");
  if (names.length < 2) return toast("メンバーを2人以上入力してください");
  if (new Set(names).size !== names.length) return toast("同じ名前は使えません");
  $("btn-create-event").disabled = true;
  try {
    const id = await store.createEvent(name, names);
    location.href = location.pathname + "?e=" + id;
  } catch (err) {
    console.error(err);
    toast("作成に失敗しました: " + err.message);
    $("btn-create-event").disabled = false;
  }
}

export function show() {
  $("view-home").classList.remove("hidden");
  addHomeMemberInput();
  addHomeMemberInput();
  renderRecentEvents();
}

function renderRecentEvents() {
  const list = loadHistory();
  const card = $("recent-events-card");
  if (list.length === 0) {
    card.classList.add("hidden");
    return;
  }
  card.classList.remove("hidden");
  const el = $("recent-events-list");
  el.innerHTML = list
    .map((h) => {
      const d = new Date(h.visited);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      return `<div class="recent-item" data-id="${h.id}">
      <div><div class="recent-name">${esc(h.name)}</div><div class="recent-date">${dateStr} にアクセス</div></div>
      <button class="recent-remove" data-rid="${h.id}" title="履歴から削除">✕</button>
    </div>`;
    })
    .join("");

  el.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.closest(".recent-remove")) return;
      location.href = location.pathname + "?e=" + item.dataset.id;
    });
  });
  el.querySelectorAll(".recent-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromHistory(btn.dataset.rid);
      renderRecentEvents();
    });
  });
}
