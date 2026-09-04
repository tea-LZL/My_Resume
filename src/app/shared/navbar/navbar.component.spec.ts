import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("opens and closes the mobile navigation panel", () => {
    expect(fixture.nativeElement.querySelector("#site-mobile-nav")).toBeNull();

    component.toggleNavMenu();
    fixture.detectChanges();

    expect(component.bNav).toBeTrue();
    expect(fixture.nativeElement.querySelector("#site-mobile-nav")).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(".site-nav__toggle")?.getAttribute("aria-expanded"),
    ).toBe("true");

    component.closeNavMenu();
    fixture.detectChanges();

    expect(component.bNav).toBeFalse();
    expect(fixture.nativeElement.querySelector("#site-mobile-nav")).toBeNull();
  });
});
