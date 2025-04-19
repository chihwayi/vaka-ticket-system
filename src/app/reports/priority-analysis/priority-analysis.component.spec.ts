import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityAnalysisComponent } from './priority-analysis.component';

describe('PriorityAnalysisComponent', () => {
  let component: PriorityAnalysisComponent;
  let fixture: ComponentFixture<PriorityAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriorityAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorityAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
