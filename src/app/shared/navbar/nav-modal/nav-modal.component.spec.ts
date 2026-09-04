import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { NavModalComponent } from "./nav-modal.component";

describe("NavModalComponent", () => {
  let fixture: ComponentFixture<NavModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavModalComponent);
    fixture.detectChanges();
  });

  it("renders route links and social actions", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routes = [...compiled.querySelectorAll(".nav-menu__links a")].map((link) =>
      link.textContent?.trim(),
    );

    expect(routes).toEqual(["Home", "Projects", "Resume", "Timeline"]);
    expect(compiled.querySelector("[aria-label='GitHub']")).toBeTruthy();
    expect(compiled.querySelector("[aria-label='GitLab']")).toBeTruthy();
    expect(compiled.querySelector("[aria-label='LinkedIn']")).toBeTruthy();
  });
});
