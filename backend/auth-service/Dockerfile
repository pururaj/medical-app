FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/auth-service-*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
