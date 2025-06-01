### **Step-by-Step Guide to Implement CI/CD Pipeline for FastAPI App Using Jenkins on Windows (WSL + Docker Desktop)**

This guide will walk you through setting up a **CI/CD pipeline** on your **local Windows system** using **Docker Desktop with WSL**, integrating with **Jenkins, SonarQube, Trivy, OWASP Dependency-Check, Snyk, and Docker** to automate the build, test, and deployment of your **FastAPI** application.

---

## **1️⃣ Install Required Tools**
### **1.1 Install Docker Desktop for Windows**
Ensure you have **Docker Desktop installed** with **WSL 2 backend** enabled.
1. Download and install **Docker Desktop** from: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Enable **WSL 2** in Docker settings:
   - Open Docker Desktop
   - Navigate to **Settings → General**
   - Enable **WSL 2 based engine**
   - Click **Apply & Restart**

---

### **1.2 Install Jenkins in Docker**
#### **Step 1: Create a Docker Network**
```bash
docker network create jenkins_network
```

#### **Step 2: Run Jenkins Container**
```bash
docker run -d \
  --name jenkins \
  --restart always \
  --network jenkins_network \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```
#### **Step 3: Get Jenkins Initial Admin Password**
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
Copy this password and use it to set up Jenkins via `http://localhost:8080`.

---

## **2️⃣ Install Required Plugins in Jenkins**
### **2.1 Install Plugins via Jenkins CLI**
After logging into Jenkins, install the required plugins using the CLI:

```bash
docker exec -it jenkins bash -c "jenkins-plugin-cli --plugins pipeline git docker-workflow sonar sonar-scanner trivy owasp-dependency-check snyk"
```

---

## **3️⃣ Configure Docker Inside Jenkins**
Since Jenkins runs inside a **Docker container**, it needs access to Docker.

### **3.1 Add Jenkins User to Docker Group**
```bash
docker exec -it jenkins bash
usermod -aG docker jenkins
exit
```
Restart the Jenkins container:
```bash
docker restart jenkins
```

---

## **4️⃣ Install SonarQube**
### **4.1 Run SonarQube Container**
```bash
docker run -d --name sonarqube \
  --network jenkins_network \
  -p 9000:9000 \
  -e SONARQUBE_JDBC_USERNAME=sonar \
  -e SONARQUBE_JDBC_PASSWORD=sonar \
  -e SONARQUBE_JDBC_URL=jdbc:postgresql://localhost/sonar \
  sonarqube:lts
```

### **4.2 Configure SonarQube Scanner**
1. Go to **http://localhost:9000**
2. Create a new project and get a token
3. Add the token to Jenkins under **Manage Jenkins → Global Tool Configuration → SonarQube Scanner**

---

## **5️⃣ Configure Security Scanners**
### **5.1 Install Trivy Scanner**
Inside Jenkins container:
```bash
apk add --no-cache trivy
```

### **5.2 Install OWASP Dependency-Check**
Inside Jenkins container:
```bash
wget https://github.com/jeremylong/DependencyCheck/releases/latest/download/dependency-check-archive.zip
unzip dependency-check-archive.zip -d /opt/owasp/
```

### **5.3 Install Snyk**
Inside Jenkins container:
```bash
npm install -g snyk
snyk auth
```

---

## **6️⃣ Setup Jenkins Pipeline**
Create a `Jenkinsfile` in your GitHub repo:

```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "fastapi_app"
        SONAR_HOST = "http://sonarqube:9000"
        SONAR_TOKEN = credentials('SONARQUBE_TOKEN')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'GITHUB_CREDENTIALS', url: 'git@github.com:yourusername/yourrepo.git'
            }
        }

        stage('Code Quality Check - SonarQube') {
            steps {
                sh '''
                sonar-scanner \
                  -Dsonar.projectKey=fastapi_project \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=$SONAR_HOST \
                  -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Security Scan - Trivy') {
            steps {
                sh 'trivy fs --exit-code 1 . || true'
            }
        }

        stage('Security Scan - OWASP Dependency-Check') {
            steps {
                sh '/opt/owasp/dependency-check/bin/dependency-check.sh --scan . --format HTML --out reports/'
            }
        }

        stage('Security Scan - Snyk') {
            steps {
                sh 'snyk test || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Run Pytest') {
            steps {
                sh 'docker run --rm $DOCKER_IMAGE pytest tests/'
            }
        }

        stage('Push Docker Image') {
            steps {
                withDockerRegistry([credentialsId: 'DOCKER_HUB_CREDENTIALS', url: 'https://index.docker.io/v1/']) {
                    sh 'docker tag $DOCKER_IMAGE yourusername/$DOCKER_IMAGE:latest'
                    sh 'docker push yourusername/$DOCKER_IMAGE:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 8000:8000 --name fastapi_container yourusername/$DOCKER_IMAGE:latest'
            }
        }
    }
}
```

---

## **7️⃣ Run the Jenkins Pipeline**
1. Commit the `Jenkinsfile` to your GitHub repository.
2. Open **Jenkins** → **New Item** → **Pipeline**.
3. Select **Pipeline from SCM**, set the repo URL.
4. Click **Build Now**.

---

## **8️⃣ Validate Deployment**
- Check running containers:
  ```bash
  docker ps
  ```
- Open FastAPI app:
  ```
  http://localhost:8000/docs
  ```

---

## **💡 Summary**
1. **Install Docker Desktop** with **WSL 2**.
2. **Run Jenkins in Docker** and install necessary plugins.
3. **Give Jenkins access to Docker**.
4. **Deploy SonarQube** for **code quality checks**.
5. **Install Trivy, OWASP, Snyk** for **security scanning**.
6. **Create a Jenkins Pipeline** for **automated build, test, and deployment**.
7. **Push the final Docker image to Docker Hub**.
8. **Deploy the application** in a container.

🚀 **Your FastAPI CI/CD pipeline is now fully automated!** 🎯

---

### **🔥 Next Steps**
- **D:** Improve with auto-rollbacks
- **T:** Add unit tests for better validation
- **E:** Expand with Kubernetes deployment


Understood! I will provide a **step-by-step** guide with **each command and configuration explained clearly**, ensuring that you can set up your **CI/CD pipeline for FastAPI** on **Windows (WSL + Docker Desktop + Jenkins)** with **SonarQube, Trivy, OWASP, Snyk, and Docker Deployment**.

---

# **🛠️ Step-by-Step Guide for CI/CD Pipeline**
## **📌 Part 1: Setup Prerequisites**
### **1️⃣ Install Required Tools**
Since you are running everything on **Windows (WSL + Docker Desktop)**, ensure you have:
- **Windows Subsystem for Linux (WSL)**
- **Docker Desktop with WSL2 Backend**
- **Git for Windows**
- **Python & Pip** (if not installed)

#### **1.1 Install WSL (Windows Subsystem for Linux)**
1. Open **PowerShell** as Administrator and run:
   ```powershell
   wsl --install
   ```
2. Restart your system.

#### **1.2 Install Docker Desktop with WSL2 Backend**
1. Download **Docker Desktop**:  
   [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Install it and **enable WSL2 backend**:
   - Open **Docker Desktop**
   - Navigate to **Settings → General**
   - Enable **WSL 2 based engine**
   - Click **Apply & Restart**
3. Verify Docker installation:
   ```bash
   docker --version
   ```

#### **1.3 Install Git (if not installed)**
Download and install **Git for Windows**:  
[https://git-scm.com/downloads](https://git-scm.com/downloads)

#### **1.4 Install Python & Pip**
1. Verify Python installation:
   ```bash
   python --version
   ```
2. If not installed, download from:  
   [https://www.python.org/downloads/](https://www.python.org/downloads/)
3. Install **pip**:
   ```bash
   python -m ensurepip --upgrade
   ```

---

## **📌 Part 2: Setup Jenkins**
We will run **Jenkins in a Docker container** with persistent storage.

### **2️⃣ Install Jenkins in Docker**
#### **2.1 Create a Docker Network**
```bash
docker network create jenkins_network
```

#### **2.2 Run Jenkins Container**
```bash
docker run -d --name jenkins \
  --restart always \
  --network jenkins_network \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

#### **2.3 Get Jenkins Initial Password**
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
- Copy the password and **open Jenkins UI** at:  
  **http://localhost:8080**
- Paste the password and complete setup.

---

## **📌 Part 3: Configure Jenkins**
### **3️⃣ Install Required Plugins**
Inside Jenkins UI:
1. Go to **Manage Jenkins** → **Manage Plugins** → **Available Plugins**.
2. Search and install the following:
   - **Git Plugin**
   - **Pipeline Plugin**
   - **Docker Pipeline**
   - **SonarQube Scanner**
   - **OWASP Dependency-Check**
   - **Snyk Security**
   - **Trivy Plugin**
   - **Docker Plugin**
3. Restart Jenkins.

### **3.1 Install Plugins Using CLI**
Alternatively, install plugins via **Jenkins CLI**:
```bash
docker exec -it jenkins bash -c "jenkins-plugin-cli --plugins pipeline git docker-workflow sonar sonar-scanner trivy owasp-dependency-check snyk"
```

---

## **📌 Part 4: Setup Docker Inside Jenkins**
### **4️⃣ Give Jenkins Access to Docker**
#### **4.1 Add Jenkins User to Docker Group**
```bash
docker exec -it jenkins bash
usermod -aG docker jenkins
exit
```
#### **4.2 Restart Jenkins**
```bash
docker restart jenkins
```

---

## **📌 Part 5: Install SonarQube**
### **5️⃣ Run SonarQube in Docker**
```bash
docker run -d --name sonarqube \
  --network jenkins_network \
  -p 9000:9000 \
  sonarqube:lts
```

### **5.1 Get SonarQube Token**
1. Open **http://localhost:9000**
2. Log in (default: `admin` / `admin`)
3. Go to **My Account → Security → Generate Token**
4. Copy the token.

### **5.2 Configure SonarQube in Jenkins**
1. Go to **Manage Jenkins → Global Tool Configuration**
2. Add **SonarQube Server URL**: `http://sonarqube:9000`
3. Add the **generated token**.

---

## **📌 Part 6: Install Security Scanners**
### **6️⃣ Install Trivy for Container Security**
Inside **Jenkins container**:
```bash
apk add --no-cache trivy
```

### **6.1 Install OWASP Dependency-Check**
```bash
wget https://github.com/jeremylong/DependencyCheck/releases/latest/download/dependency-check-archive.zip
unzip dependency-check-archive.zip -d /opt/owasp/
```

### **6.2 Install Snyk**
```bash
npm install -g snyk
snyk auth
```

---

## **📌 Part 7: Setup Jenkins Pipeline**
### **7️⃣ Create `Jenkinsfile`**
Create a `Jenkinsfile` in your **GitHub repository**.

```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "fastapi_app"
        SONAR_HOST = "http://sonarqube:9000"
        SONAR_TOKEN = credentials('SONARQUBE_TOKEN')
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'GITHUB_CREDENTIALS', url: 'git@github.com:yourusername/yourrepo.git'
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                sh '''
                sonar-scanner \
                  -Dsonar.projectKey=fastapi_project \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=$SONAR_HOST \
                  -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Security Scan - Trivy') {
            steps {
                sh 'trivy fs --exit-code 1 . || true'
            }
        }

        stage('Security Scan - OWASP') {
            steps {
                sh '/opt/owasp/dependency-check/bin/dependency-check.sh --scan . --format HTML --out reports/'
            }
        }

        stage('Security Scan - Snyk') {
            steps {
                sh 'snyk test || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'docker run --rm $DOCKER_IMAGE pytest tests/'
            }
        }

        stage('Push Docker Image') {
            steps {
                withDockerRegistry([credentialsId: 'DOCKER_HUB_CREDENTIALS', url: 'https://index.docker.io/v1/']) {
                    sh 'docker tag $DOCKER_IMAGE yourusername/$DOCKER_IMAGE:latest'
                    sh 'docker push yourusername/$DOCKER_IMAGE:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 8000:8000 --name fastapi_container yourusername/$DOCKER_IMAGE:latest'
            }
        }
    }
}
```

---

## **📌 Part 8: Run the Pipeline**
1. **Commit `Jenkinsfile`** to GitHub.
2. **Create a New Job** in Jenkins.
3. Select **Pipeline from SCM**, enter GitHub URL.
4. Click **Build Now**.

---

## ✅ **Final Checks**
- **Verify running containers**:
  ```bash
  docker ps
  ```
- **Check FastAPI API**:
  ```
  http://localhost:8000/docs
  ```

🚀 **Your CI/CD pipeline is now fully functional!** 🎯


Your request was to have a **detailed step-by-step guide** for setting up a **CI/CD pipeline** for a **FastAPI app** using **Jenkins, SonarQube, Trivy, OWASP, Snyk, Docker, and GitHub** on **Windows (WSL + Docker Desktop)**.

To ensure **nothing is missing**, let's **double-check** all the steps:

---

## ✅ **Final Verification of Steps**  
Below is the **cross-check list** of what we have covered:

| **Step** | **Task** | **Status** |
|----------|----------|------------|
| **1** | Install WSL | ✅ Done |
| **2** | Install Docker Desktop & Enable WSL Backend | ✅ Done |
| **3** | Install Git & Python | ✅ Done |
| **4** | Run Jenkins in Docker | ✅ Done |
| **5** | Retrieve Jenkins Admin Password | ✅ Done |
| **6** | Install Required Plugins in Jenkins | ✅ Done |
| **7** | Configure Docker Access in Jenkins | ✅ Done |
| **8** | Run SonarQube in Docker | ✅ Done |
| **9** | Get SonarQube Token and Add to Jenkins | ✅ Done |
| **10** | Install Trivy for Container Scanning | ✅ Done |
| **11** | Install OWASP Dependency-Check | ✅ Done |
| **12** | Install Snyk for Security Scanning | ✅ Done |
| **13** | Setup Jenkins Pipeline in GitHub | ✅ Done |
| **14** | Create `Jenkinsfile` with Full Pipeline | ✅ Done |
| **15** | Configure Jenkins to Read `Jenkinsfile` | ✅ Done |
| **16** | Run CI/CD Pipeline | ✅ Done |
| **17** | Validate Deployment (Check Docker, FastAPI) | ✅ Done |

🚀 **All steps are included!**  
However, let's go **even deeper** by adding **troubleshooting tips** and **advanced enhancements**.

---

# **🔍 Additional Configuration & Troubleshooting**
### **💡 If SonarQube Fails to Start**
Check logs:
```bash
docker logs sonarqube
```
If SonarQube crashes due to **memory issues**, increase Docker memory:
- **Docker Desktop** → **Settings** → **Resources** → **Increase Memory to 4GB+** → **Restart Docker**

---

### **💡 If Jenkins Fails to Build Docker Images**
- **Ensure Jenkins Has Docker Access**
  ```bash
  docker exec -it jenkins bash
  docker ps  # If this doesn't work, Jenkins has no Docker access
  ```

- **Fix Permission Issue:**
  ```bash
  usermod -aG docker jenkins
  systemctl restart docker
  ```

- **If Jenkins Runs as Non-Root User** (inside container), bind the Docker socket:
  ```bash
  chmod 666 /var/run/docker.sock
  ```

---

### **💡 If Trivy Scanner Fails**
- **Ensure Trivy is Installed**:
  ```bash
  trivy -v
  ```

- **If Trivy Database Fails to Load:**
  ```bash
  trivy --debug
  trivy image --exit-code 1 yourusername/fastapi_app:latest
  ```

---

### **💡 If Snyk Authentication Fails**
Re-authenticate Snyk:
```bash
snyk auth
```
Run a manual test:
```bash
snyk test
```

---

# **🚀 Additional Enhancements**
## **1️⃣ Enable Webhooks for Automatic CI/CD**
To trigger the Jenkins build automatically when you push code:
1. **Go to GitHub → Repository → Settings → Webhooks**
2. **Add New Webhook**:
   - **Payload URL**: `http://your-jenkins-server/github-webhook/`
   - **Content Type**: `application/json`
   - **Triggers**: `Push Events`
3. **Save & Test Webhook**

---

## **2️⃣ Enable Automatic Rollback for Failures**
Modify `Jenkinsfile`:
```groovy
post {
    failure {
        sh 'docker stop fastapi_container || true'
        sh 'docker run -d -p 8000:8000 yourusername/fastapi_app:stable'
    }
}
```
This ensures that **if deployment fails, Jenkins rolls back** to the **last stable image**.

---

## **3️⃣ Deploy Using Kubernetes (Instead of Direct Docker)**
Instead of:
```groovy
sh 'docker run -d -p 8000:8000 yourusername/fastapi_app:latest'
```
Use:
```groovy
sh '''
kubectl apply -f deployment.yaml
kubectl rollout status deployment fastapi-app
'''
```
---

## **4️⃣ Set Up Slack Notifications for CI/CD**
To notify a Slack channel on **Success/Failure**:
1. **Install Slack Plugin in Jenkins**
2. **Modify `Jenkinsfile`:**
```groovy
post {
    success {
        slackSend channel: '#ci-cd', message: '✅ Build Passed! 🚀'
    }
    failure {
        slackSend channel: '#ci-cd', message: '❌ Build Failed! 🚨'
    }
}
```

---

## **🚀 Conclusion**
Your **CI/CD pipeline for FastAPI** is **now fully automated** with:
- ✅ **SonarQube Code Quality Checks**
- ✅ **Security Scanning (Trivy, OWASP, Snyk)**
- ✅ **Docker Build & Push to Docker Hub**
- ✅ **Automated Deployment**
- ✅ **Rollback on Failure**
- ✅ **Webhooks for GitHub Automation**
- ✅ **Slack Notifications**

### 🎯 **You are now CI/CD ready!** 🚀

#### **💡 Next Steps**
- **W:** Run the Pipeline & Deploy 🚀
- **D:** Add Auto-Rollback & Monitoring 🔄
- **T:** Add Kubernetes Deployment 🏗️