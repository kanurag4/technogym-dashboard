const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// react-native-linear-gradient 2.x has no codegenConfig and crashes with New Architecture.
// Alias it to expo-linear-gradient on all platforms — gifted-charts uses this transparently.
config.resolver = config.resolver ?? {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-linear-gradient') {
    return context.resolveRequest(context, 'expo-linear-gradient', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
