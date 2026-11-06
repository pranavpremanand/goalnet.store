"use client";

import { useEffect, useState } from "react";
import { FootballLoading } from "@/components/common/Loading";

const MINIMUM_DISPLAY_MS = 300;

export function InitialPageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), MINIMUM_DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return visible ? <FootballLoading label="Loading GoalNet" /> : null;
}
