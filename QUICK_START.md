# Quick Start - Test Encryption Without AWS 🚀

If you want to test the encryption system before setting up AWS, here's a simple way to get started:

## 1. Add Local Encryption Key to Environment

Add this to your `.env.local` file:

```bash
# For local testing without AWS (add to existing file)
LOCAL_ENCRYPTION_KEY=my-super-secret-key-for-development-only-32chars
USE_LOCAL_ENCRYPTION=true
```

## 2. Test Your Chat System

Start your development server:

```bash
npm run dev
```

## 3. Test Endpoints

### Test Basic Encryption:

```bash
# Test local encryption
curl -X POST http://localhost:3000/api/encryption-test?test=basic-local \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

### Test Chat Message Encryption:

```bash
# Test chat message encryption
curl -X POST http://localhost:3000/api/encryption-test?test=encrypt-message \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "content": "I have a login issue",
      "role": "user",
      "timestamp": "2025-09-24T10:30:00Z"
    }
  }'
```

## 4. When Ready for AWS

Once you've tested locally and want to use AWS:

1. Set up AWS account following `AWS_SETUP_GUIDE.md`
2. Update your `.env.local`:

   ```bash
   # Comment out or remove local encryption
   # USE_LOCAL_ENCRYPTION=true

   # Add AWS credentials
   AWS_REGION=us-east-1
   AWS_KMS_KEY_ID=your-actual-key-id
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. Test with AWS KMS:
   ```bash
   curl -X POST http://localhost:3000/api/encryption-test?test=basic-kms
   ```

## Why This Approach?

- ✅ Test your chat system immediately
- ✅ No AWS setup required initially
- ✅ Learn encryption concepts first
- ✅ Easy transition to AWS later
- ✅ No costs during development

## What's the Difference?

| Feature          | Local Encryption | AWS KMS          |
| ---------------- | ---------------- | ---------------- |
| Setup Time       | 2 minutes        | 30 minutes       |
| Cost             | Free             | ~$1/month        |
| Security         | Good for dev     | Enterprise-grade |
| Key Management   | Manual           | Automatic        |
| Scalability      | Limited          | Unlimited        |
| Production Ready | No               | Yes              |

Start with local, move to AWS when you're ready! 🎯
