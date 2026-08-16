# ==========================================
# Stage 1: Build the Application
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Step 1: Copy pom.xml and download dependencies first.
# This allows Docker to cache the dependencies. If you only change your Java code,
# Docker won't re-download the internet, saving minutes on your build time.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Step 2: Copy the source code and compile the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Create the Lightweight Runtime Image
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Create a non-root user and runtime directories with proper permissions
RUN addgroup -S spring && adduser -S spring -G spring && \
    mkdir -p /app/storage/documents /app/certs && \
    chown -R spring:spring /app

USER spring

# Copy only the compiled JAR file from the builder stage
COPY --chown=spring:spring --from=builder /app/target/*.jar app.jar

# Document that this container exposes port 1818
EXPOSE 1818

# Run the application with JVM memory limits configured for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]