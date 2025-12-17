# 🛠️ DevOps Tools

Dieses Dokument beschreibt die in PrimeDrive eingesetzten DevOps-Tools und deren Zweck im Software Development Lifecycle.

---

## 📝 Plan

- **Git / GitHub**  
  Versionsverwaltung, Kollaboration über Pull Requests, Issue Tracking und Projektplanung.

---

## 💻 Code

- **Angular (Frontend)**  
  Entwicklung des Web-Frontends mit TypeScript, Komponentenarchitektur und RxJS.
- **Java Spring Boot (Backend)**  
  Entwicklung der REST-APIs und Business-Logik.
- **Visual Studio Code**  
  Haupteditor für Frontend-Entwicklung & Backend
- **IntelliJ IDEA**  
  IDE für Backend-Entwicklung in Java.

---

## 🏗️ Build

- **Maven**  
  Build- und Abhängigkeitsmanagement für das Java-Backend.
- **Angular CLI**  
  Build und Bundling des Frontends.
- **Docker (MySQL-Container)**  
  Bereitstellung und Build der Datenbankumgebung.
- **Bash Scripts + DeltaScripts**  
  Automatisiertes Erstellen und Aktualisieren der Datenbanktabellen und Inserts.

---

## 🧪 Test

- **ESLint**  
  Code-Qualitätssicherung für Angular/TypeScript.
- **Prettier**  
  Automatische Code-Formatierung.
- **JUnit (Java Tests)**  
  Unit- und Integrationstests für Spring Boot Services.
- **Jasmine / Karma (Angular Tests)**  
  Unit- und Integrationstests für das Frontend.
- **OWASP Dependency-Check**  
  Analyse von Projektabhängigkeiten auf bekannte Sicherheitslücken.
- **OWASP ZAP**  
  Dynamischer Sicherheitstest (DAST) der laufenden Anwendung zur Erkennung von Web-Sicherheitsluecken.  
  CI: Workflow `OWASP ZAP DAST` laeuft bei Pull Requests/Main-Pushes (Baseline) und woechentlich montags 03:00 UTC (Full Scan) bzw. manuell via `Actions > OWASP ZAP DAST`.  
  Konfiguration: Secret/Variable `ZAP_TARGET_URL` (Pflicht, Ziel-URL), optional `ZAP_AUTH_HEADER` fuer Auth-Header sowie Grenzwerte `ZAP_MAX_HIGH_ALERTS` / `ZAP_MAX_MEDIUM_ALERTS` (Standard 0/0).  
  Ergebnis: CI generiert HTML/XML/JSON/Markdown-Reports als Artefakt und bricht bei ueberschrittenen Grenzwerten ab.
- **Trivy**  
  Open-Source Scanner für Container-Images, Dateisysteme und Abhaengigkeiten (SCA); Integration in CI zur frühen Schwachstellen-Erkennung.

---

## 📦 Release

- **Git / GitHub**  
  Versionierung, Branch-Strategie und Release-Verwaltung.  
  Genutzte Branch-Strategie: Feature Branches, Dev-Branch für Integration, Main-Branch für stabile Releases.

---

## 🚀 Deploy

- **Maven**  
  Erzeugung und Deployment von Backend-Artefakten.
- **Angular CLI**  
  Erzeugung der Produktions-Builds für das Frontend.
- **Docker (Multi-Container Setup)**  
  Deployment von Frontend, Backend, Datenbank und optional Monitoring-Tools als Container-Services.
- **Docker Compose**
  Orchestrierung aller Container in einer integrierten Umgebung.
- **Bash Scripts**  
  Übergangslösung für DB-Updates über DeltaScripts.

---

## ⚙️ Operate

- **Logfiles**  
  Laufzeitanalyse, Debugging und Fehlerdiagnose.
- **User-Dokumentation**  
  Unterstützung für Anwender und Betrieb.

---

## 📊 Monitor

- **Elasticsearch**  
  Sammlung, Suche und Analyse von Logs zur Laufzeitüberwachung.
- **Prometheus**  
  Sammeln von Service- und Systemmetriken (via Exporter) zur Laufzeitüberwachung und Alerting.

---

## 🚀 Actions

Hier findest du die zentralen Aktionen und Verknüpfungen rund um das Projekt.

[➡️ Zurück zum Konzept](../Konzept.md#devops)
