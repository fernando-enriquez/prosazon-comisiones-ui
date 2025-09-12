import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarusuariospermisosmodalComponent } from './asignarusuariospermisosmodal.component';

describe('AsignarusuariospermisosmodalComponent', () => {
  let component: AsignarusuariospermisosmodalComponent;
  let fixture: ComponentFixture<AsignarusuariospermisosmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignarusuariospermisosmodalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarusuariospermisosmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
