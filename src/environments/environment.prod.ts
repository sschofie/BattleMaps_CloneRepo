export const environment = {
  production: true,
  appVersion: require('../../package.json').version,
  appName: require('../../package.json').name,
  copyrightYear: new Date().getFullYear()
};
