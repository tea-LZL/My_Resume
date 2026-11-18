import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from "@angular/core";

import { TEACUP_HEIGHT, buildTeacupMesh, TeacupMesh } from "./teacup-mesh";
import { createFrameBuffer, FrameBuffer, RenderView, renderTeacup } from "./teacup-renderer";

const YAW_SPEED = 0.48;
const STATIC_YAW = 0.55;
const VIEW_PITCH = (22 * Math.PI) / 180;
const MIN_COLS = 40;
const MAX_COLS = 132;
const MIN_ROWS = 20;
const MAX_ROWS = 56;
const MIN_FRAME_MS = 1000 / 24;
const MOBILE_FRAME_MS = 1000 / 20;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

@Component({
  selector: "app-ascii-teacup",
  template: `<pre #stage class="ascii-teacup" aria-hidden="true"></pre>`,
  styleUrl: "./ascii-teacup.component.scss",
})
export class AsciiTeacupComponent implements AfterViewInit, OnDestroy {
  @ViewChild("stage", { static: true }) private stage!: ElementRef<HTMLPreElement>;

  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly mesh: TeacupMesh = buildTeacupMesh();

  private buffer: FrameBuffer | null = null;
  private view: RenderView | null = null;
  private frameInterval = MIN_FRAME_MS;
  private measuringCanvas: HTMLCanvasElement | null = null;
  private observer: ResizeObserver | null = null;
  private motionQuery: MediaQueryList | null = null;
  private yaw = STATIC_YAW;
  private lastTime = 0;
  private lastPaint = 0;
  private rafId: number | null = null;
  private reduceMotion = false;
  private destroyed = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.resize();
      this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.motionQuery.addEventListener("change", this.handleMotionChange);
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(this.host.nativeElement);
      void document.fonts?.ready.then(() => this.resize());
      this.applyMotionState();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cancelFrame();
    this.observer?.disconnect();
    this.observer = null;
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    this.motionQuery = null;
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.buffer = null;
    this.view = null;
  }

  private readonly frame = (now: number): void => {
    if (this.destroyed) {
      return;
    }
    this.rafId = requestAnimationFrame(this.frame);
    if (now - this.lastPaint < this.frameInterval) {
      return;
    }
    this.lastPaint = now;
    if (this.lastTime !== 0) {
      this.yaw += Math.min((now - this.lastTime) / 1000, 0.25) * YAW_SPEED;
    }
    this.lastTime = now;
    this.paint();
  };

  private readonly handleMotionChange = (): void => {
    this.applyMotionState();
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === "hidden") {
      this.cancelFrame();
    } else if (!this.reduceMotion) {
      this.start();
    }
  };

  private applyMotionState(): void {
    this.reduceMotion = this.motionQuery?.matches ?? false;
    if (this.reduceMotion) {
      this.cancelFrame();
      this.yaw = STATIC_YAW;
      this.paint();
      return;
    }
    if (document.visibilityState !== "hidden") {
      this.start();
    }
  }

  private start(): void {
    if (this.rafId !== null || this.destroyed) {
      return;
    }
    this.lastTime = 0;
    this.lastPaint = 0;
    this.rafId = requestAnimationFrame(this.frame);
  }

  private cancelFrame(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private resize(): void {
    const stage = this.destroyed ? null : this.stage?.nativeElement;
    if (!stage) {
      return;
    }

    const style = getComputedStyle(stage);
    const fontSize = Number.parseFloat(style.fontSize) || 11;
    const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.2;
    const cellWidth = this.measureCellWidth(fontSize, style.fontFamily || "monospace");
    const aspect = cellWidth / lineHeight;

    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const cols = clamp(Math.floor(viewportWidth / cellWidth), MIN_COLS, MAX_COLS);
    const rows = clamp(Math.floor(viewportHeight / lineHeight), MIN_ROWS, MAX_ROWS);
    const fitHeight = viewportHeight < 700 ? 0.58 : 0.72;
    const fitWidth = viewportWidth < 768 ? 0.72 : 0.6;
    const rowsPerUnit = Math.min((rows * fitHeight) / 1.4, (cols * fitWidth * aspect) / 1.65);

    this.view = {
      yaw: this.yaw,
      pitch: VIEW_PITCH,
      colsPerUnit: rowsPerUnit / aspect,
      rowsPerUnit,
      originCol: cols * (viewportWidth >= 1024 ? 0.56 : 0.5),
      originRow: rows / 2 + (TEACUP_HEIGHT / 2) * rowsPerUnit,
    };
    this.frameInterval = viewportWidth < 768 ? MOBILE_FRAME_MS : MIN_FRAME_MS;

    if (!this.buffer || this.buffer.cols !== cols || this.buffer.rows !== rows) {
      this.buffer = createFrameBuffer(cols, rows, this.mesh.vertices.length);
    }

    this.paint();
  }

  private measureCellWidth(fontSize: number, fontFamily: string): number {
    this.measuringCanvas ??= document.createElement("canvas");
    const context = this.measuringCanvas.getContext("2d");
    if (!context) {
      return fontSize * 0.6;
    }

    context.font = `${fontSize}px ${fontFamily}`;
    const width = context.measureText("M").width;
    return width > 0 ? width : fontSize * 0.6;
  }

  private paint(): void {
    const stage = this.destroyed ? null : this.stage?.nativeElement;
    if (!stage || !this.buffer || !this.view) {
      return;
    }

    this.view.yaw = this.yaw;
    stage.textContent = renderTeacup(this.mesh, this.buffer, this.view);
  }
}
