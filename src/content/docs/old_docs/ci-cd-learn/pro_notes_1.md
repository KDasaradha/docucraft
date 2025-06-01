Implementing a **CI/CD pipeline for a FastAPI application** with **Jenkins, SonarQube, Trivy, OWASP, Snyk, and Docker** on your **local Windows system using Docker Desktop (WSL)** requires a **step-by-step** setup.

---

## **🚀 Full CI/CD Pipeline Plan**
The pipeline will be structured as:

1. **GitHub** → Code fetched into Jenkins
2. **SonarQube** → Code quality analysis using Sonar Scanner
3. **Trivy** → Scan Dockerfile and dependencies for vulnerabilities
4. **OWASP Dependency Check** → Security analysis of dependencies
5. **Snyk** → Additional security scanning
6. **Docker** → Build & push Docker image
7. **Run Tests** → Run `pytest` inside the container
8. **Deploy** → Deploy the container

---

## **Step 1: Install Docker Desktop & WSL (If Not Installed)**
Since you are using Docker Desktop **via WSL**, ensure:
- **Docker Desktop** is installed ✅
- **WSL2 is enabled** ✅

👉 **Verify Installation**:
```sh
docker --version
wsl --list --verbose
```

---

## **Step 2: Run Jenkins in a Docker Container**
We will run **Jenkins with Docker support** so that it can execute Docker commands.

### **🔹 2.1 Run Jenkins with Docker**
```sh
docker network create jenkins
docker volume create jenkins_home

docker run --name jenkins -d \
  --restart=always \
  --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

👉 **Get Jenkins initial password:**
```sh
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
🔹 Open **`http://localhost:8080`** and enter the **admin password**.

---

### **🔹 2.2 Install Required Plugins in Jenkins**
Inside **Jenkins Dashboard**:
1. Go to **Manage Jenkins** → **Plugins**
2. Install the following:
   - **Git Plugin**
   - **Pipeline Plugin**
   - **SonarQube Scanner**
   - **Trivy Scanner**
   - **OWASP Dependency Check**
   - **Snyk Security Scanner**
   - **Docker Pipeline**
   - **Blue Ocean UI**

👉 **Install plugins using Jenkins CLI (alternative way):**
```sh
docker exec -it jenkins bash -c "jenkins-plugin-cli --plugins git pipeline docker-workflow sonarqube scanner owasp-dependency-check snyk"
```

---

## **Step 3: Setup Docker inside Jenkins**
By default, Jenkins runs as the `jenkins` user, which **does not** have access to Docker. Fix this by adding `jenkins` to the `docker` group.

### **🔹 3.1 Grant Docker Access to Jenkins**
```sh
docker exec -it jenkins bash
```
Inside Jenkins container:
```sh
groupadd docker
usermod -aG docker jenkins
chown jenkins:docker /var/run/docker.sock
```
Exit & restart Jenkins:
```sh
docker restart jenkins
```

---

## **Step 4: Run SonarQube in a Docker Container**
We need a **SonarQube server** to analyze the FastAPI code.

### **🔹 4.1 Start SonarQube**
```sh
docker run -d --name sonarqube \
  --network jenkins \
  -p 9000:9000 \
  -e SONARQUBE_JDBC_USERNAME=sonar \
  -e SONARQUBE_JDBC_PASSWORD=sonar \
  sonarqube:lts
```
**Access UI**: `http://localhost:9000` (default login: `admin` / `admin`)

---

## **Step 5: Setup Trivy for Security Scanning**
Trivy will scan:
- Docker images
- Application dependencies

### **🔹 5.1 Install Trivy**
Run **Trivy** container:
```sh
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy --version
```

---

## **Step 6: Setup OWASP Dependency Check**
OWASP scans Python dependencies for security issues.

### **🔹 6.1 Run OWASP Scanner**
```sh
docker run --rm -v "$(pwd):/src" owasp/dependency-check --scan /src
```

---

## **Step 7: Setup Snyk for Advanced Security Checks**
### **🔹 7.1 Run Snyk**
```sh
docker run --rm snyk/snyk-cli:docker snyk test
```
---

## **Step 8: Write the Jenkinsfile**
This `Jenkinsfile` defines all the pipeline steps.

---

### **🔹 Full Jenkinsfile**
```groovy
pipeline {
    agent any

    environment {
        SONAR_URL = "http://sonarqube:9000"
        TRIVY_IMAGE = "aquasec/trivy"
        OWASP_IMAGE = "owasp/dependency-check"
        SNYK_IMAGE = "snyk/snyk-cli:docker"
        DOCKER_IMAGE = "my-fastapi-app"
    }

    stages {
        
        stage('Clone Repository') {
            steps {
                git branch: 'main', credentialsId: 'github-credentials', url: 'https://github.com/your-private-repo.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=FastAPI \
                -Dsonar.sources=. \
                -Dsonar.host.url=$SONAR_URL \
                -Dsonar.login=admin -Dsonar.password=admin
                '''
            }
        }

        stage('Security Scan: Trivy') {
            steps {
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock $TRIVY_IMAGE image $DOCKER_IMAGE"
            }
        }

        stage('Security Scan: OWASP') {
            steps {
                sh "docker run --rm -v $(pwd):/src $OWASP_IMAGE --scan /src"
            }
        }

        stage('Security Scan: Snyk') {
            steps {
                sh "docker run --rm $SNYK_IMAGE snyk test"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $DOCKER_IMAGE ."
            }
        }

        stage('Run Tests') {
            steps {
                sh "docker run --rm $DOCKER_IMAGE pytest tests/"
            }
        }

        stage('Deploy') {
            steps {
                sh "docker run -d -p 8000:8000 --name fastapi-app $DOCKER_IMAGE"
            }
        }
    }
}
```

---

## **Step 9: Run Jenkins Pipeline**
1. **Go to Jenkins → New Item → Pipeline**
2. **Use Pipeline Script from SCM**
3. Select **Git**, enter repo URL, and credentials
4. **Run the pipeline!** 🚀

---

## **Final Setup Summary**
- ✅ **Jenkins running inside Docker**
- ✅ **Docker permissions fixed for Jenkins**
- ✅ **SonarQube setup**
- ✅ **Trivy, OWASP, Snyk scanning**
- ✅ **Jenkinsfile for automation**
- ✅ **Deployment after successful tests**

🎯 **Your CI/CD is now fully automated for your FastAPI project!** 🚀