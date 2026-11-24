/**
 * electron-builder afterPack hook
 * Ensures macOS .app bundles are code-signed with entitlements (using Apple Developer ID
 * when CSC_LINK is set, or ad-hoc `codesign --sign -` otherwise) before DMG packaging.
 */
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;

  // If a real Developer ID certificate is configured, electron-builder handles signing & notarization
  if (process.env.CSC_LINK) {
    console.log('[afterPack] Developer ID certificate detected; skipping ad-hoc signing.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  const entitlementsPath = path.resolve(__dirname, '../resources/entitlements.mac.plist');

  console.log(`[afterPack] Ad-hoc signing macOS bundle with entitlements: ${appPath}`);
  try {
    execFileSync('codesign', [
      '--force',
      '--deep',
      '--sign', '-',
      '--entitlements', entitlementsPath,
      appPath
    ], { stdio: 'inherit' });

    execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], { stdio: 'inherit' });
    console.log('[afterPack] macOS code signature verified successfully.');
  } catch (err) {
    console.warn('[afterPack] Warning during ad-hoc codesign:', err.message);
  }
};
