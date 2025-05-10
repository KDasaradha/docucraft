This is a full-fledged CI/CD setup with security scanning, code quality checks, and automated deployment. I’ll break everything down step by step, including command-line instructions, configurations, and the Jenkinsfile.

---

## **1. Setting Up Jenkins in Docker Desktop (Windows + WSL)**

### **Step 1: Create a Docker Network**
First, create a dedicated Docker network to allow Jenkins, SonarQube, and other services to communicate.

```sh
docker network create jenkins_network
```

### **Step 2: Create a Jenkins Container**
Run Jenkins in a Docker container with the required permissions.

```sh
docker run -d --name jenkins \
  --restart=always \
  --network jenkins_network \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### **Step 3: Retrieve Jenkins Admin Password**
Check Jenkins logs to get the initial admin password:

```sh
docker logs jenkins | grep -i "admin"
```

Then, visit `http://localhost:8080` and enter the password to set up Jenkins.

### **Step 4: Install Required Jenkins Plugins**
Go to **Manage Jenkins → Plugin Manager** and install the following plugins:

#### **Install via Jenkins CLI (Inside Jenkins Container)**
```sh
docker exec -it jenkins bash
```
Then run:

```sh
jenkins-plugin-cli --plugins git pipeline-stage-view workflow-aggregator credentials-binding docker-workflow sonar docker-plugin trivy OWASP-Dependency-Check snyk-security-scanner
```

---

## **2. Grant Jenkins Permission to Use Docker**
Since Jenkins runs inside a container, it needs access to the Docker daemon.

### **Step 1: Add Jenkins User to Docker Group**
Run:

```sh
docker exec -it jenkins bash
```

Inside the Jenkins container:

```sh
groupadd docker
usermod -aG docker jenkins
chown root:docker /var/run/docker.sock
chmod 666 /var/run/docker.sock
exit
```

Restart Jenkins:

```sh
docker restart jenkins
```

---

## **3. Setting Up SonarQube in Docker**
SonarQube will be used for code analysis.

```sh
docker run -d --name sonarqube \
  --restart=always \
  --network jenkins_network \
  -p 9000:9000 \
  -e SONARQUBE_JDBC_URL=jdbc:postgresql://sonarqube_db:5432/sonar \
  sonarqube:lts-community
```

### **Step 1: Get SonarQube Admin Password**
Once SonarQube starts, access it at `http://localhost:9000`. Default credentials:

- **Username:** `admin`
- **Password:** `admin`

Go to **Administration → Security → Tokens**, create a new token, and save it.

---

## **4. Setting Up Security Scanners in Docker**

### **Trivy (Container & Dependency Scanner)**
```sh
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image jenkinsci/jenkins
```

### **OWASP Dependency Check**
```sh
docker run --rm -v $(pwd):/src owasp/dependency-check --scan /src
```

### **Snyk Scanner**
Create a Snyk API token from https://snyk.io and run:

```sh
docker run -e SNYK_TOKEN=your_token snyk/snyk-cli test --docker jenkinsci/jenkins
```

---

## **5. Writing the Jenkinsfile**
Create a file named `Jenkinsfile` in the root of your FastAPI project.

```groovy
pipeline {
    agent any

    environment {
        SONARQUBE_URL = "http://sonarqube:9000"
        SONARQUBE_TOKEN = credentials('sonar-token') // Add in Jenkins credentials store
        SNYK_TOKEN = credentials('snyk-token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'github-ssh-key', url: 'git@github.com:your-repo.git'
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                script {
                    sh """
                    sonar-scanner -Dsonar.projectKey=my-fastapi-app \
                                  -Dsonar.sources=. \
                                  -Dsonar.host.url=${SONARQUBE_URL} \
                                  -Dsonar.login=${SONARQUBE_TOKEN}
                    """
                }
            }
        }

        stage('Security Scans - Trivy & OWASP') {
            steps {
                script {
                    sh 'trivy fs --exit-code 1 --severity HIGH,CRITICAL .'
                    sh 'dependency-check --scan .'
                }
            }
        }

        stage('Snyk Security Scan') {
            steps {
                script {
                    sh 'snyk test --all-projects'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t my-fastapi-app .'
                }
            }
        }

        stage('Run Unit Tests') {
            steps {
                script {
                    sh 'docker run --rm my-fastapi-app pytest tests/'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh """
                    docker tag my-fastapi-app my-dockerhub-user/my-fastapi-app:latest
                    docker login -u my-dockerhub-user -p my-dockerhub-password
                    docker push my-dockerhub-user/my-fastapi-app:latest
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                    docker stop fastapi-app || true
                    docker rm fastapi-app || true
                    docker run -d --name fastapi-app -p 8000:8000 my-dockerhub-user/my-fastapi-app:latest
                    """
                }
            }
        }
    }
}
```

---

## **6. Configuring Jenkins Credentials**
Go to **Jenkins → Manage Jenkins → Credentials** and add:

1. **GitHub SSH Key** → ID: `github-ssh-key`
2. **SonarQube Token** → ID: `sonar-token`
3. **Snyk API Token** → ID: `snyk-token`
4. **DockerHub Credentials** → ID: `dockerhub-creds`

---

## **7. Running the Pipeline**
1. In Jenkins, go to **New Item → Pipeline**.
2. Select **Pipeline from SCM**, enter the GitHub URL, and save.
3. Click **Build Now** to run the pipeline.

---

## **8. Verifying the Deployment**
After the pipeline runs successfully, access your FastAPI app at:

```
http://localhost:8000/docs
```

---

## **Conclusion**
You've now set up a complete CI/CD pipeline for your FastAPI app with:

✅ **Jenkins in Docker**  
✅ **Code Quality Analysis (SonarQube)**  
✅ **Security Scanning (Trivy, OWASP, Snyk)**  
✅ **Docker Image Build & Test Execution**  
✅ **Automated Deployment**  

Would you like to add automatic rollback in case of failure? 🚀