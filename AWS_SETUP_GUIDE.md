# AWS KMS Setup Guide for Students 🎓

## 📋 Prerequisites

- AWS Account (with credit card for verification)
- Basic understanding of cloud services
- Development environment ready

## 💰 Cost Breakdown (Free Tier)

- **KMS Key**: $1/month per key (NOT free, but very cheap)
- **KMS Requests**: 20,000 free requests/month
- **Typical Development Cost**: ~$1-2/month
- **Production Cost**: ~$5-10/month depending on usage

## 🚀 Step-by-Step Setup

### 1. Access AWS Console

1. Log into [AWS Console](https://console.aws.amazon.com)
2. Search for "KMS" in the search bar
3. Click on "Key Management Service"

### 2. Create Your First KMS Key

#### 2.1 Navigate to KMS

- Go to KMS Dashboard
- Click "Create a key"

#### 2.2 Configure Key

```
Key Type: Symmetric
Key Usage: Encrypt and decrypt
Key Material Origin: KMS
Multi-Region Key: No (cheaper)
```

#### 2.3 Key Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable full access for root user",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow use of the key for your application",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_USERNAME"
      },
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey",
        "kms:GenerateDataKeyWithoutPlaintext",
        "kms:ReEncrypt*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 2.4 Key Details

```
Alias: kubota-chat-encryption-key
Description: KMS key for encrypting chat data in Kubota Assistant
```

### 3. Create IAM User (Recommended for Development)

#### 3.1 Go to IAM Service

- Search "IAM" in AWS Console
- Click "Users" in left sidebar
- Click "Add user"

#### 3.2 User Configuration

```
Username: kubota-dev-user
Access Type: Programmatic access (for API)
```

#### 3.3 Attach Policy

Create custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey",
        "kms:GenerateDataKeyWithoutPlaintext",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:YOUR_REGION:YOUR_ACCOUNT_ID:key/YOUR_KEY_ID"
    }
  ]
}
```

### 4. Get Your Credentials

After creating the user, AWS will show:

```
Access Key ID: AKIAI44QH8DHBEXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**⚠️ IMPORTANT: Save these immediately! AWS won't show them again.**

### 5. Find Your Key Information

In KMS Dashboard:

- Click on your key
- Copy the **Key ID** (looks like: `1234abcd-12ab-34cd-56ef-1234567890ab`)
- Note your **Region** (e.g., `us-east-1`, `us-west-2`)

## 🔧 Environment Configuration

Update your `.env.local` file:

```bash
# Replace with your actual values
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=1234abcd-12ab-34cd-56ef-1234567890ab
AWS_ACCESS_KEY_ID=AKIAI44QH8DHBEXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 🧪 Testing Your Setup

Run this command to test:

```bash
curl -X POST http://localhost:3000/api/encryption-test?test=basic-kms \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## 🛡️ Security Best Practices

### For Development:

- ✅ Use IAM users (not root account)
- ✅ Limit permissions to minimum required
- ✅ Never commit credentials to git
- ✅ Use different keys for dev/prod

### For Production:

- ✅ Use IAM roles instead of access keys
- ✅ Enable CloudTrail for auditing
- ✅ Rotate keys regularly
- ✅ Use separate AWS accounts for dev/prod

## 💡 Student Tips

### Save Money:

- Use only one region (avoid data transfer costs)
- Delete unused keys
- Monitor billing dashboard
- Set up billing alerts

### Learning:

- Explore other AWS services (S3, Lambda)
- Follow AWS tutorials
- Join AWS Student programs
- Use AWS documentation extensively

### Portfolio:

- Document your architecture decisions
- Show security-first approach
- Demonstrate understanding of encryption
- Highlight production-ready practices

## 🔍 Troubleshooting

### Common Issues:

#### "Access Denied" Error:

- Check IAM permissions
- Verify key policy
- Ensure correct region

#### "Key Not Found":

- Verify Key ID in environment
- Check region configuration
- Ensure key exists and is enabled

#### High Costs:

- Monitor KMS usage in CloudWatch
- Check for unnecessary API calls
- Verify you're in free tier limits

### Getting Help:

- AWS Documentation: [docs.aws.amazon.com](https://docs.aws.amazon.com)
- AWS Forums: [forums.aws.amazon.com](https://forums.aws.amazon.com)
- AWS Support (if needed)

## 📚 Next Steps

1. Set up AWS account and KMS key
2. Configure environment variables
3. Test encryption endpoints
4. Deploy to production with proper security
5. Monitor costs and usage
6. Learn more about AWS security services

---

**Remember**: AWS is an investment in your career. Most companies use cloud services, and understanding AWS will make you more employable! 🚀
