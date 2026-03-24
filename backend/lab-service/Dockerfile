FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/lab-service-*.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
