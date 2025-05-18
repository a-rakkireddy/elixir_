import crypto from 'crypto';

// Constants from Voucher API documentation
const KEY = Buffer.from('6d66fb7debfd15bf716bb14752b9603b', 'hex');
const IV = Buffer.from('716bb14752b9603b', 'hex');

/**
 * Encrypt data using AES-256-CBC algorithm
 * @param data Data to encrypt (string or object)
 * @returns Encrypted data as base64 string
 */
export const encrypt = (data: string | object): string => {
  try {
    let dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
    
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    let encrypted = cipher.update(dataStr, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-256-CBC algorithm
 * @param encryptedData Encrypted data as base64 string
 * @returns Decrypted data as string
 */
export const decrypt = (encryptedData: string): string => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};
