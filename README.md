# DWD-Wetterdashboard

Das Dashboard zeigt die Tagesprognose der DWD-WarnWetter-API für eine Stations-ID. Standardmäßig ist Station 10782 (Waldmünchen) eingestellt. Die Station liefert Prognosedaten und liegt rund 15 km von Furth im Wald entfernt; die alte Station Kötzting (2706) liefert keine aktuellen Daten mehr.

## Datenquelle und Vorschau

Die Seite lädt MOSMIX-Prognosen direkt aus dem DWD-S3-Endpunkt, der Browserzugriffe erlaubt. `stationOverview` ist durch CORS für Browser gesperrt und kann deshalb nicht direkt von GitHub Pages genutzt werden.

GitHub Pages stellt die Seite statisch bereit; dort ist kein Node-Server nötig. Für eine lokale Vorschau wird Node.js benötigt. Im Projektordner starten:

```powershell
node server.js
```

Danach `http://localhost:8001` im Browser öffnen.

Die Station kann über das Feld „Stations-ID“ geändert werden. Wenn der DWD für eine ID eine leere Prognose liefert, zeigt das Dashboard diesen Zustand an, statt Beispieldaten einzublenden.
