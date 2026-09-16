"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Phoneme Builder
        </Link>

        <ul className="hidden gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:text-blue-700 dark:hover:text-blue-400 ${
                  pathname === link.href
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span aria-hidden="true" className="block text-xl leading-none">
            {isOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {isOpen && (
        <ul id="mobile-menu" className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 sm:hidden dark:border-zinc-800">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
