"use client";

import { useEffect } from "react";

export function SelectHandler() {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const select = (e.target as HTMLElement).closest("select");
      if (!select) {
        document.querySelectorAll("select[data-open]").forEach((el) => {
          el.removeAttribute("data-open");
        });
        return;
      }

      if (select.getAttribute("data-open") === "true") {
        select.removeAttribute("data-open");
      } else {
        document.querySelectorAll("select[data-open]").forEach((el) => {
          if (el !== select) el.removeAttribute("data-open");
        });
        select.setAttribute("data-open", "true");
      }
    };

    const handleChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "SELECT") {
        target.removeAttribute("data-open");
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "SELECT") {
        setTimeout(() => {
          target.removeAttribute("data-open");
        }, 150);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "SELECT") {
        if (e.key === "Escape" || e.key === "Enter") {
          target.removeAttribute("data-open");
        } else if (e.key === " ") {
          if (target.getAttribute("data-open") === "true") {
            target.removeAttribute("data-open");
          } else {
            target.setAttribute("data-open", "true");
          }
        }
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("change", handleChange);
    document.addEventListener("focusout", handleFocusOut, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("change", handleChange);
      document.removeEventListener("focusout", handleFocusOut, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
