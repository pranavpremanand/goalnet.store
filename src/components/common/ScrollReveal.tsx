"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealVariant = "rise" | "scale";

let intersectionObserver: IntersectionObserver | null = null;
const observedElements = new Set<Element>();

function getIntersectionObserver() {
  if (intersectionObserver) return intersectionObserver;

  intersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        entry.target.removeAttribute("data-reveal-pending");
        entry.target.setAttribute("data-reveal-visible", "");
        observer.unobserve(entry.target);
        observedElements.delete(entry.target);
      }

      if (observedElements.size === 0) {
        observer.disconnect();
        intersectionObserver = null;
      }
    },
    { rootMargin: "0px 0px -48px 0px", threshold: 0.1 },
  );

  return intersectionObserver;
}

function observeElement(element: Element) {
  const observer = getIntersectionObserver();
  observedElements.add(element);
  observer.observe(element);

  return () => {
    observer.unobserve(element);
    observedElements.delete(element);
    if (observedElements.size === 0) {
      observer.disconnect();
      if (intersectionObserver === observer) intersectionObserver = null;
    }
  };
}

export function ScrollReveal({
  children,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) return;

    element.setAttribute("data-reveal-pending", "");
    return observeElement(element);
  }, []);

  return (
    <div
      className={className}
      data-scroll-reveal={variant}
      ref={elementRef}
    >
      {children}
    </div>
  );
}
