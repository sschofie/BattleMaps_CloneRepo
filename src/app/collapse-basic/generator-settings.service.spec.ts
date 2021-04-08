import { TestBed } from '@angular/core/testing';

import { GeneratorSettingsService } from './generator-settings.service';

describe('GeneratorSettingsService', () => {
  let service: GeneratorSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratorSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
