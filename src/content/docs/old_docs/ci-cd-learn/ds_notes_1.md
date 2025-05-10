Let's break this down into detailed steps. I'll cover Jenkins setup, plugins, Docker integration, SonarQube setup, and provide a complete Jenkinsfile.

### 1. Setup Jenkins in Docker Desktop (WSL2)
```bash
# Create Jenkins home directory in WSL
mkdir ~/jenkins_home

# Run Jenkins container with Docker-in-Docker setup
docker run -d --name jenkins \
  -u root \
  -p 8080:8080 -p 50000:50000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts-jdk11
```

### 2. Initial Jenkins Setup
1. Access `http://localhost:8080`
2. Get admin password: `cat ~/jenkins_home/secrets/initialAdminPassword`
3. Install suggested plugins + add these later:
   - Docker Pipeline
   - SonarQube Scanner
   - OWASP Dependency-Check
   - Snyk Security Scanner
   - Blue Ocean
   - NodeJS (for Trivy if needed)

### 3. Configure Docker in Jenkins
```bash
# Enter Jenkins container
docker exec -it jenkins bash

# Inside container:
apt update && apt install -y docker.io
usermod -aG docker jenkins
exit

# Restart Jenkins container
docker restart jenkins
```

### 4. Setup SonarQube
```bash
# Create separate container
docker run -d --name sonarqube \
  -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  sonarqube:lts-community
```
- Access `http://localhost:9000` (admin/admin)
- Generate token: My Account > Security > Generate Token
- Configure in Jenkins: Manage Jenkins > System > SonarQube servers

### 5. Install Required Tools in Jenkins Container
```bash
docker exec -it jenkins bash

# Install Trivy
apt install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | tee -a /etc/apt/sources.list.d/trivy.list
apt update && apt install -y trivy

# Install OWASP Dependency-Check
wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.2.1/dependency-check-8.2.1-release.zip
unzip dependency-check-8.2.1-release.zip -d /opt/
```

### 6. Jenkins Credentials Setup
Add these credentials in Jenkins:
1. Docker Hub credentials (Username/Password)
2. SonarQube Token (Secret text)
3. Snyk Token (Secret text)

### 7. Jenkinsfile (Full Pipeline)
```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'yourusername/fastapi-app'
        DOCKER_TAG = "build-${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Dsonar.login=${SONARQUBE_TOKEN}"
    }

    stages {
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yourusername/your-repo.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner \
                        -Dsonar.projectKey=fastapi-app \
                        -Dsonar.projectName=FastAPI-App \
                        -Dsonar.sources=. \
                        -Dsonar.python.version=3.8'
                }
            }
        }

        stage('Security Scans') {
            steps {
                script {
                    // Trivy File System Scan
                    sh 'trivy fs .'

                    // Trivy Dependency Scan
                    sh 'trivy repo .'

                    // OWASP Dependency Check
                    sh '/opt/dependency-check/bin/dependency-check.sh \
                        --project "FastAPI App" \
                        --scan . \
                        --out ./reports/'

                    // Snyk Scan (requires plugin)
                    snykSecurity(
                        snykInstallation: 'Snyk-CLI',
                        command: 'test',
                        target: '.'
                    )
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").inside {
                        sh 'pytest tests/'
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                    }
                }
            }
        }
    }

    post {
        always {
            // Cleanup workspace
            cleanWs()
            // Archive reports
            archiveArtifacts artifacts: 'reports/**/*'
        }
        failure {
            // Send notifications
            emailext body: 'Build failed!', subject: 'Build Failed', to: 'dev@example.com'
        }
    }
}
```

### 8. Pipeline Configuration
1. Create new Pipeline job in Jenkins
2. Select "Pipeline script from SCM"
3. Configure your repository details
4. Set Jenkinsfile path to `Jenkinsfile` (root directory)

### 9. Required File Structure
```
your-repo/
├── Jenkinsfile
├── Dockerfile
├── sonar-project.properties
├── requirements.txt
└── tests/
```

### 10. sonar-project.properties
```properties
sonar.projectKey=fastapi-app
sonar.projectName=FastAPI App
sonar.sourceEncoding=UTF-8
sonar.sources=.
sonar.language=py
sonar.python.version=3.8
```

### 11. Dockerfile Example
```dockerfile
FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 12. Important Notes
1. Ensure Docker Desktop is running in Windows
2. Share drive in Docker Desktop settings (for volume mounts)
3. Configure WSL2 integration in Docker Desktop
4. For Snyk scans:
   - Install Snyk CLI in Jenkins container
   - Configure Snyk plugin with API token
5. Adjust memory limits for SonarQube (minimum 2GB RAM)
6. For Windows paths in WSL:
   - Use `/mnt/c/...` for Windows paths
   - Better to work entirely in WSL filesystem

### 13. Troubleshooting Tips
1. Check Docker permissions in Jenkins container:
   ```bash
   docker exec jenkins docker ps
   ```
2. Verify SonarQube accessibility from Jenkins container:
   ```bash
   docker exec jenkins curl http://host.docker.internal:9000
   ```
3. Check Jenkins logs:
   ```bash
   docker logs jenkins
   ```

This setup creates a complete security-focused pipeline with multiple quality gates. Adjust the thresholds and quality profiles in SonarQube according to your project requirements.