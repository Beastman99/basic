// components/Header.tsx
"use client";

import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import { FaChevronDown } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

type MenuKey = "tools" | "insights" | null;

export default function Header() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);       // desktop dropdowns
  const [mobileOpen, setMobileOpen] = useState(false);            // mobile sheet
  const [mobileSection, setMobileSection] = useState<MenuKey>(null);
  const wrapRef = useRef<HTMLElement | null>(null);

  // Close on outside click / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
        setMobileSection(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
        setMobileSection(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      ref={wrapRef}
      className="bg-white dark:bg-[#1f1f1f] shadow-sm dark:border-b dark:border-gray-700 sticky top-0 z-50"
    >
      {/* ← revert to your original desktop padding; keep mobile comfy */}
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition group"
          aria-label="LawBroke Home"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">Law</span>
          <span className="inline-block transition-transform group-hover:translate-x-1">Broke</span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex items-center space-x-6">
          <Dropdown
            id="tools"
            label="Tools"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            items={[
              { href: "/signup", label: "Lawyer Match" },
              { href: "/signup", label: "Case Predictor" },
              ,
            ]}
          />
          <Dropdown
            id="insights"
            label="Insights"
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            items={[
              { href: "/Articles", label: "Articles" },
              { href: "/signup", label: "Damning Data" },
            ]}
          />
        </ul>

        {/* DESKTOP RIGHT */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/about"
            className="text-lg px-4 py-2 border-b-2 border-transparent hover:border-green-700 transition"
          >
            About
          </Link>
          <Link
            href="/signup"
            className="text-lg px-4 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
          >
            Sign Up
          </Link>
          <ThemeSwitch />
        </div>

        {/* MOBILE CONTROLS */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitch />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE SHEET (stopPropagation so taps inside don’t close it) */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f]"
          onClick={e => e.stopPropagation()}
        >
          <nav className="px-4 py-2 flex flex-col text-gray-900 dark:text-gray-100">
            <MobileSection
              id="tools"
              label="Tools"
              open={mobileSection === "tools"}
              onToggle={() => setMobileSection(mobileSection === "tools" ? null : "tools")}
              items={[
                { href: "/FindLawyer", label: "Lawyer Match" },
                { href: "/signup", label: "Case Predictor" },
                { href: "/signup", label: "Judge Search" },
              ]}
              closeAll={() => { setMobileOpen(false); setMobileSection(null); }}
            />
            <MobileSection
              id="insights"
              label="Insights"
              open={mobileSection === "insights"}
              onToggle={() => setMobileSection(mobileSection === "insights" ? null : "insights")}
              items={[
                { href: "/Articles", label: "Articles" },
                { href: "/signup", label: "Damning Data" },
              ]}
              closeAll={() => { setMobileOpen(false); setMobileSection(null); }}
            />

            <div className="mt-2 border-t border-gray-200 dark:border-gray-700" />
            <Link href="/about" className="py-3" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link
              href="/signup"
              className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-3 bg-black text-white dark:bg-white dark:text-black"
              onClick={() => setMobileOpen(false)}
            >
              Sign up
            </Link>
          </nav>
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      )}
    </header>
  );
}

function Dropdown({ id, label, items, openMenu, setOpenMenu }: {
  id: Exclude<MenuKey, null>;
  label: string;
  items: { href: string; label: string }[];
  openMenu: MenuKey;
  setOpenMenu: (k: MenuKey) => void;
}) {
  const isOpen = openMenu === id;
  return (
    <li className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        className={[
          "flex items-center text-lg px-6 py-4 border-b-2 transition focus:outline-none focus-visible:ring hover:border-green-700",
          isOpen ? "border-green-700" : "border-transparent",
        ].join(" ")}
        onClick={() => setOpenMenu(isOpen ? null : id)}
      >
        {label}
        <FaChevronDown className={`ml-1 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {isOpen && (
        <ul
          id={`${id}-menu`}
          role="menu"
          className="absolute left-0 top-full mt-1 w-56 rounded shadow bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 p-2 z-50"
        >
          {items.map(it => (
            <li key={it.href} role="none">
              <Link
                href={it.href}
                role="menuitem"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                onClick={() => setOpenMenu(null)}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileSection({
  id, label, open, onToggle, items, closeAll,
}: {
  id: Exclude<MenuKey, null>;
  label: string;
  open: boolean;
  onToggle: () => void;
  items: { href: string; label: string }[];
  closeAll: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        aria-controls={`m-${id}`}
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3"
      >
        <span className="text-base">{label}</span>
        <FaChevronDown className={`ml-2 text-xs transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul id={`m-${id}`} className="pb-2">
          {items.map(it => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={closeAll}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
