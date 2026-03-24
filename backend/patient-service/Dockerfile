FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/patient-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
