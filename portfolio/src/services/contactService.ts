import type { ContactPayload } from '@/domain/types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ValidationError extends Error {
  public readonly errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class RateLimitError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Rate limit reached. Please wait ${retryAfterSeconds} seconds before sending another message.`);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface ContactServiceConfig {
  maxRequestsPerWindow?: number;
  windowMs?: number;
  simulatedLatencyMs?: number;
  transport?: (payload: ContactPayload) => Promise<boolean>;
}

export interface SubmissionResponse {
  success: boolean;
  timestamp: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_HANDLE_REGEX = /^@[a-zA-Z0-9_]{3,32}$/;

/**
 * Validates a ContactPayload before dispatch
 */
export function validateContactPayload(payload: Partial<ContactPayload>): ValidationResult {
  const errors: Record<string, string> = {};

  const name = payload.name?.trim() || '';
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 100) {
    errors.name = 'Name must be under 100 characters';
  }

  const emailOrHandle = payload.emailOrHandle?.trim() || '';
  if (!emailOrHandle) {
    errors.emailOrHandle = 'Email or Telegram handle is required';
  } else if (!EMAIL_REGEX.test(emailOrHandle) && !TELEGRAM_HANDLE_REGEX.test(emailOrHandle)) {
    errors.emailOrHandle = 'Enter a valid email address or @telegram handle';
  }

  const message = payload.message?.trim() || '';
  if (!message) {
    errors.message = 'Message is required';
  } else if (message.length < 3) {
    errors.message = 'Message must be at least 3 characters';
  } else if (message.length > 1000) {
    errors.message = 'Message cannot exceed 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * ContactService
 * Handles transmission, client-side rate-limiting, and validation.
 */
export class ContactService {
  private maxRequests: number;
  private windowMs: number;
  private simulatedLatencyMs: number;
  private customTransport?: (payload: ContactPayload) => Promise<boolean>;
  private timestamps: number[] = [];

  constructor(config: ContactServiceConfig = {}) {
    this.maxRequests = config.maxRequestsPerWindow ?? 3;
    this.windowMs = config.windowMs ?? 60000;
    this.simulatedLatencyMs = config.simulatedLatencyMs ?? 400;
    this.customTransport = config.transport;
  }

  /**
   * Submits a message after passing validation and rate limit checks
   */
  public async submitMessage(payload: ContactPayload): Promise<SubmissionResponse> {
    const validation = validateContactPayload(payload);
    if (!validation.isValid) {
      throw new ValidationError('Contact payload validation failed', validation.errors);
    }

    const now = Date.now();
    // Prune expired timestamps
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      const waitMs = Math.max(0, this.windowMs - (now - oldest));
      const retryAfter = Math.ceil(waitMs / 1000);
      throw new RateLimitError(retryAfter);
    }

    this.timestamps.push(now);

    if (this.customTransport) {
      const ok = await this.customTransport(payload);
      if (!ok) {
        throw new Error('Transport adapter returned non-success');
      }
    } else if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }

    return {
      success: true,
      timestamp: now,
    };
  }

  /**
   * Resets internal rate limiter history
   */
  public resetLimits(): void {
    this.timestamps = [];
  }
}
