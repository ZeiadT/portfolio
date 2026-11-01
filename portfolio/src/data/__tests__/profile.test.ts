import { describe, it, expect } from 'vitest';
import { PROFILE_DATA } from '../profile';

describe('Profile Data', () => {
  it('has non-empty title, personal quote, and summary', () => {
    expect(PROFILE_DATA.title).toBe('Mobile Developer');
    expect(PROFILE_DATA.quote).toBe(
      '“I love turning complex problems into simple, reliable systems that teams can trust.”'
    );
    expect(PROFILE_DATA.summary).toBeDefined();
    expect(PROFILE_DATA.summary.trim().length).toBeGreaterThan(50);
  });

  it('contains Cairo, Egypt as the primary location', () => {
    expect(PROFILE_DATA.location).toBe('Cairo, Egypt');
  });

  it('provides valid contact details for phone and email matching wireframe', () => {
    expect(PROFILE_DATA.contact).toBeDefined();
    expect(PROFILE_DATA.contact.phone).toBe('+201019880091');
    expect(PROFILE_DATA.contact.phoneFormatted).toBe('+20 1019880091');
    expect(PROFILE_DATA.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it('includes links for GitHub, Codewars, and LinkedIn with valid URLs', () => {
    expect(Array.isArray(PROFILE_DATA.links)).toBe(true);
    expect(PROFILE_DATA.links.length).toBe(3);

    const githubLink = PROFILE_DATA.links.find((l) => l.icon === 'github');
    expect(githubLink).toBeDefined();
    expect(githubLink?.url).toMatch(/^https:\/\/(www\.)?github\.com\//);

    const codewarsLink = PROFILE_DATA.links.find((l) => l.icon === 'codewars');
    expect(codewarsLink).toBeDefined();
    expect(codewarsLink?.url).toMatch(/^https:\/\/(www\.)?codewars\.com\//);

    const linkedinLink = PROFILE_DATA.links.find((l) => l.icon === 'linkedin');
    expect(linkedinLink).toBeDefined();
    expect(linkedinLink?.url).toBe('https://linkedin.com/in/zeiad-mohammed');
  });

  it('has valid avatar config pointing to an image source', () => {
    expect(PROFILE_DATA.avatar).toBeDefined();
    expect(PROFILE_DATA.avatar.src).toBe('/profile.jpg');
    expect(PROFILE_DATA.avatar.fallbackInitials).toBe('ZM');
  });

  it('contains core engineering pillars', () => {
    expect(PROFILE_DATA.pillars).toBeDefined();
    expect(Array.isArray(PROFILE_DATA.pillars)).toBe(true);
    expect(PROFILE_DATA.pillars?.length).toBe(4);
    expect(PROFILE_DATA.pillars).toContain('Mobile & Systems Architecture');
    expect(PROFILE_DATA.pillars).toContain('Deterministic Performance');
  });

  it('contains valid education details', () => {
    expect(PROFILE_DATA.education).toBeDefined();
    expect(PROFILE_DATA.education?.institution).toBe('Helwan University');
    expect(PROFILE_DATA.education?.degree).toBe("Bachelor's in Computer Science");
    expect(PROFILE_DATA.education?.period).toBe('2022 – Present');
  });

  it('contains valid resumeUrl', () => {
    expect(PROFILE_DATA.resumeUrl).toBeDefined();
    expect(PROFILE_DATA.resumeUrl).toBe('/resume.pdf');
  });
});
