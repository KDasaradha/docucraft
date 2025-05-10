---
title: Docker Compose
description: Placeholder content for Docker Compose.
order: 1
---

# Docker Compose

# Docker Compose Setup

This guide explains how to set up a development environment using Docker Compose with multiple services, including Python, Node.js, Redis, PostgreSQL, Selenium, Jenkins, and SonarQube. Each of these services is configured in the `docker-compose.yml` file and serves a unique role in the development and testing pipeline.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Docker Services Overview

### 1. **Python Service**

The Python service uses the `python:3.10.11` image and mounts the current working directory into the container for development purposes.

**Example usage**:

```bash
docker-compose run python python my_script.py
```

**Configuration**:

- **Image**: `python:3.10.11`
- **Volume**: `.:/app` mounts the current directory into the container.
- **Working Directory**: `/app`

### 2. **Node Service**

This service uses the `node:21.2.0` image for running Node.js applications.

**Example usage**:

```bash
docker-compose run node npm install
docker-compose run node npm start
```

**Configuration**:

- **Image**: `node:21.2.0`
- **Volume**: `.:/app` mounts the current directory into the container.
- **Working Directory**: `/app`

### 3. **Redis Service**

Redis is a powerful in-memory key-value store used for caching and real-time operations.

**Configuration**:

- **Image**: `redis:latest`
- **Port**: `6379:6379` maps the default Redis port to the host.

### 4. **PostgreSQL Service**

This service is configured for the PostgreSQL database.

**Configuration**:

- **Image**: `postgres:latest`
- **Ports**: `5432:5432` maps the default PostgreSQL port to the host.
- **Environment**:
  - `POSTGRES_USER`: Username for the database (default: `postgres`).
  - `POSTGRES_PASSWORD`: Password for the database.
  - `POSTGRES_DB`: Database name (default: `postgres`).

**Example usage**:

```bash
docker-compose run postgres psql -U postgres -d postgres
```

### 5. **SonarQube Service**

SonarQube is used for continuous code quality inspection.

**Configuration**:

- **Image**: `sonarqube:latest`
- **Ports**: `9000:9000` exposes the SonarQube dashboard on port 9000.
- **Environment**:
  - `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true`: Disable Elasticsearch bootstrap checks for SonarQube.

**Example usage**:
Access SonarQube at `http://localhost:9000`.

### 6. **Selenium Service**

The Selenium service provides a standalone Chrome browser for automated browser testing.

**Configuration**:

- **Image**: `selenium/standalone-chrome`
- **Ports**: `4444:4444` exposes the Selenium server for remote WebDriver requests.

### 7. **Postman (Newman) Service**

Postman’s `newman` service allows you to run Postman collections for API testing.

**Configuration**:

- **Image**: `postman/newman`
- **Volumes**: Mount the `collections` folder for storing test collections (`./collections:/etc/newman`).
- **Command**: Run a Postman collection using the command: `run /etc/newman/my_collection.json`.

**Example usage**:

```bash
docker-compose run postman
```

### 8. **Jenkins Service**

Jenkins is configured for continuous integration and continuous deployment (CI/CD).

**Configuration**:

- **Image**: `jenkins/jenkins:lts`
- **Ports**:
  - `8080:8080` for the Jenkins dashboard.
  - `50000:50000` for Jenkins agent communications.
- **Volumes**: `jenkins_data:/var/jenkins_home` stores Jenkins data.

**Example usage**:
Access Jenkins at `http://localhost:8080`.

## Setting Up the Environment

1. **Clone your project** (if applicable):

   ```bash
   git clone https://your-repository-url.git
   cd your-project-directory
   ```

2. **Run Docker Compose**:
   Bring up all services with the following command:

   ```bash
   docker-compose up
   ```

   This will start all services defined in `docker-compose.yml`.

3. **Access Services**:
   - **Python**: You can run Python scripts by connecting to the container.

     ```bash
     docker-compose run python python my_script.py
     ```

   - **Node**: You can install dependencies and run a Node.js application.

     ```bash
     docker-compose run node npm install
     docker-compose run node npm start
     ```

   - **Redis**: Redis will be available on `localhost:6379`.
   - **PostgreSQL**: Connect to PostgreSQL at `localhost:5432` using the credentials in the environment section.
   - **SonarQube**: Visit `http://localhost:9000` for the SonarQube dashboard.
   - **Selenium**: Selenium Chrome will be available on port `4444`.
   - **Postman**: Postman collections can be run automatically by placing them in the `./collections` folder.
   - **Jenkins**: Jenkins is available at `http://localhost:8080`. The initial admin password is located in the Jenkins container logs.

4. **Stopping Services**:
   To stop all services, use:

   ```bash
   docker-compose down
   ```

5. **Removing Containers and Volumes**:
   To remove all containers and their associated volumes, use:

   ```bash
   docker-compose down --volumes
   ```

## Useful Docker Commands

- **Check running services**:

  ```bash
  docker-compose ps
  ```

- **View logs of a specific service**:

  ```bash
  docker-compose logs <service_name>
  ```

- **Enter a service’s container** (e.g., for the Python service):

  ```bash
  docker-compose exec python bash
  ```

## Conclusion

This `docker-compose.yml` provides a fully-fledged development environment. You can extend and modify the setup according to your project needs. If you encounter any issues, ensure that Docker and Docker Compose are installed properly and the correct versions are being used.

---

Here’s a detailed breakdown of your `docker-compose.yml` file, with explanations and corresponding code snippets for each service:

---

# Docker Compose Detailed Explanation

This document provides a detailed explanation of each service in your `docker-compose.yml` file along with sample usage and code snippets to understand its configuration better.

---

### **Version Declaration**

We start by specifying the version of Docker Compose to use. In this case, version `3.8` is chosen, which provides compatibility with a wide range of Docker Compose features.

```yaml
version: '3.8'
```

---

### **Services**

#### 1. **Python Service**

The Python service uses the `python:3.10.11` image and mounts the current directory (`.`) into the container as `/app`. This allows you to run Python scripts from within the container, with the codebase accessible in the container.

```yaml
  python:
    image: python:3.10.11
    container_name: python
    volumes:
      - .:/app
    working_dir: /app
```

- **Explanation**:
  - `image`: The base image is `python:3.10.11`.
  - `container_name`: The container is named `python` for easy identification.
  - `volumes`: The current directory (`.`) on your host is mounted into `/app` in the container.
  - `working_dir`: Sets `/app` as the working directory inside the container.
  
- **Usage**:
  Run Python scripts inside the container:

  ```bash
  docker-compose run python python script.py
  ```

#### 2. **Node Service**

The Node.js service is configured similarly to the Python service. It uses the latest `node:21.2.0` image and mounts the current directory.

```yaml
  node:
    image: node:21.2.0
    container_name: node
    volumes:
      - .:/app
    working_dir: /app
```

- **Explanation**:
  - `image`: The base image is `node:21.2.0`.
  - `container_name`: Named `node`.
  - `volumes`: The current directory (`.`) on your host is mounted into `/app` in the container.
  - `working_dir`: Sets `/app` as the working directory inside the container.

- **Usage**:
  Install dependencies or run a Node.js app:

  ```bash
  docker-compose run node npm install
  docker-compose run node npm start
  ```

#### 3. **Redis Service**

Redis is an in-memory data store used for caching. This service runs the latest version of Redis.

```yaml
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
```

- **Explanation**:
  - `image`: Uses the latest version of Redis.
  - `container_name`: Named `redis`.
  - `ports`: Exposes port `6379` on the host, which is Redis's default port.

- **Usage**:
  Redis can now be accessed at `localhost:6379`:

  ```bash
  redis-cli -h localhost -p 6379
  ```

#### 4. **PostgreSQL Service**

PostgreSQL is a powerful, open-source database. This service sets up a PostgreSQL instance with user, password, and database configuration.

```yaml
  postgres:
    image: postgres:latest
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
```

- **Explanation**:
  - `image`: Uses the latest version of PostgreSQL.
  - `container_name`: Named `postgres`.
  - `ports`: Maps PostgreSQL's default port `5432` to the host.
  - `environment`: Sets environment variables for the PostgreSQL container:
    - `POSTGRES_USER`: Username (default: `postgres`).
    - `POSTGRES_PASSWORD`: Password for the user (default: `postgres`).
    - `POSTGRES_DB`: Name of the database (default: `postgres`).

- **Usage**:
  Connect to the PostgreSQL database:

  ```bash
  psql -h localhost -U postgres -d postgres
  ```

#### 5. **SonarQube Service**

SonarQube is used for continuous inspection of code quality. This service exposes the SonarQube dashboard on port `9000`.

```yaml
  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
```

- **Explanation**:
  - `image`: Uses the latest version of SonarQube.
  - `container_name`: Named `sonarqube`.
  - `ports`: Maps SonarQube's port `9000` to the host, allowing access at `http://localhost:9000`.
  - `environment`: Disables Elasticsearch bootstrap checks with `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true`.

- **Usage**:
  Access the SonarQube dashboard at:

  ```
  http://localhost:9000
  ```

#### 6. **Selenium Service**

The Selenium service provides a standalone Chrome browser for testing web applications automatically.

```yaml
  selenium:
    image: selenium/standalone-chrome
    container_name: selenium
    ports:
      - "4444:4444"
```

- **Explanation**:
  - `image`: Uses the `selenium/standalone-chrome` image for Chrome browser automation.
  - `container_name`: Named `selenium`.
  - `ports`: Maps Selenium's port `4444` to the host, used for remote WebDriver sessions.

- **Usage**:
  You can connect to Selenium at `http://localhost:4444/wd/hub`.

#### 7. **Postman (Newman) Service**

This service runs Postman collections through `newman`, Postman's CLI tool. It mounts a directory where collections are stored and runs a predefined collection file.

```yaml
  postman:
    image: postman/newman
    container_name: postman
    volumes:
      - ./collections:/etc/newman
    command: "run /etc/newman/my_collection.json"
```

- **Explanation**:
  - `image`: Uses the `postman/newman` image for running Postman collections.
  - `container_name`: Named `postman`.
  - `volumes`: Mounts the `./collections` directory from the host into `/etc/newman` in the container.
  - `command`: Executes the `my_collection.json` file inside `/etc/newman`.

- **Usage**:
  To run Postman collections:

  ```bash
  docker-compose run postman
  ```

#### 8. **Jenkins Service**

Jenkins is an automation server used for CI/CD. This service exposes Jenkins on port `8080`.

```yaml
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_data:/var/jenkins_home
```

- **Explanation**:
  - `image`: Uses the latest Jenkins Long Term Support (LTS) version.
  - `container_name`: Named `jenkins`.
  - `user`: Runs Jenkins as the root user to ensure proper permissions.
  - `ports`: Exposes port `8080` (for the web interface) and `50000` (for Jenkins agents).
  - `volumes`: Mounts the `jenkins_data` volume to persist Jenkins data.

- **Usage**:
  Access Jenkins at:

  ```
  http://localhost:8080
  ```

---

### **Volumes**

A named volume, `jenkins_data`, is defined to store persistent Jenkins data, which allows you to maintain Jenkins configurations and build history across container restarts.

```yaml
volumes:
  jenkins_data:
```

---

### **Networks**

The services in this setup are all connected via the default `bridge` network, which allows inter-container communication.

```yaml
networks:
  default:
    driver: bridge
```

---

### **Complete Example**

Here’s the complete Docker Compose file:

```yaml
version: '3.8'

services:
  python:
    image: python:3.10.11
    container_name: python
    volumes:
      - .:/app
    working_dir: /app

  node:
    image: node:21.2.0
    container_name: node
    volumes:
      - .:/app
    working_dir: /app

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"

  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true

  postgres:
    image: postgres:latest
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres

  selenium:
    image: selenium/standalone-chrome
    container_name: selenium
    ports:
      - "4444:4444"

  postman:


    image: postman/newman
    container_name: postman
    volumes:
      - ./collections:/etc/newman
    command: "run /etc/newman/my_collection.json"

  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_data:/var/jenkins_home

volumes:
  jenkins_data:

networks:
  default:
    driver: bridge
```

---

This document should give a comprehensive understanding of your `docker-compose.yml` setup and how to use each service with corresponding code snippets.
