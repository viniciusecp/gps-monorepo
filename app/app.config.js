try {
  require("dotenv").config();
} catch {}

function tryPlugin(name) {
  try {
    require.resolve(name);
    return name;
  } catch {
    return null;
  }
}

module.exports = () => {
  const splashScreen = tryPlugin("expo-splash-screen");
  const buildProperties = tryPlugin("expo-build-properties");

  const plugins = [];
  if (tryPlugin("expo-router")) {
    plugins.push("expo-router");
  }
  if (splashScreen) {
    plugins.push([splashScreen, { image: "./assets/images/icon.png", imageWidth: 200, resizeMode: "contain", backgroundColor: "#000000", dark: { backgroundColor: "#000000" } }]);
  }
  if (buildProperties) {
    plugins.push([buildProperties, { android: { usesCleartextTraffic: true } }]);
  }

  return {
    expo: {
      name: "RastroApp",
      slug: "rastroapp-v2",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "rastroappv2",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.viniciusfs.rastroappv2",
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/images/icon.png",
          backgroundImage: "./assets/images/icon.png",
          monochromeImage: "./assets/images/icon.png",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: "com.viniciusfs.rastroappv2",
        config: {
          googleMaps: {
            apiKey: process.env.GOOGLE_MAPS_API_KEY,
          },
        },
      },
      web: {
        output: "static",
        favicon: "./assets/images/icon.png",
      },
      plugins,
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        router: {},
        eas: {
          projectId: process.env.EAS_PROJECT_ID,
        },
      },
    },
  };
};
