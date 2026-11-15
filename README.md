# Audio Studio Tycoon (Android)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)](android)
[![Accessibility: TalkBack Ready](https://img.shields.io/badge/Accessibility-TalkBack%20Ready-brightgreen.svg)]()
[![F-Droid Ready](https://img.shields.io/badge/F--Droid-Ready-blue.svg)](fdroid)

**Audio Studio Tycoon** ist eine tiefgründige Wirtschafts- und Audio-/Spieleentwickler-Simulation für Android von **1930 bis 2026** (plus optionalem Endlos-Modus), die von Grund auf für **blinde, sehbehinderte und sehende Spieler** entwickelt wurde (Deutsch & Englisch, automatische Spracherkennung).

---

## ✨ Features & Barrierefreiheit

* **100% TalkBack-optimiert (`AriaLiveQueue`):** Alle Steuerelemente, Statistiken, Zeitabläufe und Menüs sind mit Screenreadern vollständig bedienbar. Eine eigene Live-Region-Warteschlange (`#sr-announcer` für `assertive`, `#sr-polite` für `polite`) filtert Emojis aus Ansagen heraus und verhindert das Überlappen von Meldungen; ergänzt durch ein kontrastreiches OLED-Dark-Design.
* **Akustisches & haptisches Feedback:** `TycoonAudioEngine` nutzt OGG-Soundeffekte (`assets/*.ogg`) mit automatischem Web-Audio-API-Synthesizer-Fallback, Web Speech API TTS sowie Haptik-Vibration (`navigator.vibrate` / Capacitor Haptics).
* **Barrierefreie Zeitsteuerung im HUD:** Direkte Schaltflächen für **Pause/Weiter**, **1x**, **2x** sowie **+1 Woche** (manuelles wochenweises Weiterschalten mit gesprochener Rückmeldung) ermöglichen entspanntes Spielen ohne Zeitdruck.
* **100% Frei & Datenschutzfreundlich:** Keine Werbung, keine In-App-Käufe, kein Tracking. Vollständig Open Source unter MIT-Lizenz.

---

## 🎮 Überarbeitete Tycoon-Mechaniken (1930–2026)

* **Historische Zeitlinie (6 Ären, 1930–2026 + Endlos-Modus):**
  Start im Jahr **1930** in der *Hinterhof-Tonkabine (Garage)* mit `50.000 €` Startkapital, `150` Fans, `15` Forschungspunkten (FP) und **48 Wochen/Jahr**. Umfasst **51 historische Plattformen** mit laufenden Freischaltungen und Ausmusterungen (von *Hand-Abakus* und *Zuse Z1/Z3* bis zur Moderne), **97 jährliche historische Ereignisse**, **172 Themen** sowie ein dynamisches **Markttrend-Badge** im HUD.
* **Zeitgestaffelte Feature-Unlocks (18 Features):**
  Meilensteine wie *Soundtrack-Label* (**1985**), *Merchandising* (**1990**), *SoundCon Messe* & *Abo-Modell* (**1995**), *Streaming-Plattform* (**2005**), *Content Creators Sponsern* (**2010**), *VR Hardware Labor* (**2016**) oder *KI-Tools* (**2020**) schalten sich historisch passend frei.
* **Live-Synergie-Vorschau, Zielgruppen & Ideale Genre-Slider:**
  Im Entwicklungs-Modal wird die kombinierte **Thema-, Genre- und Zielgruppen-Synergie** in Echtzeit als Sterne-Bewertung (`0–3` bzw. `⚠️` bis `⭐⭐⭐`) angezeigt. **3 Zielgruppen** (*Jeder*, *Jugendliche*, *Hardcore-Gamer*) beeinflussen Kritikerwertung (`+4` bzw. `-5`) und Verkaufsfaktor (`1,15x` / `1,0x` / `0,75x`). Die Fokus-Slider (**Gameplay** & **Audio/Sound**) steuern den wöchentlichen Punktezuwachs — per Button **„Ideale Genre-Slider“** lässt sich das Optimalprofil des gewählten Genres direkt übernehmen.
* **Publisher-Verträge (5 Vertriebsmodelle):**
  Neben dem *Eigenverlag (Indie)* stehen **4 Publisher** (*Aetherwelle Distribution*, *Polyphonie Verlag*, *Global Sonic Records*, *OmniMedia Megacorp*) zur Auswahl. Publisher zahlen einen sofortigen **Vorschuss** (kann knappe Studio-Budgets direkt retten), erhöhen die **Marktreichweite** (`1,25x` bis `2,15x`), behalten dafür eine **Umsatzbeteiligung** (`25%` bis `40%`) ein und verlangen eine **Mindestwertung** (`+300` Bonus-Fans bei Erfolg, `-100` Fans bei Verfehlen).
* **Reihen & Fortsetzungen (Sequels):**
  Bereits veröffentlichte Titel können fortgesetzt werden (`1,20x` Verkaufsfaktor). Wird eine Fortsetzung auf einer **neueren Custom-Engine** entwickelt, erhält sie `+6` Qualitätsbonus (statt `-4` Franchise-Ermüdung bei identischer Engine).
* **Aktive Entwicklungs-Entscheidungen & QA-Feinschliff:**
  * **🔧 QA-Feinschliff & Mastering** (`1.200 €`, bis zu `3` Durchläufe pro Projekt): entfernt bis zu `4` Bugs und erhöht die Qualität um je `+3`.
  * **🎙️ Live-Akustik-Session** *(1× pro Projekt, `2.000 €`)*: liefert sofort `+25` Audio-Punkte, `+10` Feature-Punkte und `+5` Qualität.
* **Ära-gestaffelte Auftragsarbeiten (`📋`):**
  **8 Tonstudio-Aufträge** — 4 Starter-Aufträge ab **1930** (*Radio-Jingle & Stationskennung*, *Hörspiel-Geräuschkulisse (Foley)*, *Frequenzweiche & Signal-Optimierung*, *Orchester- & Tonträger-Mastering*) sowie 4 historische Folgeaufträge (*Arcade-Soundchip* ab **1972**, *CD-Redbook Soundtrack* ab **1985**, *5.1 Surround-Kino-Abmischung* ab **2000**, *VR Binaural Spatial-Audio Suite* ab **2016**) mit ära-skalierten Vergütungen (`1,0x` vor 1970, `1,6x` 1970–1989, `2,5x` ab 1990) und `+2` FP bei fristgerechtem Abschluss (oder Vertragsstrafe bei Ablauf).
* **Tonstudio-Ausbau & Personalentwicklung:**
  * **4 Studio-Ausbaustufen** (`+10` Prestige pro Stufe): *Hinterhof-Tonkabine (Garage)* (max. 4 Mitarbeiter), *Kleines Tonstudio* (`30.000 €`, max. 6, `+5%` Qualität), *Professionelles Funkhaus-Studio* (`90.000 €`, max. 8, `+12%` Qualität), *Internationaler Audio-Campus (HQ)* (`250.000 €`, max. 12, `+20%` Qualität).
  * **Mitarbeiter-Schulung & Urlaub:** Schulungen (`2.500 €`) erhöhen den Skill um `+1` (bis Stufe 10); 4-wöchiger Erholungsurlaub senkt Müdigkeit, steigert Moral und blockiert während der Urlaubszeit Schulungen.
* **Post-Release-Lebenszyklus:**
  * **📊 Spielbericht / Post-Mortem** *(1× pro Titel)*: analysiert Thema-Genre-Synergie, **Zielgruppen-Passung** und ideale Genre-Slider des veröffentlichten Spiels und vergibt `+10` FP sowie `+200` Fans.
  * **🔧 Patch** (`1.500 €`, 1× pro Spiel): behebt verbliebene Bugs und bringt `+2.500 €` Umsatz, `+600` Verkäufe sowie `+150` Fans.
  * **💿 Addon / DLC** (max. `2` pro Spiel, je `4.000 €`): steigert Umsatz (`+30%`, min. `6.000 €`), Verkäufe (`+25%`, min. `1.200`), Fans (`+250`) und FP (`+5`).
* **Forschung (1930–2024), Engine-Lizenzierung, Soundtrack-Label, SoundCon, Bank & Awards:**
  * **14 zeitgestaffelte Technologien** im Forschungslabor (`1930–2024`) — lückenlos von *Schalldämmung & Studio-Kabinen* (1930), *Magnetband-Aufnahme* (1938), *Vinyl-Schneidemaschine & Hi-Fi Mastering* (1948), *Stereo-Panorama-Mischpult* (1958), *Analoger Modular-Synthesizer* (1968) und *PCM Digital-Audio Sampling* (1975) bis zu *KI-Prozeduraler Soundtrack-Engine* (2015), *Echtzeit-Acoustic Raytracing* (2020) und *Neuronaler Echtzeit-Akustik* (2024).
  * **Engine-Drittlizenzierung:** Eigene Sound-Engines (mit ära-passenden Namen und Baujahr) können an Fremdstudios lizenziert werden und liefern wöchentliche Lizenzeinnahmen (`350 × Tech-Bonus` pro Woche), inklusive wöchentlicher Cashflow-Übersicht in der Bank (`0,5%` Wochenzins).
  * **Jährliche Preisverleihungen & Soundtrack-Label:** Automatische Tonträger-Releases ab 1985 (verstärkt durch *Vinyl-Mastering* `+15%` & *KI-Soundtrack-Engine* `+35%`), jährliche **GOTY-Verleihungen** (`score >= 85`) sowie das **Goldene Mikrofon (Bestes Audio-Design)** für audiofokussierte Titel (`score >= 75` & `audioPts >= 80`, `+15.000 €`, `+800` Fans).
* **Remaster, Mitarbeiter-Traits, Hardware-Labor, AudioPass, Konkurrenz & Meilensteine:**
  * **Remaster-Projekte & 5 Mitarbeiter-Spezialisierungen:** Ältere Hits lassen sich einmalig für `2.500 €` als *Remastered*-Edition mit `35 %` Startfortschritt und `+5` Qualitätsbonus auf moderner Plattform neu auflegen. Personal besitzt eines von **5 Spezialisierungs-Traits** (*Foley-Meister*, *Crunch-resistent*, *Synth-Pionier*, *Bug-Jäger*, *Story-Virtuose*) mit direktem Effekt auf Punkte, Ermüdung, Bugs und Score.
  * **Custom Hardware-Labor (ab 1975) & AudioPass-Abo (ab 1995):** **4 eigenentwickelte Hardware-Produkte** (`1975–2016`) bringen wöchentliche Lizenz-Royalties und dauerhafte Qualitätsboni (`+2` bis `+5`). Ab 1995 lässt sich der **AudioPass**-Abodienst mit Preisstufen und dynamischer Abonnentenbasis inklusive wöchentlicher Netto-Abrechnung betreiben.
  * **4 Konkurrenz-Studios & 10 Studio-Meilensteine:** Rivalisierende Studios lassen sich als Tochterstudios übernehmen (wöchentliche Dividenden und **+10 % Fan-Boost** auf Awards, Marketing & SoundCon); **10 Studio-Meilensteine** belohnen prägende Erfolge einmalig mit Cash, Fans und Forschungspunkten.

---

## 🛠️ Projektstruktur

Dieses Projekt basiert auf **Capacitor Android** (Web-Frontend in Vanilla JS, HTML5, CSS3, Web Audio API) ergänzt um eine optionale/native Rust-Kernbibliothek via JNI:
* `www/`: Webanwendung (`index.html`, `audio_engine.js`, `js/game_data.js`, `js/models.js`, `js/systems/*.js`, `js/ui/*.js`, Styles & Assets)
* `android/`: Natives Android-Projekt (Gradle, Capacitor Plugins, Ressourcen)
* `rust-core/`: Rust-Bibliothek (`lauju_app_core` v2.0.0) mit JNI-Funktionen für `de.lauri.audiostudiotycoon` (`sha256Hex`, `verifyIntegrity`, `sanitizeInput`, 2 Unit-Tests)
* `test_simulation.js`: Automatisierte Simulations-, Lokalisierungs- (327 DE/EN-Keys) und Barrierefreiheits-Testsuite (Node.js, **52 Testsuiten**)
* `fastlane/metadata/android/`: Metadaten und Grafiken für F-Droid und App-Stores
* `fdroid/`: F-Droid Metadaten-Rezept (`de.lauri.audiostudiotycoon.yml`)

---

## 🚀 Testen & Bauen aus dem Quellcode

Voraussetzungen:
* Node.js (`>= 22.0.0`) & npm (für Capacitor 8.5+)
* Java JDK `21` (z. B. Eclipse Temurin 21) & Android SDK
* Rust Toolchain (`cargo`) für `rust-core`

```bash
# 1. Abhängigkeiten installieren
npm ci

# 2. Automatisierte Tests ausführen (Web-Simulation & Rust-Core)
npm test
cd rust-core && cargo test && cd ..

# 3. Capacitor Android synchronisieren
npx cap sync android

# 4. Android APK kompilieren
cd android
./gradlew assembleRelease
```
Die generierte APK befindet sich anschließend in:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE) - frei und quelloffen für alle.
