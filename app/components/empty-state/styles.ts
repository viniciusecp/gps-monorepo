import { Colors, getSpacing, getTypography } from "@/src/theme";

export const getStyles = () => ({
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: getSpacing("px4"),
  },
  iconContainer: {
    position: "relative" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 120,
    height: 120,
  },
  arrowContainer: {
    position: "absolute" as const,
    top: -40,
    alignItems: "center" as const,
  },
  glowEffect: {
    position: "absolute" as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
  },
  textContainer: {
    marginTop: getSpacing("px6"),
    alignItems: "center" as const,
  },
  title: {
    fontSize: getTypography("h3"),
    fontWeight: getTypography("fontWeight").bold,
    color: Colors.text,
    textAlign: "center" as const,
  },
});
