import { Colors, getSpacing, getTypography } from "@/src/theme";

export const getStyles = () => ({
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: getSpacing("px5"),
  },
  iconContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 80,
    height: 80,
  },
  icon: {
    marginBottom: getSpacing("px2"),
  },
  textContainer: {
    marginTop: getSpacing("px4"),
    alignItems: "center" as const,
  },
  title: {
    fontSize: getTypography("h4"),
    fontWeight: getTypography("fontWeight").semibold,
    color: Colors.text,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: getTypography("caption"),
    fontWeight: getTypography("fontWeight").regular,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: getSpacing("px1"),
  },
});