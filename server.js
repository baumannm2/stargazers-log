const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 8001;
const root = __dirname;
const staticFiles = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"]
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" });
    response.end("Method not allowed");
    return;
  }

  if (url.pathname === "/api/weather") {
    const stationId = url.searchParams.get("stationId") || "";
    if (!/^\d+$/.test(stationId)) {
      sendJson(response, 400, { error: "Ungültige Stations-ID" });
      return;
    }

    try {
      const upstreamUrl = `https://app-prod-ws.warnwetter.de/v16/stationOverview?stationIds=${encodeURIComponent(stationId)}`;
      const upstream = await fetch(upstreamUrl, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
      if (!upstream.ok) {
        sendJson(response, 502, { error: `DWD antwortete mit HTTP ${upstream.status}` });
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(await upstream.text());
    } catch (error) {
      console.error("DWD request failed:", error);
      sendJson(response, 502, { error: "DWD-Daten konnten nicht abgerufen werden" });
    }
    return;
  }

  const file = staticFiles[url.pathname];
  if (!file) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  fs.readFile(path.join(root, file[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end("Datei konnte nicht gelesen werden");
      return;
    }
    response.writeHead(200, { "Content-Type": file[1] });
    response.end(content);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`DWD-Wetterdashboard läuft unter http://127.0.0.1:${port}`);
});