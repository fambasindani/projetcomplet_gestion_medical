# ===== Build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Le cache des dépendances est géré par les couches Docker : on copie pom.xml
# puis on lance directement le package (évite dependency:go-offline qui échoue
# sur certaines dépendances transitives fragiles).
ARG MAVEN_OPTS="-Dmaven.wagon.http.retryHandler.count=3 -Dmaven.wagon.httpconnectionManager.ttlSeconds=120"
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests clean package

# ===== Runtime =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 7035
ENTRYPOINT ["java", "-jar", "app.jar"]
