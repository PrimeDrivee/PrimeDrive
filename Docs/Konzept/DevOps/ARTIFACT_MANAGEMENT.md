# 📦 Artefaktverwaltung (Artifact Management)

Dieses Dokument beschreibt die Strategie und Implementierung der Artefaktverwaltung im PrimeDrive-Projekt.

---

## 🏗️ Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                   Git Repository (GitHub)                    │
├─────────────────────────────────────────────────────────────┤
│                      CI/CD Pipeline                          │
│  (GitHub Actions Workflows: build & publish)                 │
├─────────────────────────────────────────────────────────────┤
│               GitHub Packages Registry                        │
│  ├─ Maven Repository (Java Backend)                          │
│  └─ npm Registry (Angular Frontend)                          │
├─────────────────────────────────────────────────────────────┤
│              Download / Dependency Management                 │
│  ├─ Maven (pom.xml)                                          │
│  └─ npm (package.json)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Artefakt-Repository

### Gewählte Lösung: **GitHub Packages**

#### Begründung:

- ✅ **Integriert mit GitHub**: Kein separates Tool erforderlich
- ✅ **Kostenlos**: Für öffentliche und private Repositories
- ✅ **Token-basierte Authentifizierung**: Einfach mit GitHub Actions zu integrieren
- ✅ **Unterstützt Multiple Formate**: Maven, npm, Docker, etc.
- ✅ **RBAC**: Granulare Zugriffskontrolle über GitHub Teams

#### Alternativen (evaluiert):

| Repository          | Vorteile                                  | Nachteile                                      |
| ------------------- | ----------------------------------------- | ---------------------------------------------- |
| **Nexus**           | Enterprise-Features, Multi-Format Support | Selbstgehostet, komplexe Setup, Kostenintensiv |
| **Artifactory**     | Powerful, viele Plugins                   | Teuer, overkill für Schulprojekt               |
| **GitLab**          | Schön, GitLab-integriert                  | Nicht relevant (GitHub wird genutzt)           |
| **GitHub Packages** | ✅ **Gewählt**                            | Weniger Features als Nexus/Artifactory         |

---

## 2️⃣ Versionierungsstrategie

### Semantic Versioning (SemVer) 2.0.0

**Format:** `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

#### Regeln:

- **MAJOR**: Inkompatible API-Änderungen
- **MINOR**: Neue Funktionalität (rückwärts-kompatibel)
- **PATCH**: Bugfixes und Patches
- **PRERELEASE** (optional): `alpha`, `beta`, `rc`
- **BUILD** (optional): `build.123`, `git.abc123f`

#### Beispiele:

```
1.0.0          → Release
1.0.1          → Patch-Release (Bugfix)
1.1.0          → Minor-Release (neue Feature)
2.0.0          → Major-Release (Breaking Change)
1.0.0-alpha    → Alpha-Version
1.0.0-beta.1   → Beta-Version 1
1.0.0-rc.1     → Release Candidate
```

#### Release-Zyklus:

```
main (stable)
├─ v0.1.0 ─────► Release Tag
├─ v0.2.0 ─────► Release Tag
└─ v1.0.0 ─────► Major Release Tag

feature/ branches
├─ feature/OPS-004 (dev work)
└─ v1.0.0-beta.1 (pre-release)
```

---

## 3️⃣ Implementierung

### A) Backend (Java / Maven)

#### pom.xml Konfiguration

```xml
<groupId>com.primedrive</groupId>
<artifactId>primedrive-backend</artifactId>
<version>0.1.0</version>

<distributionManagement>
  <repository>
    <id>github</id>
    <name>GitHub Packages</name>
    <url>https://maven.pkg.github.com/PrimeDrivee/PrimeDrive</url>
  </repository>
</distributionManagement>
```

#### settings.xml (lokal/CI)

Automatisch per GitHub Actions mit `GITHUB_TOKEN` authentifiziert.

#### Publishing

```bash
# Lokal (mit GitHub Token)
export GITHUB_ACTOR=<username>
export GITHUB_TOKEN=<personal-access-token>
mvn deploy -DskipTests

# CI/CD (automatisch via GitHub Actions)
```

---

### B) Frontend (Angular / npm)

#### package.json Konfiguration

```json
{
  "name": "@primedrivee/primedrive-frontend",
  "version": "0.1.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

#### .npmrc (lokal/CI)

```plaintext
@primedrivee:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<GITHUB_TOKEN>
```

#### Publishing

```bash
# Lokal
npm publish

# CI/CD (automatisch via GitHub Actions)
```

---

## 4️⃣ CI/CD Integration

### GitHub Actions Workflow

**Trigger:** Push zu `main` oder Tags matching `v*.*.*`

```yaml
on:
  push:
    branches: ["main"]
    tags:
      - "v*.*.*"
```

#### Backend Publishing Steps

```yaml
- name: Publish Backend to GitHub Packages
  if: startsWith(github.ref, 'refs/tags/v')
  working-directory: PrimeDriveBackend
  run: ./mvnw deploy -DskipTests
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Frontend Publishing Steps

```yaml
- name: Publish Frontend to GitHub Packages
  if: startsWith(github.ref, 'refs/tags/v')
  working-directory: PrimeDriveFrontend
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5️⃣ Release-Prozess (Checkliste)

### Schritt 1: Vorbereitung

- [ ] Alle Features in `main` gemergt
- [ ] Tests erfolgreich durchgelaufen (`npm run test:ci`)
- [ ] Dokumentation aktualisiert
- [ ] CHANGELOG.md aktualisiert

### Schritt 2: Versionierung

- [ ] Version in `PrimeDriveBackend/pom.xml` erhöhen
- [ ] Version in `PrimeDriveFrontend/package.json` erhöhen
- [ ] Commit: `git commit -am "Release v0.1.0"`

### Schritt 3: Tag erstellen

```bash
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0
```

### Schritt 4: Automatisches Publishing

- [ ] GitHub Actions Workflow startet automatisch
- [ ] Backend wird zu GitHub Packages (Maven) published
- [ ] Frontend wird zu GitHub Packages (npm) published
- [ ] Artifacts sind unter Releases verfügbar

### Schritt 5: Verifikation

- [ ] GitHub Release anschauen
- [ ] Maven Artifact in Packages sichtbar
- [ ] npm Packet in Packages sichtbar

---

## 6️⃣ Verwendung der Artefakte

### Backend-Abhängigkeit (andere Projekte)

**pom.xml:**

```xml
<repository>
  <id>github</id>
  <name>GitHub Packages</name>
  <url>https://maven.pkg.github.com/PrimeDrivee/PrimeDrive</url>
</repository>

<dependency>
  <groupId>com.primedrive</groupId>
  <artifactId>primedrive-backend</artifactId>
  <version>0.1.0</version>
</dependency>
```

**settings.xml:**

```xml
<server>
  <id>github</id>
  <username>USERNAME</username>
  <password>PERSONAL_ACCESS_TOKEN</password>
</server>
```

### Frontend-Abhängigkeit (andere Projekte)

**package.json:**

```json
{
  "dependencies": {
    "@primedrivee/primedrive-frontend": "0.1.0"
  }
}
```

**.npmrc:**

```plaintext
@primedrivee:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=GITHUB_TOKEN
```

---

## 7️⃣ Best Practices

### ✅ Zu beachten

1. **Versionierung konsistent halten**
   - Backend und Frontend auf gleiche Version synchronisieren
   - Nur bei kompatiblen Releases veröffentlichen

2. **CHANGELOG pflegen**

   ```
   ## [0.1.0] - 2026-01-21
   ### Added
   - Initial release
   - Jasmine testing setup

   ### Fixed
   - TypeScript build issues
   ```

3. **Git Tags nutzen**
   - Immer mit `v` prefix taggen: `v0.1.0`
   - Annotated Tags: `git tag -a v0.1.0 -m "message"`

4. **Tokens sicher verwalten**
   - `GITHUB_TOKEN` wird automatisch in CI/CD injiziert
   - Lokal: Personal Access Token mit `packages:read` permission

5. **Snapshot vs Release**
   - Aktuell nur Release-Versionen in GitHub Packages
   - Snapshot-Versions (`-SNAPSHOT`) werden nicht published

### ⚠️ Zu vermeiden

- ❌ Mehrere Versionen in parallel publishen (verwirrend)
- ❌ Versionsnummern unterschiedlich zwischen Frontend/Backend
- ❌ Direkte Commits zu `main` (nur über Pull Requests)
- ❌ Token in Logs oder Code committen

---

## 8️⃣ Monitoring & Wartung

### Repository-Status überprüfen

**GitHub UI:** `PrimeDrive` → `Packages`

### Abhängigkeiten aktualisieren

```bash
# Backend
cd PrimeDriveBackend
./mvnw dependency:update-snapshots

# Frontend
cd PrimeDriveFrontend
npm outdated
npm update
```

### Alte Versionen löschen

GitHub UI → Packages → Version → Delete

---

## 9️⃣ Troubleshooting

### Maven / Backend Publishing-Fehler

#### **403 Forbidden** bei Maven Deploy

**Problem:** `Failed to deploy artifacts: status code: 403, reason phrase: Forbidden (403)`

**Ursachen:**

- `GITHUB_TOKEN` hat keine ausreichenden Permissions
- `settings.xml` wird nicht korrekt erstellt
- Authentifizierung wird nicht an Maven übergeben

**Lösungen:**

1. **settings.xml Debug:** Überprüfen Sie, ob die Datei unter `$HOME/.m2/settings.xml` erstellt wird

   ```bash
   cat ~/.m2/settings.xml
   ```

2. **Umgebungsvariablen prüfen:** Stellen Sie sicher, dass `GITHUB_ACTOR` und `GITHUB_TOKEN` gesetzt sind

   ```bash
   echo $GITHUB_ACTOR
   echo $GITHUB_TOKEN
   ```

3. **Token-Permissions:** Der Token braucht mindestens diese Scopes:
   - `write:packages`
   - `read:packages`

   ⚠️ **Hinweis:** Der automatische `GITHUB_TOKEN` in GitHub Actions kann manchmal zu Permissions-Problemen führen.

4. **Alternative:** Verwenden Sie einen **Personal Access Token (PAT)** statt `GITHUB_TOKEN`:

   ```bash
   Settings → Developer settings → Personal access tokens → Generate new token
   # Scopes: write:packages, read:packages
   # Speichern Sie ihn als Repository Secret: PUBLISH_TOKEN
   ```

   Dann im Workflow anpassen:

   ```yaml
   env:
     GITHUB_ACTOR: ${{ github.actor }}
     GITHUB_TOKEN: ${{ secrets.PUBLISH_TOKEN }}
   ```

---

### npm / Frontend Publishing-Fehler

#### **404 Not Found** bei npm publish

**Problem:** `404 Not Found - PUT https://npm.pkg.github.com/primedrive-frontend`

**Ursachen:**

- npm ist nicht authentifiziert bei GitHub Packages
- `.npmrc` nicht korrekt konfiguriert
- Registry-URL nicht korrekt gesetzt

**Lösungen:**

1. **Lokal Testen:**

   ```bash
   cd PrimeDriveFrontend

   # .npmrc überprüfen
   cat .npmrc

   # Token setzen
   export NODE_AUTH_TOKEN=<GITHUB_TOKEN>

   # Mit expliziter Registry publishen
   npm publish --registry https://npm.pkg.github.com/
   ```

2. **Workflow-Debug:** `npm config` vor publish aufrufen

   ```yaml
   - name: Debug npm config
     run: npm config list

   - name: Publish
     run: npm publish --registry https://npm.pkg.github.com/ -d
   ```

3. **Alternative: Ghcr.io nutzen** (Docker-basiert)
   - Wenn npm Publishing problematisch bleibt, können Sie die Anwendung auch als Docker-Image publishen

---

### Allgemeine Tipps

| Fehler                      | Debug-Befehl                                           |
| --------------------------- | ------------------------------------------------------ |
| Maven nicht authentifiziert | `./mvnw deploy -X` (Enable debug logging)              |
| npm nicht authentifiziert   | `npm publish -d` (Debug mode)                          |
| Settings nicht gefunden     | `ls -la ~/.m2/`                                        |
| Token abgelaufen            | Repository Settings → Secrets and variables überprüfen |

---

## 🔟 Artefaktverwaltung - Operativer Betrieb

### 10.1 Nutzung und Wiederverwendung von Artefakten

#### Build-Artefakte beziehen

**GitHub Actions Artifacts:**

```
Repository → Actions → [Workflow Name] → Artifacts
```

**Download-Optionen:**

1. **Web UI**: Einzelnes Artifact herunterladen
2. **CLI**: `gh run download <RUN_ID> -n <ARTIFACT_NAME>`
3. **Programmatisch**: GitHub API verwenden

#### Wiederverwendung in lokaler Entwicklung

**Backend JAR verwenden:**

```bash
cd PrimeDriveFrontend

# JAR in lokal entwickeltem Frontend testen
java -jar primedrive-backend-0.1.9.jar
```

**Frontend Build verwenden:**

```bash
# Downloaded dist/ Folder in Static Server deployen
cd primedrive-frontend-dist-v0.1.9
python -m http.server 8080
```

#### Abhängigkeitsmanagement

**Backend - Maven Dependency mit lokalem JAR:**

```xml
<!-- Falls veröffentlicht zu GitHub Packages -->
<dependency>
  <groupId>com.primedrive</groupId>
  <artifactId>primedrive-backend</artifactId>
  <version>0.1.9</version>
</dependency>
```

**Frontend - npm Dependency mit veröffentlichtem Package:**

```json
{
  "dependencies": {
    "primedrive-frontend": "0.1.9"
  }
}
```

---

### 10.2 Maintenance & Cleanup-Strategie

#### Automatische Retention Policies

**GitHub Actions Artifacts:**

- **Retention**: 90 Tage (eingestellt im Workflow)
- **Automatisches Löschen**: Nach 90 Tagen

**GitHub Releases** (wenn später aktiviert):

- **Retention**: Unbegrenzt (manuelle Verwaltung)
- **Speicherplatz**: Kostenlos für öffentliche Repos

#### Manuelle Cleanup-Operationen

**GitHub UI - Artifacts löschen:**

```
1. Repository → Actions
2. [Workflow Run] → Artifacts
3. [Artifact] → Delete
```

**GitHub UI - alte Releases löschen:**

```
1. Repository → Releases
2. [Release] → Delete
3. Confirm
```

**CLI - Artifacts löschen:**

```bash
# Alle Artifacts eines Workflows löschen
gh run list --workflow=newbuild.yml --limit=10 | grep COMPLETED
gh run delete <RUN_ID>

# Oder einzelnes Artifact
gh run download <RUN_ID> --name primedrive-backend-v0.1.0
# manuell löschen
```

#### Cleanup-Scheduling

**Wöchentliches Cleanup (optional):**

```yaml
# .github/workflows/cleanup-artifacts.yml
name: Weekly Artifact Cleanup

on:
  schedule:
    - cron: "0 3 * * 0" # Sunday 3 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete old artifacts
        uses: geekyeggo/delete-artifact@v2
        with:
          name: "*"
          failOnError: false
```

---

### 10.3 Qualitätssicherung & Audit

#### Prüf-Checkliste (monatlich)

- [ ] **Größe überprüfen**:

  ```bash
  du -sh ~/.m2/repository/com/primedrive/
  du -sh ~/.npm/primedrive*
  ```

- [ ] **Versionierung konsistent**:
  - Backend und Frontend auf gleiche Version
  - SemVer Format eingehalten

- [ ] **Alte Versionen identifizieren**:
  - Older as 6 months: candidates for deletion
  - Unused versions: remove

- [ ] **Abhängigkeitsupdate überprüfen**:

  ```bash
  mvn dependency:tree | grep SNAPSHOT  # sollte leer sein
  npm outdated                          # sollte leer oder geplant sein
  ```

- [ ] **Artifakt-Integrität prüfen**:

  ```bash
  # Backend JAR Test
  java -jar primedrive-backend-*.jar --version

  # Frontend Build Test
  ls primedrive-frontend-dist-*/dist/index.html
  ```

#### Audit-Bericht Template

```markdown
# Artefakt-Audit Report

**Datum:** 2026-01-28
**Durchgeführt von:** [Name]

## Größen-Übersicht

- Backend Repository: [size]
- Frontend Repository: [size]
- Total: [size]

## Versionen vorhanden

- Backend: v0.1.0 - v0.1.9 (9 versions)
- Frontend: v0.1.1 - v0.1.9 (9 versions)

## Zu löschende Versionen

- Keine (alle aktiv verwendet)

## Recommendations

- [Details]
```

---

### 10.4 Disaster Recovery

#### Artefakt-Wiederherstellung

**Wenn ein Artefakt gelöscht wurde:**

1. Git History überprüfen: `git log --all`
2. Tag überprüfen: `git tag -l v*`
3. **Neu builden**: `git checkout v0.1.5 && ./mvnw clean package`

**Wenn GitHub Actions gelöscht wurde:**

1. Lokal über Git Tag neu builden
2. Oder aus Docker Image (falls verfügbar)

#### Backup-Strategie

**Empfohlen - monatlich durchführen:**

```bash
# Alle Artefakte lokal archivieren
mkdir -p ./artifact-backups/$(date +%Y-%m)
gh run list --workflow=newbuild.yml --limit=100 | while read line; do
  gh run download $(echo $line | awk '{print $1}') -D ./artifact-backups/$(date +%Y-%m)/
done

# Archivieren
tar -czf artifact-backups-$(date +%Y-%m).tar.gz ./artifact-backups/
```

---

## 🔟 Referenzen

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/managing-workflow-runs/about-workflow-runs#artifacts)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Maven Deployment Guide](https://maven.apache.org/guides/mini/guide-deployment-to-a-central-mirror.html)
- [npm publish Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)

---

**Version:** 1.1.0  
**Letztes Update:** 21. Januar 2026  
**Autoren:** PrimeDrive Team
