FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/inventory-service-*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
