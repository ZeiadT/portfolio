import type { ProfileData } from '@/domain/types';
import { ProfileQuote } from './ProfileQuote';
import { ProfileBio } from './ProfileBio';
import { ProfileLinksComponent } from './ProfileLinks';
import { ProfileContactComponent } from './ProfileContact';
import { ProfileAvatarComponent } from './ProfileAvatar';
import { CardSummonEngine } from '@/engines/card/CardSummonEngine';
import { EditorialCardFaceRenderer } from '@/engines/card/renderers/EditorialCardFaceRenderer';
import { BentoRevealController } from './BentoRevealController';

/**
 * ProfileHeader Component
 * Implements the Curated Editorial Bento Grid architecture:
 * - Hero Card 1 (Left 7 cols): Social badges + Cairo location chip,
 *   centered personal quote, and direct contact buttons.
 * - Hero Card 2 (Right 5 cols): Glowing 3D bending portrait card,
 *   role title ("Software Developer"), and phone number with copy icon.
 * - Bottom Bento Row (12 cols): 3-column editorial bento row arranged strictly LTR:
 *   1. Education Card (3 cols)
 *   2. Globe Card (3 cols)
 *   3. Summary Narrative Card (6 cols)
 */
export class ProfileHeader {
  private data: ProfileData;
  private rootEl: HTMLElement | null = null;
  private linksComponent: ProfileLinksComponent | null = null;
  private quoteComponent: ProfileQuote | null = null;
  private contactComponent: ProfileContactComponent | null = null;
  private avatarComponent: ProfileAvatarComponent | null = null;
  private bioComponent: ProfileBio | null = null;
  private cardSummonEngine: CardSummonEngine | null = null;
  private revealController: BentoRevealController | null = null;

  constructor(data: ProfileData) {
    this.data = data;
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className =
      'profile-header-root relative w-full flex-1 flex flex-col justify-between select-text';

    // 1. Top Bento Row (Left: Hero Statement Card; Right: 3D Portrait Identity Card)
    const topRow = document.createElement('div');
    topRow.className =
      'w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch lg:flex-1';

    // --- Hero Card 1: Left Column (7 cols) ---
    const leftHeroCard = document.createElement('div');
    leftHeroCard.setAttribute('data-bento-hero-left', 'true');
    leftHeroCard.className =
      'lg:col-span-7 p-5 sm:p-6 lg:p-7 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between gap-4 sm:gap-5 min-h-[330px] lg:min-h-[340px]';

    // Top Bar inside Card 1: Social Links
    const card1TopBar = document.createElement('div');
    card1TopBar.className = 'w-full flex items-center justify-start';

    // Top-Left Links
    this.linksComponent = new ProfileLinksComponent(this.data.links);
    this.linksComponent.mount(card1TopBar);
    leftHeroCard.appendChild(card1TopBar);

    // Center Quote inside Card 1
    this.quoteComponent = new ProfileQuote(this.data.quote);
    this.quoteComponent.mount(leftHeroCard);

    // Bottom Contact Bar inside Card 1
    const contactWrapper = document.createElement('div');
    contactWrapper.className = 'w-full pt-2 border-t border-white/[0.06] flex items-center';
    this.contactComponent = new ProfileContactComponent(this.data.contact, this.data.resumeUrl);
    this.contactComponent.mount(contactWrapper);
    leftHeroCard.appendChild(contactWrapper);

    // --- Hero Card 2: Right Column (5 cols) ---
    const rightHeroCard = document.createElement('div');
    rightHeroCard.setAttribute('data-bento-hero-right', 'true');
    rightHeroCard.className =
      'lg:col-span-5 p-5 sm:p-6 lg:p-7 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col items-center justify-center';

    this.cardSummonEngine = new CardSummonEngine({
      faceRenderer: new EditorialCardFaceRenderer(),
      autoFlipToFront: true,
      cardData: {
        name: 'Zeiad Mohammed',
        rarity: 'Rare Edition',
        stars: 5,
        role: 'Mobile Developer',
        imageSrc: this.data.avatar.src,
        imageAlt: this.data.avatar.alt,
        skillName: 'Rare Edition',
        skillDescription:
          'Engineers offline-first Android & KMP platforms with Kotlin Coroutines, Jetpack Compose, and robust Clean Architecture.',
        stats: {
          perf: 99,
          arch: 98,
          code: 95,
        },
      },
    });
    if (typeof document !== 'undefined' && document.body) {
      this.cardSummonEngine.mount(document.body);
    }

    this.avatarComponent = new ProfileAvatarComponent(this.data.avatar, {
      title: this.data.title,
      onImageClick: () => this.cardSummonEngine?.open(),
    });
    this.avatarComponent.mount(rightHeroCard);

    topRow.appendChild(leftHeroCard);
    topRow.appendChild(rightHeroCard);
    root.appendChild(topRow);

    // 2. Bottom Row: 3-Column Editorial Bento Row (Education 3 cols, Globe 3 cols, Summary 6 cols)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'w-full mt-[22px] lg:flex-1 flex flex-col';

    this.bioComponent = new ProfileBio(this.data);
    this.bioComponent.mount(bottomRow);
    root.appendChild(bottomRow);

    container.appendChild(root);
    this.rootEl = root;

    this.revealController = new BentoRevealController(root);
  }

  public getRevealController(): BentoRevealController | null {
    return this.revealController;
  }

  public destroy(): void {
    if (this.revealController) {
      this.revealController.destroy();
      this.revealController = null;
    }
    if (this.cardSummonEngine) {
      this.cardSummonEngine.destroy();
      this.cardSummonEngine = null;
    }
    if (this.avatarComponent) {
      this.avatarComponent.destroy();
      this.avatarComponent = null;
    }
    if (this.contactComponent) {
      this.contactComponent.destroy();
      this.contactComponent = null;
    }
    if (this.quoteComponent) {
      this.quoteComponent.destroy();
      this.quoteComponent = null;
    }
    if (this.linksComponent) {
      this.linksComponent.destroy();
      this.linksComponent = null;
    }
    if (this.bioComponent) {
      this.bioComponent.destroy();
      this.bioComponent = null;
    }
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
  }
}
