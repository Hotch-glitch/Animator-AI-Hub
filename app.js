
/**
 * Animator AI Hub with Hoshi
 * Multi-category blind pairwise tournament (EN primary + JA translations)
 */
const DATA_URL = "videos.json";

// ------- DOM -------
const leftPane = document.getElementById("leftPane");
const rightPane = document.getElementById("rightPane");
const leftVideo = document.getElementById("leftVideo");
const rightVideo = document.getElementById("rightVideo");
const pickLeft = document.getElementById("pickLeft");
const pickRight = document.getElementById("pickRight");
const categoryLabel = document.getElementById("categoryLabel");
const roundLabel = document.getElementById("roundLabel");
const progress = document.getElementById("progress");
const toast = document.getElementById("toast");

const stage = document.getElementById("stage");
const interlude = document.getElementById("interlude");
const interludeTitle = document.getElementById("interludeTitle");
const interludeDesc = document.getElementById("interludeDesc");
const startBtn = document.getElementById("startBtn");

const results = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const restartBtn = document.getElementById("restartBtn");

// ------- state -------
let data = null;
let catIndex = 0;
let items = [];
let pairs = [];
let byes = [];
let winners = [];
let pairIndex = 0;
let roundNum = 1;
let sessionWinners = []; // [{categoryId, categoryName, championClip}]

const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

init().catch(e => {
  console.error(e);
  alert("Initialization failed.（初期化に失敗しました）");
});

async function init() {
  data = await fetch(DATA_URL).then(r => r.json());
  // Interlude for first category
  stage.classList.add("hidden");
  interlude.classList.remove("hidden");
  results.classList.add("hidden");

  updateInterludeText();
  startBtn.onclick = () => startCategory(catIndex);

  // picks
  pickLeft.addEventListener("click", () => choose("left"));
  pickRight.addEventListener("click", () => choose("right"));
  leftPane.addEventListener("click", (e) => { if (e.target.tagName.toLowerCase() !== "video") choose("left"); });
  rightPane.addEventListener("click", (e) => { if (e.target.tagName.toLowerCase() !== "video") choose("right"); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "j" || e.key === "J") choose("left");
    if (e.key === "k" || e.key === "K") choose("right");
  });
  restartBtn.onclick = () => {
    catIndex = 0;
    sessionWinners = [];
    stage.classList.add("hidden");
    results.classList.add("hidden");
    interlude.classList.remove("hidden");
    updateInterludeText();
  };
}

function updateInterludeText() {
  const c = data.categories[catIndex];
  interludeTitle.textContent = `Next: ${c.name_en} (${c.name_ja})`;
  interludeDesc.innerHTML = `You will compare 10 clips in this category using quick two-choice duels.<br/>（このカテゴリで10本のクリップを二択で素早く比較します）`;
}

// Category start
function startCategory(index) {
  const c = data.categories[index];
  items = c.clips.filter(x => x.enabled !== false); // allow disabling
  if (items.length < 2) {
    showToast("This category needs at least 2 clips.（最低2本必要です）");
    return;
  }
  roundNum = 1;
  stage.classList.remove("hidden");
  interlude.classList.add("hidden");
  results.classList.add("hidden");
  categoryLabel.textContent = `Category: ${c.name_en}（${c.name_ja}）`;
  startRound();
}

function startRound() {
  winners = [];
  byes = [];
  pairIndex = 0;

  const shuffled = shuffle(items);

  if (shuffled.length % 2 === 1) {
    byes.push(shuffled.pop());
  }

  pairs = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i+1]]);
  }

  roundLabel.textContent = `Round ${roundNum}（ラウンド ${roundNum}）`;
  progress.textContent = `Pair 0/${pairs.length}（ペア 0/${pairs.length}）`;

  if (pairs.length > 0) {
    showPair(pairs[pairIndex]);
  } else {
    const finalists = items.concat(byes);
    if (finalists.length === 1) {
      finish(finalists[0]);
    } else {
      items = finalists;
      roundNum++;
      startRound();
    }
  }
}

async function showPair([clipL, clipR]) {
  await setVideo(leftVideo, clipL.url);
  await setVideo(rightVideo, clipR.url);

  leftPane.classList.remove("chosen");
  rightPane.classList.remove("chosen");

  progress.textContent = `Pair ${pairIndex + 1}/${pairs.length}（ペア ${pairIndex + 1}/${pairs.length}）`;

  try {
    leftVideo.currentTime = 0;
    rightVideo.currentTime = 0;
    await Promise.all([leftVideo.play(), rightVideo.play()]);
  } catch (e) {
    showToast("Autoplay blocked. Tap to start.（自動再生がブロックされました。タップしてください）");
  }

  const nextPair = pairs[pairIndex + 1];
  if (nextPair) {
    preloadVideo(nextPair[0].url);
    preloadVideo(nextPair[1].url);
  }
}

async function setVideo(el, url) {
  return new Promise((resolve) => {
    el.src = url;
    const done = () => {
      el.removeEventListener("loadeddata", done);
      el.removeEventListener("error", done);
      resolve();
    };
    el.addEventListener("loadeddata", done, { once: true });
    el.addEventListener("error", done, { once: true });
    el.load();
  });
}

function preloadVideo(url) {
  const v = document.createElement("video");
  v.muted = true;
  v.preload = "auto";
  v.src = url;
  setTimeout(() => v.remove(), 2500);
}

async function choose(side) {
  const [clipL, clipR] = pairs[pairIndex];
  const winner = (side === "left") ? clipL : clipR;

  if (side === "left") leftPane.classList.add("chosen");
  else rightPane.classList.add("chosen");

  // For production: send a POST to your API here with (category, round, left_id, right_id, chosen_id)
  console.log("vote", {
    category: data.categories[catIndex].id,
    round: roundNum,
    left_id: clipL.id, right_id: clipR.id,
    chosen_id: winner.id
  });

  winners.push(winner);
  await (new Promise(r=>setTimeout(r,120)));

  pairIndex++;
  if (pairIndex < pairs.length) {
    showPair(pairs[pairIndex]);
  } else {
    const nextItems = winners.concat(byes);
    if (nextItems.length === 1) {
      finish(nextItems[0]);
    } else {
      items = nextItems;
      roundNum++;
      startRound();
    }
  }
}

function finish(champion) {
  try { leftVideo.pause(); rightVideo.pause(); } catch {}
  const c = data.categories[catIndex];
  sessionWinners.push({ categoryId: c.id, categoryName: `${c.name_en}（${c.name_ja}）`, champion });

  // Move to next category or show results
  catIndex++;
  if (catIndex < data.categories.length) {
    stage.classList.add("hidden");
    interlude.classList.remove("hidden");
    updateInterludeText();
    showToast(`Winner: ${champion.title} (${champion.model}) — ${c.name_en}（優勝・${c.name_ja}）`);
  } else {
    // All categories done
    stage.classList.add("hidden");
    interlude.classList.add("hidden");
    results.classList.remove("hidden");
    renderResults();
  }
}

function renderResults() {
  resultsList.innerHTML = "";
  sessionWinners.forEach((w, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "12px";
    div.innerHTML = `
      <div class="kv">
        <div><strong>Category（カテゴリ）</strong></div><div>${w.categoryName}</div>
        <div><strong>Champion（優勝）</strong></div><div>${w.champion.title} — ${w.champion.model}</div>
        <div class="sep"></div>
        <div><strong>Preview（プレビュー）</strong></div>
        <div>
          <video src="${w.champion.url}" muted playsinline loop style="max-width:360px;border-radius:8px"></video>
        </div>
      </div>
    `;
    resultsList.appendChild(div);
  });
}

// Toast
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 1800);
}
