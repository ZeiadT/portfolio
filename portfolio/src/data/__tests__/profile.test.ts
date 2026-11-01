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

  it('contains Egypt as the primary location', () => {
    expect(PROFILE_DATA.location).toBe('Egypt');
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

  it('contains valid education details matching 3 history milestones', () => {
    expect(PROFILE_DATA.education).toBeDefined();
    const eduList = Array.isArray(PROFILE_DATA.education)
      ? PROFILE_DATA.education
      : [PROFILE_DATA.education!];
    expect(eduList.length).toBe(3);
    expect(eduList[0].degree).toBe('9-Month Professional Diploma');
    expect(eduList[0].field).toBe('Mobile Application Development (Native)');

    // Item 2: Faculty of Computers and Artificial Intelligence, B.Sc. in Scientific Computing, Benha University
    expect(eduList[1].degree || eduList[1].title).toBe('Faculty of Computers and Artificial Intelligence');
    expect(eduList[1].field || eduList[1].track).toBe('B.Sc. in Scientific Computing');
    expect(eduList[1].institution || eduList[1].location).toBe('Benha University');
    expect(eduList[1].period).toBe('Oct 2021 – Jun 2025');

    expect(eduList[2].degree).toContain('Digital Egypt Pioneers Initiative');
  });

  it('contains valid resumeUrl', () => {
    expect(PROFILE_DATA.resumeUrl).toBeDefined();
    expect(PROFILE_DATA.resumeUrl).toBe('/resume.pdf');
  });
});
