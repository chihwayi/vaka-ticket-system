import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusDistributionComponent } from './status-distribution.component';

describe('StatusDistributionComponent', () => {
  let component: StatusDistributionComponent;
  let fixture: ComponentFixture<StatusDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusDistributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
