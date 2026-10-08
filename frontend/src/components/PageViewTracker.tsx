"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/lib/api";

// Reports how long the visitor stayed on each route to the backend's
// /api/page-views, feeding the dashboard's "average time on page"
// stat. Each pathname gets its own effect instance (and so its own
// closed-over start time), fired on client-side route change and on
// tab close/refresh (pagehide) — React doesn't reliably unmount
// before the browser tears the page down, so pagehide is required
// alongside the cleanup function, not instead of it.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const start = Date.now();
    function report() {
      recordPageView(pathname, Date.now() - start);
    }

    window.addEventListener("pagehide", report);
    return () => {
      window.removeEventListener("pagehide", report);
      report();
    };
  }, [pathname]);

  return null;
}
