"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { copy, type Locale } from "@/lib/i18n";
import { Icon } from "./icons";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = copy[locale];
  const other = locale === "de" ? "en" : "de";
  const otherPath = pathname.replace(/^\/(de|en)(?=\/|$)/, `/${other}`);

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("td-theme", next);
  }

  return (
    <header className="site-header">
      <Link className="brand" href={`/${locale}`} aria-label="technisches-datenblatt.de Startseite"><span>TD</span><b>technisches-datenblatt.de</b></Link>
      <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menü"><Icon name="menu" /></button>
      <nav className={open ? "open" : ""} aria-label="Hauptnavigation">
        <Link href={`/${locale}#leistung`} onClick={() => setOpen(false)}>{t.nav.service}</Link>
        <Link href={`/${locale}#beispiele`} onClick={() => setOpen(false)}>{locale === "de" ? "Muster" : "Samples"}</Link>
        <Link href={`/${locale}/status`} onClick={() => setOpen(false)}>{t.nav.status}</Link>
        <Link className="nav-login" href={`/${locale}/app`}>{t.nav.app}</Link>
        <Link className="locale-link" href={otherPath} hrefLang={other}>{other.toUpperCase()}</Link>
        <button className="icon-button theme-button" type="button" onClick={toggleTheme} aria-label={t.common.theme}><span className="theme-sun"><Icon name="sun" /></span><span className="theme-moon"><Icon name="moon" /></span></button>
        <Link className="button primary small" href={`/${locale}#auftrag`}>{t.nav.order}</Link>
      </nav>
    </header>
  );
}
