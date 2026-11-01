import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PROJECTS } from '@/data/projects';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { ProjectDetailsModal } from '@/components/projects/ProjectDetailsModal';
import type { ProjectDetails } from '@/domain/types';

describe('Main Screen Project Navigation Integration', () => {
  let container: HTMLElement;
  let projectsSection: ProjectsSection | null = null;
  let detailsModal: ProjectDetailsModal | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'carousel-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (projectsSection) {
      projectsSection.destroy();
      projectsSection = null;
    }
    if (detailsModal) {
      detailsModal.destroy();
      detailsModal = null;
    }
    document.body.innerHTML = '';
  });

  it('connects ProjectsSection onProjectSelect callback to open ProjectDetailsModal', () => {
    detailsModal = new ProjectDetailsModal();
    detailsModal.mount(document.body);

    const openSpy = vi.spyOn(detailsModal, 'open');

    projectsSection = new ProjectsSection(PROJECTS, {
      onProjectSelect: (project) => {
        detailsModal?.open(project as ProjectDetails);
      },
    });
    projectsSection.mount(container);

    expect(detailsModal.isOpen()).toBe(false);

    // 1. Trigger selection via active project header trigger
    const trigger = container.querySelector('[data-testid="active-project-trigger"]') as HTMLElement;
    expect(trigger).toBeTruthy();
    trigger.click();

    expect(openSpy).toHaveBeenCalledWith(PROJECTS[0]);
    expect(detailsModal.isOpen()).toBe(true);

    const modalSheet = document.querySelector('[data-project-details-modal]');
    expect(modalSheet).toBeTruthy();
    expect(modalSheet?.textContent).toContain(PROJECTS[0].title);

    // 2. Escape key dismisses modal
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(detailsModal.isOpen()).toBe(false);
  });

  it('opens modal for any selected project from carousel navigation', () => {
    detailsModal = new ProjectDetailsModal();
    detailsModal.mount(document.body);

    projectsSection = new ProjectsSection(PROJECTS, {
      onProjectSelect: (project) => {
        detailsModal?.open(project as ProjectDetails);
      },
    });
    projectsSection.mount(container);

    // Advance to project 2 (Gusto) and select
    projectsSection.selectProject(2);

    expect(detailsModal.isOpen()).toBe(true);
    const modalSheet = document.querySelector('[data-project-details-modal]');
    expect(modalSheet?.textContent).toContain('Gusto');
  });
});
