---
title: AWS Jenkins Pipeline
description: Placeholder content for AWS Jenkins Pipeline.
order: 2
---

# AWS Jenkins Pipeline

Below are detailed, step-by-step notes on how to create a Jenkins CI/CD pipeline for a FastAPI application in the AWS Cloud using a free-tier account. This guide incorporates Git, Jenkins, Docker, SonarQube, SonarScanner, Snyk, Trivy, and OWASP tools for a secure and efficient pipeline. Since you're on the AWS free tier, we'll use an EC2 `t2.micro` instance and ensure all tools fit within free-tier limits where possible.

---

### Prerequisites
1. **AWS Free Tier Account**: Sign up at [aws.amazon.com/free](https://aws.amazon.com/free) if you don’t have one.
2. **FastAPI App**: A basic FastAPI app in a private Git repository (e.g., GitHub).
3. **Tools**:
   - Git: For source control.
   - Jenkins: CI/CD orchestration.
   - Docker: Containerization.
   - SonarQube/SonarScanner: Code quality analysis.
   - Snyk: Dependency vulnerability scanning.
   - Trivy: Container image and filesystem scanning.
   - OWASP Dependency-Check: Dependency vulnerability analysis.
4. **Local Setup**: Install AWS CLI (`aws configure`) and Git on your local machine.

---

### Step-by-Step Guide

#### 1. Set Up AWS EC2 Instance (Free Tier)
- **Launch EC2 Instance**:
  - Log in to AWS Console > EC2 > Launch Instance.
  - Name: `Jenkins-Server`.
  - OS: Amazon Linux 2 AMI (free-tier eligible).
  - Instance Type: `t2.micro` (1 vCPU, 1 GB RAM, free-tier eligible).
  - Key Pair: Create or use an existing key pair (e.g., `my-key.pem`) for SSH.
  - Security Group: Allow ports:
    - 22 (SSH)
    - 8080 (Jenkins)
    - 9000 (SonarQube)
  - Storage: 8 GB (free-tier default).
- **Connect to EC2**:
  - SSH into your instance: `ssh -i my-key.pem ec2-user@<public-ip>`.

#### 2. Install Required Tools on EC2
Run these commands as `ec2-user` to set up the environment:

- **Update System**:
  ```bash
  sudo yum update -y
  ```

- **Install Java (Jenkins Requirement)**:
  ```bash
  sudo yum install java-17-amazon-corretto -y
  sudo alternatives --config java
  ```

- **Install Jenkins**:
  ```bash
  sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
  sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
  sudo yum install jenkins -y
  sudo systemctl start jenkins
  sudo systemctl enable jenkins
  ```

- **Install Git**:
  ```bash
  sudo yum install git -y
  ```

- **Install Docker**:
  ```bash
  sudo yum install docker -y
  sudo usermod -aG docker ec2-user
  sudo usermod -aG docker jenkins
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

- **Install SonarQube (via Docker)**:
  ```bash
  sudo docker run -d --name sonarqube -p 9000:9000 sonarqube:community
  ```
  - Access SonarQube at `http://<ec2-public-ip>:9000` (default login: `admin`/`admin`, then change password).

- **Install SonarScanner**:
  ```bash
  sudo wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
  sudo unzip sonar-scanner-cli-4.8.0.2856-linux.zip -d /opt
  sudo mv /opt/sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner
  sudo ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
  ```

- **Install Trivy**:
  ```bash
  sudo rpm -ivh https://github.com/aquasecurity/trivy/releases/download/v0.38.3/trivy_0.38.3_Linux-64bit.rpm
  ```

- **Install Snyk CLI**:
  ```bash
  curl -sL https://static.snyk.io/cli/latest/snyk-linux -o snyk
  sudo mv snyk /usr/local/bin/
  sudo chmod +x /usr/local/bin/snyk
  ```

- **Install Python (for FastAPI)**:
  ```bash
  sudo yum install python3 -y
  sudo pip3 install fastapi uvicorn
  ```

#### 3. Configure Jenkins
- **Access Jenkins**:
  - Open `http://<ec2-public-ip>:8080`.
  - Get initial admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`.
  - Install suggested plugins and create an admin user.

- **Install Plugins**:
  - Go to `Manage Jenkins > Manage Plugins > Available`.
  - Install:
    - Git
    - Pipeline
    - Docker Pipeline
    - SonarQube Scanner
    - OWASP Dependency-Check
    - Credentials Binding

- **Configure Tools**:
  - `Manage Jenkins > Global Tool Configuration`:
    - **SonarQube Scanner**: Add, name it `sonar-scanner`, install automatically.
    - **Docker**: Add, name it `docker`, install automatically.

- **Add Credentials**:
  - `Manage Jenkins > Manage Credentials > Global`:
    - Git: Add SSH key or username/token for your private repo.
    - Snyk: Add API token (get from [snyk.io](https://snyk.io)).
    - Docker Hub: Add username/password (optional for pushing images).

- **Configure SonarQube**:
  - In SonarQube UI, create a project and generate a token.
  - In Jenkins, `Manage Jenkins > Configure System > SonarQube Servers`:
    - Name: `sonarqube`.
    - Server URL: `http://localhost:9000`.
    - Add token as credentials.

#### 4. Prepare FastAPI App
- **Sample FastAPI App** (if you don’t have one):
  ```python
  # main.py
  from fastapi import FastAPI
  app = FastAPI()
  @app.get("/")
  def read_root():
      return {"message": "Hello from FastAPI"}
  ```
- **Dockerfile**:
  ```dockerfile
  FROM python:3.9-slim
  WORKDIR /app
  COPY . .
  RUN pip install fastapi uvicorn
  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
  ```
- **requirements.txt**:
  ```
  fastapi
  uvicorn
  ```
- Push to your private Git repo.

#### 5. Create Jenkins Pipeline
- **New Item**:
  - Name: `FastAPI-CICD`.
  - Type: Pipeline > OK.

- **Pipeline Script** (Paste this in `Pipeline > Script`):
  ```groovy
  pipeline {
      agent any
      environment {
          SNYK_TOKEN = credentials('snyk-token') // Snyk credential ID
          DOCKERHUB_CRED = credentials('dockerhub-cred') // Optional
      }
      tools {
          sonarQubeScanner 'sonar-scanner'
      }
      stages {
          stage('Checkout') {
              steps {
                  git branch: 'main', url: 'https://github.com/<your-username>/<your-repo>.git', credentialsId: 'git-cred'
              }
          }
          stage('Install Dependencies') {
              steps {
                  sh 'pip3 install -r requirements.txt'
              }
          }
          stage('SonarQube Analysis') {
              steps {
                  withSonarQubeEnv('sonarqube') {
                      sh 'sonar-scanner -Dsonar.projectKey=fastapi-app -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000'
                  }
              }
          }
          stage('Snyk Security Scan') {
              steps {
                  sh 'snyk test --all-projects --severity-threshold=high --token=$SNYK_TOKEN'
              }
          }
          stage('OWASP Dependency Check') {
              steps {
                  dependencyCheck additionalArguments: '--scan ./ --format HTML', odcInstallation: 'default'
                  dependencyCheckPublisher pattern: 'dependency-check-report.xml'
              }
          }
          stage('Build Docker Image') {
              steps {
                  sh 'docker build -t fastapi-app:latest .'
              }
          }
          stage('Trivy Scan') {
              steps {
                  sh 'trivy image --severity HIGH,CRITICAL fastapi-app:latest > trivy-report.txt'
              }
          }
          stage('Push Docker Image') { // Optional
              steps {
                  script {
                      docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-cred') {
                          sh 'docker tag fastapi-app:latest <your-dockerhub-username>/fastapi-app:latest'
                          sh 'docker push <your-dockerhub-username>/fastapi-app:latest'
                      }
                  }
              }
          }
          stage('Deploy Locally') {
              steps {
                  sh 'docker run -d -p 80:80 fastapi-app:latest'
              }
          }
      }
      post {
          always {
              archiveArtifacts artifacts: 'trivy-report.txt, dependency-check-report.html', allowEmptyArchive: true
          }
      }
  }
  ```
  - Replace `<your-username>`, `<your-repo>`, and credential IDs as needed.

#### 6. Configure Git Webhook (Optional Automation)
- In your GitHub repo:
  - `Settings > Webhooks > Add Webhook`.
  - Payload URL: `http://<ec2-public-ip>:8080/github-webhook/`.
  - Content Type: `application/json`.
  - Events: `Just the push event`.
- In Jenkins job: Check `GitHub hook trigger for GITScm polling`.

#### 7. Run and Test the Pipeline
- Click `Build Now` in Jenkins.
- Monitor stages in the pipeline view.
- Access the app: `http://<ec2-public-ip>:80` (if deployed locally).

---

### Guidance and Best Practices
- **Free Tier Limits**:
  - `t2.micro` has 1 GB RAM, which may struggle with all tools running simultaneously. Stop unused services (e.g., SonarQube) when not needed.
  - Stay within 750 hours/month of EC2 usage.
- **Security**:
  - Use IAM roles instead of hardcoding AWS credentials.
  - Restrict Security Group rules to your IP for SSH (port 22).
  - Store sensitive data (e.g., Snyk token) in Jenkins credentials.
- **Optimization**:
  - Cache dependencies in Docker to speed up builds.
  - Use multi-stage Docker builds if your app grows complex.
- **Troubleshooting**:
  - Check Jenkins logs: `/var/lib/jenkins/jobs/FastAPI-CICD/builds/<build-number>/log`.
  - Ensure Docker has permissions: `sudo chmod 666 /var/run/docker.sock`.
  - Verify SonarQube is running: `sudo docker ps`.

---

### Notes
- **SonarQube**: Runs locally on EC2; adjust memory if needed (`docker run -e SONARQUBE_JAVA_OPTS="-Xmx512m"`).
- **Snyk**: Free tier limits scans; upgrade if needed for extensive use.
- **Trivy**: Lightweight and free, ideal for container scanning.
- **OWASP**: Reports are archived for review; set thresholds to fail builds on critical issues.
- **Deployment**: This deploys locally on EC2. For production, consider AWS ECS or EKS (beyond free tier).

## Let me know if you need help with specific steps or run into issues!

Below are detailed notes on setting up an **EC2 Instance**, **VPC**, **Subnet**, and **Security Group** in AWS, tailored for deploying a FastAPI app with a Jenkins CI/CD pipeline (as in your previous request). These notes assume you're using an AWS free-tier account and aim to provide a clear, structured understanding with guidance for your use case.

---

### 1. Virtual Private Cloud (VPC)
A VPC is a virtual network in AWS where your resources (e.g., EC2 instances) reside. AWS provides a default VPC, but creating a custom one gives you more control.

#### Steps to Create a Custom VPC
1. **Navigate to VPC Dashboard**:
   - AWS Console > Services > VPC > "Create VPC".
2. **Configure VPC**:
   - Name: `FastAPI-VPC`.
   - IPv4 CIDR Block: `10.0.0.0/16` (provides 65,536 IP addresses; free-tier compatible).
   - IPv6 CIDR: (Optional, leave unselected for simplicity).
   - Tenancy: Default (shared hardware, free-tier eligible).
3. **Create**:
   - Click "Create VPC" > Note the VPC ID (e.g., `vpc-12345678`).

#### Key Notes
- **Purpose**: Isolates your resources for security and networking control.
- **Free Tier**: VPC creation is free; costs come from resources inside it (e.g., EC2).
- **Default VPC**: If you skip this, AWS provides a default VPC (e.g., `172.31.0.0/16`), but it’s less customizable.

---

### 2. Subnet
Subnets divide your VPC into smaller IP ranges for organizing resources across Availability Zones (AZs). You’ll need at least one subnet for your EC2 instance.

#### Steps to Create a Subnet
1. **Navigate to Subnets**:
   - VPC Dashboard > "Subnets" > "Create Subnet".
2. **Configure Subnet**:
   - VPC: Select `FastAPI-VPC`.
   - Name: `FastAPI-Subnet-Public`.
   - Availability Zone: Choose one (e.g., `us-east-1a`).
   - IPv4 CIDR Block: `10.0.1.0/24` (256 IP addresses; `10.0.1.0 - 10.0.1.255`).
3. **Create**:
   - Click "Create Subnet" > Note the Subnet ID (e.g., `subnet-12345678`).
4. **Enable Public IP** (for internet access):
   - Select the subnet > "Actions" > "Modify auto-assign IP settings" > Check "Enable auto-assign public IPv4 address" > Save.

#### Key Notes
- **Public vs. Private**: This is a public subnet (internet-facing) for Jenkins/SonarQube access. Private subnets (no public IP) are for databases or internal services.
- **CIDR Size**: `/24` is sufficient for small setups; adjust for larger needs (e.g., `/22` for 1024 IPs).
- **Free Tier**: Subnets are free; usage depends on attached resources.

---

### 3. Internet Gateway (IGW) and Route Table
For your subnet to be public, it needs an Internet Gateway and a route to the internet.

#### Steps to Set Up
1. **Create Internet Gateway**:
   - VPC Dashboard > "Internet Gateways" > "Create Internet Gateway".
   - Name: `FastAPI-IGW` > Create > Attach to `FastAPI-VPC`.
2. **Update Route Table**:
   - VPC Dashboard > "Route Tables" > Select the route table associated with `FastAPI-VPC` (or create a new one).
   - Name: `FastAPI-Route-Table`.
   - Routes tab > "Edit routes" > Add:
     - Destination: `0.0.0.0/0` (all traffic).
     - Target: `FastAPI-IGW` (select your IGW).
   - Subnet Associations tab > "Edit subnet associations" > Associate with `FastAPI-Subnet-Public`.

#### Key Notes
- **Purpose**: Allows your EC2 instance to communicate with the internet (e.g., for Git, Docker pulls).
- **Free Tier**: IGW is free; data transfer costs apply if you exceed 1 GB outbound (unlikely in small setups).

---

### 4. Security Group
A Security Group acts as a virtual firewall to control inbound and outbound traffic to your EC2 instance.

#### Steps to Create a Security Group
1. **Navigate to Security Groups**:
   - VPC Dashboard > "Security Groups" > "Create Security Group".
2. **Configure Security Group**:
   - Name: `FastAPI-SG`.
   - Description: "Security group for Jenkins and FastAPI".
   - VPC: Select `FastAPI-VPC`.
3. **Inbound Rules**:
   - Add rules:
     - **SSH**: Type: SSH, Protocol: TCP, Port: 22, Source: `Your IP` (e.g., `203.0.113.0/32`) or `0.0.0.0/0` (less secure).
     - **Jenkins**: Type: Custom TCP, Port: 8080, Source: `0.0.0.0/0` (or restrict to your IP).
     - **SonarQube**: Type: Custom TCP, Port: 9000, Source: `0.0.0.0/0`.
     - **FastAPI**: Type: HTTP, Port: 80, Source: `0.0.0.0/0`.
4. **Outbound Rules**:
   - Default: Allow all traffic (0.0.0.0/0) for simplicity.
5. **Create**:
   - Click "Create Security Group" > Note the SG ID (e.g., `sg-12345678`).

#### Key Notes
- **Granularity**: Restrict sources (e.g., your IP) for production; `0.0.0.0/0` is fine for testing.
- **Free Tier**: Security Groups are free; no additional cost.

---

### 5. EC2 Instance
Now, launch an EC2 instance in your custom VPC for Jenkins and your FastAPI app.

#### Steps to Launch EC2
1. **Navigate to EC2 Dashboard**:
   - AWS Console > EC2 > "Launch Instance".
2. **Configure Instance**:
   - Name: `Jenkins-FastAPI-Server`.
   - AMI: Amazon Linux 2 (free-tier eligible).
   - Instance Type: `t2.micro` (free-tier eligible).
   - Key Pair: Create or select an existing key (e.g., `my-key.pem`).
3. **Network Settings**:
   - VPC: `FastAPI-VPC`.
   - Subnet: `FastAPI-Subnet-Public`.
   - Auto-assign Public IP: Enable.
   - Security Group: Select `FastAPI-SG`.
4. **Storage**:
   - 8 GB gp2 SSD (free-tier default).
5. **Launch**:
   - Click "Launch Instance" > Note the Public IP (e.g., `54.123.45.67`).

#### Connect to EC2
- SSH: `ssh -i my-key.pem ec2-user@<public-ip>`.

#### Key Notes
- **Free Tier**: 750 hours/month of `t2.micro` usage; stop the instance when not in use to save hours.
- **Purpose**: Hosts Jenkins, SonarQube, and your FastAPI app (via Docker).

---

### Putting It Together (Example Setup)
1. **VPC**: `FastAPI-VPC` (`10.0.0.0/16`).
2. **Subnet**: `FastAPI-Subnet-Public` (`10.0.1.0/24`) in `us-east-1a`.
3. **Internet Gateway**: `FastAPI-IGW` attached to `FastAPI-VPC`.
4. **Route Table**: Routes `0.0.0.0/0` to `FastAPI-IGW`, associated with `FastAPI-Subnet-Public`.
5. **Security Group**: `FastAPI-SG` with ports 22, 80, 8080, 9000 open.
6. **EC2**: `Jenkins-FastAPI-Server` in `FastAPI-Subnet-Public` with `FastAPI-SG`.

---

### Guidance and Best Practices
- **VPC**:
  - Use multiple subnets across AZs for high availability (beyond free tier).
  - Tag resources (e.g., `Name: FastAPI-VPC`) for organization.
- **Subnet**:
  - Reserve private subnets (e.g., `10.0.2.0/24`) for future databases or internal services.
  - Ensure public subnets have a route to the internet via IGW.
- **Security Group**:
  - Avoid `0.0.0.0/0` for SSH in production; use a bastion host or VPN instead.
  - Log traffic with VPC Flow Logs (not free-tier) for debugging.
- **EC2**:
  - Use an Elastic IP (free while attached) if you need a static public IP.
  - Automate setup with a User Data script (e.g., install Jenkins/Docker on launch):
    ```bash
    #!/bin/bash
    yum update -y
    yum install java-openjdk11 docker git -y
    systemctl start docker
    systemctl enable docker
    wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
    yum install jenkins -y
    systemctl start jenkins
    systemctl enable jenkins
    ```

---

### Verification
- SSH into EC2: `ssh -i my-key.pem ec2-user@<public-ip>`.
- Check VPC/Subnet: `curl http://169.254.169.254/latest/meta-data/network/interfaces/macs/`.
- Test Jenkins: `http://<public-ip>:8080`.
- Test FastAPI (after deployment): `http://<public-ip>:80`.

This setup aligns with your Jenkins CI/CD pipeline requirements while staying within AWS free-tier limits. Let me know if you need further clarification or assistance!