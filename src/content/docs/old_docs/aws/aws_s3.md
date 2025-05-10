---
title: S3
description: Placeholder content for AWS S3.
order: 4
---

# AWS S3

Below are detailed notes on **Amazon S3 (Simple Storage Service)**, including what it is, how to create an S3 bucket, and how to fetch and use credentials to store data in buckets. These notes are structured for clarity and practical use.

---

### **What is Amazon S3?**
- **Definition**: Amazon S3 is an object storage service provided by AWS, designed for scalability, durability, and security.
- **Purpose**: Store and retrieve any amount of data (e.g., files, images, backups) at any time.
- **Key Features**:
  - 99.999999999% (11 nines) durability.
  - Unlimited storage capacity.
  - Supports various storage classes (e.g., Standard, Glacier, Intelligent-Tiering).
  - Access control via IAM policies, bucket policies, and ACLs.
- **Use Cases**: Backup, static website hosting, data lakes, media storage.

---

### **Key Concepts**
1. **Bucket**: A container for objects (similar to a folder but flat in structure).
2. **Object**: Any file or data stored in a bucket (e.g., `.txt`, `.jpg`, `.pdf`), identified by a unique key.
3. **Key**: The name of the object within the bucket (e.g., `photos/image.jpg`).
4. **Region**: The AWS region where the bucket is created (e.g., `us-east-1`).
5. **Storage Classes**:
   - **Standard**: Frequent access.
   - **Infrequent Access (IA)**: Less frequent but quick access.
   - **Glacier**: Archival storage (cheaper, slower retrieval).

---

### **Prerequisites**
- **AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com).
- **IAM User**: Create an IAM user with S3 permissions (optional but recommended for security).
- **AWS CLI**: Install and configure it (optional):
  ```bash
  aws configure
  ```
  - Enter Access Key, Secret Key, region, and output format.

---

### **Steps to Create an S3 Bucket**

#### **1. Via AWS Management Console**
1. **Log in to AWS Console**:
   - Navigate to the S3 service.
2. **Create a Bucket**:
   - Click **Create Bucket**.
   - **Bucket Name**: Enter a globally unique name (e.g., `my-unique-bucket-123`).
     - Must follow DNS naming conventions (lowercase, no spaces).
   - **Region**: Select an AWS region (e.g., `us-west-2`).
   - **Object Ownership**: Choose **ACLs disabled** (recommended) or enable if needed.
   - **Block Public Access**: Enable by default (uncheck if public access is required).
   - **Versioning**: Enable if you want to keep multiple versions of objects (optional).
   - **Encryption**: Enable server-side encryption (e.g., SSE-S3) for security (optional).
   - Click **Create Bucket**.
3. **Verify**:
   - The bucket should appear in the S3 dashboard.

#### **2. Via AWS CLI**
- Command:
  ```bash
  aws s3 mb s3://my-unique-bucket-123 --region us-west-2
  ```
- Notes:
  - Replace `my-unique-bucket-123` with your bucket name.
  - Specify the region as needed.

#### **3. Via AWS SDK (e.g., Python with Boto3)**
- Install Boto3:
  ```bash
  pip install boto3
  ```
- Code:
  ```python
  import boto3

  s3 = boto3.client('s3')
  bucket_name = 'my-unique-bucket-123'
  region = 'us-west-2'

  s3.create_bucket(
      Bucket=bucket_name,
      CreateBucketConfiguration={'LocationConstraint': region}
  )
  print(f"Bucket {bucket_name} created.")
  ```

---

### **Fetching Credentials to Access S3**
AWS uses **IAM credentials** (Access Key and Secret Access Key) to authenticate and interact with S3 programmatically or via CLI.

#### **Steps to Fetch Credentials**
1. **Create an IAM User**:
   - Go to **IAM** in the AWS Console.
   - Click **Users** > **Add Users**.
   - Enter a username (e.g., `s3-user`).
   - Check **Access Key - Programmatic Access**.
   - Click **Next: Permissions**.
2. **Attach Permissions**:
   - Option 1: Attach an existing policy (e.g., `AmazonS3FullAccess`).
   - Option 2: Create a custom policy:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": "s3:*",
                 "Resource": [
                     "arn:aws:s3:::my-unique-bucket-123",
                     "arn:aws:s3:::my-unique-bucket-123/*"
                 ]
             }
         ]
     }
     ```
   - Click **Next** > **Create User**.
3. **Download Credentials**:
   - After creation, you’ll see:
     - **Access Key ID** (e.g., `AKIAIOSFODNN7EXAMPLE`).
     - **Secret Access Key** (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`).
   - Download the `.csv` file or copy these values (they won’t be shown again).
4. **Store Credentials Securely**:
   - **AWS CLI**: Run `aws configure` and input the keys.
   - **Environment Variables**:
     ```bash
     export AWS_ACCESS_KEY_ID='AKIAIOSFODNN7EXAMPLE'
     export AWS_SECRET_ACCESS_KEY='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
     ```
   - **Credentials File**: Edit `~/.aws/credentials`:
     ```
     [default]
     aws_access_key_id = AKIAIOSFODNN7EXAMPLE
     aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
     ```

---

### **Storing Data in S3 Buckets**

#### **1. Via AWS Console**
- Go to your bucket in S3.
- Click **Upload**.
- Drag and drop files or select them.
- Click **Upload**.

#### **2. Via AWS CLI**
- Upload a single file:
  ```bash
  aws s3 cp myfile.txt s3://my-unique-bucket-123/
  ```
- Upload a folder:
  ```bash
  aws s3 sync ./myfolder s3://my-unique-bucket-123/
  ```

#### **3. Via AWS SDK (Python Boto3)**
- Upload a file:
  ```python
  import boto3

  s3 = boto3.client('s3')
  bucket_name = 'my-unique-bucket-123'
  file_name = 'myfile.txt'
  object_key = 'myfile.txt'  # Key in S3

  s3.upload_file(file_name, bucket_name, object_key)
  print(f"Uploaded {file_name} to {bucket_name}")
  ```
- Upload with custom metadata:
  ```python
  s3.upload_file(
      file_name,
      bucket_name,
      object_key,
      ExtraArgs={'Metadata': {'key1': 'value1'}}
  )
  ```

#### **4. Presigned URLs (Temporary Access)**
- Generate a URL to upload/download without credentials:
  ```python
  url = s3.generate_presigned_url(
      'put_object',
      Params={'Bucket': bucket_name, 'Key': object_key},
      ExpiresIn=3600  # URL valid for 1 hour
  )
  print(url)
  ```
- Use the URL with tools like `curl`:
  ```bash
  curl -X PUT -T myfile.txt "PRESIGNED_URL"
  ```

---

### **Managing Buckets**
- **List Buckets**:
  - CLI: `aws s3 ls`
  - Python: `s3.list_buckets()`
- **List Objects**:
  - CLI: `aws s3 ls s3://my-unique-bucket-123/`
  - Python: `s3.list_objects_v2(Bucket=bucket_name)`
- **Delete Object**:
  - CLI: `aws s3 rm s3://my-unique-bucket-123/myfile.txt`
  - Python: `s3.delete_object(Bucket=bucket_name, Key=object_key)`
- **Delete Bucket** (must be empty):
  - CLI: `aws s3 rb s3://my-unique-bucket-123`
  - Python: `s3.delete_bucket(Bucket=bucket_name)`

---

### **Best Practices**
- **Naming**: Use unique, meaningful bucket names.
- **Security**: 
  - Enable encryption (SSE-S3 or SSE-KMS).
  - Use IAM policies and bucket policies to restrict access.
  - Avoid making buckets public unless necessary.
- **Cost**: Choose the right storage class based on access patterns.
- **Versioning**: Enable it for critical data to prevent accidental overwrites.

---

### **Troubleshooting**
- **Access Denied**: Check IAM permissions, bucket policies, and public access settings.
- **Bucket Already Exists**: Bucket names are global; choose a unique name.
- **File Not Found**: Verify the key matches the object name in S3.

---

These notes cover the essentials of S3 bucket creation, credential management, and data storage. Let me know if you need help with a specific task or example!