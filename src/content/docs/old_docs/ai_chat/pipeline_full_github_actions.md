---
title: GitHub Actions CI/CD
description: Placeholder content for GitHub Actions CI/CD.
order: 2
---

# GitHub Actions CI/CD

Yes! You can **completely replace Jenkins** with **GitHub Actions** and set up **pre-commit linting and testing locally** before pushing code. This will:  

✅ **Reduce setup complexity** – No need to maintain a Jenkins server  
✅ **Speed up development** – Catch issues **before pushing code**  
✅ **Avoid unnecessary Docker image builds** – Build only when needed  

---

# **🚀 Full GitHub Actions CI/CD Pipeline**
We’ll create a **GitHub Actions workflow** that does everything **Jenkins** was doing but **more efficiently**.  

### **🛠 Steps We’ll Implement**
1. **Local Pre-Commit Hooks** – Run **linting, security scans, and tests before committing**  
2. **GitHub Actions CI Pipeline** – **Lint, test, scan, build & deploy automatically**  
3. **Push Docker Images Only When Needed** – Avoid unnecessary builds  
4. **Canary & Blue-Green Deployments** – Safer production rollouts  

---

# **🟢 Step 1: Pre-Commit Hooks (Run Before `git commit`)**
👉 This ensures that **bad code never gets committed**.  

### **📌 Install Pre-Commit Hooks**
Run this in your **FastAPI project root**:
```sh
pip install pre-commit
pre-commit install
```

### **📌 Create a `.pre-commit-config.yaml`**
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
        args: ["--py36-plus"]
```
🔹 **Now, before every commit, it will:**
✔ **Format code (Black)**  
✔ **Check for syntax errors (Flake8)**  
✔ **Upgrade Python syntax (PyUpgrade)**  

---

# **🟢 Step 2: GitHub Actions CI/CD Workflow**
👉 This **replaces Jenkins** and **automates testing, security, and deployments**.

### **📌 Create `.github/workflows/ci.yml`**
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
```
🔹 **Now, every push to `main` will:**
✔ **Lint & test code**  
✔ **Only build Docker if tests pass**  
✔ **Push images only when needed**  

---

# **🟢 Step 3: Deploy Automatically (Kubernetes)**
👉 Instead of **manually running `docker run`**, we use **K8s & GitHub Actions**.

### **📌 Add a Deployment Stage**
```yaml
  deploy:
    needs: build-docker
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/fastapi-app fastapi-app=dasaradh2117/fastapi-app:${{ github.sha }}
          kubectl rollout status deployment/fastapi-app
```
🔹 **Now, every time you push code, GitHub Actions will automatically deploy it**.

---

# **🔥 Final Flow**
| **Step** | **Where It Runs** | **Purpose** |
|----------|-----------------|-------------|
| **Pre-Commit Hooks** | Local | Prevents bad code from being committed |
| **GitHub Actions - Lint & Test** | GitHub | Runs formatting & tests automatically |
| **GitHub Actions - Build Docker** | GitHub | Builds & pushes Docker image (only when needed) |
| **GitHub Actions - Deploy** | Kubernetes | Deploys new version automatically |

---

# **🎯 Key Benefits**
✅ **No more Jenkins** – Everything runs in **GitHub Actions**  
✅ **No unnecessary Docker pushes** – **Only build when needed**  
✅ **Pre-commit hooks** – **Catch issues before pushing**  
✅ **Faster & simpler** – Fully automated **CI/CD pipeline**  

---

Would you like help setting up **GitHub Secrets** for Docker & Kubernetes? 🚀

Great! To **further improve** your knowledge and CI/CD setup, here are **advanced concepts** you can explore:

---

### **🔹 Advanced CI/CD & GitHub Actions**
1️⃣ **Matrix Builds** – Run tests on multiple Python versions  
2️⃣ **Self-Hosted Runners** – Speed up builds using your own machine  
3️⃣ **Caching Dependencies** – Store dependencies to speed up builds  
4️⃣ **Releases & Versioning** – Automate semantic versioning (`v1.0.0`, `v1.1.0`)  
5️⃣ **GitHub Actions Workflows Reusability** – Split workflows into **reusable templates**  

---

### **🔹 Optimized Docker & Kubernetes**
6️⃣ **Multi-Stage Docker Builds** – Reduce image size & speed up builds  
7️⃣ **Docker Build Caching** – Avoid rebuilding unchanged layers  
8️⃣ **Kubernetes Canary Deployments** – Gradually roll out updates  
9️⃣ **Blue-Green Deployments** – Zero-downtime rollbacks  
🔟 **ArgoCD/GitOps** – Automate Kubernetes deployments using Git  

---

### **🔹 Security & Compliance**
1️⃣1️⃣ **Docker Image Scanning** – Automate security checks (Trivy, Snyk)  
1️⃣2️⃣ **GitHub Dependabot** – Auto-update dependencies for security patches  
1️⃣3️⃣ **Secret Scanning & Management** – Use GitHub Actions secrets & SOPS  

---

### **🔥 Next Steps**
- Which **specific area** do you want to **focus on first**?  
  - **Optimizing CI/CD?**  
  - **Kubernetes deployments?**  
  - **Security & best practices?**  
- I can provide **detailed implementations** for any of these! 🚀

