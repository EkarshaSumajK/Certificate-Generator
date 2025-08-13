# Environment Variables Setup

This file contains all the environment variables needed for the Certificate Generator application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# =================================
# CLERK AUTHENTICATION
# =================================
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (optional - these are the defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# =================================
# AWS S3 CONFIGURATION
# =================================
# AWS Credentials for S3 access
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# S3 Bucket Configuration
AWS_S3_BUCKET_NAME=certificate-generator-files-your-suffix
AWS_S3_UPLOAD_PATH=uploads
AWS_S3_CERTIFICATES_PATH=certificates
AWS_S3_TEMPLATES_PATH=templates
AWS_S3_TEMP_PATH=temp

# =================================
# APPLICATION CONFIGURATION
# =================================
# Next.js Environment
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3001

# File Upload Limits
MAX_FILE_SIZE=10485760          # 10MB in bytes
ALLOWED_FILE_TYPES=.csv,.txt
MAX_FILES_PER_USER=50

# Certificate Generation
DEFAULT_CERTIFICATE_FORMAT=PDF
CERTIFICATE_DPI=300
CERTIFICATE_QUALITY=high

# =================================
# DATABASE (Future Implementation)
# =================================
# Uncomment when database is added
# DATABASE_URL=postgresql://username:password@localhost:5432/certificate_generator
# DATABASE_POOL_SIZE=10

# =================================
# EMAIL SERVICE (Future Implementation)
# =================================
# Uncomment when email service is added
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# FROM_EMAIL=noreply@your-domain.com

# =================================
# ANALYTICS (Future Implementation)
# =================================
# Uncomment when analytics are added
# GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# POSTHOG_KEY=your-posthog-key
```

## Setup Instructions

### 1. Clerk Authentication
See `CLERK_SETUP.md` for detailed Clerk setup instructions.

### 2. AWS S3 Storage
See `AWS_S3_SETUP.md` for detailed S3 setup instructions.

### 3. Development vs Production

#### Development Environment
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3001
```

#### Production Environment
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

## Environment Variable Validation

The application validates required environment variables at startup. Missing variables will cause the application to fail with helpful error messages.

### Required Variables (Application won't start without these)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

### Optional Variables (Have defaults)
- `MAX_FILE_SIZE` (defaults to 10MB)
- `ALLOWED_FILE_TYPES` (defaults to .csv,.txt)
- `MAX_FILES_PER_USER` (defaults to 50)

## Security Best Practices

### ✅ Do This
- Use different keys for development and production
- Never commit `.env.local` to version control
- Use strong, unique secret keys
- Rotate credentials regularly
- Use least-privilege principle for AWS IAM

### ❌ Don't Do This
- Don't use production keys in development
- Don't share environment files
- Don't use weak or default passwords
- Don't grant unnecessary permissions

## Troubleshooting

### Common Issues

#### Clerk Issues
```bash
# Error: Clerk publishable key not found
# Solution: Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set and starts with pk_

# Error: Invalid Clerk secret key
# Solution: Verify CLERK_SECRET_KEY is correct and starts with sk_
```

#### AWS S3 Issues
```bash
# Error: Access Denied
# Solution: Check AWS credentials and IAM permissions

# Error: Bucket not found
# Solution: Verify AWS_S3_BUCKET_NAME is correct and bucket exists

# Error: Invalid region
# Solution: Check AWS_REGION matches your bucket's region
```

#### File Upload Issues
```bash
# Error: File too large
# Solution: Adjust MAX_FILE_SIZE or compress file

# Error: File type not allowed
# Solution: Check ALLOWED_FILE_TYPES includes your file extension
```

## Environment Files by Environment

### Development (.env.local)
- Used for local development
- Contains development keys and local URLs
- Not committed to version control

### Production (.env.production)
- Used for production deployment
- Contains production keys and live URLs
- Managed through deployment platform

### Testing (.env.test)
- Used for automated testing
- Contains test database and mock service keys
- Can be committed to version control (without real secrets)

## Validation Script

You can add this validation script to check your environment setup:

```javascript
// scripts/validate-env.js
const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log('✅ All required environment variables are set');
```

Run with: `node scripts/validate-env.js`
