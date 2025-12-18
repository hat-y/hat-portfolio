import { Injectable, ElementRef, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FocusTrapService {
  private previousFocusElement: HTMLElement | null = null;

  constructor(private renderer: Renderer2) {}

  /**
   * Trap focus within a container element
   */
  trapFocus(containerElement: HTMLElement): void {
    // Store the currently focused element
    this.previousFocusElement = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    // Focus the first element
    const firstElement = focusableElements[0];
    firstElement.focus();

    // Add keydown listener for tab navigation
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Escape key to restore focus
      if (e.key === 'Escape') {
        this.removeFocusTrap(containerElement);
      }
    };

    this.renderer.listen('window', 'keydown', keydownHandler);
  }

  /**
   * Remove focus trap and restore previous focus
   */
  removeFocusTrap(containerElement: HTMLElement): void {
    if (this.previousFocusElement && this.previousFocusElement.focus) {
      this.previousFocusElement.focus();
    }
    this.previousFocusElement = null;
  }

  /**
   * Announce screen reader messages
   */
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Set focus to element with smooth scroll
   */
  focusElement(element: HTMLElement, smooth: boolean = true): void {
    setTimeout(() => {
      element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      element.focus({ preventScroll: true });
    }, 100);
  }
}