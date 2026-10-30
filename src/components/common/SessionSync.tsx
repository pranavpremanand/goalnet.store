"use client";

import { useEffect } from "react";
import { syncSession } from "@/lib/auth-client";

export function SessionSync() {
  useEffect(() => {
    void syncSession();
  }, []);

  return null;
}
