import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBottomSheetComponent } from './menu-bottom-sheet.component';

describe('MenuBottomSheetComponent', () => {
  let component: MenuBottomSheetComponent;
  let fixture: ComponentFixture<MenuBottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuBottomSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
