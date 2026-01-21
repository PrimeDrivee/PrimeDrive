# 🧪 Testumgebung - Setup & Wartung

Dieses Dokument beschreibt den Aufbau und die Wartung der konsistenten Testumgebung für PrimeDrive.

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                   Testumgebung (Local/Remote)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Frontend        │  │  Backend         │                 │
│  │  (Angular)       │  │  (Spring Boot)   │                 │
│  │  :4200           │  │  :8080           │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │                                        │
│           ┌─────────▼─────────┐                             │
│           │   MySQL Database  │                             │
│           │   :3306           │                             │
│           └───────────────────┘                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Docker-Compose Setup

### Full-Stack Testumgebung

**Datei:** `docker-compose.yml` (im Root-Verzeichnis)

```yaml
version: "3.8"

services:
  # Frontend Service
  frontend:
    build:
      context: ./PrimeDriveFrontend
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - backend
    environment:
      - API_URL=http://backend:8080
    networks:
      - primedrive-network
    container_name: primedrive-frontend

  # Backend Service
  backend:
    build:
      context: ./PrimeDriveBackend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/primedrive
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=rootpassword
    networks:
      - primedrive-network
    container_name: primedrive-backend

  # Database Service
  mysql:
    build:
      context: ./Database/Docker
      dockerfile: Dockerfile
    env_file:
      - .env
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=primedrive
    volumes:
      - mysql_data:/var/lib/mysql
      - ./Database/DeltaScripts:/docker-entrypoint-initdb.d
    networks:
      - primedrive-network
    container_name: primedrive-mysql

networks:
  primedrive-network:
    driver: bridge

volumes:
  mysql_data:
```

### Frontend Dockerfile

**Datei:** `PrimeDriveFrontend/Dockerfile`

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
COPY --from=builder /app/dist/prime-drive-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

**Datei:** `PrimeDriveBackend/Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 2️⃣ Schnellstart - Testumgebung lokal

### Voraussetzungen

- Docker Desktop installiert
- Git Repository geklont

### Starten

```bash
# 1. Ins Projektverzeichnis wechseln
cd /Users/fatlumepiroti/Coding/SchoolProjects/PrimeDrive

# 2. Backend bauen
cd PrimeDriveBackend
./mvnw clean package -DskipTests

# 3. Zurück ins Root-Verzeichnis
cd ..

# 4. All-in-One: Docker Compose starten
docker-compose up -d --build

# 5. Logs prüfen
docker-compose logs -f

# 6. Services prüfen
docker ps
```

### Zugriff auf Services

```
Frontend:  http://localhost:4200
Backend:   http://localhost:8080
Database:  localhost:3306 (MySQL Workbench)
```

### Stoppen

```bash
docker-compose down
```

---

## 3️⃣ Testumgebung für Remote-Zugang

### GitHub Actions: Automatisches Test-Deployment

**Datei:** `.github/workflows/test-deploy.yml`

```yaml
name: Test Environment Deploy

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build-test-env:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Frontend Image
        run: |
          docker build -f PrimeDriveFrontend/Dockerfile \
            -t primedrive-frontend:${{ github.sha }} \
            ./PrimeDriveFrontend

      - name: Build Backend Image
        run: |
          cd PrimeDriveBackend
          ./mvnw clean package -DskipTests
          docker build -f Dockerfile \
            -t primedrive-backend:${{ github.sha }} \
            .

      - name: Start Test Environment
        run: |
          docker-compose up -d

      - name: Wait for services
        run: |
          timeout 300 bash -c 'until curl -f http://localhost:8080/actuator/health; do sleep 5; done'

      - name: Run Integration Tests
        run: |
          cd PrimeDriveBackend
          ./mvnw test

      - name: Run Frontend Tests
        run: |
          cd PrimeDriveFrontend
          npm ci --legacy-peer-deps
          npm run test:ci

      - name: Cleanup
        if: always()
        run: docker-compose down
```

---

## 4️⃣ Zugang für Tester & Kunde

### 4.1 Lokale Testumgebung für Team

**Anforderungen:**

- Docker Desktop
- Git Clone des Repositories
- 5-10 Minuten Setup-Zeit

**Setup-Anleitung für Tester:**

```bash
# 1. Repository klonen
git clone https://github.com/PrimeDrivee/PrimeDrive.git
cd PrimeDrive

# 2. Testumgebung starten
docker-compose -f Database/docker-compose.yml up -d

# 3. Warten auf Services (ca. 30 Sekunden)
echo "Waiting for services..."
sleep 30

# 4. Browser öffnen
open http://localhost:4200  # Frontend
open http://localhost:8080  # Backend API

# Tests durchführen...

# 5. Nach dem Testen: Cleanup
docker-compose -f Database/docker-compose.yml down
```

### 4.2 Testumgebung für Kunden (Optional - Remote)

**Option A: Demonstration via Demo-Server**

```bash
# Deployment auf Public Demo-Server (z.B. DigitalOcean)
ssh demo@primedrive-test.example.com
docker-compose -f /app/docker-compose.yml restart
```

**Option B: VPN/Tunnel-Zugang**

```bash
# Lokale Testumgebung über SSH-Tunnel freigeben
ssh -R 4200:localhost:4200 -R 8080:localhost:8080 \
    tunnel@jump-server.example.com

# Kunde kann dann zugreifen:
# http://jump-server.example.com:4200
```

**Option C: Docker Hub Registry**

```bash
# Bilder zu Docker Hub pushen
docker tag primedrive-frontend:latest primedrivee/frontend:latest
docker push primedrivee/frontend:latest

# Kunde kann dann lokal starten:
docker pull primedrivee/frontend:latest
docker run -p 4200:80 primedrivee/frontend:latest
```

---

## 5️⃣ Wartung der Testumgebung

### 5.1 Regelmäßige Wartungsaufgaben

**Wöchentlich:**

- [ ] Docker Images updaten: `docker pull`
- [ ] Ungenutzte Images löschen: `docker image prune`
- [ ] Volumes überprüfen: `docker volume ls`

**Monatlich:**

- [ ] Datenbank-Backups prüfen
- [ ] Testdaten refreshen (DeltaScripts neu ausführen)
- [ ] Performance-Logs überprüfen

**Quartal:**

- [ ] Abhängigkeits-Updates (Java, Node.js)
- [ ] Docker Base-Images updaten
- [ ] Security-Scanning durchführen

### 5.2 Cleanup-Befehle

```bash
# Ungenutzte Images löschen
docker image prune -a

# Ungenutzte Volumes löschen
docker volume prune

# Alles ausmisten (⚠️ Vorsicht!)
docker system prune -a --volumes

# Spezifisches Container löschen
docker rm primedrive-frontend
docker rmi primedrive-frontend:old-tag
```

---

## 6️⃣ Troubleshooting

### Problem: Container starten nicht

```bash
# Logs überprüfen
docker-compose -f Database/docker-compose.yml logs mysql

# Port bereits belegt?
lsof -i :3306
lsof -i :8080
lsof -i :4200

# Lösung: Port freigeben oder in docker-compose ändern
# ports: ["3307:3306"]  # localhost:3307 statt 3306
```

### Problem: Datenbankverbindung fehlgeschlagen

```bash
# Datenbank-Status prüfen
docker-compose -f Database/docker-compose.yml exec mysql \
  mysql -u root -prootpassword -e "SHOW DATABASES;"

# Logs anschauen
docker-compose logs mysql

# DeltaScripts manuell ausführen
docker-compose exec mysql \
  mysql -u root -prootpassword primedrive < Database/DeltaScripts/000.000.000.000.sql
```

### Problem: Frontend zeigt "Cannot GET /"

```bash
# Nginx Config überprüfen
docker-compose exec frontend cat /etc/nginx/nginx.conf

# Build neu triggern
docker-compose -f Database/docker-compose.yml build --no-cache frontend
docker-compose -f Database/docker-compose.yml up -d frontend
```

---

## 7️⃣ Best Practices

✅ **Zu tun:**

- Konsistente Base-Images verwenden
- Volume-Mounts für Daten nutzen
- Environment-Variablen für Konfiguration
- `.env` Datei für Secrets (nicht in Git!)
- Automatische Datenbank-Migration via DeltaScripts

❌ **Zu vermeiden:**

- Hardcodierte Ports
- Root-Zugang in Containers
- Große Docker Images (Multi-Stage builds nutzen)
- Manuelle Datenbankänderungen (DeltaScripts verwenden)

---

## 8️⃣ Referenzen

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Best Practices for Docker](https://docs.docker.com/develop/dev-best-practices/)

---

**Version:** 1.0.0  
**Letztes Update:** 21. Januar 2026  
**Autoren:** PrimeDrive Team
