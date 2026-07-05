import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  title: string;
  expression?: string;
  note?: string;
  final?: boolean;
}

@Component({
  selector: 'app-step-reveal',
  imports: [CommonModule],
  template: `
    <div class="step-reveal">
      <div class="step-list">
        @for (step of steps; track step.title; let i = $index) {
          <div class="step" [class.step--revealed]="i < revealedCount" [class.step--final]="step.final && i === revealedCount - 1">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-title">{{ step.title }}</div>
            @if (step.expression) {
              <div class="step-expression">{{ step.expression }}</div>
            }
            @if (step.note) {
              <div class="step-note">{{ step.note }}</div>
            }
          </div>
        }
      </div>

      <div class="step-controls">
        <button class="step-btn step-btn--reveal" (click)="revealNext()" [disabled]="revealedCount >= steps.length">
          <span>{{ revealedCount >= steps.length ? 'Complete' : 'Reveal step ' + (revealedCount + 1) }}</span>
          <i class="bi bi-arrow-down ms-2"></i>
        </button>
        <button class="step-btn step-btn--reset" (click)="reset()">
          <i class="bi bi-arrow-repeat me-2"></i>
          Reset
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-reveal {
      margin-top: 16px;
    }

    .step-list {
      position: relative;
    }

    .step-list::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 20px;
      bottom: 20px;
      width: 1px;
      background: var(--ef-border);
    }

    .step {
      position: relative;
      padding-left: 56px;
      padding-bottom: 24px;
      opacity: 0;
      transform: translateX(-12px);
      max-height: 0;
      overflow: hidden;
      transition:
        opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        max-height 0.5s ease,
        padding 0.5s ease;
    }

    .step--revealed {
      opacity: 1;
      transform: translateX(0);
      max-height: 400px;
    }

    .step-num {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      background: var(--card-bg);
      border: 2px solid var(--ef-green);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--ef-green);
      z-index: 1;
      transition:
        background-color 0.3s ease,
        border-color 0.3s ease,
        color 0.3s ease;
    }

    .step--final .step-num {
      background: var(--ef-green);
      color: var(--ef-bg);
    }

    .step-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--ef-fg);
      transition: color 0.3s ease;
    }

    .step-expression {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      color: var(--ef-green);
      background: rgba(var(--ef-green-rgb), 0.08);
      padding: 10px 14px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 6px;
      border: 1px solid rgba(var(--ef-green-rgb), 0.15);
      transition:
        background-color 0.3s ease,
        border-color 0.3s ease;
    }

    .step-note {
      font-size: 13px;
      color: var(--ef-fg-dim);
      font-style: italic;
      line-height: 1.5;
    }

    .step-controls {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      flex-wrap: wrap;
      padding-left: 56px;
    }

    .step-btn {
      font-family: inherit;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      padding: 10px 20px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      transition: all 0.25s ease;
    }

    .step-btn--reveal {
      background: var(--ef-green);
      color: var(--ef-bg);
      border: none;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--ef-green-rgb), 0.35);
      }

      &:disabled {
        background: var(--ef-bg-light);
        color: var(--ef-fg-muted);
        cursor: default;
      }
    }

    .step-btn--reset {
      background: transparent;
      color: var(--ef-fg-dim);
      border: 1px solid var(--ef-border);

      &:hover {
        color: var(--ef-fg);
        border-color: var(--ef-fg-dim);
      }
    }
  `]
})
export class StepRevealComponent {
  @Input() steps: StepItem[] = [];
  revealedCount = 0;

  revealNext(): void {
    if (this.revealedCount < this.steps.length) {
      this.revealedCount++;
    }
  }

  reset(): void {
    this.revealedCount = 0;
  }
}
