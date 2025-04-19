import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTrendsComponent } from './ticket-trends.component';

describe('TicketTrendsComponent', () => {
  let component: TicketTrendsComponent;
  let fixture: ComponentFixture<TicketTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketTrendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
