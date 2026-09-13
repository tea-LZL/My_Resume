import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens a PDF resource and releases it when the viewer closes', async () => {
    const revoke = jasmine.createSpy('revoke');
    const modalRef = component.openPdfResource('blob:resume-preview', revoke);

    expect(component.pdfUrl).toBeTruthy();
    expect(component.pdfUrl?.toString()).toContain('blob:resume-preview');

    modalRef.dismiss('test-close');
    await modalRef.result.catch(() => undefined);
    await fixture.whenStable();

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(component.pdfUrl).toBeNull();
  });
});
