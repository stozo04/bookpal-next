"use client";
import { useEffect } from "react";

export default function ClientBootstrap() {
  useEffect(() => {
    // only runs in the browser; avoids SSR "document is not defined"
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
