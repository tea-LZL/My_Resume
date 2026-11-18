import { TestBed } from "@angular/core/testing";

import { AsciiTeacupComponent } from "./ascii-teacup.component";

describe("AsciiTeacupComponent", () => {
  function stubReducedMotion(reduce: boolean): void {
    spyOn(window, "matchMedia").and.callFake(
      (query: string) =>
        ({
          matches: reduce && query.includes("reduce"),
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );
  }

  it("renders one hidden pre with an ASCII frame", () => {
    stubReducedMotion(true);
    const fixture = TestBed.createComponent(AsciiTeacupComponent);
    fixture.detectChanges();

    const pres = fixture.nativeElement.querySelectorAll("pre");
    expect(pres.length).toBe(1);
    expect(pres[0].getAttribute("aria-hidden")).toBe("true");
    expect((pres[0].textContent as string).length).toBeGreaterThan(100);

    fixture.destroy();
  });

  it("does not animate when reduced motion is requested", () => {
    const requestFrame = spyOn(window, "requestAnimationFrame");
    stubReducedMotion(true);
    const fixture = TestBed.createComponent(AsciiTeacupComponent);
    fixture.detectChanges();

    expect(requestFrame).not.toHaveBeenCalled();

    fixture.destroy();
  });

  it("stops the animation frame loop on destroy", () => {
    const requestFrame = spyOn(window, "requestAnimationFrame").and.returnValue(41);
    const cancelFrame = spyOn(window, "cancelAnimationFrame");
    stubReducedMotion(false);
    const fixture = TestBed.createComponent(AsciiTeacupComponent);
    fixture.detectChanges();

    expect(requestFrame).toHaveBeenCalled();
    const stage = fixture.nativeElement.querySelector("pre") as HTMLPreElement;
    const lastFrame = stage.textContent;
    const callback = requestFrame.calls.mostRecent().args[0] as FrameRequestCallback;

    fixture.destroy();
    callback(performance.now());

    expect(cancelFrame).toHaveBeenCalledWith(41);
    expect(stage.textContent).toBe(lastFrame);
  });
});
