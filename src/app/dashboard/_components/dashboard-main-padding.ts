/** Single source of truth for dashboard `<main>` inset — wired via CSS vars on `SidebarProvider`. */
export const DASHBOARD_MAIN_PADDING = {
  x: "1rem",
  top: "4rem",
  bottom: "4rem",
  md: "2rem",
} as const;

export const dashboardMainPaddingStyle = {
  "--dashboard-main-padding-x": DASHBOARD_MAIN_PADDING.x,
  "--dashboard-main-padding-top": DASHBOARD_MAIN_PADDING.top,
  "--dashboard-main-padding-bottom": DASHBOARD_MAIN_PADDING.bottom,
  "--dashboard-main-padding-md": DASHBOARD_MAIN_PADDING.md,
} as const;
