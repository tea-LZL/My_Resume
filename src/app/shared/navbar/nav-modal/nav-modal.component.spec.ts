import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { NavModalComponent } from './nav-modal.component';

describe('NavModalComponent', () => {
  let component: NavModalComponent;
  let fixture: ComponentFixture<NavModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavModalComponent],
      providers: [
        provideRouter([]),
        { provide: NgbActiveModal, useValue: { close: jasmine.createSpy('close') } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
