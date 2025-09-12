import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSetupComponent } from './general-setup.component';

describe('GeneralSetupComponent', () => {
  let component: GeneralSetupComponent;
  let fixture: ComponentFixture<GeneralSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
