---
title: Elastic Beanstalk
description: Placeholder content for AWS Elastic Beanstalk.
order: 5
---

# AWS Elastic Beanstalk

Here are detailed notes on how to use **Amazon Elastic Beanstalk (EB)**, an AWS service that simplifies the deployment and management of applications in the cloud. These notes cover the basics, setup, deployment, and management steps.

---

### **What is Amazon Elastic Beanstalk?**
- **Definition**: Elastic Beanstalk is a Platform-as-a-Service (PaaS) offering from AWS that automates the deployment, scaling, and management of applications.
- **Purpose**: It allows developers to focus on writing code without worrying about infrastructure management (e.g., EC2 instances, load balancers, auto-scaling).
- **Supported Languages/Frameworks**: Java, .NET, PHP, Node.js, Python, Ruby, Go, Docker, etc.
- **Key Features**:
  - Automatic scaling
  - Load balancing
  - Health monitoring
  - Easy deployment via ZIP files, Git, or Docker containers

---

### **Key Components**
1. **Application**: The top-level resource in Elastic Beanstalk, representing your project.
2. **Environment**: A specific instance of your application (e.g., production, staging) running on AWS resources.
3. **Environment Tier**:
   - **Web Server Tier**: For web applications that handle HTTP requests.
   - **Worker Tier**: For background processing tasks (e.g., using SQS queues).
4. **Configuration**: Settings for the environment (e.g., instance type, scaling rules).

---

### **Prerequisites**
- **AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com).
- **AWS CLI**: Install and configure it (optional but recommended).
  - Command: `aws configure` (enter Access Key, Secret Key, region, etc.).
- **Application Code**: Prepare your app (e.g., a Python Flask app, Node.js app, etc.).
- **IAM Permissions**: Ensure your AWS user has permissions for Elastic Beanstalk, EC2, S3, etc.

---

### **Steps to Use Elastic Beanstalk**

#### **1. Prepare Your Application**
- **Structure**: Ensure your app is in a format EB understands:
  - A ZIP file containing your code and dependencies.
  - Include a `Procfile` or configuration file (e.g., `application.py` for Python) if needed.
  - For example:
    ```
    my-app/
    ├── application.py
    ├── requirements.txt
    └── .ebextensions/
        └── python.config
    ```
- **Dependencies**: List them (e.g., `requirements.txt` for Python, `package.json` for Node.js).
- **Configuration Files** (optional):
  - `.ebextensions/`: Customize the environment (e.g., install packages, set environment variables).
  - Example `python.config`:
    ```yaml
    option_settings:
      aws:elasticbeanstalk:container:python:
        WSGIPath: application:application
    ```

#### **2. Create an Application in Elastic Beanstalk**
- **Via AWS Management Console**:
  1. Go to the Elastic Beanstalk service in the AWS Console.
  2. Click **Create Application**.
  3. Enter an **Application Name** (e.g., "MyWebApp").
  4. Optionally add a description.
- **Via AWS CLI**:
  ```bash
  aws elasticbeanstalk create-application --application-name MyWebApp --description "My first EB app"
  ```

#### **3. Create an Environment**
- **Via Console**:
  1. After creating the application, click **Create Environment**.
  2. Choose **Web Server Environment** or **Worker Environment**.
  3. Select a **Platform** (e.g., Python, Node.js).
  4. Upload your application ZIP file or use a sample app to test.
  5. Configure environment settings (e.g., domain, instance type).
  6. Click **Create Environment**.
- **Via CLI**:
  ```bash
  aws elasticbeanstalk create-environment \
      --application-name MyWebApp \
      --environment-name MyWebAppEnv \
      --solution-stack-name "64bit Amazon Linux 2 v3.3.13 running Python 3.8" \
      --option-settings file://options.json
  ```
  - `options.json` example:
    ```json
    [
      {"Namespace": "aws:autoscaling:asg", "OptionName": "MinSize", "Value": "1"},
      {"Namespace": "aws:autoscaling:asg", "OptionName": "MaxSize", "Value": "4"}
    ]
  ```

#### **4. Deploy Your Application**
- **Via Console**:
  1. Go to your environment in EB.
  2. Click **Upload and Deploy**.
  3. Upload the ZIP file of your app.
  4. Click **Deploy**.
- **Via CLI**:
  1. Zip your application:
     ```bash
     zip -r myapp.zip . -x "*.git*"
     ```
  2. Deploy:
     ```bash
     aws elasticbeanstalk update-environment \
         --environment-name MyWebAppEnv \
         --version-label v1 \
         --application-name MyWebApp
     ```
  - Note: You may need to create a version first:
     ```bash
     aws elasticbeanstalk create-application-version \
         --application-name MyWebApp \
         --version-label v1 \
         --source-bundle S3Bucket="my-bucket",S3Key="myapp.zip"
     ```

#### **5. Monitor and Manage**
- **Console**:
  - Go to the **Environment Dashboard**.
  - Check **Health**, **Logs**, **Events**, and **Monitoring**.
  - Adjust scaling settings under **Configuration** (e.g., min/max instances).
- **CLI**:
  - Check environment status:
    ```bash
    aws elasticbeanstalk describe-environments --environment-name MyWebAppEnv
    ```
  - Tail logs:
    ```bash
    aws elasticbeanstalk request-environment-info --environment-name MyWebAppEnv
    aws elasticbeanstalk retrieve-environment-info --environment-name MyWebAppEnv
    ```

#### **6. Update or Roll Back**
- **Update**:
  - Upload a new ZIP file and deploy it (same steps as deployment).
- **Roll Back**:
  - In the console, go to **Application Versions**, select a previous version, and deploy it.
  - Via CLI:
    ```bash
    aws elasticbeanstalk update-environment \
        --environment-name MyWebAppEnv \
        --version-label v1
    ```

#### **7. Terminate Environment**
- **Console**: Go to the environment, click **Actions** > **Terminate Environment**.
- **CLI**:
  ```bash
  aws elasticbeanstalk terminate-environment --environment-name MyWebAppEnv
  ```

---

### **Best Practices**
- **Version Control**: Use Git to manage your codebase and deploy via EB’s Git integration (`eb deploy` with EB CLI).
- **EB CLI**: Install it for easier management:
  ```bash
  pip install awsebcli
  eb init
  eb create
  eb deploy
  ```
- **Environment Variables**: Set them in `.ebextensions` or the console to avoid hardcoding secrets.
- **Scaling**: Configure auto-scaling based on CPU usage or request count.
- **Logging**: Enable log rotation and store logs in S3 for debugging.

---

### **Troubleshooting**
- **Deployment Fails**: Check the **Events** tab or logs (`/var/log/`) in the EB console.
- **App Not Accessible**: Ensure security groups allow port 80/443 and the health check path (e.g., `/`) is correct.
- **Permission Issues**: Verify IAM roles for EB and EC2.

---

### **Example Workflow (Python App)**
1. Create a simple Flask app:
   ```python
   # application.py
   from flask import Flask
   application = Flask(__name__)

   @application.route('/')
   def hello():
       return "Hello, Elastic Beanstalk!"
   ```
2. Add `requirements.txt`:
   ```
   Flask==2.0.1
   ```
3. Zip the app:
   ```bash
   zip -r myapp.zip application.py requirements.txt
   ```
4. Deploy via console or CLI as described above.
5. Access the app at the provided EB URL (e.g., `mywebappenv.elasticbeanstalk.com`).

---

These notes should give you a solid foundation for using Elastic Beanstalk. Let me know if you need clarification or help with a specific use case!