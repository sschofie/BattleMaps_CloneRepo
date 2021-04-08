export const environment = {
  production: true,
  appVersion: require('../../package.json').version,
  appName: require('../../package.json').name,
  appURL: 'http://battle-maps.carlsonmckinnon.com',
  copyrightYear: new Date().getFullYear(),
  featureFlags: {
    sharing: false,
    dynamicMaps: true
  }
};
