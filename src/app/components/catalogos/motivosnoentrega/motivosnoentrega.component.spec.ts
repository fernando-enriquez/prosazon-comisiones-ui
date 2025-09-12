import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivosnoentregaComponent } from './motivosnoentrega.component';

describe('MotivosnoentregaComponent', () => {
  let component: MotivosnoentregaComponent;
  let fixture: ComponentFixture<MotivosnoentregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotivosnoentregaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivosnoentregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
