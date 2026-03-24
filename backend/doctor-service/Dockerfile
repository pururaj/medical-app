FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/doctor-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
