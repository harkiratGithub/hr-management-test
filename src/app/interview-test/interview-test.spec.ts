import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewTest } from './interview-test';

describe('InterviewTest', () => {
  let component: InterviewTest;
  let fixture: ComponentFixture<InterviewTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
