# Audio Studio Tycoon (Android)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)](android)
[![Accessibility: TalkBack Ready](https://img.shields.io/badge/Accessibility-TalkBack%20Ready-brightgreen.svg)]()
[![F-Droid Ready](https://img.shields.io/badge/F--Droid-Ready-blue.svg)](fdroid)

**Audio Studio Tycoon** ist eine tiefgründige Wirtschafts- und Spieleentwickler-Simulation für Android, die von Grund auf für **blinde, sehbehinderte und sehende Spieler** entwickelt wurde.

---

## ✨ Features & Barrierefreiheit

* **100% TalkBack-optimiert:** Alle Steuerelemente, Statistiken, Zeitabläufe und Menüs sind mit Screenreadern vollständig bedienbar.
* **Akustisches Feedback:** Dynamische Sounds, Sprachausgabe (TTS) und Haptik begleiten jede Aktion.
* **Eigenes Studio führen:** Starte 1980 in der Garage und expandiere bis in das moderne Zeitalter.
* **Blockbuster kreieren:** Entwickle Spielkonzepte, Engines, Grafik- und Soundstile, führe Marktforschung durch und leite dein Team.
* **100% Frei & Datenschutzfreundlich:** Keine Werbung, keine In-App-Käufe, kein Tracking. Vollständig Open Source unter MIT-Lizenz.

---

## 🛠️ Projektstruktur

Dieses Projekt basiert auf **Capacitor Android** mit reinem Web-Frontend (Vanilla JS, HTML5, CSS3, Web Audio API):
* `www/`: Webanwendung (Quellcode des Spiels, Sound-Engine, Styles)
* `android/`: Natives Android-Projekt (Gradle, Capacitor Plugins, Ressourcen)
* `fastlane/metadata/android/`: Metadaten und Grafiken für F-Droid und App-Stores
* `fdroid/`: F-Droid Metadaten-Rezept (`de.lauri.audiostudiotycoon.yml`)

---

## 🚀 Bauen aus dem Quellcode

Voraussetzungen:
* Node.js (>= 18) & npm
* Java JDK (>= 17 oder 21)
* Android SDK

```bash
# 1. Abhängigkeiten installieren
npm ci

# 2. Capacitor Android synchronisieren
npx cap sync android

# 3. Android APK kompilieren
cd android
./gradlew assembleRelease
```
Die generierte APK befindet sich anschließend in:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE) - frei und quelloffen für alle.
