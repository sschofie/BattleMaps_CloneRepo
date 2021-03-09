import { TestBed } from '@angular/core/testing';

import { FeatureFlagGuard } from './feature-flag.guard';
import {RouterTestingModule} from '@angular/router/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
  imports: [RouterTestingModule],
  providers: [],
  declarations: [],
  });
});

describe('FeatureFlagGuard', () => {
  let guard: FeatureFlagGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FeatureFlagGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
