from __future__ import annotations

import math
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "beispiele"

PAPER = colors.HexColor("#FCFCF8")
INK = colors.HexColor("#17201D")
MUTED = colors.HexColor("#5D6965")
GREEN = colors.HexColor("#164D3E")
GREEN_2 = colors.HexColor("#2F7560")
PALE_GREEN = colors.HexColor("#EAF3EE")
PALE_GREEN_2 = colors.HexColor("#F4F8F5")
ACID = colors.HexColor("#DDF59B")
LINE = colors.HexColor("#AEBAB5")
RED = colors.HexColor("#A62929")
PALE_RED = colors.HexColor("#F7EAEA")


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            Path("C:/Windows/Fonts/arial.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
            Path("C:/Windows/Fonts/cour.ttf"),
            "ArialTD",
        ),
        (
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/segoeuib.ttf"),
            Path("C:/Windows/Fonts/consola.ttf"),
            "SegoeTD",
        ),
    ]
    for regular, bold, mono, family in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont(family, str(regular)))
            pdfmetrics.registerFont(TTFont(f"{family}-Bold", str(bold)))
            mono_name = "Courier"
            if mono.exists():
                mono_name = f"{family}-Mono"
                pdfmetrics.registerFont(TTFont(mono_name, str(mono)))
            return family, f"{family}-Bold", mono_name
    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, FONT_BOLD, FONT_MONO = register_fonts()

DATA = {
    "vin": "WVWZZZAUZKW000001",
    "make": "VOLKSWAGEN, D",
    "model": "Golf 2.0 TDI",
    "type": "AU",
    "variant": "ACDFGX0",
    "version": "FM6FM62Q024",
    "approval": "e1*2007/46*9999*00 (fiktiv)",
    "manufacturer": "Volkswagen AG, Berliner Ring 2, 38440 Wolfsburg, Deutschland",
    "built": "12.02.2019",
    "first_registration": "15.03.2019",
}


def wrap_lines(text: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    for paragraph in str(text).split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        line = words[0]
        for word in words[1:]:
            candidate = f"{line} {word}"
            if pdfmetrics.stringWidth(candidate, font, size) <= max_width:
                line = candidate
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    top: float,
    max_width: float,
    font: str = FONT,
    size: float = 7.3,
    leading: float | None = None,
    color=INK,
    max_lines: int | None = None,
) -> float:
    leading = leading or size * 1.25
    lines = wrap_lines(text, font, size, max_width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines and pdfmetrics.stringWidth(lines[-1] + "...", font, size) > max_width:
            lines[-1] = lines[-1][:-1]
        if lines:
            lines[-1] += "..."
    c.setFont(font, size)
    c.setFillColor(color)
    y = top
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def security_background(c: canvas.Canvas, page_size: tuple[float, float]) -> None:
    width, height = page_size
    c.setFillColor(PAPER)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.saveState()
    c.setStrokeColor(colors.HexColor("#DBE7E1"))
    c.setLineWidth(0.23)
    for offset in range(-60, int(height / mm) + 80, 14):
        path = c.beginPath()
        for px in range(-20, int(width / mm) + 20, 3):
            py = offset + 2.1 * math.sin(px / 8.0)
            if px == -20:
                path.moveTo(px * mm, py * mm)
            else:
                path.lineTo(px * mm, py * mm)
        c.drawPath(path)
    c.restoreState()


def watermark(c: canvas.Canvas, page_size: tuple[float, float]) -> None:
    width, height = page_size
    c.saveState()
    try:
        c.setFillAlpha(0.105)
    except AttributeError:
        pass
    c.setFillColor(RED)
    c.translate(width / 2, height / 2)
    c.rotate(31)
    c.setFont(FONT_BOLD, 26 if width > height else 22)
    c.drawCentredString(0, 7 * mm, "MUSTER - FIKTIVE DATEN")
    c.setFont(FONT_BOLD, 15)
    c.drawCentredString(0, -2 * mm, "NICHT ZUR VORLAGE")
    c.restoreState()


def document_header(
    c: canvas.Canvas,
    page_size: tuple[float, float],
    title: str,
    subtitle: str,
    code: str,
    page: int,
    pages: int,
) -> None:
    width, height = page_size
    security_background(c, page_size)
    band_h = 29 * mm
    c.setFillColor(GREEN)
    c.rect(0, height - band_h, width, band_h, fill=1, stroke=0)
    c.setFillColor(ACID)
    c.roundRect(12 * mm, height - 21 * mm, 12 * mm, 12 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.setFont(FONT_BOLD, 7.5)
    c.drawCentredString(18 * mm, height - 16.7 * mm, "TD")
    c.setFillColor(colors.white)
    title_size = 10.8 if width < height and len(title) > 38 else (14 if width < height else 15)
    c.setFont(FONT_BOLD, title_size)
    c.drawString(29 * mm, height - 12.5 * mm, title)
    c.setFillColor(colors.HexColor("#BDD0C8"))
    c.setFont(FONT, 7.2)
    c.drawString(29 * mm, height - 18.7 * mm, subtitle)
    c.setFillColor(ACID)
    c.setFont(FONT_BOLD, 6.8)
    c.drawRightString(width - 12 * mm, height - 12.2 * mm, "MUSTER - NICHT ZUR VORLAGE")
    c.setFillColor(colors.HexColor("#BDD0C8"))
    c.setFont(FONT, 6.2)
    c.drawRightString(width - 12 * mm, height - 18.7 * mm, f"{code}  |  Seite {page} von {pages}")


def document_footer(c: canvas.Canvas, page_size: tuple[float, float], reference: str) -> None:
    width, _ = page_size
    c.setStrokeColor(LINE)
    c.setLineWidth(0.35)
    c.line(12 * mm, 15 * mm, width - 12 * mm, 15 * mm)
    c.setFillColor(MUTED)
    c.setFont(FONT, 5.8)
    c.drawString(12 * mm, 10.7 * mm, "technisches-datenblatt.de | Autohaus Dörrschuck Handels GmbH | 55128 Mainz")
    c.drawRightString(width - 12 * mm, 10.7 * mm, reference)
    watermark(c, page_size)


def set_metadata(c: canvas.Canvas, title: str, subject: str) -> None:
    c.setTitle(title)
    c.setAuthor("Autohaus Dörrschuck Handels GmbH")
    c.setSubject(subject)
    c.setKeywords("Muster, fiktive Daten, technisches Datenblatt, COC, Typgenehmigung, FIN")


def notice_bar(c: canvas.Canvas, x: float, y: float, width: float, text: str) -> None:
    c.setFillColor(PALE_RED)
    c.setStrokeColor(colors.HexColor("#D7A3A3"))
    c.roundRect(x, y, width, 10 * mm, 1.5 * mm, fill=1, stroke=1)
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 6.6)
    c.drawString(x + 3 * mm, y + 6.1 * mm, "FIKTIVES ANSCHAUUNGSMUSTER")
    c.setFont(FONT, 6.2)
    c.drawRightString(x + width - 3 * mm, y + 6.1 * mm, text)


def field_box(
    c: canvas.Canvas,
    x: float,
    y_top: float,
    width: float,
    height: float,
    code: str,
    label: str,
    value: str,
    accent: bool = False,
    value_size: float = 7.4,
) -> None:
    bottom = y_top - height
    c.setFillColor(PALE_GREEN if accent else colors.white)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.35)
    c.rect(x, bottom, width, height, fill=1, stroke=1)
    c.setFillColor(GREEN if accent else MUTED)
    c.setFont(FONT_BOLD, 5.4)
    c.drawString(x + 2 * mm, y_top - 3.3 * mm, code)
    label_x = x + 12 * mm if code else x + 2 * mm
    draw_wrapped(c, label, label_x, y_top - 3.3 * mm, width - (label_x - x) - 2 * mm, FONT, 5.4, 6.5, MUTED, 1)
    draw_wrapped(c, value, x + 2 * mm, y_top - 7.0 * mm, width - 4 * mm, FONT_BOLD if accent else FONT, value_size, value_size * 1.18, INK, 2)


def draw_section_label(c: canvas.Canvas, x: float, y: float, width: float, title: str) -> None:
    c.setFillColor(GREEN)
    c.rect(x, y - 5.5 * mm, width, 5.5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 6.4)
    c.drawString(x + 2 * mm, y - 3.8 * mm, title.upper())


def build_type_approval() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / "coc-typgenehmigungsdatenblatt-muster.pdf"
    page_size = landscape(A4)
    c = canvas.Canvas(str(target), pagesize=page_size, pageCompression=1)
    set_metadata(c, "Erklärung der Typgenehmigungsdaten - Muster", "Realitätsnah strukturiertes, fiktives Muster ohne amtliche Gültigkeit")

    page_fields = [
        (
            "A. Fahrzeugidentifikation und Genehmigung",
            [
                ("0.1", "Fabrikmarke (Firmenname des Herstellers)", DATA["make"]),
                ("0.2", "Typ", DATA["type"]),
                ("0.2", "Variante", DATA["variant"]),
                ("0.2", "Version", DATA["version"]),
                ("0.2.1", "Handelsbezeichnung", DATA["model"]),
                ("0.4", "Fahrzeugklasse", "M1 - Personenkraftwagen"),
                ("0.5", "Name und Anschrift des Herstellers", DATA["manufacturer"]),
                ("0.6", "Anbringungsstelle der Fahrzeug-Identifizierungsnummer", "Motorraum rechts, auf dem Längsträger"),
                ("0.10", "Fahrzeug-Identifizierungsnummer", DATA["vin"]),
                ("K", "Nummer der EU-Typgenehmigung", DATA["approval"]),
                ("B", "Datum der ersten Zulassung", DATA["first_registration"]),
                ("0.11", "Datum der Herstellung", DATA["built"]),
            ],
            "B. Allgemeine Bauart, Abmessungen und Massen",
            [
                ("1", "Anzahl der Achsen / Räder", "2 / 4"),
                ("3", "Angetriebene Achsen", "Achse 1 (Vorderachse)"),
                ("4", "Radstand", "2.620 mm"),
                ("5", "Spurweite Achse 1 / Achse 2", "1.549 mm / 1.520 mm"),
                ("6", "Länge", "4.258 mm"),
                ("7", "Breite", "1.799 mm"),
                ("8", "Höhe", "1.492 mm"),
                ("13", "Masse des Fahrzeugs in fahrbereitem Zustand", "1.395 kg"),
                ("13.2", "Tatsächliche Masse", "1.452 kg"),
                ("16.1", "Technisch zulässige Gesamtmasse", "1.940 kg"),
                ("16.2", "Technisch zulässige Achslast vorn / hinten", "1.050 kg / 940 kg"),
                ("18", "Technisch zulässige Gesamtmasse der Fahrzeugkombination", "3.440 kg"),
            ],
        ),
        (
            "C. Antriebsmaschine und Kraftübertragung",
            [
                ("20", "Hersteller des Motors", "Volkswagen AG"),
                ("21", "Motorkennbuchstabe / Motortyp", "DFA - fiktive Zuordnung"),
                ("22", "Arbeitsverfahren", "Selbstzündung, Viertakt"),
                ("23", "Anzahl und Anordnung der Zylinder", "4, in Reihe"),
                ("24", "Hubraum", "1.968 cm3"),
                ("25", "Kraftstoff", "Diesel"),
                ("27", "Höchste Nutzleistung", "110 kW bei 3.500 min-1"),
                ("27.1", "Höchstes Nettodrehmoment", "340 Nm bei 1.750-3.000 min-1"),
                ("28", "Getriebe", "6-Gang-Doppelkupplungsgetriebe"),
                ("29", "Höchstgeschwindigkeit", "216 km/h"),
                ("30", "Bereifung Achse 1", "205/55 R16 91V - 6,5Jx16 ET46"),
                ("30", "Bereifung Achse 2", "205/55 R16 91V - 6,5Jx16 ET46"),
            ],
            "D. Aufbau, Umwelt und weitere Angaben",
            [
                ("38", "Aufbauart / Fahrzeugart", "Schräghecklimousine / Personenkraftwagen"),
                ("40", "Farbe", "Blau"),
                ("42", "Anzahl und Anordnung der Türen", "5 / seitlich und hinten"),
                ("42.1", "Anzahl der Sitzplätze einschließlich Fahrersitz", "5"),
                ("44", "Standgeräusch / Motordrehzahl", "72 dB(A) / 2.500 min-1"),
                ("45", "Fahrgeräusch", "68 dB(A)"),
                ("46.1", "CO2-Emissionen kombiniert (WLTP)", "129 g/km - fiktiver Musterwert"),
                ("46.2", "Kraftstoffverbrauch kombiniert (WLTP)", "4,9 l/100 km - fiktiver Musterwert"),
                ("47", "Abgasemissionsstufe", "EURO 6d-TEMP"),
                ("O.1", "Technisch zulässige Anhängelast gebremst", "1.500 kg"),
                ("O.2", "Technisch zulässige Anhängelast ungebremst", "700 kg"),
                ("19", "Technisch zulässige Stützlast", "80 kg"),
            ],
        ),
    ]

    for page_no, (left_title, left_fields, right_title, right_fields) in enumerate(page_fields, start=1):
        document_header(
            c,
            page_size,
            "Erklärung der Typgenehmigungsdaten",
            "Struktur nach EU-Feldsystematik | Kein Hersteller-COC und keine amtliche Bescheinigung",
            "TD-MUSTER-TYP-01",
            page_no,
            2,
        )
        width, height = page_size
        margin = 12 * mm
        notice_bar(c, margin, height - 43 * mm, width - 2 * margin, "Alle Nummern und Werte sind fiktiv. Kein Ersatz für ein Original-COC.")
        gap = 5 * mm
        col_w = (width - 2 * margin - gap) / 2
        top = height - 49 * mm
        section_h = 5.5 * mm
        row_h = 9.35 * mm
        draw_section_label(c, margin, top, col_w, left_title)
        draw_section_label(c, margin + col_w + gap, top, col_w, right_title)
        y_left = top - section_h
        y_right = top - section_h
        for index, (code, label, value) in enumerate(left_fields):
            field_box(c, margin, y_left, col_w, row_h, code, label, value, accent=index in {8, 9})
            y_left -= row_h
        for index, (code, label, value) in enumerate(right_fields):
            field_box(c, margin + col_w + gap, y_right, col_w, row_h, code, label, value, accent=False)
            y_right -= row_h
        c.setFillColor(MUTED)
        c.setFont(FONT, 5.7)
        c.drawString(margin, 18.3 * mm, "Datenbasis: fiktiver Musterdatensatz. Feldbezeichnungen orientieren sich an der EU-Systematik für Übereinstimmungsbescheinigungen.")
        c.drawRightString(width - margin, 18.3 * mm, "Prüfvermerk: MUSTER - keine Prüfung, keine Unterschrift, kein Siegel")
        document_footer(c, page_size, f"TD-MUSTER-TYP-01/{page_no}")
        c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def grid_row(
    c: canvas.Canvas,
    x: float,
    y_top: float,
    width: float,
    height: float,
    cells: list[tuple[str, str, str, float, bool]],
) -> None:
    cursor = x
    for code, label, value, share, accent in cells:
        cell_w = width * share
        field_box(c, cursor, y_top, cell_w, height, code, label, value, accent=accent, value_size=7.0)
        cursor += cell_w


def build_technical() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / "technisches-datenblatt-muster.pdf"
    page_size = A4
    c = canvas.Canvas(str(target), pagesize=page_size, pageCompression=1)
    set_metadata(c, "Bestätigung der technischen Daten - Muster", "Realitätsnahes, fiktives technisches Datenblatt ohne amtliche Gültigkeit")
    document_header(
        c,
        page_size,
        "Bestätigung der Technischen Daten",
        "Feldhilfe zur Zulassungsbescheinigung Teil I | Privates Datenblatt",
        "TD-MUSTER-DATA-01",
        1,
        1,
    )
    width, height = page_size
    margin = 13 * mm
    usable = width - 2 * margin
    notice_bar(c, margin, height - 43 * mm, usable, "Dauerhaft als Muster gekennzeichnet - nicht zur Vorlage bei Behörden.")
    y = height - 49 * mm

    draw_section_label(c, margin, y, usable, "Fahrzeugidentifikation")
    y -= 5.5 * mm
    rows = [
        ([
            ("E", "Fahrzeug-Identifizierungsnummer", DATA["vin"], 0.64, True),
            ("B", "Erstzulassung", DATA["first_registration"], 0.36, False),
        ], 10.5),
        ([
            ("D.1", "Marke", "VOLKSWAGEN", 0.32, False),
            ("D.2", "Typ / Variante / Version", f"{DATA['type']} / {DATA['variant']} / {DATA['version']}", 0.68, False),
        ], 10.5),
        ([
            ("D.3", "Handelsbezeichnung", DATA["model"], 0.48, False),
            ("K", "Nummer der Typgenehmigung", DATA["approval"], 0.52, True),
        ], 10.5),
        ([
            ("2.1", "Hersteller-Kurzbezeichnung", "0603 (Muster)", 0.34, False),
            ("2.2", "Typ-Schlüssel", "BLA 00001 (Muster)", 0.33, False),
            ("J", "Fahrzeugklasse", "M1", 0.33, False),
        ], 9.5),
    ]
    for cells, height_mm in rows:
        grid_row(c, margin, y, usable, height_mm * mm, cells)
        y -= height_mm * mm

    y -= 2 * mm
    draw_section_label(c, margin, y, usable, "Massen, Abmessungen und Anhängelasten")
    y -= 5.5 * mm
    rows_2 = [
        [("F.1", "Techn. zul. Gesamtmasse", "1.940 kg", .25, False), ("F.2", "Zul. Gesamtmasse", "1.940 kg", .25, False), ("G", "Masse in Betrieb", "1.395 kg", .25, False), ("13", "Stützlast", "80 kg", .25, False)],
        [("7.1", "Techn. Achslast 1", "1.050 kg", .25, False), ("7.2", "Techn. Achslast 2", "940 kg", .25, False), ("8.1", "Zul. Achslast 1", "1.050 kg", .25, False), ("8.2", "Zul. Achslast 2", "940 kg", .25, False)],
        [("O.1", "Anhängelast gebremst", "1.500 kg", .28, False), ("O.2", "Anhängelast ungebremst", "700 kg", .28, False), ("18", "Länge", "4.258 mm", .22, False), ("19", "Breite", "1.799 mm", .22, False)],
        [("20", "Höhe", "1.492 mm", .25, False), ("9", "Antriebsachsen", "Achse 1", .25, False), ("12", "Rauminhalt Tank", "50 l", .25, False), ("21", "Bemerkung", "keine", .25, False)],
    ]
    for cells in rows_2:
        grid_row(c, margin, y, usable, 9.5 * mm, cells)
        y -= 9.5 * mm

    y -= 2 * mm
    draw_section_label(c, margin, y, usable, "Motor, Umwelt, Aufbau und Bereifung")
    y -= 5.5 * mm
    rows_3 = [
        [("P.1", "Hubraum", "1.968 cm3", .25, False), ("P.2", "Nennleistung", "110 kW", .25, False), ("P.4", "Nenndrehzahl", "3.500 min-1", .25, False), ("P.3", "Kraftstoff", "Diesel", .25, False)],
        [("T", "Höchstgeschwindigkeit", "216 km/h", .34, False), ("R", "Farbe", "Blau", .22, False), ("S.1", "Sitzplätze", "5", .22, False), ("L", "Achsen", "2", .22, False)],
        [("U.1/U.2", "Standgeräusch / Drehzahl", "72 dB(A) / 2.500 min-1", .38, False), ("U.3", "Fahrgeräusch", "68 dB(A)", .24, False), ("V.9", "Emissionsklasse", "EURO 6d-TEMP", .38, False)],
        [("V.7", "CO2 kombiniert (WLTP)", "129 g/km - fiktiv", .34, False), ("14", "Bezeichnung Emissionsklasse", "EURO 6d-TEMP", .33, False), ("14.1", "Emissionsschlüssel", "36BG (Muster)", .33, False)],
        [("15.1", "Bereifung Achse 1", "205/55 R16 91V", .50, False), ("15.2", "Bereifung Achse 2", "205/55 R16 91V", .50, False)],
    ]
    for cells in rows_3:
        grid_row(c, margin, y, usable, 9.5 * mm, cells)
        y -= 9.5 * mm

    y -= 2.5 * mm
    c.setFillColor(PALE_GREEN)
    c.setStrokeColor(GREEN_2)
    c.roundRect(margin, y - 17 * mm, usable, 17 * mm, 1.5 * mm, fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.setFont(FONT_BOLD, 6.2)
    c.drawString(margin + 3 * mm, y - 4.2 * mm, "DATENGRUNDLAGE UND VERWENDUNGSHINWEIS")
    draw_wrapped(
        c,
        "Fiktiver Musterdatensatz auf Grundlage einer beispielhaften EU-Typgenehmigungsrecherche. Dieses Anschauungsmuster ist keine Betriebserlaubnis, kein Gutachten, keine Zulassungsbescheinigung und keine Bestätigung einer Prüforganisation. Verbindlich entscheidet die zuständige Stelle im Einzelfall.",
        margin + 3 * mm,
        y - 8 * mm,
        usable - 6 * mm,
        FONT,
        6.1,
        7.5,
        INK,
        3,
    )
    document_footer(c, page_size, "TD-MUSTER-DATA-01/1")
    c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def checkbox(c: canvas.Canvas, x: float, y: float, text: str, checked: bool = True) -> None:
    size = 4 * mm
    c.setFillColor(colors.white)
    c.setStrokeColor(GREEN)
    c.rect(x, y - size + 1 * mm, size, size, fill=1, stroke=1)
    if checked:
        c.setFillColor(GREEN)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(x + size / 2, y - 1.7 * mm, "X")
    draw_wrapped(c, text, x + 6 * mm, y, 160 * mm, FONT, 7.0, 9.0, INK, 2)


def build_vin() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / "fin-bestaetigung-muster.pdf"
    page_size = A4
    c = canvas.Canvas(str(target), pagesize=page_size, pageCompression=1)
    set_metadata(c, "FIN-Bestätigung - Muster", "Realitätsnahes, fiktives Muster einer Erklärung zur Fahrzeug-Identifizierungsnummer")
    document_header(
        c,
        page_size,
        "Bestätigung der Fahrzeug-Identifizierungsnummer",
        "Erklärung des Auftraggebers zum Abgleich am Fahrzeug",
        "TD-MUSTER-FIN-01",
        1,
        1,
    )
    width, height = page_size
    margin = 15 * mm
    usable = width - 2 * margin
    notice_bar(c, margin, height - 43 * mm, usable, "Nicht unterschrieben - keine tatsächlich durchgeführte Identitätsprüfung.")
    y = height - 51 * mm
    draw_wrapped(
        c,
        "Der Auftraggeber erklärt, die nachfolgend wiedergegebene Fahrzeug-Identifizierungsnummer (FIN) selbst unmittelbar am bezeichneten Fahrzeug abgelesen und mit den vorgelegten Fahrzeugunterlagen abgeglichen zu haben.",
        margin,
        y,
        usable,
        FONT,
        8.0,
        10.5,
        INK,
        3,
    )
    y -= 18 * mm

    c.setFillColor(PALE_GREEN)
    c.setStrokeColor(GREEN)
    c.setLineWidth(0.8)
    c.roundRect(margin, y - 24 * mm, usable, 24 * mm, 2 * mm, fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.setFont(FONT_BOLD, 6.6)
    c.drawCentredString(width / 2, y - 6.2 * mm, "FAHRZEUG-IDENTIFIZIERUNGSNUMMER (FIN)")
    c.saveState()
    text = c.beginText()
    text.setTextOrigin(margin + 18 * mm, y - 16 * mm)
    text.setFont(FONT_MONO, 17)
    text.setCharSpace(1.5)
    text.setFillColor(INK)
    text.textLine(DATA["vin"])
    c.drawText(text)
    c.restoreState()
    y -= 30 * mm

    draw_section_label(c, margin, y, usable, "Fahrzeugzuordnung")
    y -= 5.5 * mm
    vehicle_rows = [
        [("D.1", "Fabrikmarke", "VOLKSWAGEN", .5, False), ("D.3", "Handelsbezeichnung", DATA["model"], .5, False)],
        [("D.2", "Typ / Variante / Version", f"{DATA['type']} / {DATA['variant']} / {DATA['version']}", .64, False), ("B", "Erstzulassung", DATA["first_registration"], .36, False)],
        [("", "FIN-Anbringungsstelle", "Motorraum rechts, dauerhaft auf dem Längsträger eingeschlagen", .64, True), ("", "Herkunftsland", "Italien (fiktiv)", .36, False)],
    ]
    for cells in vehicle_rows:
        grid_row(c, margin, y, usable, 11 * mm, cells)
        y -= 11 * mm

    y -= 6 * mm
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8.2)
    c.drawString(margin, y, "Erklärung und dokumentierter Abgleich")
    y -= 9 * mm
    checkbox(c, margin, y, "Die FIN am Fahrzeug stimmt Zeichen für Zeichen mit der oben wiedergegebenen 17-stelligen FIN überein.")
    y -= 13 * mm
    checkbox(c, margin, y, "Die FIN stimmt mit den vorgelegten ausländischen Fahrzeugpapieren beziehungsweise dem Eigentumsnachweis überein.")
    y -= 13 * mm
    checkbox(c, margin, y, "An der abgelesenen FIN waren bei der Sichtprüfung keine erkennbaren Manipulationsspuren festzustellen.")
    y -= 15 * mm

    c.setFillColor(PALE_GREEN_2)
    c.setStrokeColor(LINE)
    c.roundRect(margin, y - 20 * mm, usable, 20 * mm, 1.5 * mm, fill=1, stroke=1)
    c.setFillColor(MUTED)
    c.setFont(FONT_BOLD, 6.1)
    c.drawString(margin + 3 * mm, y - 5 * mm, "DOKUMENTATIONSVERWEISE (MUSTER)")
    draw_wrapped(c, "Foto 1: FIN am Fahrzeug | Foto 2: Gesamtansicht Fahrzeug | Anlage: Kopie ausländisches Fahrzeugdokument", margin + 3 * mm, y - 10 * mm, usable - 6 * mm, FONT, 6.6, 8.2, INK, 2)
    y -= 29 * mm

    c.setStrokeColor(INK)
    c.setLineWidth(0.5)
    c.line(margin, y, margin + 76 * mm, y)
    c.line(width - margin - 76 * mm, y, width - margin, y)
    c.setFillColor(MUTED)
    c.setFont(FONT, 6.2)
    c.drawString(margin, y - 4 * mm, "Ort, Datum: MUSTER - nicht ausgefüllt")
    c.drawString(width - margin - 76 * mm, y - 4 * mm, "Unterschrift Auftraggeber: MUSTER - keine Unterschrift")
    y -= 14 * mm
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 6.6)
    c.drawCentredString(width / 2, y, "Dieses Dokument bestätigt keine reale Prüfung und ist nicht zur Vorlage bestimmt.")
    document_footer(c, page_size, "TD-MUSTER-FIN-01/1")
    c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    build_type_approval()
    build_technical()
    build_vin()
    print(f"Created realistic sample PDFs in {OUTPUT_DIR} and {PUBLIC_DIR}")


if __name__ == "__main__":
    main()
