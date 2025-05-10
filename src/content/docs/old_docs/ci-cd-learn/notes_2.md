### **Sonar Scanner Setup & Jenkins Pipeline Configuration Guide**  

You want to integrate **SonarQube** into your Jenkins pipeline properly. I'll cover **Sonar Scanner installation, credential setup in Jenkins, pipeline configuration**, and explain **how to structure the pipeline in Jenkins** step by step.  

---

# **1. Sonar Scanner Setup**

### **A. Install Sonar Scanner on Jenkins**
Since your Jenkins is running in a Docker container, we need to install Sonar Scanner inside Jenkins.

1. **Enter the Jenkins container:**
   ```sh
   docker exec -it jenkins bash
   ```

2. **Download & Install Sonar Scanner:**
   ```sh
   wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
   unzip sonar-scanner-cli-5.0.1.3006-linux.zip
   mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
   ```

3. **Set Environment Variables:**
   ```sh
   echo 'export PATH=$PATH:/opt/sonar-scanner/bin' >> ~/.bashrc
   echo 'export SONAR_SCANNER_OPTS="-server"' >> ~/.bashrc
   source ~/.bashrc
   ```

4. **Verify Installation:**
   ```sh
   sonar-scanner -v
   ```

---

# **2. Jenkins Credential Setup**
Jenkins needs **access credentials** for GitHub, SonarQube, Snyk, and DockerHub. These are stored in **Jenkins → Manage Jenkins → Credentials**.

## **A. GitHub Credentials**
**Used for accessing your private GitHub repo.**
- **Type:** SSH Username with private key  
- **ID:** `github-ssh-key`  
- **Username:** Your GitHub username  
- **Private Key:** Paste the SSH private key (from `~/.ssh/id_rsa`)  

---

## **B. SonarQube Credentials**
**Used to authenticate Jenkins with SonarQube.**
1. Go to **SonarQube UI → Administration → Security → Tokens**.
2. Click **Generate Token**, name it `"Jenkins Sonar"`, and save the token.

Now, add this token to Jenkins:

- **Type:** Secret text  
- **ID:** `sonar-token`  
- **Secret:** Paste the SonarQube token  
- **Description:** `"Token for SonarQube analysis"`  

---

## **C. Snyk API Token**
1. Create a Snyk account at [https://snyk.io](https://snyk.io).
2. Generate an API Token (`https://snyk.io/account`).
3. In Jenkins:
   - **Type:** Secret text  
   - **ID:** `snyk-token`  
   - **Secret:** Paste Snyk API token  
   - **Description:** `"Snyk Security Scanner API Token"`  

---

## **D. DockerHub Credentials**
**Used to push the built Docker image.**
- **Type:** Username & Password  
- **ID:** `dockerhub-creds`  
- **Username:** Your DockerHub username  
- **Password:** Your DockerHub password  
- **Description:** `"DockerHub credentials for pushing images"`  

---

# **3. Jenkins Pipeline Configuration**
Now let’s set up the pipeline.

### **A. Create a New Pipeline Job**
1. Open **Jenkins UI** (`http://localhost:8080`).
2. Go to **New Item → Pipeline**.
3. **Enter a Name** (e.g., `FastAPI-CI-CD`).
4. Select **Pipeline**, then click **OK**.
5. Under **Pipeline**, select **Pipeline script from SCM**.
6. **SCM:** Git  
7. **Repository URL:** `git@github.com:your-repo.git`  
8. **Credentials:** Choose `github-ssh-key`.  
9. **Branch:** `main`  

Now, Jenkins will pull the `Jenkinsfile` from GitHub.

---

# **4. Complete Jenkinsfile**
Save this `Jenkinsfile` in the root of your GitHub repo.

```groovy
pipeline {
    agent any

    environment {
        SONARQUBE_URL = "http://sonarqube:9000"
        SONARQUBE_TOKEN = credentials('sonar-token')
        SNYK_TOKEN = credentials('snyk-token')
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'github-ssh-key', url: 'git@github.com:your-repo.git'
            }
        }

        stage('Code Quality Analysis - SonarQube') {
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
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
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

# **5. Running the Pipeline**
1. **Go to Jenkins** → Open the job **FastAPI-CI-CD**.
2. Click **Build Now**.
3. Watch the logs in **Console Output**.

---

# **6. Verifying Deployment**
Once the deployment is complete, check:

✅ **SonarQube Analysis:**  
Go to **http://localhost:9000** and check your project report.

✅ **FastAPI Running:**  
Go to **http://localhost:8000/docs** to see your API.

✅ **Docker Image Pushed:**  
Run `docker images` to verify that the image was built.

✅ **Security Scans Passed:**  
Jenkins should show successful execution of **Trivy, OWASP, and Snyk**.

---

# **Final Thoughts**
You've now set up a **fully automated CI/CD pipeline** in Jenkins for your **FastAPI app**, with:

✔ **SonarQube for code quality**  
✔ **Trivy & OWASP for security scans**  
✔ **Snyk for vulnerability detection**  
✔ **Docker build, test, and deployment**  

Let me know if you need **automatic rollback** or **Slack notifications** on failures! 🚀