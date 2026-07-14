# technisches-datenblatt.de

Produktionsreifes Next.js-16-Portal der Autohaus Dörrschuck Handels GmbH für technische Fahrzeugdaten und einen koordinierten Zulassungsablauf zwischen Deutschland und dem EU-Ausland.

## Funktionsumfang

- deutsche und englische Marketing-, Wissens- und SEO-Seiten unter `/de/*` und `/en/*`
- auswählbares 199-Euro-Zulassungspaket aus HU/AU durch TÜV Hessen, technischem Datenblatt und persönlicher Koordination
- europaweite Datenblatt-Akzeptanzgarantie mit vollständiger Erstattung des gezahlten Paketpreises bei nachgewiesener Nichtakzeptanz
- separates digitales Datenpaket sowie öffentliche, fiktive Muster für COC-/Typgenehmigungsdatenblatt, technisches Datenblatt und FIN-Bestätigung
- helles und dunkles Farbschema, responsive und barrierearm aufgebaut
- Auftragsanlage mit serverseitiger Validierung von FIN, Pflichtfeldern und Einwilligungsnachweisen
- Magic-Byte-Prüfung und private Ablage von PDF/JPG/PNG in einem Railway Bucket
- geschützter Auftragsstatus mit gehashtem, zufälligem Zugriffscode
- optionaler Stripe Checkout mit signaturgeprüftem Webhook; manueller Zahlungsmodus als Fallback
- serverseitig geschütztes Backoffice unter `/de/app` mit Statuspflege, Auditprotokoll und Ergebnis-Uploads
- PostgreSQL/Drizzle-Migrationen, Healthcheck, Sicherheitsheader, Sitemap und strukturierte Daten
- Impressum, Datenschutz, AGB und Widerrufsbelehrung für den konkreten Dienst

## Lokale Entwicklung

Voraussetzungen: Node.js 22+, pnpm und PostgreSQL.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

Prüfungen:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Wichtige Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | PostgreSQL-Verbindung |
| `PUBLIC_BASE_URL` | kanonische öffentliche Basis-URL |
| `AUTH_SECRET` | mindestens 32 Zeichen für die Admin-JWT-Signatur |
| `ADMIN_PASSWORD_HASH` | `salt:hash`, jeweils hexadezimal; Hash via scrypt |
| `AWS_ENDPOINT_URL` / `S3_ENDPOINT` | S3-kompatibler Railway-Bucket-Endpunkt |
| `AWS_S3_BUCKET_NAME` / `S3_BUCKET` | privater Bucketname |
| `AWS_ACCESS_KEY_ID` / `S3_ACCESS_KEY_ID` | Bucket-Zugriffsschlüssel |
| `AWS_SECRET_ACCESS_KEY` / `S3_SECRET_ACCESS_KEY` | Bucket-Geheimnis |
| `PAYMENT_MODE` | `manual` oder `stripe` |
| `STRIPE_SECRET_KEY` | optionaler Stripe-Schlüssel |
| `STRIPE_WEBHOOK_SECRET` | optionales Webhook-Geheimnis |

## Daten- und Sicherheitsmodell

Kundendokumente sind nie öffentliche Assets. Die Anwendung lädt sie serverseitig in den privaten Bucket und gibt sie nur nach Admin-Session oder korrektem Auftragszugriffscode über kurzlebige signierte URLs frei. Der vollständige Kundencode und das Admin-Passwort werden nicht gespeichert. Uploads werden anhand ihres Inhalts geprüft, Dateinamen bereinigt und alle Statusänderungen protokolliert.

Das Backoffice wird sowohl auf Seiten- als auch API-Ebene abgesichert. Cookies sind `HttpOnly`, `SameSite=Strict` und in Produktion `Secure`. Loginversuche werden begrenzt. Mutierende Endpunkte prüfen zusätzlich den Origin.

## Railway

`railway.toml` baut die Standalone-Anwendung, führt vor dem Start Drizzle-Migrationen aus und prüft `/api/health`. Empfohlen ist die EU-West-Region Amsterdam für Web, PostgreSQL und Bucket. Die Railway-Domain kann später ohne Codeänderung durch `technisches-datenblatt.de` ersetzt werden; anschließend muss `PUBLIC_BASE_URL` angepasst werden.

> Rechtlicher Hinweis: Die mitgelieferten Rechtstexte sind auf den derzeit umgesetzten Datenfluss zugeschnitten. Vor Aufnahme des Live-Geschäftsbetriebs sollten Preis, Zahlungsart, Löschfristen und Texte anwaltlich geprüft und bei Prozessänderungen aktualisiert werden.
