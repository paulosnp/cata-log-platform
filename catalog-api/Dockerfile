# --- Build stage: compila o JAR com Maven ---
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/
RUN ./mvnw package -DskipTests -B && \
    mv target/*.jar target/app.jar

# --- Runtime stage: apenas JRE + JAR ---
FROM eclipse-temurin:17-jre-alpine

RUN addgroup -S catalog && adduser -S catalog -G catalog

WORKDIR /app

COPY --from=build /app/target/app.jar app.jar

RUN chown catalog:catalog app.jar

USER catalog

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
