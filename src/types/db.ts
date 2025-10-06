// Database-related types
export interface DatabaseConnection {
  isConnected: boolean;
  host?: string;
  database?: string;
}

export interface SearchOptions {
  limit?: number;
  category?: string;
  sortBy?: "relevance" | "date" | "title";
}

export interface SearchResult<T> {
  results: T[];
  total: number;
  hasMore: boolean;
}

// Encrypted data structure for secure storage
export interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted content
  keyId: string; // KMS key ARN or ID
  algorithm: string; // Encryption algorithm used
  iv: string; // Base64 encoded initialization vector
  authTag?: string; // Base64 encoded authentication tag
  dataKeyEncrypted: string; // Base64 encoded encrypted data key
}
