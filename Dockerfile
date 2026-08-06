# ── Stage 1: Build with Maven ────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy Maven wrapper and pom first (better layer caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable and pre-download dependencies
RUN chmod +x mvnw && mvn dependency:go-offline -B -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# ── Stage 2: Lightweight runtime ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/staynest-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
