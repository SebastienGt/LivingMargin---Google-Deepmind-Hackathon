"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { livingMarginCatalog } from "@/lib/a2ui-catalog";

/**
 * CopilotKitProviderShell — mounts CopilotKit v2 with our A2UI catalog.
 *
 * The catalog is built via @copilotkit/a2ui-renderer's `createCatalog`,
 * passing both the Zod schemas (definitions) and the React renderers.
 * Auto-rendering of A2UI surfaces is dormant unless a CopilotKit runtime
 * is configured to emit them; in this build, our /api/agent route
 * dispatches components manually via lib/a2ui-catalog's exports, so the
 * catalog acts as a typed registry both ends share.
 */
export function CopilotKitProviderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
      a2ui={{ catalog: livingMarginCatalog }}
    >
      {children}
    </CopilotKitProvider>
  );
}
