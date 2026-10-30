const apiBase = "https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/forecast_mosmix_";
const stationForm = document.querySelector("#station-form");
const stationInput = document.querySelector("#station-id");
const stationLabel = document.querySelector("#station-label");
const apiStatus = document.querySelector("#api-status");
const currentPanel = document.querySelector("#current-panel");
const forecastGrid = document.querySelector("#forecast-grid");
const forecastCount = document.querySelector("#forecast-count");
const updatedAt = document.querySelector("#updated-at");
const stationNames = { "10782": "Waldmünchen" };

const weatherTypes = {
  1: ["☀️", "Sonne"], 2: ["🌤️", "Heiter"], 3: ["🌥️", "Wolkig"],
  4: ["☁️", "Bewölkt"], 5: ["🌫️", "Nebel"], 6: ["🌫️", "Nebel / Glätte"],
  7: ["🌦️", "Leichter Regen"], 8: ["🌧️", "Regen"], 9: ["🌧️", "Starker Regen"],
  10: ["🌧️", "Regen / Glätte"], 11: ["🌧️", "Starker Regen / Glätte"],
  12: ["🌨️", "Regen und Schnee"], 13: ["🌨️", "Regen und Schnee"],
  14: ["❄️", "Leichter Schneefall"], 15: ["❄️", "Schneefall"],
  16: ["❄️", "Starker Schneefall"], 17: ["🌩️", "Wolken / Hagel"],
  18: ["🌦️", "Sonne und Regen"], 19: ["🌧️", "Sonne und starker Regen"],
  20: ["🌨️", "Regen und Schnee"], 21: ["🌨️", "Regen und Schnee"],
  22: ["❄️", "Sonne und Schnee"], 23: ["❄️", "Sonne und Schnee"],
  24: ["🌩️", "Hagel"], 25: ["🌩️", "Starker Hagel"], 26: ["⛈️", "Gewitter"],
  27: ["⛈️", "Gewitter und Regen"], 28: ["⛈️", "Starkes Gewitter"],
  29: ["⛈️", "Gewitter und Hagel"], 30: ["⛈️", "Starkes Gewitter / Hagel"],
  31: ["💨", "Wind"]
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function numberValue(value, divisor = 1, digits = 1) {
  if (value === null || value === undefined || value === "") return "Keine Angabe";
  const number = Number(value);
  if (!Number.isFinite(number)) return "Keine Angabe";
  return (number / divisor).toLocaleString("de-DE", { maximumFractionDigits: digits });
}

function temperature(value) {
  return value == null ? "--°" : `${numberValue(value, 10)}°`;
}

function dateLabel(value, options = { weekday: "long", day: "numeric", month: "long" }) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("de-DE", options).format(date);
}

function timeLabel(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "–";
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function windDirection(value) {
  if (value === null || value === undefined || value === "") return "Keine Angabe";
  const degrees = Number(value) / 10;
  if (!Number.isFinite(degrees)) return "Keine Angabe";
  const directions = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
  return `${directions[Math.round(degrees / 45) % 8]} · ${numberValue(value, 10, 0)}°`;
}

function weatherFor(day) {
  const iconId = Number(day.icon ?? day.icon1 ?? day.icon2);
  return weatherTypes[iconId] || ["◌", "Wetterlage"];
}

function metric(label, value) {
  const item = element("div", "metric");
  item.append(element("span", "detail-label", label));
  item.append(element("strong", "detail-value", value));
  return item;
}

function renderEmpty(stationId, message, description = `Für die DWD-Station ${stationId} liegt derzeit keine Prognose vor. Prüfe die Stations-ID oder versuche es später erneut.`) {
  currentPanel.replaceChildren();
  const state = element("div", "empty-state");
  state.append(element("span", "empty-symbol", "◌"));
  const copy = element("div");
  copy.append(element("h2", "", message));
  copy.append(element("p", "", description));
  state.append(copy);
  currentPanel.append(state);
  forecastGrid.replaceChildren();
  forecastCount.textContent = "Noch keine Prognose";
}

function renderHero(day) {
  const [symbol, condition] = weatherFor(day);
  const hero = element("div", "weather-hero");
  const main = element("div", "hero-main");
  main.append(element("p", "hero-date", dateLabel(day.dayDate)));
  main.append(element("p", "hero-temp", temperature(day.temperatureMax)));
  main.append(element("p", "hero-range", `Tiefstwert ${temperature(day.temperatureMin)}`));

  const weather = element("div", "hero-weather");
  weather.append(element("span", "weather-symbol", symbol));
  const label = element("div", "hero-condition");
  label.append(element("strong", "", condition));
  label.append(element("span", "", `Sonnenaufgang ${timeLabel(day.sunrise)}`));
  weather.append(label);

  const side = element("div", "hero-side");
  side.append(element("span", "", "Regen"));
  side.append(element("strong", "", `${numberValue(day.precipitation, 10)} mm`));
  hero.append(main, weather, side);
  currentPanel.replaceChildren(hero);
}

function renderDay(day, index) {
  const [symbol, condition] = weatherFor(day);
  const card = element("article", "day-card");
  card.style.animationDelay = `${Math.min(index, 5) * 40}ms`;

  const header = element("div", "day-header");
  header.append(element("span", "day-date", dateLabel(day.dayDate, { weekday: "short", day: "numeric", month: "short" })));
  header.append(element("span", "day-icon", symbol));
  card.append(header);

  const conditionLabel = element("p", "card-condition", condition);
  card.append(conditionLabel);
  const temps = element("p", "day-temp", temperature(day.temperatureMax));
  temps.append(element("span", "", temperature(day.temperatureMin)));
  card.append(temps);

  const details = element("div", "day-details");
  details.append(
    metric("Niederschlag", `${numberValue(day.precipitation, 10)} mm`),
    metric("Wind", `${numberValue(day.windSpeed, 10)} m/s`),
    metric("Böen", `${numberValue(day.windGust, 10)} m/s`),
    metric("Windrichtung", windDirection(day.windDirection)),
    metric("Sonne", day.sunshine == null ? "Keine Angabe" : `${numberValue(day.sunshine / 3600)} Std.`),
    metric("Mondphase (Code)", day.moonPhase == null ? "Keine Angabe" : String(day.moonPhase)),
    metric("Symbol Tag", day.icon1 == null ? "Keine Angabe" : String(day.icon1)),
    metric("Symbol Nacht", day.icon2 == null ? "Keine Angabe" : String(day.icon2))
  );
  card.append(details);

  const times = element("div", "day-times");
  times.textContent = `Sonne ${timeLabel(day.sunrise)}–${timeLabel(day.sunset)} · Mond ${timeLabel(day.moonrise)}–${timeLabel(day.moonset)}`;
  card.append(times);
  return card;
}

async function loadStation(stationId) {
  if (!/^\d+$/.test(stationId)) {
    apiStatus.dataset.state = "error";
    apiStatus.textContent = "Ungültige Stations-ID";
    renderEmpty(stationId, "Bitte gib eine gültige Stations-ID ein.");
    return;
  }

  stationInput.value = stationId;
  stationLabel.textContent = stationNames[stationId] ? `${stationNames[stationId]} · DWD-Station ${stationId}` : `DWD-Station ${stationId}`;
  apiStatus.dataset.state = "loading";
  apiStatus.textContent = "Daten werden geladen";
  currentPanel.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(`${apiBase}${encodeURIComponent(stationId)}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const days = payload.days;
    if (!Array.isArray(days)) throw new Error("Unerwartetes Datenformat");

    apiStatus.dataset.state = "success";
    apiStatus.textContent = "Verbindung zum DWD aktiv";
    updatedAt.textContent = `Abgerufen um ${new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date())} Uhr`;

    if (days.length === 0) {
      renderEmpty(stationId, "Für diese Station sind keine Daten verfügbar.");
      return;
    }

    renderHero(days[0]);
    forecastGrid.replaceChildren(...days.map(renderDay));
    forecastCount.textContent = `${days.length} ${days.length === 1 ? "Tag" : "Tage"} mit Prognose`;
  } catch (error) {
    apiStatus.dataset.state = "error";
    apiStatus.textContent = "DWD gerade nicht erreichbar";
    updatedAt.textContent = "Abruf fehlgeschlagen";
    renderEmpty(stationId, "Die Wetterdaten konnten nicht geladen werden.", "Der DWD-Abruf ist fehlgeschlagen. Prüfe die Stations-ID, deine Verbindung oder die Verfügbarkeit des DWD-Endpunkts.");
    console.error("DWD MOSMIX request failed:", error);
  } finally {
    currentPanel.removeAttribute("aria-busy");
  }
}

stationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadStation(stationInput.value.trim());
});

loadStation(stationInput.value);