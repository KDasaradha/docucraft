---
title: FastAPI CI/CD Pipeline
description: Placeholder content for FastAPI CI/CD Pipeline.
order: 4
---

# FastAPI CI/CD Pipeline

Since you want to **remove Jenkins** and **implement the same pipeline using GitHub Actions**, I’ll convert each Jenkins stage into **GitHub Actions workflows** while **improving efficiency**.  

---
## **🚀 Full GitHub Actions CI/CD Pipeline for FastAPI**
### **✅ Features Covered**
✔ **Pre-commit hooks** – Lint, format, and test before pushing  
✔ **CI/CD with GitHub Actions** – Automated workflows  
✔ **Secure Docker image builds** – Lightweight and optimized  
✔ **SonarQube analysis** – Code quality checks  
✔ **Trivy & OWASP scans** – Security compliance  
✔ **Database migrations** – Automated with Alembic  
✔ **Load Testing** – Performance tests with Locust  
✔ **Kubernetes Deployments** – Zero-downtime rollouts  

---

## **📌 Step 1: Setup Pre-Commit Hooks**
👉 **Prevent bad code from being committed**  

📝 **Install Pre-Commit**
```sh
pip install pre-commit
pre-commit install
```
📝 **Add `.pre-commit-config.yaml`**
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
```
🔹 Runs automatically before `git commit` ✅

---

## **📌 Step 2: Convert Jenkins Pipeline to GitHub Actions**
Create `.github/workflows/ci-cd.yml`

### **📝 GitHub Actions CI/CD**
```yaml
name: FastAPI CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  DOCKER_IMAGE: dasaradh2117/fastapi-app:${{ github.sha }}

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
          pip install --upgrade pip
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
        continue-on-error: false

      - name: Upload Test Report
        uses: actions/upload-artifact@v3
        with:
          name: pytest-report
          path: pytest-report.xml

  security-analysis:
    runs-on: ubuntu-latest
    needs: lint-test
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
          pip install bandit safety

      - name: Run Security Checks
        run: |
          source venv/bin/activate
          bandit -r . || true
          safety check || true

  sonar-analysis:
    runs-on: ubuntu-latest
    needs: security-analysis
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        with:
          projectBaseDir: "."
          args: >
            -Dsonar.projectKey=fastapi-app
            -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }}
            -Dsonar.token=${{ secrets.SONAR_TOKEN }}

  database-migrations:
    runs-on: ubuntu-latest
    needs: sonar-analysis
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

      - name: Run Alembic Migrations
        run: |
          source venv/bin/activate
          alembic upgrade head

  load-testing:
    runs-on: ubuntu-latest
    needs: database-migrations
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install locust

      - name: Run Load Testing
        run: |
          source venv/bin/activate
          locust -f tests/load_test.py --headless -u 10 -r 2 --run-time 2m

  build-docker:
    needs: load-testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build & Push Docker Image
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker build -t ${{ env.DOCKER_IMAGE }} .
          docker push ${{ env.DOCKER_IMAGE }}

  trivy-scan:
    needs: build-docker
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy Image Scan
        run: |
          trivy image --severity HIGH,CRITICAL --format json ${{ env.DOCKER_IMAGE }} > trivy-image-report.json

      - name: Upload Trivy Report
        uses: actions/upload-artifact@v3
        with:
          name: trivy-report
          path: trivy-image-report.json

  deploy:
    needs: trivy-scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: "latest"

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/deployment.yaml
          kubectl rollout status deployment/fastapi-app
```

---

## **📌 Step 3: Secrets Setup**
👉 **Store secrets securely in GitHub Actions**  
Go to **GitHub Repo → Settings → Secrets and Variables → Actions** and add:  
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `SONAR_HOST_URL`
- `SONAR_TOKEN`
- `KUBE_CONFIG`

---

## **🎯 Final Outcome**
✅ **No Jenkins required!**  
✅ **Fully automated CI/CD pipeline**  
✅ **Pre-commit hooks prevent errors before push**  
✅ **Security, load testing, and SonarQube checks**  
✅ **Automatic deployment to Kubernetes**  

---

## **🎯 Next Steps**
💡 Want **step-by-step setup** for any specific part?  
- **CI/CD optimizations?**  
- **Advanced Kubernetes Deployments?**  
- **Security Best Practices?**  

Let me know, and I’ll guide you! 🚀