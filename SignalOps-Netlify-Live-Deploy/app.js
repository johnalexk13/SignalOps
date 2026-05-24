import { getFallbackPayload } from "./seed.js";

const REFRESH_INTERVAL_MS = 60_000;
const ENDPOINT = "/.netlify/functions/signals";

const competitorFilter = document.querySelector("#competitorFilter");
const sourceFilter = document.querySelector("#sourceFilter");
const searchInput = document.querySelector("#searchInput");
const refreshButton = document.querySelector("#refreshButton");

const streamHealth = document.querySelector("#streamHealth");
const lastUpdated = document.querySelector("#lastUpdated");
const sourceCount = document.querySelector("#sourceCount");
const activeSignalCount = document.querySelector("#activeSignalCount");

const metricCards = document.querySelector("#metricCards");
const signalFeed = document.querySelector("#signalFeed");
const competitorHeatmap = document.querySelector("#competitorHeatmap");
const positioningList = document.querySelector("#positioningList");
const reviewsList = document.querySelector("#reviewsList");
const contentIdeas = document.querySelector("#contentIdeas");
const actionList = document.querySelector("#actionList");
const capabilityList = document.querySelector("#capabilityList");
const signalCardTemplate = document.querySelector("#signalCardTemplate");

const state = {
  payload: null,
  filters: {
    competitor: "All competitors",
    source: "All sources",
    search: "",
  },
};

boot();

function boot() {
  attachEvents();
  loadDashboard();
  window.setInterval(loadDashboard, REFRESH_INTERVAL_MS);
}

function attachEvents() {
  competitorFilter.addEventListener("change", (event) => {
    state.filters.competitor = event.target.value;
    render();
  });

  sourceFilter.addEventListener("change", (event) => {
    state.filters.source = event.target.value;
    render();
  });

  searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  refreshButton.addEventListener("click", () => {
    refreshButton.disabled = true;
    loadDashboard().finally(() => {
      refreshButton.disabled = false;
    });
  });
}

async function loadDashboard() {
  try {
    setLoadingState();
    const response = await fetch(`${ENDPOINT}?ts=${Date.now()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Signal endpoint failed with ${response.status}`);
    }

    state.payload = await response.json();
    hydrateFilters();
    render();
  } catch (error) {
    console.error(error);
    state.payload = getFallbackPayload();
    hydrateFilters();
    render();
    setErrorState(error);
  }
}

function hydrateFilters() {
  const payload = state.payload;
  const competitors = ["All competitors", ...(payload.meta?.competitors || [])];
  const sources = ["All sources", ...(payload.meta?.sources || [])];

  renderSelect(competitorFilter, competitors, state.filters.competitor);
  renderSelect(sourceFilter, sources, state.filters.source);
}

function renderSelect(element, options, selectedValue) {
  element.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option;
    node.textContent = option;
    if (option === selectedValue) {
      node.selected = true;
    }
    element.appendChild(node);
  });
}

function render() {
  if (!state.payload) {
    return;
  }

  const filteredSignals = getFilteredSignals();

  streamHealth.textContent = state.payload.meta.status;
  sourceCount.textContent = String(state.payload.meta.sources.length);
  lastUpdated.textContent = `Last refresh ${formatAbsoluteTime(state.payload.meta.generatedAt)}`;
  activeSignalCount.textContent = `${filteredSignals.length} signals`;

  renderMetrics(filteredSignals);
  renderSignalFeed(filteredSignals);
  renderHeatmap(state.payload.competitorScores);
  renderStack(positioningList, state.payload.positioning);
  renderStack(reviewsList, state.payload.reviewsIntel);
  renderStack(contentIdeas, state.payload.thoughtLeadershipIdeas);
  renderStack(actionList, state.payload.actions);
  renderStack(capabilityList, state.payload.capabilitySuggestions);
}

function renderMetrics(signals) {
  const aggregates = {
    volume: signals.length,
    averageConfidence: average(signals.map((signal) => signal.confidence)),
    averageUrgency: average(signals.map((signal) => signal.urgency)),
    websiteChanges: signals.filter((signal) => signal.sourceType === "Website change").length,
  };

  const cards = [
    {
      label: "Signal Volume",
      value: aggregates.volume,
      copy: "Filtered live signals in the current market view.",
    },
    {
      label: "Avg Confidence",
      value: `${Math.round(aggregates.averageConfidence * 100)}%`,
      copy: "Confidence blends source quality, freshness, and corroboration.",
    },
    {
      label: "Urgency Index",
      value: `${Math.round(aggregates.averageUrgency * 100)}`,
      copy: "Higher values mean faster PMM response is recommended.",
    },
    {
      label: "Web Change Alerts",
      value: aggregates.websiteChanges,
      copy: "Detected page, launch, or product narrative changes.",
    },
  ];

  metricCards.innerHTML = cards.map((card) => `
    <article class="metric-card">
      <p class="panel-kicker">${card.label}</p>
      <strong>${card.value}</strong>
      <p>${card.copy}</p>
    </article>
  `).join("");
}

function renderSignalFeed(signals) {
  signalFeed.innerHTML = "";

  if (!signals.length) {
    signalFeed.innerHTML = `<p class="empty-state">No signals match the current filters.</p>`;
    return;
  }

  signals.forEach((signal) => {
    const fragment = signalCardTemplate.content.cloneNode(true);
    fragment.querySelector(".signal-source").textContent = signal.sourceType;
    fragment.querySelector(".signal-title").textContent = signal.title;
    fragment.querySelector(".signal-score").textContent = `${Math.round(signal.urgency * 100)} urgency`;
    fragment.querySelector(".signal-summary").textContent = signal.summary;
    fragment.querySelector(".signal-badge.competitor").textContent = signal.competitor;
    fragment.querySelector(".signal-badge.topic").textContent = signal.topic;
    fragment.querySelector(".signal-badge.freshness").textContent = formatRelativeTime(signal.publishedAt);
    const corroborationLabel = signal.corroboration > 1 ? ` | ${signal.corroboration} sources aligned` : "";
    fragment.querySelector(".signal-confidence").textContent = `Confidence ${Math.round(signal.confidence * 100)}%${corroborationLabel}`;

    const link = fragment.querySelector(".signal-link");
    link.href = signal.url;
    link.textContent = signal.source;

    signalFeed.appendChild(fragment);
  });
}

function renderHeatmap(scores) {
  competitorHeatmap.innerHTML = "";

  scores.forEach((score) => {
    const pressure = Math.round(score.pressure * 100);
    competitorHeatmap.innerHTML += `
      <article class="heatmap-item">
        <div class="heatmap-row">
          <h3>${score.competitor}</h3>
          <strong>${pressure}</strong>
        </div>
        <div class="heatbar">
          <div class="heatbar-fill" style="width:${pressure}%"></div>
        </div>
        <p>${score.narrative}</p>
      </article>
    `;
  });
}

function renderStack(container, items) {
  container.innerHTML = "";

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "stack-item";
    article.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <strong>${item.ownerHint}</strong>
    `;

    if (item.prompt) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "asset-button";
      button.textContent = "Copy Asset Prompt";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(item.prompt);
          button.textContent = "Prompt Copied";
          window.setTimeout(() => {
            button.textContent = "Copy Asset Prompt";
          }, 1800);
        } catch (error) {
          console.error(error);
          button.textContent = "Copy Failed";
        }
      });
      article.appendChild(button);
    }

    container.appendChild(article);
  });
}

function getFilteredSignals() {
  const search = state.filters.search;

  return state.payload.signals.filter((signal) => {
    const matchesCompetitor = state.filters.competitor === "All competitors" || signal.competitor === state.filters.competitor;
    const matchesSource = state.filters.source === "All sources" || signal.sourceType === state.filters.source;
    const matchesSearch = !search || [
      signal.title,
      signal.summary,
      signal.topic,
      signal.competitor,
      signal.source,
    ].join(" ").toLowerCase().includes(search);

    return matchesCompetitor && matchesSource && matchesSearch;
  });
}

function setLoadingState() {
  streamHealth.textContent = "Refreshing";
  lastUpdated.textContent = "Pulling latest signals...";
}

function setErrorState(error) {
  streamHealth.textContent = "Fallback Mode";
  lastUpdated.textContent = `Live endpoint unavailable: ${error.message}`;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatRelativeTime(timestamp) {
  const deltaMs = Date.now() - new Date(timestamp).getTime();
  const deltaMinutes = Math.max(1, Math.round(deltaMs / 60000));

  if (deltaMinutes < 60) {
    return `${deltaMinutes} min ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours} hr ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays} day ago`;
}

function formatAbsoluteTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
