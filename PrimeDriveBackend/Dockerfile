FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy built JAR from target directory
# Assumes: mvn clean package has been run before docker build
COPY target/*.jar app.jar

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
