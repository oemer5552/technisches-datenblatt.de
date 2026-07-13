import Link from "next/link";

export default function NotFound() {
  return <main className="center-page"><div className="center-card"><span className="kicker">404</span><h1>Diese Seite gibt es nicht.</h1><p>Der Link ist möglicherweise veraltet oder unvollständig.</p><Link className="button primary" href="/de">Zur Startseite</Link></div></main>;
}

