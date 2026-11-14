# Klaslab

Gratis tools voor leerkrachten, per vak. Gewone HTML, CSS en JavaScript: geen build, geen account, alles draait in de browser.

## Tools

| Vak | Tool | Wat |
|---|---|---|
| Biologie | [Mutatie checker](biologie/mutatie-checker.html) | DNA naar eiwit voor en na een puntmutatie, vraaggenerator, export als meerkeuzevraag met sleutel |
| Chemie | [pH rekenaar](chemie/ph-rekenaar.html) | Stappenplan, oefeningengenerator met werkblad en leerlingenlink, meerkeuze uit denkfouten, foutdiagnose, puntenverdeling, zout raden, visualisaties |
| Chemie | [Buffers](chemie/buffer.html) | Henderson Hasselbalch, toevoegen van sterk zuur of base, buffercapaciteit |
| Chemie | [Titratiecurves](chemie/titratie.html) | Exacte curve, belangrijke punten, indicatoradvies, werkblad |
| Chemie | [Indicatoren](chemie/indicatoren.html) | Kleuren bij een pH, pH puzzels met sleutel |
| Chemie | [Neutralisatie](chemie/neutralisatie.html) | Reactievergelijking, benodigd volume, pH na mengen, oefeningen |

## Functies in elke tool

* **Delen**: link en QR code die exact dezelfde gegevens openen
* **Afdrukken**: werkbladen en verbetersleutels, ook als PDF
* **Projectie**: grote letters en stap voor stap uitwerken (pijltjestoetsen)
* **Variant**: dezelfde soort oefening met andere getallen

Oefenreeksen hebben een nummer. Met hetzelfde nummer krijg je dezelfde oefeningen, zodat een leerlingenlink en een afgedrukt werkblad overeenkomen.

## Persoonlijk

* **Instellingen** (`settings.html`): je naam en school (komen op elk werkblad), begroeting, favoriete tools bovenaan, vakken verbergen, licht/donker thema en accentkleur
* **Op al je toestellen**: instellingen staan in een Google Sheet, gekoppeld aan een persoonlijke code (bv. `ABCD-1234`) die je op een andere computer invult
* **Vraag een nieuwe functionaliteit aan**: knop rechtsonder op elke pagina, aanvragen komen in het tabblad `Aanvragen` van de Sheet

De databank is een Google Apps Script web app. Installatie: zie [apps-script/README.md](apps-script/README.md). Zonder databank werkt alles nog, maar enkel in de browser.

## Structuur

```
index.html          hub
settings.html       instellingen
assets/             gedeelde stijl en code (common.css, common.js, ph-core.js, indicators.js, qrcode.js)
                    config.js (URL van de databank), profile.js + personal.css (profiel, thema, aanvraagknop)
apps-script/        Code.gs voor de Google Sheet databank
biologie/
chemie/
```

Nieuwe tool: zet een HTML bestand in de map van het vak, laad `../assets/common.css`, `../assets/personal.css`, `../assets/config.js` en `../assets/profile.js` in de `<head>` en `../assets/common.js` onderaan, zet `<div id="kl-top"></div>` bovenaan en roep `KL.toolbar()` aan. Voeg daarna een kaart toe in `index.html` en de tool in `TOOLS` in `assets/profile.js`.

## Online zetten

Push naar GitHub en zet GitHub Pages aan: Settings → Pages → branch `main`, map `/ (root)`.

QR codes: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) van Kazuhiko Arase (MIT licentie).
