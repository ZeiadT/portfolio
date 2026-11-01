import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ContactService,
  validateContactPayload,
  RateLimitError,
  ValidationError,
} from '../contactService';
import type { ContactPayload } from '@/domain/types';

describe('ContactService & validateContactPayload', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('validateContactPayload', () => {
    const validEmailPayload: ContactPayload = {
      name: 'Alice Developer',
      emailOrHandle: 'alice@example.com',
      channel: 'email',
      message: 'Hello Zeiad, love your portfolio!',
      timestamp: Date.now(),
    };

    const validTelegramPayload: ContactPayload = {
      name: 'Bob Lead',
      emailOrHandle: '@bob_recruiter',
      channel: 'telegram',
      message: 'Reaching out regarding a Senior Mobile role.',
      timestamp: Date.now(),
    };

    it('approves valid email contact payload', () => {
      const result = validateContactPayload(validEmailPayload);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('approves valid telegram handle contact payload', () => {
      const result = validateContactPayload(validTelegramPayload);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('rejects empty or whitespace name', () => {
      const result = validateContactPayload({
        ...validEmailPayload,
        name: '   ',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('rejects invalid email and handle format', () => {
      const result = validateContactPayload({
        ...validEmailPayload,
        emailOrHandle: 'invalid-email-no-at',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.emailOrHandle).toBeDefined();
    });

    it('rejects empty message or message under 3 characters', () => {
      const result = validateContactPayload({
        ...validEmailPayload,
        message: 'hi',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toBeDefined();
    });

    it('rejects message exceeding 1000 characters', () => {
      const longMessage = 'a'.repeat(1001);
      const result = validateContactPayload({
        ...validEmailPayload,
        message: longMessage,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toContain('1000');
    });
  });

  describe('ContactService Transmission & Rate Limiting', () => {
    let service: ContactService;

    beforeEach(() => {
      service = new ContactService({
        maxRequestsPerWindow: 3,
        windowMs: 60000,
        simulatedLatencyMs: 10,
      });
    });

    it('dispatches valid message successfully', async () => {
      const payload: ContactPayload = {
        name: 'Charlie Tech',
        emailOrHandle: 'charlie@venture.co',
        channel: 'email',
        message: 'Would love to discuss your cross-platform architecture.',
        timestamp: Date.now(),
      };

      const response = await service.submitMessage(payload);
      expect(response.success).toBe(true);
      expect(response.timestamp).toBeGreaterThan(0);
    });

    it('throws ValidationError when attempting to dispatch invalid payload', async () => {
      const invalidPayload: ContactPayload = {
        name: '',
        emailOrHandle: 'bad',
        channel: 'email',
        message: '',
        timestamp: Date.now(),
      };

      await expect(service.submitMessage(invalidPayload)).rejects.toThrow(ValidationError);
    });

    it('enforces rate limiting after exceeding max requests within window', async () => {
      const payload: ContactPayload = {
        name: 'Dana',
        emailOrHandle: 'dana@example.com',
        channel: 'email',
        message: 'Ping message to test limiter',
        timestamp: Date.now(),
      };

      // 3 successful requests
      await service.submitMessage(payload);
      await service.submitMessage(payload);
      await service.submitMessage(payload);

      // 4th request must be rejected with RateLimitError
      await expect(service.submitMessage(payload)).rejects.toThrow(RateLimitError);
    });

    it('allows requests again once window expires', async () => {
      vi.useFakeTimers();
      const expiryService = new ContactService({
        maxRequestsPerWindow: 3,
        windowMs: 60000,
        simulatedLatencyMs: 0,
      });

      const payload: ContactPayload = {
        name: 'Eve',
        emailOrHandle: 'eve@example.com',
        channel: 'email',
        message: 'Window expiry test message',
        timestamp: Date.now(),
      };

      await expiryService.submitMessage(payload);
      await expiryService.submitMessage(payload);
      await expiryService.submitMessage(payload);

      // Advance time past the 60 second window
      vi.advanceTimersByTime(60001);

      // Should now succeed
      const response = await expiryService.submitMessage(payload);
      expect(response.success).toBe(true);
      vi.useRealTimers();
    });

    it('supports custom transport adapter', async () => {
      const customTransport = vi.fn().mockResolvedValue(true);
      const customService = new ContactService({
        transport: customTransport,
        simulatedLatencyMs: 0,
      });

      const payload: ContactPayload = {
        name: 'Frank',
        emailOrHandle: 'frank@example.com',
        channel: 'telegram',
        message: 'Testing custom transport hook.',
        timestamp: Date.now(),
      };

      await customService.submitMessage(payload);
      expect(customTransport).toHaveBeenCalledWith(payload);
    });
  });
});
