import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileEducationComponent } from '../ProfileEducation';
import type { ProfileEducationEntry } from '@/domain/types';

describe('ProfileEducationComponent', () => {
  let container: HTMLElement;

  const mockEducation: ProfileEducationEntry = {
    institution: 'Helwan University',
    degree: "Bachelor's in Computer Science",
    period: '2022 – Present',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Rendering with provided education data', () => {
    it('renders root container with data-bento-education attribute and bento styling', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);

      const root = container.querySelector('[data-bento-education="true"]');
      expect(root).toBeTruthy();
      expect(root?.className).toContain('p-5');
      expect(root?.className).toContain('sm:p-6');
      expect(root?.className).toContain('rounded-2xl');
      expect(root?.className).toContain('bg-white/[0.02]');
      expect(root?.className).toContain('border');
      expect(root?.className).toContain('border-white/10');
      expect(root?.className).toContain('backdrop-blur-sm');
      expect(root?.className).toContain('shadow-[0_8px_32px_rgba(0,0,0,0.37)]');
      expect(root?.className).toContain('flex');
      expect(root?.className).toContain('flex-col');
      expect(root?.className).toContain('justify-between');
      expect(root?.className).toContain('h-full');
      expect(root?.className).toContain('select-text');
      expect(root?.className).toContain('group/education');
      expect(root?.className).toContain('transition-colors');
      expect(root?.className).toContain('hover:border-white/20');
    });

    it('renders graduation cap icon badge and EDUCATION label', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);

      // Check badge container styling
      const badge = container.querySelector('.bg-\\[\\#ff4421\\]\\/10');
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('text-[#ff4421]');

      // Check graduation cap SVG
      const svg = badge?.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      const paths = svg?.querySelectorAll('path');
      expect(paths && paths.length > 0).toBe(true);

      // Check EDUCATION label
      const label = container.querySelector('.uppercase.tracking-widest');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('EDUCATION');
      expect(label?.className).toContain('text-xs');
      expect(label?.className).toContain('font-semibold');
      expect(label?.className).toContain('text-[#ff4421]/80');
    });

    it('renders institution, degree, and period correctly in inner card', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);

      // Check inner card container
      const innerCard = container.querySelector('[data-education-institution]')?.parentElement;
      expect(innerCard).toBeTruthy();
      expect(innerCard?.className).toContain('bg-white/[0.03]');
      expect(innerCard?.className).toContain('border-white/10');
      expect(innerCard?.className).toContain('rounded-xl');
      expect(innerCard?.className).toContain('p-3.5');
      expect(innerCard?.className).toContain('sm:p-4');

      // Check institution
      const instEl = container.querySelector('[data-education-institution]');
      expect(instEl).toBeTruthy();
      expect(instEl?.textContent?.trim()).toBe('Helwan University');
      expect(instEl?.className).toContain('text-sm');
      expect(instEl?.className).toContain('sm:text-base');
      expect(instEl?.className).toContain('font-bold');
      expect(instEl?.className).toContain('text-neutral-100');

      // Check degree
      const degreeEl = container.querySelector('[data-education-degree]');
      expect(degreeEl).toBeTruthy();
      expect(degreeEl?.textContent?.trim()).toBe("Bachelor's in Computer Science");
      expect(degreeEl?.className).toContain('text-xs');
      expect(degreeEl?.className).toContain('text-neutral-400');
      expect(degreeEl?.className).toContain('mt-1');

      // Check period
      const periodEl = container.querySelector('[data-education-period]');
      expect(periodEl).toBeTruthy();
      expect(periodEl?.textContent?.trim()).toBe('2022 – Present');
      expect(periodEl?.className).toContain('text-[11px]');
      expect(periodEl?.className).toContain('font-mono');
      expect(periodEl?.className).toContain('text-neutral-400');
      expect(periodEl?.className).toContain('mt-2');
    });
  });

  describe('Fallback behavior for undefined or incomplete data', () => {
    it('uses fallback values when education prop is undefined', () => {
      const comp = new ProfileEducationComponent(undefined);
      comp.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      const degreeEl = container.querySelector('[data-education-degree]');
      const periodEl = container.querySelector('[data-education-period]');

      expect(instEl?.textContent?.trim()).toBe('University');
      expect(degreeEl?.textContent?.trim()).toBe('Computer Science');
      expect(periodEl?.textContent?.trim()).toBe('Present');
    });

    it('uses fallback values when education prop is empty or has blank strings', () => {
      const comp = new ProfileEducationComponent({
        institution: '   ',
        degree: '',
        period: '  ',
      });
      comp.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      const degreeEl = container.querySelector('[data-education-degree]');
      const periodEl = container.querySelector('[data-education-period]');

      expect(instEl?.textContent?.trim()).toBe('University');
      expect(degreeEl?.textContent?.trim()).toBe('Computer Science');
      expect(periodEl?.textContent?.trim()).toBe('Present');
    });

    it('uses fallback values individually for partially provided education prop', () => {
      const partialComp = new ProfileEducationComponent({
        institution: 'Oxford University',
      } as any);
      partialComp.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      const degreeEl = container.querySelector('[data-education-degree]');
      const periodEl = container.querySelector('[data-education-period]');

      expect(instEl?.textContent?.trim()).toBe('Oxford University');
      expect(degreeEl?.textContent?.trim()).toBe('Computer Science');
      expect(periodEl?.textContent?.trim()).toBe('Present');
    });

    it('escapes special characters safely against XSS', () => {
      const comp = new ProfileEducationComponent({
        institution: '<script>alert(1)</script>MIT',
        degree: '<img src=x onerror=alert(1)>BSc',
        period: '<b>2024</b>',
      });
      comp.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      expect(instEl?.innerHTML).not.toContain('<script>');
      expect(instEl?.textContent).toBe('<script>alert(1)</script>MIT');

      const degreeEl = container.querySelector('[data-education-degree]');
      expect(degreeEl?.innerHTML).not.toContain('<img');
      expect(degreeEl?.textContent).toBe('<img src=x onerror=alert(1)>BSc');

      const periodEl = container.querySelector('[data-education-period]');
      expect(periodEl?.innerHTML).not.toContain('<b>');
      expect(periodEl?.textContent).toBe('<b>2024</b>');
    });
  });

  describe('Lifecycle and cleanup', () => {
    it('cleanly removes the root element from parent on destroy', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);

      expect(container.children.length).toBe(1);
      expect(container.querySelector('[data-bento-education="true"]')).toBeTruthy();

      comp.destroy();

      expect(container.children.length).toBe(0);
      expect(container.querySelector('[data-bento-education="true"]')).toBeNull();
    });

    it('does not throw when destroy is called without mounting', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      expect(() => comp.destroy()).not.toThrow();
    });

    it('does not throw when destroy is called multiple times', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);
      expect(() => {
        comp.destroy();
        comp.destroy();
      }).not.toThrow();
      expect(container.children.length).toBe(0);
    });

    it('supports remounting cleanly after destroy', () => {
      const comp = new ProfileEducationComponent(mockEducation);
      comp.mount(container);
      expect(container.children.length).toBe(1);

      comp.destroy();
      expect(container.children.length).toBe(0);

      comp.mount(container);
      expect(container.children.length).toBe(1);
      expect(container.querySelector('[data-bento-education="true"]')).toBeTruthy();
      expect(container.querySelector('[data-education-institution]')?.textContent?.trim()).toBe('Helwan University');

      comp.destroy();
      expect(container.children.length).toBe(0);
    });
  });
});
