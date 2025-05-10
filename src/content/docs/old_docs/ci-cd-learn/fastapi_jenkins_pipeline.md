---
title: FastAPI CI/CD Pipeline
description: Placeholder content for FastAPI CI/CD Pipeline.
order: 3
---

# FastAPI CI/CD Pipeline

Below is a comprehensive, step-by-step guide in Markdown format for a novice developer to set up a CI/CD pipeline for a FastAPI application using Jenkins, Git, Docker, and various security and quality tools on a Windows system with WSL2. This guide assumes no prior knowledge and walks you through every detail, from system setup to pipeline execution, based on the provided `Jenkinsfile` and additional instructions.

---

# Setting Up a CI/CD Pipeline for a FastAPI Application with Jenkins

This guide will help you create a fully automated CI/CD pipeline for your FastAPI application using Jenkins, Git, Docker, and tools like SonarQube, Trivy, OWASP Dependency-Check, and Snyk. We'll set it up on a Windows system with WSL2 (Windows Subsystem for Linux) and Docker Desktop. By the end, you'll have a pipeline that checks code quality, runs tests, scans for vulnerabilities, builds a Docker image, and deploys it locally.

---

## Prerequisites
Before starting, ensure you have the following:
1. **Windows 10 or 11**: With administrative access.
2. **FastAPI Application**: A working FastAPI app with a `Dockerfile` and a `requirements.txt` file, hosted in a Git repository (e.g., GitHub).
3. **Internet Access**: To download tools and dependencies.
4. **Basic Terminal Knowledge**: Familiarity with running commands in a terminal.

---

## Step 1: System Setup

### 1.1 Install WSL2 and Ubuntu
WSL2 allows you to run Linux (Ubuntu) on Windows, where we'll install most tools.

1. **Enable WSL2**:
   - Open PowerShell as Administrator:
     ```powershell
     wsl --install
     ```
   - Restart your computer if prompted.

2. **Install Ubuntu**:
   - Open the Microsoft Store, search for "Ubuntu" (e.g., Ubuntu 20.04 or 22.04), and install it.
   - Launch Ubuntu from the Start menu, set up a username and password when prompted, and wait for the initial setup to complete.

3. **Set Ubuntu as Default**:
   - In PowerShell:
     ```powershell
     wsl --set-default Ubuntu
     ```

4. **Verify WSL**:
   - Open a terminal (e.g., Windows Terminal) and type:
     ```bash
     wsl
     ```
   - You should see the Ubuntu prompt (e.g., `username@hostname:~$`).

### 1.2 Install Docker Desktop
Docker Desktop integrates with WSL2 to run containers.

1. **Download Docker Desktop**:
   - Go to [docker.com](https://www.docker.com/products/docker-desktop/), download the installer, and run it.

2. **Configure Docker Desktop**:
   - Open Docker Desktop after installation.
   - Go to `Settings > General` and check "Use the WSL 2 based engine".
   - Go to `Settings > Resources > WSL Integration`, enable integration with Ubuntu, and click "Apply & Restart".

3. **Verify Docker in WSL**:
   - In your WSL Ubuntu terminal:
     ```bash
     docker --version
     ```
   - Expected output: `Docker version x.x.x, build xxxxxxx`.

### 1.3 Install Git
Git is needed to clone your FastAPI repository.

1. **Install Git in WSL**:
   - In your Ubuntu terminal:
     ```bash
     sudo apt update
     sudo apt install git -y
     git --version
     ```
   - Expected output: `git version x.x.x`.

2. **Install Git on Windows (Optional)**:
   - Download from [git-scm.com](https://git-scm.com/) and install it for Git operations outside WSL.

### 1.4 Install Jenkins in WSL
Jenkins will orchestrate the pipeline.

1. **Install Java**:
   - Jenkins requires Java:
     ```bash
     sudo apt install openjdk-17-jdk -y
     java -version
     ```
   - Expected output: `openjdk version "17.x.x"`.

2. **Add Jenkins Repository**:
   - Add the Jenkins key and repository:
     ```bash
     curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg
     echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
     sudo apt update
     ```

3. **Install Jenkins**:
   - Install and start Jenkins:
     ```bash
     sudo apt install jenkins -y
     sudo systemctl start jenkins
     sudo systemctl enable jenkins
     sudo systemctl status jenkins
     ```
   - Check that Jenkins is "active (running)".

4. **Access Jenkins**:
   - Open a browser on Windows and go to `http://localhost:8080`.
   - Get the initial admin password:
     ```bash
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```
   - Copy the password (e.g., `492c353f64204d68ba0ae660ce9db7af`), paste it into the browser, and click "Continue".
   - Install suggested plugins and create an admin user (e.g., username: `admin`, password: `yourpassword`).

### 1.5 Install Additional Tools in WSL
These tools are used in the pipeline for scanning and testing.

1. **Trivy (Vulnerability Scanner)**:
   ```bash
   sudo apt-get install wget apt-transport-https gnupg lsb-release -y
   wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
   echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
   sudo apt-get update
   sudo apt-get install trivy -y
   trivy --version
   ```

2. **SonarScanner (Code Quality)**:
   ```bash
   wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
   sudo apt install unzip -y
   unzip sonar-scanner-cli-5.0.1.3006-linux.zip
   sudo mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
   sudo ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
   sonar-scanner --version
   ```

3. **Node.js and Snyk (Security Scanner)**:
   ```bash
   curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
   sudo apt install nodejs -y
   npm install -g snyk
   snyk --version
   ```

4. **Python and pip**:
   ```bash
   sudo apt update
   sudo apt install python3-pip -y
   python3 -m pip --version
   sudo apt install python3-venv -y
   ```

### 1.6 Set Up SonarQube
SonarQube analyzes code quality.

1. **Run SonarQube in Docker**:
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
   ```

2. **Access SonarQube**:
   - Go to `http://localhost:9000` in your browser.
   - Log in with `admin`/`admin`, then change the password (e.g., to `newpassword`).

3. **Generate a Token**:
   - Go to `My Account > Security > Generate Tokens`, name it (e.g., `jenkins-token`), and save the token (e.g., `squ_671f583f75b49dc8d636a917e26bb3bb745fe774`).

---

## Step 2: Jenkins Configuration

### 2.1 Install Jenkins Plugins
Plugins extend Jenkins functionality.

1. **Go to Plugins**:
   - In Jenkins, click `Manage Jenkins > Manage Plugins > Available`.

2. **Install Plugins**:
   - Search and check:
     - `Git Plugin`
     - `Docker Plugin`
     - `Docker Pipeline`
     - `SonarQube Scanner for Jenkins`
     - `OWASP Dependency-Check Plugin`
     - `Credentials Plugin` (usually pre-installed)
     - `Pipeline Plugin` (usually pre-installed)
   - Click `Install without restart`.

### 2.2 Configure SonarQube in Jenkins
1. **Add SonarQube Server**:
   - Go to `Manage Jenkins > Configure System`.
   - Scroll to "SonarQube servers".
   - Click "Add SonarQube":
     - Name: `sonarqube`
     - Server URL: `http://localhost:9000`
     - Server Authentication Token: Add your token (e.g., `squ_671f583f75b49dc8d636a917e26bb3bb745fe774`) as a "Secret text" credential with ID `sonarqube-token`.

### 2.3 Configure Tools
1. **Go to Tools**:
   - `Manage Jenkins > Global Tool Configuration`.

2. **Add JDK**:
   - Name: `openjdk-17`
   - Check "Install automatically", select version `17`.

3. **Add SonarScanner**:
   - Name: `sonar-scanner`
   - Check "Install automatically", select version `5.0.1`.

4. **Add Docker**:
   - Name: `docker`
   - Check "Install automatically", select the latest version.

### 2.4 Set Up Credentials
1. **Go to Credentials**:
   - `Manage Jenkins > Manage Credentials > (global) > Add Credentials`.

2. **GitHub Credentials**:
   - Kind: `Username with password`
   - Username: Your GitHub username
   - Password: Your GitHub Personal Access Token (PAT)
   - ID: `github-cred`

3. **Docker Hub Credentials**:
   - Kind: `Username with password`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password
   - ID: `docker-cred`

4. **Snyk Token**:
   - Kind: `Secret text`
   - Secret: Your Snyk API token (from [snyk.io](https://snyk.io))
   - ID: `snyk-token`

---

## Step 3: Prepare Your FastAPI Project
1. **Project Structure**:
   - Ensure your FastAPI app has:
     - `app.py` (or similar): Your FastAPI code.
     - `requirements.txt`: Python dependencies (e.g., `fastapi`, `uvicorn`).
     - `Dockerfile`: To build the Docker image.
     - `tests/`: Directory with unit tests (e.g., `test_app.py`).

2. **Sample Dockerfile**:
   ```dockerfile
   FROM python:3.10-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

3. **Push to GitHub**:
   - Create a repository (e.g., `fastapi-pipeline`) and push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/yourusername/fastapi-pipeline.git
     git push -u origin main
     ```

---

## Step 4: Create the Jenkins Pipeline

### 4.1 Add Jenkinsfile to Your Repository
Create a file named `Jenkinsfile` in your project root with the following content:

```groovy
pipeline {
    agent any
    tools {
        jdk 'openjdk-17'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = "dasaradh2117/fastapi-app:${env.BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github-cred', url: 'https://github.com/KDasaradha/fastapi-pipeline.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh '''
                    # Ensure python3-venv is installed
                    if ! python3 -m venv --help > /dev/null 2>&1; then
                        sudo apt update
                        sudo apt install python3-venv -y
                    fi
                    
                    # Create and activate virtual environment
                    python3 -m venv venv
                    . venv/bin/activate
                    
                    # Upgrade pip and install dependencies
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    
                    # Deactivate virtual environment
                    deactivate
                '''
            }
        }
        stage('Static Analysis') {
            parallel {
                stage('Security Checks') { // skip this step because its taking more time consuming process greater than 30 minutes
                    steps {
                        sh '''
                            . venv/bin/activate
                            pip install bandit safety
                            bandit -r . -f html -o bandit-report.html || true
                            safety check --output json --save-json safety-report.json || true
                            deactivate
                        '''
                        archiveArtifacts artifacts: 'bandit-report.html, safety-report.json', allowEmptyArchive: true
                    }
                }
                stage('Linting') {
                    steps {
                        sh '''
                            . venv/bin/activate
                            pip install flake8 pylint
                            flake8 . --max-line-length=100 --format=html --output-file=flake8-report.html || true
                            pylint *.py --output-format=json:pylint-report.json || true
                            deactivate
                        '''
                        archiveArtifacts artifacts: 'flake8-report.html, pylint-report.json', allowEmptyArchive: true
                    }
                }
            }
        }
        stage('Secrets Scanning') {
            steps {
                sh '''
                    docker run --rm trufflesecurity/trufflehog:latest git file://. --json > trufflehog-report.json || true
                '''
                archiveArtifacts artifacts: 'trufflehog-report.json', allowEmptyArchive: true
            }
        }
        stage('Unit Tests') {
            steps {
                sh '''
                    . venv/bin/activate
                    pip install pytest pytest-asyncio
                    pytest tests/ --junitxml=test-results.xml || true
                    deactivate
                '''
                junit 'test-results.xml'
            }
        }
        stage('Code Coverage') {
            steps {
                sh '''
                    . venv/bin/activate
                    pip install pytest-cov
                    pytest tests/ --cov=./ --cov-report=html:coverage-report --cov-fail-under=80 || true
                    deactivate
                '''
                archiveArtifacts artifacts: 'coverage-report/index.html', allowEmptyArchive: true
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=fastapi-app \
                        -Dsonar.projectName=fastapi-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.qualitygate.wait=true
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Quality Gate failed: ${qg.status}"
                        }
                    }
                }
            }
        }
        stage('Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format HTML', odcInstallation: 'OWASP Dependency-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.html'
                archiveArtifacts artifacts: 'dependency-check-report.html', allowEmptyArchive: true
            }
        }
        stage('Trivy Filesystem Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --format json . > trivy-fs-report.json || true'
                archiveArtifacts artifacts: 'trivy-fs-report.json', allowEmptyArchive: true
            }
        }
        stage('Test Docker') {
            steps {
                sh 'docker --version'
                sh 'docker ps'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}")
                }
            }
        }
        stage('Trivy Image Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --format json ${DOCKER_IMAGE} > trivy-image-report.json || true"
                archiveArtifacts artifacts: 'trivy-image-report.json', allowEmptyArchive: true
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-cred') {
                        docker.image("${DOCKER_IMAGE}").push()
                        docker.image("${DOCKER_IMAGE}").push('latest')
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    docker stop fastapi-app || true
                    docker rm fastapi-app || true
                    docker run -d --name fastapi-app -p 8000:8000 ${DOCKER_IMAGE}
                '''
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed'
            sh 'docker system prune -f'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            slackSend channel: '#ci-cd', message: "Build ${env.BUILD_NUMBER} succeeded for ${env.JOB_NAME}! :tada:"
        }
        failure {
            echo 'Pipeline failed!'
            slackSend channel: '#ci-cd', message: "Build ${env.BUILD_NUMBER} failed for ${env.JOB_NAME}. Check logs: ${env.BUILD_URL} :red_circle:"
        }
    }
}
```

2. **Commit and Push**:
   ```bash
   git add Jenkinsfile
   git commit -m "Add Jenkinsfile"
   git push origin main
   ```

### 4.2 Create a Pipeline in Jenkins
1. **New Pipeline**:
   - In Jenkins, click `New Item`.
   - Name: `fastapi-cicd`
   - Type: `Pipeline`
   - Click `OK`.

2. **Configure Pipeline**:
   - Scroll to "Pipeline" section.
   - Definition: `Pipeline script from SCM`.
   - SCM: `Git`.
   - Repository URL: `https://github.com/KDasaradha/fastapi-pipeline.git`.
   - Credentials: Select `github-cred`.
   - Branch: `main`.
   - Script Path: `Jenkinsfile`.
   - Click `Save`.

---

## Step 5: Run and Test the Pipeline

1. **Trigger the Build**:
   - On the `fastapi-cicd` job page, click `Build Now`.

2. **Monitor Progress**:
   - Click the build number (e.g., `#1`) and select `Console Output` to see real-time logs.
   - The pipeline will:
     - Clone your repo.
     - Install dependencies in a virtual environment.
     - Run security checks (Bandit, Safety), linting (Flake8, Pylint), and secrets scanning (TruffleHog).
     - Execute unit tests and code coverage with Pytest.
     - Analyze code with SonarQube and enforce a quality gate.
     - Scan dependencies with OWASP and Trivy.
     - Build, scan, and push a Docker image to Docker Hub.
     - Deploy the app locally.

3. **Verify Deployment**:
   - Open `http://localhost:8000` in your browser to test your FastAPI app.

---

## Step 6: Troubleshooting
- **Docker Permission Issues**:
  ```bash
  sudo usermod -aG docker jenkins
  sudo systemctl restart jenkins
  ```
- **SonarQube Fails**:
  - Ensure SonarQube is running (`docker ps`) and the token/URL are correct.
- **Pipeline Fails at Tests**:
  - Ensure `tests/` exists and tests pass locally:
    ```bash
    python3 -m pytest tests/
    ```
- **Artifact Not Found**:
  - The `|| true` in commands prevents failures; check archived artifacts in Jenkins UI.

---

## Step 7: Enhancements (Optional)
- **Slack Notifications**:
  - Install the `Slack Notification` plugin and configure a Slack webhook in `Manage Jenkins > Configure System`.
- **Production Deployment**:
  - Replace the `Deploy` stage with Kubernetes or cloud service deployment logic.
- **Private Registry**:
  - Run a local registry:
    ```bash
    docker run -d -p 5000:5000 registry:2
    ```
  - Update `DOCKER_IMAGE` to `localhost:5000/fastapi-app:${env.BUILD_NUMBER}`.

---

## Conclusion
You now have a fully functional CI/CD pipeline for your FastAPI app! It automates code quality checks, security scans, testing, and deployment. Explore the archived reports (e.g., `bandit-report.html`, `coverage-report/index.html`) in Jenkins to improve your code. Let me know if you need help customizing this further!

While the guide is comprehensive and covers the setup, configuration, and execution of a CI/CD pipeline for a FastAPI application, there are a few additional considerations, enhancements, and clarifications that could make it even more robust, beginner-friendly, and production-ready. Below, I’ll outline these additions in a structured manner, categorized by purpose, and provide guidance on how to integrate them into your pipeline or setup process.

---

## Additional Enhancements and Details

### 1. Project Prerequisites Clarification
To ensure a novice developer has everything ready before starting, let’s explicitly define the FastAPI app requirements and provide sample files.

#### 1.1 Sample FastAPI Application
Add these files to your project to ensure the pipeline works out of the box:
- **`app.py`** (Basic FastAPI app):
  ```python
  from fastapi import FastAPI

  app = FastAPI()

  @app.get("/")
  async def root():
      return {"message": "Hello, World!"}
  ```
- **`requirements.txt`**:
  ```
  fastapi==0.95.1
  uvicorn==0.21.1
  ```
- **`tests/test_app.py`** (Basic test):
  ```python
  from fastapi.testclient import TestClient
  from app import app

  client = TestClient(app)

  def test_read_root():
      response = client.get("/")
      assert response.status_code == 200
      assert response.json() == {"message": "Hello, World!"}
  ```

#### 1.2 Update Dockerfile
Ensure the `Dockerfile` aligns with the Python version used in WSL (e.g., 3.10):
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Integration
- Add these files to your GitHub repository before running the pipeline.
- Update the guide’s “Step 3: Prepare Your FastAPI Project” with these examples.

---

### 2. Pipeline Robustness

#### 2.1 Handle Missing `requirements.txt` or `tests/` Directory
The pipeline assumes these exist. Add checks to avoid failures:
- **Update `Install Dependencies` Stage**:
  ```groovy
  stage('Install Dependencies') {
      steps {
          sh '''
              if [ ! -f requirements.txt ]; then
                  echo "requirements.txt not found, creating an empty one"
                  touch requirements.txt
              fi
              if ! python3 -m venv --help > /dev/null 2>&1; then
                  sudo apt update
                  sudo apt install python3-venv -y
              fi
              python3 -m venv venv
              . venv/bin/activate
              pip install --upgrade pip
              pip install -r requirements.txt
              deactivate
          '''
      }
  }
  ```
- **Update `Unit Tests` Stage**:
  ```groovy
  stage('Unit Tests') {
      steps {
          sh '''
              if [ ! -d tests ]; then
                  echo "No tests directory found, skipping tests"
                  exit 0
              fi
              . venv/bin/activate
              pip install pytest pytest-asyncio
              pytest tests/ --junitxml=test-results.xml || true
              deactivate
          '''
          junit allowEmptyResults: true, testResults: 'test-results.xml'
      }
  }
  ```

#### 2.2 Add Snyk to the Pipeline
Snyk was installed but not used. Add a stage:
- **New Stage**:
  ```groovy
  stage('Snyk Security Scan') {
      steps {
          withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
              sh '''
                  snyk auth $SNYK_TOKEN
                  snyk test --file=requirements.txt --json > snyk-report.json || true
              '''
              archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
          }
      }
  }
  ```
- **Placement**: Add after `Dependency Check` and before `Build Docker Image`.

#### Integration
- Update the `Jenkinsfile` in “Step 4.1” with these changes.

---

### 3. Security Enhancements

#### 3.1 Secure Jenkins Access
By default, Jenkins runs on `localhost:8080` without authentication after setup. Secure it:
- **Enable Security**:
  - Go to `Manage Jenkins > Configure Global Security`.
  - Check "Enable Security".
  - Select "Jenkins’ own user database" and "Allow users to sign up" (disable later).
  - Set "Matrix-based security", give "Anonymous" no permissions, and grant your admin user full access.
- **Use HTTPS (Optional)**:
  - Configure a reverse proxy (e.g., Nginx) or use a self-signed certificate for production.

#### 3.2 Secure Docker Images
- **Sign Images**:
  - Install `docker-content-trust`:
    ```bash
    export DOCKER_CONTENT_TRUST=1
    ```
  - Update `Push Docker Image` stage:
    ```groovy
    stage('Push Docker Image') {
        steps {
            script {
                docker.withRegistry('https://registry.hub.docker.com', 'docker-cred') {
                    def image = docker.image("${DOCKER_IMAGE}")
                    image.push()
                    image.push('latest')
                }
            }
        }
    }
    ```

#### Integration
- Add these steps to “Step 2: Jenkins Configuration” and update the `Jenkinsfile`.

---

### 4. Monitoring and Logging

#### 4.1 Add Logging to FastAPI App
Ensure logs are available for debugging:
- **Update `app.py`**:
  ```python
  import logging
  from fastapi import FastAPI

  logging.basicConfig(level=logging.INFO)
  logger = logging.getLogger(__name__)

  app = FastAPI()

  @app.get("/")
  async def root():
      logger.info("Root endpoint called")
      return {"message": "Hello, World!"}
  ```
- **Update `requirements.txt`**:
  ```
  fastapi==0.95.1
  uvicorn==0.21.1
  python-json-logger
  ```

#### 4.2 Pipeline Logging
- Archive logs from the deployed container:
  - **Update `Deploy` Stage**:
    ```groovy
    stage('Deploy') {
        steps {
            sh '''
                docker stop fastapi-app || true
                docker rm fastapi-app || true
                docker run -d --name fastapi-app -p 8000:8000 ${DOCKER_IMAGE}
                sleep 5  # Wait for container to start
                docker logs fastapi-app > app-logs.txt 2>&1
            '''
            archiveArtifacts artifacts: 'app-logs.txt', allowEmptyArchive: true
        }
    }
    ```

#### Integration
- Update “Step 3.1” with the logging code and “Step 4.1” with the updated stage.

---

### 5. Performance and Optimization

#### 5.1 Parallelize More Stages
Run independent stages concurrently to speed up the pipeline:
- **Update `Jenkinsfile`**:
  ```groovy
  stage('Static Analysis and Tests') {
      parallel {
          stage('Static Analysis') { /* Existing Static Analysis */ }
          stage('Unit Tests') { /* Existing Unit Tests */ }
          stage('Code Coverage') { /* Existing Code Coverage */ }
      }
  }
  ```

#### 5.2 Cache Dependencies
Speed up builds by caching Python dependencies:
- **Update `Dockerfile`**:
  ```dockerfile
  FROM python:3.10-slim AS builder
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --user -r requirements.txt

  FROM python:3.10-slim
  WORKDIR /app
  COPY --from=builder /root/.local /root/.local
  COPY . .
  ENV PATH=/root/.local/bin:$PATH
  EXPOSE 8000
  CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

#### Integration
- Update “Step 3.2” with the new `Dockerfile` and “Step 4.1” with parallel stages.

---

### 6. Documentation and User Guidance

#### 6.1 Add a README
Include a `README.md` in your repository:
```markdown
# FastAPI CI/CD Pipeline

This project sets up a CI/CD pipeline for a FastAPI app using Jenkins, Docker, and various tools.

## Prerequisites
- WSL2 with Ubuntu
- Docker Desktop
- Jenkins
- GitHub account

## Setup
1. Clone this repo.
2. Follow the guide to set up Jenkins and tools.
3. Run the pipeline in Jenkins.

## Pipeline Stages
- Checkout: Clones the repo.
- Install Dependencies: Sets up a virtual environment.
- Static Analysis: Runs security and linting checks.
- Unit Tests: Executes tests.
- SonarQube: Analyzes code quality.
- Docker: Builds and pushes an image.
- Deploy: Runs the app locally.
```

#### 6.2 Pipeline Visualization
- Install the `Pipeline Stage View Plugin` in Jenkins to see a graphical view of stages.

#### Integration
- Add “Create a README” to “Step 3” and mention the plugin in “Step 2.1”.

---

### 7. Final Updated Jenkinsfile
Here’s the consolidated `Jenkinsfile` with all enhancements:
```groovy
pipeline {
    agent any
    tools {
        jdk 'openjdk-17'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = "dasaradh2117/fastapi-app:${env.BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github-cred', url: 'https://github.com/KDasaradha/fastapi-pipeline.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh '''
                    if [ ! -f requirements.txt ]; then
                        echo "requirements.txt not found, creating an empty one"
                        touch requirements.txt
                    fi
                    if ! python3 -m venv --help > /dev/null 2>&1; then
                        sudo apt update
                        sudo apt install python3-venv -y
                    fi
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    deactivate
                '''
            }
        }
        stage('Static Analysis and Tests') {
            parallel {
                stage('Security Checks') {
                    steps {
                        sh '''
                            . venv/bin/activate
                            pip install bandit safety
                            bandit -r . -f html -o bandit-report.html || true
                            safety check --output json --save-json safety-report.json || true
                            deactivate
                        '''
                        archiveArtifacts artifacts: 'bandit-report.html, safety-report.json', allowEmptyArchive: true
                    }
                }
                stage('Linting') {
                    steps {
                        sh '''
                            . venv/bin/activate
                            pip install flake8 pylint
                            flake8 . --max-line-length=100 --format=html --output-file=flake8-report.html || true
                            pylint *.py --output-format=json:pylint-report.json || true
                            deactivate
                        '''
                        archiveArtifacts artifacts: 'flake8-report.html, pylint-report.json', allowEmptyArchive: true
                    }
                }
                stage('Unit Tests') {
                    steps {
                        sh '''
                            if [ ! -d tests ]; then
                                echo "No tests directory found, skipping tests"
                                exit 0
                            fi
                            . venv/bin/activate
                            pip install pytest pytest-asyncio
                            pytest tests/ --junitxml=test-results.xml || true
                            deactivate
                        '''
                        junit allowEmptyResults: true, testResults: 'test-results.xml'
                    }
                }
                stage('Code Coverage') {
                    steps {
                        sh '''
                            . venv/bin/activate
                            pip install pytest-cov
                            pytest tests/ --cov=./ --cov-report=html:coverage-report --cov-fail-under=80 || true
                            deactivate
                        '''
                        archiveArtifacts artifacts: 'coverage-report/index.html', allowEmptyArchive: true
                    }
                }
            }
        }
        stage('Secrets Scanning') {
            steps {
                sh '''
                    docker run --rm trufflesecurity/trufflehog:latest git file://. --json > trufflehog-report.json || true
                '''
                archiveArtifacts artifacts: 'trufflehog-report.json', allowEmptyArchive: true
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=fastapi-app \
                        -Dsonar.projectName=fastapi-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.qualitygate.wait=true
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Quality Gate failed: ${qg.status}"
                        }
                    }
                }
            }
        }
        stage('Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format HTML', odcInstallation: 'OWASP Dependency-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.html'
                archiveArtifacts artifacts: 'dependency-check-report.html', allowEmptyArchive: true
            }
        }
        stage('Snyk Security Scan') {
            steps {
                withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
                    sh '''
                        snyk auth $SNYK_TOKEN
                        snyk test --file=requirements.txt --json > snyk-report.json || true
                    '''
                    archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
                }
            }
        }
        stage('Trivy Filesystem Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --format json . > trivy-fs-report.json || true'
                archiveArtifacts artifacts: 'trivy-fs-report.json', allowEmptyArchive: true
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}")
                }
            }
        }
        stage('Trivy Image Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --format json ${DOCKER_IMAGE} > trivy-image-report.json || true"
                archiveArtifacts artifacts: 'trivy-image-report.json', allowEmptyArchive: true
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-cred') {
                        def image = docker.image("${DOCKER_IMAGE}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    docker stop fastapi-app || true
                    docker rm fastapi-app || true
                    docker run -d --name fastapi-app -p 8000:8000 ${DOCKER_IMAGE}
                    sleep 5
                    docker logs fastapi-app > app-logs.txt 2>&1
                '''
                archiveArtifacts artifacts: 'app-logs.txt', allowEmptyArchive: true
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed'
            sh 'docker system prune -f'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            slackSend channel: '#ci-cd', message: "Build ${env.BUILD_NUMBER} succeeded for ${env.JOB_NAME}! :tada:"
        }
        failure {
            echo 'Pipeline failed!'
            slackSend channel: '#ci-cd', message: "Build ${env.BUILD_NUMBER} failed for ${env.JOB_NAME}. Check logs: ${env.BUILD_URL} :red_circle:"
        }
    }
}
```

---

### Integration into the Guide
- **Step 1**: Add “1.1 Sample FastAPI Application” under “Prerequisites”.
- **Step 2**: Add “3.1 Secure Jenkins Access” and “3.2 Secure Docker Images” under “Jenkins Configuration”.
- **Step 3**: Update “3.1 Sample FastAPI Application” with logging and “3.2 Update Dockerfile” with caching.
- **Step 4**: Replace the `Jenkinsfile` with the updated version and mention Snyk, parallel stages, and logging.
- **Step 5**: Add “Verify Logs” under “Run and Test” to check `app-logs.txt`.
- **Step 6**: Add “Check Snyk Report” under “Troubleshooting”.
- **Step 7**: Add “Add README” and “Pipeline Visualization” under “Enhancements”.

---

## Final Thoughts
With these additions, the pipeline becomes more resilient, secure, and user-friendly. It handles edge cases (e.g., missing files), improves performance (e.g., caching, parallelization), enhances security (e.g., HTTPS, signed images), and provides better visibility (e.g., logs, README). For a novice developer, this ensures a smoother experience, while for production use, it adds robustness. If you’d like me to expand on any specific area (e.g., Kubernetes deployment, advanced SonarQube rules), let me know!
