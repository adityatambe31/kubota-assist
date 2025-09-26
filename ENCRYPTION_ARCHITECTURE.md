# 🔐 Chat Encryption Architecture

## 🎯 **Security Requirements**

### **What We're Encrypting:**

- All chat messages (user → bot, bot → user)
- User queries and sensitive information
- Solution steps that might contain system details
- Conversation history before ticket creation
- Any PII (Personally Identifiable Information)

### **What We're NOT Encrypting:**

- Ticket IDs (need for indexing)
- Timestamps (needed for sorting)
- Basic metadata (status, category)
- Non-sensitive system fields

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Chat     │───▶│   Encryption    │───▶│   MongoDB       │
│   (Plaintext)   │    │   Service       │    │   (Encrypted)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
┌─────────────────┐    ┌─────────────────┐
│   AWS KMS       │◀───│   Key           │
│   (Key Mgmt)    │    │   Management    │
└─────────────────┘    └─────────────────┘
```

## 🔑 **Key Management Strategy**

### **AWS KMS Setup:**

```json
{
  "KeySpec": "SYMMETRIC_DEFAULT",
  "KeyUsage": "ENCRYPT_DECRYPT",
  "Origin": "AWS_KMS",
  "MultiRegion": false,
  "KeyRotationStatus": "Enabled"
}
```

### **Key Rotation:**

- **Automatic Rotation**: Every 365 days (AWS KMS manages this)
- **Manual Rotation**: On security incidents
- **Version Management**: KMS maintains all key versions

## 🔐 **Encryption Implementation**

### **Algorithm Choice:**

- **AES-256-GCM** (Galois/Counter Mode)
- **Why GCM**: Provides both encryption and authentication
- **Key Size**: 256-bit for maximum security
- **IV/Nonce**: 96-bit random per message

### **Data Envelope Encryption:**

```
1. Generate random Data Encryption Key (DEK)
2. Encrypt message with DEK using AES-256-GCM
3. Encrypt DEK with KMS Customer Master Key (CMK)
4. Store: encrypted_message + encrypted_DEK + metadata
```

## 📊 **Database Schema Changes**

### **Before (Plaintext):**

```typescript
conversationHistory: [
  {
    role: "user",
    content: "I can't login to my email account",
    timestamp: "2025-09-24T10:30:00Z",
  },
];
```

### **After (Encrypted):**

```typescript
conversationHistory: [
  {
    role: "user", // Not encrypted (needed for flow logic)
    content: {
      encrypted: "AQICAHh...encrypted_content...",
      keyId: "arn:aws:kms:us-east-1:123456789012:key/...",
      algorithm: "AES-256-GCM",
      iv: "base64_encoded_iv",
    },
    timestamp: "2025-09-24T10:30:00Z", // Not encrypted (needed for sorting)
  },
];
```

## 🛡️ **Security Benefits**

### **Data Protection:**

- **At Rest**: All sensitive chat data encrypted in MongoDB
- **In Transit**: HTTPS + TLS encryption
- **Key Security**: KMS-managed keys, never stored with data
- **Access Control**: IAM policies control KMS access

### **Compliance Ready:**

- **GDPR**: Encrypted PII, right to erasure via key deletion
- **HIPAA**: Strong encryption for any health-related queries
- **SOC 2**: Encryption controls for confidentiality
- **PCI DSS**: If payment info mentioned in chats

## ⚡ **Performance Considerations**

### **Optimization Strategies:**

- **Lazy Decryption**: Only decrypt when actually displaying messages
- **Caching**: Cache frequently accessed decrypted messages
- **Batch Operations**: Encrypt/decrypt multiple messages together
- **Async Processing**: Background encryption for large conversations

### **Expected Performance:**

- **Encryption**: ~1ms per message
- **Decryption**: ~1ms per message
- **KMS Calls**: ~10-50ms (cached for session)
- **Storage Overhead**: ~20% increase in size

## 🔄 **Key Lifecycle Management**

### **Key States:**

1. **Active**: Current key for new encryption
2. **Rotating**: During rotation period
3. **Inactive**: Previous keys (still decrypt old data)
4. **Disabled**: Emergency disable
5. **Deleted**: Scheduled for deletion (7-30 days)

### **Migration Strategy:**

```typescript
// Re-encrypt old data with new keys (background job)
const migrateConversation = async (conversationId) => {
  1. Decrypt with old key
  2. Encrypt with current key
  3. Update database record
  4. Verify integrity
};
```

## 🚨 **Error Handling**

### **Failure Scenarios:**

- **KMS Unavailable**: Graceful degradation, queue for retry
- **Key Disabled**: Alert admin, prevent new encryption
- **Decryption Failure**: Log security event, show error to user
- **Network Issues**: Retry with exponential backoff

## 📋 **Implementation Checklist**

- [ ] Create AWS KMS key with proper policies
- [ ] Set up AWS SDK with IAM permissions
- [ ] Implement encryption utilities
- [ ] Update MongoDB schemas
- [ ] Modify chat storage logic
- [ ] Update API endpoints
- [ ] Add environment configuration
- [ ] Implement error handling
- [ ] Add monitoring and alerting
- [ ] Test encryption/decryption cycles
- [ ] Validate key rotation
- [ ] Security audit and penetration testing

## 🎯 **Success Metrics**

### **Security Metrics:**

- Zero plaintext sensitive data in database
- All KMS calls properly authenticated
- Encryption/decryption success rate > 99.9%
- Key rotation functioning automatically

### **Performance Metrics:**

- Chat response time increase < 100ms
- Database storage increase < 25%
- KMS call optimization (caching effective)

This architecture ensures enterprise-grade security while maintaining system performance and user experience! 🚀
