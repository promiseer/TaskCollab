# SST Configuration

This directory contains configuration files for deploying the TaskCollab application to AWS using SST (Serverless Stack).

## Setup

1. Install SST globally:
```bash
npm install -g sst
```

2. Configure AWS credentials:
```bash
aws configure
```

3. Initialize SST in your project:
```bash
sst init
```

4. Configure your environment variables in SST:
```bash
sst secrets set DATABASE_URL "your-database-url"
sst secrets set NEXTAUTH_SECRET "your-secret"
```

## Deployment

Deploy to development:
```bash
sst deploy
```

Deploy to production:
```bash
sst deploy --stage production
```

## Resources

The SST configuration will create:
- Next.js application on AWS Lambda
- PostgreSQL RDS instance
- CloudFront distribution
- Route53 domain (optional)

For detailed SST configuration, refer to the SST documentation: https://docs.sst.dev/
