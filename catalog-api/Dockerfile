# --- Build stage: compila o JAR com Maven ---
FROM maven:3.9-amazoncorretto-17 AS build

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src/ src/
RUN mvn package -DskipTests -B && \
    mv target/*.jar target/app.jar

# --- Runtime stage: apenas JRE + JAR ---
FROM amazoncorretto:17-alpine

RUN addgroup -S catalog && adduser -S catalog -G catalog

WORKDIR /app

COPY --from=build /app/target/app.jar app.jar

RUN mkdir -p /app/uploads/imagens && \
    chown -R catalog:catalog /app/uploads app.jar

USER catalog

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
