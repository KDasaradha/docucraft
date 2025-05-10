---
title: Production CI/CD Setup
description: Placeholder content for Production CI/CD Setup.
order: 3
---

# Production CI/CD Setup

Yes! Below is a structured **latest industry-standard approach** for building and deploying applications to production using **GitHub Actions, Kubernetes, and security best practices**.

---

# **🚀 Full Production-Ready CI/CD Setup**
We’ll implement:
✅ **Pre-commit hooks** – Lint, format, and test before pushing code  
✅ **Optimized CI/CD pipeline** – Efficient GitHub Actions workflows  
✅ **Secure Docker image management** – Smaller, faster builds  
✅ **Advanced Kubernetes deployments** – Zero-downtime rollouts  
✅ **Security & compliance** – Automated security checks  

---

## **📌 Step 1: Pre-Commit Hooks**
👉 **Catch issues before committing** code.

1️⃣ **Install pre-commit**
```sh
pip install pre-commit
pre-commit install
```

2️⃣ **Create `.pre-commit-config.yaml`**
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: stable
    hooks:
      - id: black

  - repo: https://github.com/PyCQA/flake8
    rev: 5.0.4
    hooks:
      - id: flake8

  - repo: https://github.com/asottile/pyupgrade
    rev: v3.4.0
    hooks:
      - id: pyupgrade
        args: ["--py38-plus"]
```
🔹 Runs **before `git commit`** to format & check code.

---

## **📌 Step 2: GitHub Actions CI/CD**
👉 **Automate builds, tests, and deployments**.

### **📁 Create `.github/workflows/ci-cd.yml`**
```yaml
name: FastAPI CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.12"

      - name: Install Dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt

      - name: Run Linting
        run: |
          source venv/bin/activate
          black --check .
          flake8 .

      - name: Run Unit Tests
        run: |
          source venv/bin/activate
          pytest --junitxml=pytest-report.xml --cov=. --cov-report=term-missing

  build-docker:
    needs: lint-test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build & Push Docker Image
        if: github.event_name == 'push'
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker build -t dasaradh2117/fastapi-app:${{ github.sha }} .
          docker push dasaradh2117/fastapi-app:${{ github.sha }}

  deploy:
    needs: build-docker
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/fastapi-app fastapi-app=dasaradh2117/fastapi-app:${{ github.sha }}
          kubectl rollout status deployment/fastapi-app
```

🔹 **Now, every push:**
✔ **Lint & test code**  
✔ **Build & push Docker image**  
✔ **Deploy automatically to Kubernetes**  

---

## **📌 Step 3: Secure & Optimize Docker**
👉 **Use Multi-Stage Builds for smaller images.**  

### **📝 `Dockerfile`**
```dockerfile
# Stage 1: Build dependencies
FROM python:3.12 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final production image
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH="/root/.local/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

🔹 **Reduces image size** and **increases build speed**.

---

## **📌 Step 4: Advanced Kubernetes Deployment**
👉 **Implement Blue-Green & Canary Deployments**.

### **📝 `kubernetes/deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
spec:
  replicas: 2
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: fastapi-app
  template:
    metadata:
      labels:
        app: fastapi-app
    spec:
      containers:
        - name: fastapi-app
          image: dasaradh2117/fastapi-app:latest
          ports:
            - containerPort: 8000
```

🔹 **Ensures zero-downtime deployments**.

---

## **📌 Step 5: Security Best Practices**
🔐 **Security Tools**
✔ **Trivy** – Scan Docker images for vulnerabilities  
✔ **OWASP ZAP** – API security testing  
✔ **GitHub Dependabot** – Automatic security updates  

### **📝 Add Security Scans in CI/CD**
```yaml
  security-check:
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy Scan
        run: |
          trivy image dasaradh2117/fastapi-app:latest
```

🔹 **Now, vulnerabilities are detected before deployment**.

---

# **🎯 Final Tech Stack**
✅ **GitHub Actions** – Fully automated CI/CD  
✅ **Pre-Commit Hooks** – Catch errors before committing  
✅ **Optimized Docker Builds** – Faster and smaller images  
✅ **Kubernetes Deployments** – Blue-Green & Canary rollouts  
✅ **Security Best Practices** – Automated security scans  

---

## **🎯 Next Steps**
💡 Which **specific part** do you want to **implement first**?  
- **CI/CD pipeline improvements?**  
- **Advanced Kubernetes deployments?**  
- **Security best practices?**  

🚀 Let me know, and I’ll provide **step-by-step implementation!**

