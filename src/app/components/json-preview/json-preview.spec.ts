import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonPreview } from './json-preview';

describe('JsonPreview', () => {
  let component: JsonPreview;
  let fixture: ComponentFixture<JsonPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
