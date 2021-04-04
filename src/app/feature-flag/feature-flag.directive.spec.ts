import { FeatureFlagDirective } from './feature-flag.directive';

describe('FeatureFlagDirective', () => {
  it('should create an instance', () => {
    const directive = new FeatureFlagDirective(null, null, null);
    expect(directive).toBeTruthy();
  });
});
