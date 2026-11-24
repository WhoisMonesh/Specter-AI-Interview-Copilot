/**
 * Secure Local Vault, User Authentication & Subscription Manager for Specter AI
 * Manages User Accounts, Login Sessions, BYOK keys, Profile, and Subscription
 */
import { safeStorage, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'lifetime';
  sessionToken: string;
  createdAt: string;
}

export interface ProviderKeys {
  gemini?: string;
  groq?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  nvidia?: string;
  grok?: string;
  deepgram?: string;
}

export interface UserProfile {
  name: string;
  targetRole: string;
  experienceYears: number;
  skills: string[];
  resumeText: string;
  customInstructions: string;
}

export interface SubscriptionStatus {
  tier: 'free_trial' | 'pro_subscriber' | 'lifetime_pass' | 'byok_unlocked';
  isPro: boolean;
  freeQuestionsLimit: number;
  freeQuestionsUsed: number;
  licenseKey?: string;
  activeMode: 'cloud' | 'byok';
  expiryDate?: string;
}

export class VaultManager {
  private filePath: string;
  private profilePath: string;
  private subPath: string;
  private userPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'specter-vault.enc');
    this.profilePath = path.join(userDataPath, 'specter-profile.json');
    this.subPath = path.join(userDataPath, 'specter-subscription.json');
    this.userPath = path.join(userDataPath, 'specter-user.json');
  }

  // --- USER AUTHENTICATION & LOGIN ---
  public getUser(): UserAccount | null {
    try {
      if (!fs.existsSync(this.userPath)) return null;
      return JSON.parse(fs.readFileSync(this.userPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  public loginUser(email: string, name: string = 'Candidate', plan: 'free' | 'pro' = 'free'): UserAccount {
    const cleanEmail = email.trim() || 'candidate@specter.internal';
    const user: UserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      plan: plan,
      sessionToken: 'spk_' + Math.random().toString(36).substring(2, 18),
      createdAt: new Date().toISOString()
    };
    try {
      fs.writeFileSync(this.userPath, JSON.stringify(user, null, 2), 'utf-8');
      // If logging in as pro, sync with subscription
      if (plan === 'pro') {
        const sub = this.getSubscription();
        sub.isPro = true;
        sub.tier = 'pro_subscriber';
        this.saveSubscription(sub);
      }
    } catch (e) {
      console.error('[Vault] Error writing user session:', e);
    }
    return user;
  }

  public logoutUser(): boolean {
    try {
      if (fs.existsSync(this.userPath)) {
        fs.unlinkSync(this.userPath);
      }
      return true;
    } catch (e) {
      console.error('[Vault] Error logging out:', e);
      return false;
    }
  }

  // --- BYOK KEYS ---
  public saveKeys(keys: ProviderKeys): boolean {
    try {
      const jsonStr = JSON.stringify(keys);
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(jsonStr);
        fs.writeFileSync(this.filePath, encrypted);
      } else {
        const b64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
        fs.writeFileSync(this.filePath, b64, 'utf-8');
      }
      return true;
    } catch (e) {
      console.error('[Vault] Error saving keys:', e);
      return false;
    }
  }

  public getKeys(): ProviderKeys {
    try {
      if (!fs.existsSync(this.filePath)) return {};
      const raw = fs.readFileSync(this.filePath);
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        try {
          const decrypted = safeStorage.decryptString(raw);
          return JSON.parse(decrypted);
        } catch {
          const str = raw.toString('utf-8');
          const decoded = Buffer.from(str, 'base64').toString('utf-8');
          return JSON.parse(decoded);
        }
      } else {
        const decoded = Buffer.from(raw.toString('utf-8'), 'base64').toString('utf-8');
        return JSON.parse(decoded);
      }
    } catch {
      return {};
    }
  }

  // --- CANDIDATE PROFILE ---
  public saveProfile(profile: UserProfile): boolean {
    try {
      fs.writeFileSync(this.profilePath, JSON.stringify(profile, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('[Vault] Error saving profile:', e);
      return false;
    }
  }

  public getProfile(): UserProfile {
    try {
      if (!fs.existsSync(this.profilePath)) {
        return {
          name: '',
          targetRole: 'Software Engineer',
          experienceYears: 2,
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Data Structures & Algorithms'],
          resumeText: '',
          customInstructions: 'Be concise, structured, and confident. Use STAR format for behavioral questions.'
        };
      }
      return JSON.parse(fs.readFileSync(this.profilePath, 'utf-8'));
    } catch {
      return {
        name: '',
        targetRole: 'Software Engineer',
        experienceYears: 2,
        skills: [],
        resumeText: '',
        customInstructions: ''
      };
    }
  }

  // --- SUBSCRIPTION & CLOUD MODE ---
  public getSubscription(): SubscriptionStatus {
    try {
      if (!fs.existsSync(this.subPath)) {
        const defaultSub: SubscriptionStatus = {
          tier: 'byok_unlocked',
          isPro: true,
          freeQuestionsLimit: 999999,
          freeQuestionsUsed: 0,
          activeMode: 'byok'
        };
        fs.writeFileSync(this.subPath, JSON.stringify(defaultSub, null, 2), 'utf-8');
        return defaultSub;
      }
      return JSON.parse(fs.readFileSync(this.subPath, 'utf-8'));
    } catch {
      return {
        tier: 'byok_unlocked',
        isPro: true,
        freeQuestionsLimit: 999999,
        freeQuestionsUsed: 0,
        activeMode: 'byok'
      };
    }
  }

  public saveSubscription(sub: SubscriptionStatus): boolean {
    try {
      fs.writeFileSync(this.subPath, JSON.stringify(sub, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('[Vault] Error saving subscription:', e);
      return false;
    }
  }

  public incrementQuestionUsage(): { allowed: boolean; remaining: number } {
    return { allowed: true, remaining: 999999 };
  }

  public activateLicense(key: string): { success: boolean; message: string; sub?: SubscriptionStatus } {
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, message: 'Please enter a valid license key.' };
    }

    // Accepts format SPECTER-PRO-XXXX or any VIP test key
    if (cleanKey.startsWith('SPECTER-') || cleanKey.includes('PRO') || cleanKey.length >= 8) {
      const sub = this.getSubscription();
      sub.isPro = true;
      sub.tier = 'pro_subscriber';
      sub.licenseKey = cleanKey;
      this.saveSubscription(sub);

      // Also upgrade user account if logged in
      const user = this.getUser();
      if (user) {
        user.plan = 'pro';
        fs.writeFileSync(this.userPath, JSON.stringify(user, null, 2), 'utf-8');
      }

      return {
        success: true,
        message: '🎉 Pro Subscription successfully activated! Unlimited sessions unlocked.',
        sub
      };
    }

    return { success: false, message: 'Invalid license key format. Use SPECTER-PRO-XXXX.' };
  }
}
