# Klaslab databank (Google Apps Script)

De databank is een Google Sheet met een Apps Script web app. Ze bewaart:

* **Profielen**: je instellingen (naam, school, favorieten, thema), gekoppeld aan een persoonlijke code
* **Aanvragen**: alles wat via "Vraag een nieuwe functionaliteit aan" binnenkomt

## Installeren (eenmalig, 5 minuten)

1. Maak een nieuwe Google Sheet, bv. "Klaslab databank".
2. In de Sheet: **Extensies → Apps Script**.
3. Vervang de inhoud van `Code.gs` door [Code.gs](Code.gs) uit deze map en klik op opslaan.
4. **Implementeren → Nieuwe implementatie** → type **Web-app**:
   * Uitvoeren als: **Ik**
   * Wie heeft toegang: **Iedereen**
5. Geef toestemming wanneer Google erom vraagt (je eigen account).
6. Kopieer de **web-app URL** (eindigt op `/exec`).
7. Plak die URL in [`assets/config.js`](../assets/config.js) bij `KL_API` en push naar GitHub.

De tabbladen `Profielen` en `Aanvragen` worden vanzelf aangemaakt bij het eerste gebruik.

## Code aanpassen

Na een wijziging in `Code.gs`: **Implementeren → Implementaties beheren → potloodje → Versie: Nieuwe versie → Implementeren**. De URL blijft dan dezelfde.

## Privacy

Wie de URL kent, kan aanvragen sturen en een profiel lezen of schrijven als hij de code kent. Bewaar dus geen gevoelige gegevens in je profiel. De code is 8 tekens uit 32 mogelijke (ruim een biljoen combinaties).
