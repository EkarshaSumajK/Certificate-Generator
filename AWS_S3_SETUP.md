# AWS S3 Setup Guide for Certificate Generator

This guide will walk you through setting up an AWS S3 bucket for storing user-uploaded CSV files and generated certificates.

## Table of Contents
1. [Create S3 Bucket](#1-create-s3-bucket)
2. [Create IAM User](#2-create-iam-user)
3. [Configure Bucket Policy](#3-configure-bucket-policy)
4. [Set Up CORS](#4-set-up-cors)
5. [Environment Variables](#5-environment-variables)
6. [Integration with Next.js](#6-integration-with-nextjs)

## 1. Create S3 Bucket

### Step 1: Create the Bucket
1. Sign in to the [AWS Console](https://console.aws.amazon.com)
2. Navigate to **S3** service
3. Click **"Create bucket"**
4. Configure the bucket:
   - **Bucket name**: `certificate-generator-files-[your-unique-suffix]`
   - **Region**: Choose a region close to your users (e.g., `us-east-1`)
   - **Block Public Access settings**: Keep all blocks enabled for security
   - **Bucket Versioning**: Enable (recommended)
   - **Default encryption**: Enable with SSE-S3

### Step 2: Folder Structure
Create the following folder structure in your bucket:
```
certificate-generator-files-[suffix]/
├── uploads/           # User uploaded CSV files
├── certificates/      # Generated certificate files
├── templates/         # Certificate templates
└── temp/             # Temporary processing files
```

## 2. Create IAM User

### Step 1: Create IAM User
1. Navigate to **IAM** service in AWS Console
2. Click **"Users"** → **"Create user"**
3. User details:
   - **User name**: `certificate-generator-app`
   - **Access type**: Programmatic access only
   - Do NOT provide console access

### Step 2: Create Custom Policy
1. In IAM, go to **"Policies"** → **"Create policy"**
2. Use the JSON editor and paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucketAccess",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::certificate-generator-files-[your-suffix]"
        },
        {
            "Sid": "ObjectAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::certificate-generator-files-[your-suffix]/*"
        },
        {
            "Sid": "UploadAccess",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::certificate-generator-files-[your-suffix]/uploads/*",
                "arn:aws:s3:::certificate-generator-files-[your-suffix]/temp/*"
            ]
        },
        {
            "Sid": "CertificateAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::certificate-generator-files-[your-suffix]/certificates/*"
        }
    ]
}
```

3. **Policy name**: `CertificateGeneratorS3Policy`
4. **Description**: "Limited S3 access for Certificate Generator application"

### Step 3: Attach Policy to User
1. Go back to your IAM user
2. Click **"Add permissions"** → **"Attach policies directly"**
3. Search for and select `CertificateGeneratorS3Policy`
4. Click **"Add permissions"**

### Step 4: Generate Access Keys
1. In the user details, go to **"Security credentials"** tab
2. Click **"Create access key"**
3. Choose **"Application running on AWS service"** or **"Local code"**
4. **Save both Access Key ID and Secret Access Key securely**

## 3. Configure Bucket Policy

### Step 1: Set Bucket Policy
1. Go to your S3 bucket
2. Navigate to **"Permissions"** tab
3. Click **"Bucket policy"** → **"Edit"**
4. Paste this policy (replace `[your-suffix]` with your actual suffix):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyInsecureConnections",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::certificate-generator-files-[your-suffix]",
                "arn:aws:s3:::certificate-generator-files-[your-suffix]/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        },
        {
            "Sid": "AllowApplicationAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::[your-account-id]:user/certificate-generator-app"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::certificate-generator-files-[your-suffix]",
                "arn:aws:s3:::certificate-generator-files-[your-suffix]/*"
            ]
        }
    ]
}
```

## 4. Set Up CORS

### Step 1: Configure CORS
1. In your S3 bucket, go to **"Permissions"** tab
2. Scroll to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"** and paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://your-domain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 2: Update for Production
- Replace `https://your-domain.com` with your actual production domain
- Remove localhost URLs in production
- Consider using environment-specific CORS configurations

## 5. Environment Variables

Add these variables to your `.env.local` file:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=certificate-generator-files-[your-suffix]
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# Optional S3 Configuration
AWS_S3_UPLOAD_PATH=uploads
AWS_S3_CERTIFICATES_PATH=certificates
AWS_S3_TEMPLATES_PATH=templates
AWS_S3_TEMP_PATH=temp
```

## 6. Integration with Next.js

### Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install --save-dev @types/aws-sdk
```

### Basic S3 Client Setup
Create `src/lib/s3.ts`:

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export { s3Client };
```

### Example Upload Function
```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3';

export async function uploadFile(
  file: File, 
  folder: string, 
  userId: string
) {
  const key = `${folder}/${userId}/${Date.now()}-${file.name}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return key;
}
```

## Security Best Practices

### ✅ Implemented Security Measures
- **IAM User**: Limited permissions, no console access
- **Bucket Policy**: Denies insecure connections, restricts access
- **Private Bucket**: No public read/write access
- **CORS**: Restricted to specific domains
- **Encryption**: Server-side encryption enabled

### 🔒 Additional Recommendations
1. **Lifecycle Policies**: Auto-delete temporary files after 7 days
2. **Access Logging**: Enable S3 access logging for auditing
3. **Versioning**: Keep previous versions for recovery
4. **MFA Delete**: Enable MFA for object deletion in production
5. **CloudTrail**: Monitor API calls for security auditing

### 📝 File Upload Guidelines
- **File Size Limits**: Implement client and server-side limits
- **File Type Validation**: Only allow specific file types (CSV, PDF)
- **Virus Scanning**: Consider integrating with AWS Security services
- **User Quotas**: Implement per-user storage limits

## Troubleshooting

### Common Issues
1. **Access Denied**: Check IAM permissions and bucket policy
2. **CORS Errors**: Verify CORS configuration matches your domain
3. **SSL Required**: Ensure all requests use HTTPS
4. **Invalid Credentials**: Verify AWS access keys are correct

### Testing Connection
```bash
# Test AWS credentials
aws s3 ls s3://certificate-generator-files-[your-suffix] --profile certificate-generator
```

## Cost Optimization

### Storage Classes
- **Standard**: For frequently accessed files
- **IA (Infrequent Access)**: For certificates older than 30 days
- **Glacier**: For long-term certificate archival

### Lifecycle Rules Example
```json
{
    "Rules": [
        {
            "ID": "TempFileCleanup",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "temp/"
            },
            "Expiration": {
                "Days": 7
            }
        }
    ]
}
```

This setup provides a secure, scalable foundation for file storage in your Certificate Generator application.
