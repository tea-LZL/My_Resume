import { TestBed } from "@angular/core/testing";

import { HoverInvertComponent } from "./hover-invert.component";

describe("HoverInvertComponent", () => {
  let created: HTMLElement[] = [];

  function addElement(tag: string, parent: HTMLElement = document.body): HTMLElement {
    const element = document.createElement(tag);
    parent.appendChild(element);
    created.push(element);
    return element;
  }

  // Promise.withResolvers is ES2024; this project compiles against ES2022 libs.
  async function nextFrame(): Promise<void> {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  function pointer(type: string, target: Element, extra: PointerEventInit = {}): void {
    target.dispatchEvent(
      new PointerEvent(type, { bubbles: true, pointerType: "mouse", ...extra }),
    );
  }

  afterEach(() => {
    created.forEach((element) => element.remove());
    created = [];
  });

  it("grows in on entering a heading and then tracks the pointer", () => {
    const fixture = TestBed.createComponent(HoverInvertComponent);
    fixture.detectChanges();
    const spot = fixture.nativeElement.querySelector(".hover-spot") as HTMLElement;
    const heading = addElement("h2");

    pointer("pointerover", heading, { clientX: 100, clientY: 220 });

    expect(spot.classList.contains("is-active")).toBeTrue();
    expect(spot.style.translate).toBe("100px 220px");
    expect(spot.style.scale).toBe("1");

    pointer("pointermove", heading, { clientX: 120, clientY: 240 });

    expect(spot.style.translate).toBe("120px 240px");
    expect(spot.style.scale).toBe("1");

    pointer("pointermove", heading, { clientX: 160, clientY: 300 });

    expect(spot.style.translate).toBe("160px 300px");

    fixture.destroy();
  });

  it("shrinks away when the pointer leaves the heading", () => {
    const fixture = TestBed.createComponent(HoverInvertComponent);
    fixture.detectChanges();
    const spot = fixture.nativeElement.querySelector(".hover-spot") as HTMLElement;
    const heading = addElement("h1");
    const paragraph = addElement("p");

    pointer("pointerover", heading);
    pointer("pointermove", heading, { clientX: 50, clientY: 60 });
    pointer("pointerout", heading, { relatedTarget: paragraph });

    expect(spot.classList.contains("is-active")).toBeFalse();
    expect(spot.style.translate).toBe("50px 60px");
    expect(spot.style.scale).toBe("0.3");

    fixture.destroy();
  });

  it("keeps the disc alive while moving between children of the heading", () => {
    const fixture = TestBed.createComponent(HoverInvertComponent);
    fixture.detectChanges();
    const spot = fixture.nativeElement.querySelector(".hover-spot") as HTMLElement;
    const heading = addElement("h2");
    const em = addElement("em", heading);

    pointer("pointerover", heading);
    pointer("pointerout", heading, { relatedTarget: em });

    expect(spot.classList.contains("is-active")).toBeTrue();

    fixture.destroy();
  });

  it("ignores touch pointers even when they enter a heading", () => {
    const fixture = TestBed.createComponent(HoverInvertComponent);
    fixture.detectChanges();
    const spot = fixture.nativeElement.querySelector(".hover-spot") as HTMLElement;
    const heading = addElement("h1");

    heading.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "touch" }),
    );

    expect(spot.classList.contains("is-active")).toBeFalse();
    expect(spot.style.translate).toBe("");

    fixture.destroy();
  });

  it("re-tests the element under a stationary pointer while scrolling", async () => {
    const fixture = TestBed.createComponent(HoverInvertComponent);
    fixture.detectChanges();
    const spot = fixture.nativeElement.querySelector(".hover-spot") as HTMLElement;
    const heading = addElement("h2");
    heading.style.cssText = "position: fixed; top: 0; left: 0; width: 300px; height: 80px; margin: 0;";

    pointer("pointerover", heading, { clientX: 100, clientY: 40 });
    pointer("pointermove", heading, { clientX: 100, clientY: 40 });
    expect(spot.classList.contains("is-active")).toBeTrue();

    document.dispatchEvent(new Event("scroll"));
    await nextFrame();
    expect(spot.classList.contains("is-active")).toBeTrue();

    heading.style.top = "400px";
    document.dispatchEvent(new Event("scroll"));
    await nextFrame();
    expect(spot.classList.contains("is-active")).toBeFalse();

    fixture.destroy();
  });
});
