import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../projects';
import type { ProjectDetails } from '@/domain/types';

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

describe('Project Deep-Dive Data Suite', () => {
  it('contains exactly 6 flagship projects', () => {
    expect(PROJECTS).toHaveLength(6);
  });

  it('populates deep-dive details for each flagship project', () => {
    const requiredProjectIds = ['dusk', 'cargo', 'gusto', 'sportx', 'elevated', 'wireless-mouse'];
    const projectIds = PROJECTS.map((p) => p.id);
    expect(projectIds).toEqual(requiredProjectIds);

    PROJECTS.forEach((project) => {
      const p = project as ProjectDetails;
      expect(p.longDescription).toBeDefined();
      expect(p.longDescription!.length).toBeGreaterThan(50);
      expect(p.liveStatus).toBeDefined();

      // Architecture graph verification
      expect(p.architectureGraph).toBeDefined();
      expect(p.architectureGraph!.nodes.length).toBeGreaterThanOrEqual(3);
      expect(p.architectureGraph!.flows.length).toBeGreaterThanOrEqual(2);

      // Metrics verification
      expect(p.metrics).toBeDefined();
      expect(p.metrics!.length).toBeGreaterThanOrEqual(2);

      // Code snippet verification
      expect(p.codeSnippet).toBeDefined();
      expect(p.codeSnippet!.language).toMatch(/^(kotlin|swift|dart|csharp)$/);
      expect(p.codeSnippet!.code.length).toBeGreaterThan(20);

      // Screenshots
      expect(p.galleryScreenshots).toBeDefined();
      expect(p.galleryScreenshots!.length).toBeGreaterThanOrEqual(1);
    });
  });
});
