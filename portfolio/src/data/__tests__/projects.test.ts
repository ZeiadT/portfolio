import { describe, it, expect } from 'vitest';
import { PROJECTS } from '@/data/projects';

describe('Domain Data: Projects Repository', () => {
  it('should have valid project records with required fields', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);

    for (const project of PROJECTS) {
      expect(project.id).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.category).toBeTruthy();
      expect(project.year).toMatch(/^\d{4}$/);
      expect(project.tags.length).toBeGreaterThan(0);
      expect(project.description).toBeTruthy();
      expect(project.media.thumbnail).toBeTruthy();
    }
  });

  it('should have unique IDs across all projects', () => {
    const ids = PROJECTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
