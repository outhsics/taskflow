import { db } from './db';
import { AppSettings, AppSettingsSchema } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const SETTINGS_ID = 'app-settings';
const ENCRYPTED_KEY_STORAGE = 'encrypted_api_key';
const ENCRYPTION_IV_STORAGE = 'encryption_iv';

export class SettingsRepository {
  /**
   * Get app settings
   */
  async get(): Promise<AppSettings | undefined> {
    return await db.settings.get(SETTINGS_ID);
  }

  /**
   * Save app settings
   */
  async save(settings: AppSettings): Promise<AppSettings> {
    // Validate with Zod
    const validated = AppSettingsSchema.parse(settings);

    await db.settings.put(validated, SETTINGS_ID);
    return validated;
  }

  /**
   * Update settings
   */
  async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    const existing = await this.get();
    const settings: AppSettings = existing
      ? { ...existing, ...updates }
      : {
          id: SETTINGS_ID,
          aiProvider: 'openai',
          apiKey: '',
          aiEnabled: false,
          theme: 'light',
          ...updates,
        };

    return await this.save(settings);
  }

  /**
   * Get AI provider
   */
  async getAIProvider(): Promise<'openai' | 'anthropic'> {
    const settings = await this.get();
    return settings?.aiProvider ?? 'openai';
  }

  /**
   * Check if AI is enabled
   */
  async isAIEnabled(): Promise<boolean> {
    const settings = await this.get();
    return settings?.aiEnabled ?? false;
  }

  /**
   * Get theme
   */
  async getTheme(): Promise<'light' | 'dark'> {
    const settings = await this.get();
    return settings?.theme ?? 'light';
  }

  /**
   * Encrypt and store API key using Web Crypto API
   * @param apiKey - The plaintext API key
   * @param passphrase - User-provided passphrase for encryption
   */
  async encryptAndStoreApiKey(apiKey: string, passphrase: string): Promise<void> {
    // Validate passphrase strength
    if (passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters');
    }

    // Derive encryption key from passphrase using PBKDF2
    const encoder = new TextEncoder();
    const passphraseData = encoder.encode(passphrase);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passphraseData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('TaskFlow-Salt'), // In production, use random salt
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the API key
    const apiKeyData = encoder.encode(apiKey);
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      apiKeyData
    );

    // Store encrypted key and IV in localStorage
    const encryptedArray = new Uint8Array(encryptedData);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    localStorage.setItem(ENCRYPTED_KEY_STORAGE, encryptedBase64);
    localStorage.setItem(ENCRYPTION_IV_STORAGE, ivBase64);

    // Update settings to indicate API key is configured
    await this.update({ apiKey: '***encrypted***' });
  }

  /**
   * Decrypt API key from storage
   * @param passphrase - User-provided passphrase for decryption
   * @returns The decrypted API key, or null if decryption fails
   */
  async decryptApiKey(passphrase: string): Promise<string | null> {
    try {
      const encryptedBase64 = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
      const ivBase64 = localStorage.getItem(ENCRYPTION_IV_STORAGE);

      if (!encryptedBase64 || !ivBase64) {
        return null;
      }

      // Derive decryption key from passphrase
      const encoder = new TextEncoder();
      const passphraseData = encoder.encode(passphrase);

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passphraseData,
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const decryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('TaskFlow-Salt'),
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      // Convert back from base64
      const encryptedArray = new Uint8Array(
        atob(encryptedBase64)
          .split('')
          .map((c) => c.charCodeAt(0))
      );
      const iv = new Uint8Array(
        atob(ivBase64)
          .split('')
          .map((c) => c.charCodeAt(0))
      );

      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        decryptionKey,
        encryptedArray
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }

  /**
   * Check if API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    const encryptedKey = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
    return encryptedKey !== null;
  }

  /**
   * Clear stored API key
   */
  async clearApiKey(): Promise<void> {
    localStorage.removeItem(ENCRYPTED_KEY_STORAGE);
    localStorage.removeItem(ENCRYPTION_IV_STORAGE);
    await this.update({ apiKey: '', aiEnabled: false });
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    const tasks = await db.tasks.toArray();
    const categories = await db.categories.toArray();
    const settings = await this.get();

    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      settings,
    }, null, 2);
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    // Validate basic structure
    if (!data.version || !Array.isArray(data.tasks)) {
      throw new Error('Invalid backup file format');
    }

    // Clear existing data
    await db.tasks.clear();
    await db.categories.clear();

    // Import tasks
    for (const task of data.tasks) {
      await db.tasks.put(task);
    }

    // Import categories
    for (const category of data.categories) {
      await db.categories.put(category);
    }

    // Import settings if present
    if (data.settings) {
      await this.save(data.settings);
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    await db.tasks.clear();
    await db.categories.clear();
    await db.settings.delete(SETTINGS_ID);
    await this.clearApiKey();
  }
}

// Export singleton instance
export const settingsRepository = new SettingsRepository();
