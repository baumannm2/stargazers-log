# DWD-Wetterdashboard

Das Dashboard zeigt die Tagesprognose der DWD-WarnWetter-API für eine Stations-ID. Standardmäßig ist Station 10782 (Waldmünchen) eingestellt. Die Station liefert Prognosedaten und liegt rund 15 km von Furth im Wald entfernt; die alte Station Kötzting (2706) liefert keine aktuellen Daten mehr.

## Starten

Node.js 22 oder neuer wird benötigt. Im Projektordner starten:

```powershell
node --use-system-ca server.js
```

Danach `http://localhost:8001` im Browser öffnen. Der lokale Server stellt die Dashboard-Dateien bereit und leitet API-Anfragen weiter, da der DWD-Endpunkt Browserzugriffe von anderen Ursprüngen nicht per CORS freigibt. `--use-system-ca` nutzt zusätzlich vertrauenswürdige Zertifikate aus dem Betriebssystem-Zertifikatsspeicher.

Die Station kann über das Feld „Stations-ID“ geändert werden. Wenn der DWD für eine ID eine leere Prognose liefert, zeigt das Dashboard diesen Zustand an, statt Beispieldaten einzublenden.
