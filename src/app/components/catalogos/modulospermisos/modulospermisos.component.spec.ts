import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulospermisosComponent } from './modulospermisos.component';

describe('ModulospermisosComponent', () => {
  let component: ModulospermisosComponent;
  let fixture: ComponentFixture<ModulospermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModulospermisosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulospermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
