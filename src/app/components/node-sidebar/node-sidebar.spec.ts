import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeSidebar } from './node-sidebar';

describe('NodeSidebar', () => {
  let component: NodeSidebar;
  let fixture: ComponentFixture<NodeSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
