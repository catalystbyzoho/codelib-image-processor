class AppConstants {
  static NumberRegex = /^[0-9]+$/
  static File = {
    MaxSize: 5 * 1000 * 1000
  }

  static Headers = {
    CodelibSecretKey: 'catalyst-codelib-secret-key'
  }

  static Env = {
    CodelibSecretKey: 'CODELIB_SECRET_KEY',
    BrowserWSEndpoint: 'BROWSER_WS_ENDPOINT'
  }

  static MountingDivID = 'root'
  static MaxImageWidth = 2000
  static MaxImageHeight = 2000
}

module.exports = AppConstants
