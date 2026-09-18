import { registerHelpdeskExtension } from "@/extensions/registry";
import { travelosModuleNavigation } from "@/kancom/shell/navigation";

registerHelpdeskExtension({
  id: "kancom-product",
  productContextUrl: "kancom_custom.api.product_context.get_product_context",
  moduleNavigation: [...travelosModuleNavigation],
  routes: [
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () =>
        import("@/kancom/operations/pages/OperationsDashboard.vue"),
      meta: { capability: "operations" },
    },
    {
      path: "/analytics",
      name: "AnalyticsDashboard",
      component: () =>
        import("@/kancom/analytics/pages/AnalyticsDashboard.vue"),
      meta: { analytics: true, capability: "analytics" },
    },
    {
      path: "/reports",
      name: "OperationalReports",
      component: () => import("@/kancom/reports/pages/OperationalReports.vue"),
      meta: { capability: "basic_reports" },
    },
    {
      path: "/workforce",
      name: "WorkforceDashboard",
      component: () =>
        import("@/kancom/workforce/pages/WorkforceDashboard.vue"),
      meta: { manager: true, capability: "workforce" },
    },
    {
      path: "/quality",
      name: "QualityDashboard",
      component: () => import("@/kancom/quality/pages/QualityDashboard.vue"),
      meta: { manager: true, capability: "quality" },
    },
  ],
});
