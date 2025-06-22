# ----- GIAI ĐOẠN 1: Build ứng dụng với Maven -----
# Sử dụng một image chứa sẵn Maven và JDK 17 để làm môi trường build
FROM maven:3.9.6-eclipse-temurin-17-focal AS builder

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file pom.xml trước để tận dụng cache của Docker
COPY pom.xml .
RUN mvn dependency:go-offline

# Sao chép toàn bộ source code còn lại
COPY src ./src

# Chạy lệnh build của Maven để tạo ra file .jar trong thư mục /app/target/
RUN mvn clean package -DskipTests


# ----- GIAI ĐOẠN 2: Chạy ứng dụng -----
# Bắt đầu từ một image Java 17 gọn nhẹ cho môi trường chạy thật
FROM openjdk:17-slim-bullseye

WORKDIR /app

# Sao chép file .jar đã được build ở giai đoạn "builder" vào đây
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Lệnh để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]