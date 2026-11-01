import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContactHub } from '../ContactHub';
import { ContactService } from '@/services/contactService';
import { PROFILE_DATA } from '@/data/profile';

describe('ContactHub Orchestration & Engine Lifecycle', () => {
  let container: HTMLElement;
  let hub: ContactHub;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    hub = new ContactHub({
      profileData: PROFILE_DATA,
      contactService: new ContactService({ simulatedLatencyMs: 0 }),
    });
  });

  afterEach(() => {
    hub.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('implements standard Engine lifecycle interface', () => {
    expect(hub.id).toBe('contact-hub');
    expect(typeof hub.mount).toBe('function');
    expect(typeof hub.destroy).toBe('function');
  });

  it('mounts header, Cairo clock HUD, Telegram card, and Direct Email dispatcher', () => {
    hub.mount(container);

    const hubEl = container.querySelector('[data-contact-hub]');
    const clockEl = container.querySelector('[data-cairo-clock]');
    const telegramCard = container.querySelector('.telegram-channel-card');
    const dispatcher = container.querySelector('.direct-email-dispatcher');

    expect(hubEl).not.toBeNull();
    expect(clockEl).not.toBeNull();
    expect(telegramCard).not.toBeNull();
    expect(dispatcher).not.toBeNull();
  });

  it('switches between standard Email Dispatcher and Retro Terminal Mode', () => {
    hub.mount(container);

    // Initial state: Email Dispatcher is visible, Terminal is not
    expect(container.querySelector('.direct-email-dispatcher')).not.toBeNull();
    expect(container.querySelector('[data-retro-terminal]')).toBeNull();

    // Click terminal toggle
    const toggleBtn = container.querySelector('[data-terminal-toggle]') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();
    toggleBtn.click();

    // Now Retro Terminal should be mounted
    expect(container.querySelector('[data-retro-terminal]')).not.toBeNull();

    // Click exit terminal button
    const exitBtn = container.querySelector('[data-terminal-exit]') as HTMLButtonElement;
    expect(exitBtn).not.toBeNull();
    exitBtn.click();

    // Back to Email Dispatcher
    expect(container.querySelector('.direct-email-dispatcher')).not.toBeNull();
    expect(container.querySelector('[data-retro-terminal]')).toBeNull();
  });

  it('handles message submission and triggers kinetic send flow', async () => {
    hub.mount(container);

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[name="emailOrHandle"]') as HTMLInputElement;
    const messageInput = container.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    const form = container.querySelector('form') as HTMLFormElement;

    nameInput.value = 'Hiring Manager';
    nameInput.dispatchEvent(new Event('input'));

    emailInput.value = 'manager@company.com';
    emailInput.dispatchEvent(new Event('input'));

    messageInput.value = 'We want to interview you for the Senior Mobile position.';
    messageInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    // Wait for async animation settle
    await new Promise((r) => setTimeout(r, 900));

    const successEl = container.querySelector('[data-send-success]');
    expect(successEl).not.toBeNull();
  });

  it('survives 20 rapid sequential mount() and destroy() cycles without leaking DOM or state corruption', () => {
    for (let i = 0; i < 20; i++) {
      const tempHub = new ContactHub({ profileData: PROFILE_DATA });
      tempHub.mount(container);
      expect(container.children.length).toBeGreaterThan(0);
      tempHub.destroy();
      expect(container.children.length).toBe(0);
    }
  });
});
