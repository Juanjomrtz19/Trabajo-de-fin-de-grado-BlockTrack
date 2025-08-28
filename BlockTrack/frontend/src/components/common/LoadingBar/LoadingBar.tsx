// src/components/TopLoadingBar.tsx
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export default function TopLoadingBar({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) {
      NProgress.start();
    } else {
      NProgress.done();
    }
    return () => {
      NProgress.remove();
    };
  }, [active]);

  return null;
}
