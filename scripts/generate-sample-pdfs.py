from __future__ import annotations

import math
import shutil
import textwrap
from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "beispiele"
REFERENCE_ROOT = Path("C:/Users/aslan/OneDrive/Desktop/COC und Datenblatt")

BLACK = (0.0, 0.0, 0.0)
GREY = (0.47, 0.47, 0.47)
RED = (0.61, 0.08, 0.08)
PALE_RED = (1.0, 0.95, 0.95)
GREEN = (0.04, 0.30, 0.19)
GRID_GREEN = (0.16, 0.42, 0.30)
BOX_GREEN = (0.24, 0.50, 0.36)


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            Path("C:/Windows/Fonts/arial.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
            Path("C:/Windows/Fonts/ariali.ttf"),
            "ArialTD",
        ),
        (
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/segoeuib.ttf"),
            Path("C:/Windows/Fonts/segoeuii.ttf"),
            "SegoeTD",
        ),
        (
            REFERENCE_ROOT / "coc_tool" / "DejaVuSans.ttf",
            REFERENCE_ROOT / "coc_tool" / "DejaVuSans-Bold.ttf",
            REFERENCE_ROOT / "coc_tool" / "DejaVuSans-Oblique.ttf",
            "DejaVuTD",
        ),
    ]
    for regular, bold, italic, family in candidates:
        if regular.exists() and bold.exists() and italic.exists():
            pdfmetrics.registerFont(TTFont(family, str(regular)))
            pdfmetrics.registerFont(TTFont(f"{family}-Bold", str(bold)))
            pdfmetrics.registerFont(TTFont(f"{family}-Italic", str(italic)))
            return family, f"{family}-Bold", f"{family}-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT, FONT_BOLD, FONT_ITALIC = register_fonts()

LOGO_CANDIDATES = [
    ROOT / "scripts" / "assets" / "autohaus-doerrschuck-logo.png",
    REFERENCE_ROOT / "coc_tool" / "logo.png",
]

DATA = {
    "vin": "VF3LCYHZKMS000001",
    "make": "PEUGEOT",
    "model": "308 SW 1.5 BlueHDi 130",
    "type": "L",
    "variant": "C",
    "version": "YHZK-R20000",
    "approval": "e2*2007/46*0405*33",
    "vehicle_class": "M1",
    "manufacturer_address": "Automobiles Peugeot, 2-10 Boulevard de l'Europe, 78300 Poissy, Frankreich",
    "vin_location": "im Motorraum, rechts am Federbeindom",
    "first_registration": "30.03.2021",
    "country": "Frankreich",
    "plate": "AB-123-CD (Muster)",
    "body": "AF - Mehrzweckfahrzeug",
    "color": "SCHWARZ",
}


def draw_logo(c: canvas.Canvas, x: float, y: float, width: float) -> None:
    for logo in LOGO_CANDIDATES:
        if logo.exists():
            try:
                c.drawImage(str(logo), x, y, width=width, height=width * 122 / 900, mask="auto")
                return
            except Exception:
                continue
    c.setFont(FONT_BOLD, 9)
    c.drawRightString(x + width, y + 2 * mm, "AUTOHAUS DÖRRSCHUCK")


def draw_sample_mark(c: canvas.Canvas, width: float, height: float) -> None:
    box_width = 84 * mm
    box_height = 5.4 * mm
    x = (width - box_width) / 2
    y = height - 7.2 * mm
    c.saveState()
    c.setFillColorRGB(*PALE_RED)
    c.setStrokeColorRGB(*RED)
    c.setLineWidth(0.45)
    c.roundRect(x, y, box_width, box_height, 1.2 * mm, fill=1, stroke=1)
    c.setFillColorRGB(*RED)
    c.setFont(FONT_BOLD, 6.2)
    c.drawCentredString(width / 2, y + 1.75 * mm, "MUSTER - FIKTIVE DATEN - NICHT ZUR VORLAGE")
    c.restoreState()


def set_metadata(c: canvas.Canvas, title: str) -> None:
    c.setTitle(title)
    c.setAuthor("Autohaus Dörrschuck Handels GmbH")
    c.setSubject("Fiktives Anschauungsmuster ohne rechtliche oder amtliche Gültigkeit")
    c.setKeywords("Muster, fiktive Daten, technisches Datenblatt, Typgenehmigungsdaten, FIN")


def draw_company_header(c: canvas.Canvas, width: float, height: float, title: str, subtitle: str) -> None:
    draw_sample_mark(c, width, height)
    c.setFillColorRGB(*BLACK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(15 * mm, height - 13 * mm, "Autohaus Dörrschuck Handels GmbH")
    c.setFont(FONT, 7.5)
    c.drawString(15 * mm, height - 16.8 * mm, "Marienborner Str. 49 - 55128 Mainz")
    c.drawString(15 * mm, height - 20.2 * mm, "Tel. 06131 934070 - info@autohaus-doerrschuck.de")
    draw_logo(c, width - 67 * mm, height - 19 * mm, 52 * mm)
    c.setFont(FONT_BOLD, 14)
    c.drawCentredString(width / 2, height - 50 * mm, title)
    c.setFont(FONT_ITALIC, 8)
    c.drawCentredString(width / 2, height - 54.5 * mm, subtitle)


def draw_unsigned_block(c: canvas.Canvas, x: float, y: float, width: float) -> None:
    left_width = 79 * mm
    c.setStrokeColorRGB(*BLACK)
    c.setLineWidth(0.4)
    c.line(x, y, x + left_width, y)
    c.line(x + width / 2 + 6 * mm, y, x + width, y)
    c.setFillColorRGB(*BLACK)
    c.setFont(FONT, 6.5)
    c.drawString(x, y - 3.5 * mm, "(Ort)                         (Datum)")
    c.drawString(x + width / 2 + 6 * mm, y - 3.5 * mm, "Stempel und Unterschrift")
    c.setFillColorRGB(*RED)
    c.setFont(FONT_BOLD, 6.4)
    c.drawString(x, y + 1.7 * mm, "MAINZ, MUSTERDATUM")
    c.drawString(x + width / 2 + 6 * mm, y + 1.7 * mm, "MUSTER - NICHT UNTERSCHRIEBEN")
    c.setFillColorRGB(*BLACK)
    c.setFont(FONT, 6.5)
    c.drawString(x + width / 2 + 6 * mm, y - 6.5 * mm, "Autohaus Dörrschuck Handels GmbH")


def draw_blank_back(c: canvas.Canvas, width: float, height: float) -> None:
    draw_sample_mark(c, width, height)
    c.setFillColorRGB(0.55, 0.55, 0.55)
    c.setFont(FONT, 7)
    c.drawCentredString(width / 2, 15 * mm, "- Rückseite bewusst frei -")


def consumption(co2: str, diesel: bool = True) -> str:
    try:
        value = float(str(co2).replace(",", "."))
    except ValueError:
        return "-"
    return f"{value / (2640 if diesel else 2330) * 100:.2f}".replace(".", ",")


def build_type_approval() -> None:
    target = OUTPUT_DIR / "coc-typgenehmigungsdatenblatt-muster.pdf"
    width, height = landscape(A4)
    margin = 14 * mm
    gap = 8 * mm
    column_width = (width - 2 * margin - gap) / 2
    c = canvas.Canvas(str(target), pagesize=(width, height), pageCompression=1)
    set_metadata(c, "Erklärung Typgenehmigungsdaten - Muster")

    class Column:
        def __init__(self, x: float, y: float):
            self.x = x
            self.y = y

        def section(self, title: str, before: float = 4.6) -> None:
            self.y -= before * mm
            c.setFont(FONT_BOLD, 9.5)
            c.drawString(self.x, self.y, title)
            self.y -= 1.5 * mm
            c.setLineWidth(0.5)
            c.line(self.x, self.y, self.x + column_width, self.y)
            self.y -= 4.6 * mm

        def row(self, label: str, value: str = "", label_width: float = 70, line_height: float = 4.5, bold: bool = True) -> None:
            c.setFont(FONT, 8)
            c.drawString(self.x, self.y, label)
            if value:
                c.setFont(FONT_BOLD if bold else FONT, 8.5)
                c.drawString(self.x + label_width * mm, self.y, str(value))
            self.y -= line_height * mm

        def text(self, text: str, font: str = FONT, size: float = 8, line_height: float = 4, indent: float = 0) -> None:
            c.setFont(font, size)
            c.drawString(self.x + indent * mm, self.y, text)
            self.y -= line_height * mm

        def space(self, amount: float = 2) -> None:
            self.y -= amount * mm

    def footer(page: int) -> None:
        c.setStrokeColorRGB(*BLACK)
        c.setLineWidth(0.4)
        c.line(margin, 9 * mm, width - margin, 9 * mm)
        if page == 2:
            c.setFont(FONT_ITALIC, 5.2)
            c.drawString(
                margin,
                5.6 * mm,
                "Vermerke: Fiktive Musterdaten in der Struktur der EG-Typgenehmigungsdaten. Kein Hersteller-COC und keine amtliche Bescheinigung.",
            )
        c.setFont(FONT, 7)
        c.drawRightString(width - margin, 5.6 * mm, f"Seite {page} von 2")

    # Seite 1
    draw_sample_mark(c, width, height)
    y0 = height - 13 * mm
    draw_logo(c, width - margin - 66 * mm, height - 16 * mm, 66 * mm)
    c.setFont(FONT_BOLD, 13)
    c.drawString(margin, y0, "Erklärung Typgenehmigungsdaten")
    c.setFont(FONT, 9)
    c.drawString(margin, y0 - 5.3 * mm, "Certificat de conformité Européen - Declaration of type-approval data")
    c.setFont(FONT_ITALIC, 8.5)
    c.drawString(margin, y0 - 9.6 * mm, "für vollständige Fahrzeuge")
    c.setLineWidth(0.8)
    c.line(margin, y0 - 13 * mm, width - margin, y0 - 13 * mm)
    intro_y = y0 - 18 * mm
    c.setFont(FONT, 8)
    c.drawString(
        margin,
        intro_y,
        "Der Unterzeichner der Autohaus Dörrschuck Handels GmbH - technische Dokumentation - bestätigt, dass das unten bezeichnete Fahrzeug",
    )
    left = Column(margin, intro_y - 7 * mm)
    right = Column(margin + column_width + gap, intro_y - 7 * mm)
    c.setStrokeColorRGB(*GREY)
    c.setLineWidth(0.3)
    c.line(margin + column_width + gap / 2, 14 * mm, margin + column_width + gap / 2, intro_y - 2 * mm)
    c.setStrokeColorRGB(*BLACK)

    left.row("0.1   Fabrikmarke (Hersteller):", DATA["make"], 60)
    left.row("0.2   Typ:", DATA["type"], 60)
    left.row("        Variante:", DATA["variant"], 60)
    left.row("        Version:", DATA["version"], 60)
    left.row("0.2.1 Handelsbezeichnung:", DATA["model"], 60)
    left.row("0.4   Fahrzeugklasse:", DATA["vehicle_class"], 60)
    left.text("0.5   Name und Anschrift des Herstellers:")
    left.text(DATA["manufacturer_address"], FONT_BOLD, 7.6, 4.2, 8)
    left.text("0.6   Anbringungsstelle der FIN:")
    left.text(DATA["vin_location"], FONT, 8, 4.6, 8)
    left.space(0.6)
    left.row("0.10 Fahrzeug-Identifizierungsnr.:", DATA["vin"], 62, 5.6)
    left.row("B      Erstzulassung:", DATA["first_registration"], 62)
    left.space(0.6)
    left.row("mit dem in der am", DATA["approval"], 32)
    for line in [
        "erteilten Genehmigung beschriebenen Typ in jeder Hinsicht übereinstimmt",
        "und zur fortwährenden Teilnahme am Straßenverkehr in Mitgliedsländern",
        "mit Rechtsverkehr zugelassen werden kann.",
    ]:
        left.text(line)
    left.space(7)
    c.setFont(FONT, 8.5)
    c.setFillColorRGB(*BLACK)
    c.drawString(left.x, left.y, "Mainz, den MUSTERDATUM")
    left.y -= 5 * mm
    c.setLineWidth(0.4)
    c.line(left.x, left.y, left.x + 95 * mm, left.y)
    left.y -= 3.5 * mm
    c.setFillColorRGB(*RED)
    left.text("MUSTER - keine Unterschrift und kein Stempel", FONT_BOLD, 7, 4)
    c.setFillColorRGB(*BLACK)
    left.text("Autohaus Dörrschuck Handels GmbH", FONT, 7, 4)

    right.section("Allgemeine Baumerkmale", 0)
    right.row("1.    Anzahl der Achsen:  2     und Räder:  4", "", 40)
    right.row("       Antriebsart:", "Vorderradantrieb", 40)
    right.section("Hauptabmessungen")
    right.row("4.    Radstand:", "2730 mm", 40)
    right.row("5.    Länge:", "4585 mm", 40)
    right.row("6.    Breite:", "1804 mm", 40)
    right.row("7.    Höhe:", "1460-1470 mm", 40)
    right.section("Massen")
    right.row("13.   Masse des fahrbereiten Fahrzeugs:", "1395 kg", 74)
    right.row("13.1 Tatsächliche Masse des Fahrzeugs:", "1468 kg", 74)
    right.row("13.2 Techn. zul. Gesamtmasse:", "1890 kg", 74)
    right.row("16.1 Zul. Achslast Achse 1:", "1100 kg", 74)
    right.row("16.2 Zul. Achslast Achse 2:", "980 kg", 74)
    right.row("16.4 Zul. Gesamtmasse Fahrzeugkomb.:", "3190 kg", 74)
    right.row("18.1 Anhängelast gebremst:", "1300 kg", 74)
    right.row("18.4 Anhängelast ungebremst:", "695 kg", 74)
    right.row("19.   Zul. Stützlast am Kupplungspunkt:", "70 kg", 74)
    footer(1)
    c.showPage()

    # Seite 2
    draw_sample_mark(c, width, height)
    draw_logo(c, width - margin - 46 * mm, height - 15 * mm, 46 * mm)
    c.setFont(FONT_BOLD, 9)
    c.drawString(margin, height - 12 * mm, f"Fortsetzung: EU-Genehmigungsnummer: {DATA['approval']}   -   FIN: {DATA['vin']}")
    c.setLineWidth(0.8)
    c.line(margin, height - 14 * mm, width - margin, height - 14 * mm)
    top = height - 19 * mm
    left = Column(margin, top)
    right = Column(margin + column_width + gap, top)
    c.setStrokeColorRGB(*GREY)
    c.setLineWidth(0.3)
    c.line(margin + column_width + gap / 2, 16 * mm, margin + column_width + gap / 2, top)
    c.setStrokeColorRGB(*BLACK)

    left.section("Antriebsmaschine", 0)
    left.row("20.   Hersteller der Antriebsmaschine:", "Automobiles Peugeot (PSA)", 66)
    left.row("21.   Baumusterbezeichnung Motor:", "YH01", 66)
    left.row("22.   Arbeitsverfahren:", "Diesel, Selbstzündung, Turbo, 4-Takt", 66)
    left.row("24.   Zahl und Anordnung der Zylinder:", "4, Reihe", 66)
    left.row("25.   Hubraum:", "1499 cm³", 66)
    left.row("26.   Kraftstoff:", "Diesel", 66)
    left.row("27.1 Höchste Nutzleistung:", "96 kW bei 3750 min-1", 66)
    left.row("        Max. Drehmoment:", "300 Nm bei 1750 min-1", 66)
    left.row("29.   Höchstgeschwindigkeit:", "203 km/h", 66)
    left.row("        Getriebe:", "Automatik 8-Gang (EAT8)", 66)
    left.section("Achsen und Räder")
    left.row("30.   Spurweite Achse 1 / 2:", "1550 / 1545 mm", 50)
    left.text("35.   Reifen-/Radkombinationen:")
    for tire in ["205/55 R16 88H", "225/45 R17 88H", "225/40 R18 88H"]:
        left.text(tire, FONT_BOLD, 8.2, 4.2, 66)
    left.section("Aufbau")
    left.row("38.   Code des Aufbaus:", DATA["body"], 66)
    left.row("40.   Farbe des Fahrzeugs:", DATA["color"], 66)
    left.row("41.   Anzahl der Türen:", "4+1", 66)
    left.row("42.   Sitzplätze (inkl. Fahrer):", "5", 66)
    left.row("        Zul. Dachlast:", "80 kg", 66)

    right.section("Umweltverträglichkeit", 0)
    right.row("46.   Standgeräusch:", "75,00 dB(A) bei 2813 min-1", 42)
    right.row("        Fahrgeräusch:", "66,00 dB(A)", 42)
    right.row("47.   Abgasnorm:", "EURO 6 AP", 42)
    right.row("        ", "(715/2007*2018/1832AP)", 42, bold=False)
    right.text("48.   Abgasemissionen (Typ 1, WLTP):", FONT_BOLD, 8, 4.8)
    right.row("        CO:", "0,0449 g/km", 42)
    right.row("        NOx:", "0,0336 g/km", 42)
    right.row("        Partikelmasse:", "0,00033 g/km", 42)
    right.row("        Partikelanzahl:", "0,04 · 10¹¹ /km", 42)
    right.space(1)
    right.text("49.   CO2 / Kraftstoffverbrauch:", FONT_BOLD, 8, 4.8)
    right.row("49.4 CO2 WLTP kombiniert:", "115 g/km", 56)
    right.row("        Verbrauch WLTP komb.:", f"{consumption('115')} l/100km", 56)
    right.row("49.1 CO2 NEFZ kombiniert:", "- g/km", 56)
    footer(2)
    c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def build_technical() -> None:
    target = OUTPUT_DIR / "technisches-datenblatt-muster.pdf"
    width, height = A4
    margin = 15 * mm
    c = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    set_metadata(c, "Bestätigung der Technischen Daten - Muster")
    draw_company_header(
        c,
        width,
        height,
        "Bestätigung der Technischen Daten",
        "(als Hilfestellung zum Ausfüllen der Zulassungsbescheinigung Teil I durch die Zulassungsstelle)",
    )
    c.setFont(FONT, 8)
    c.drawString(margin, height - 61 * mm, f"Amtliches Kennzeichen (entwertet):  {DATA['country']}, {DATA['plate']}")
    c.drawString(margin, height - 64.6 * mm, f"Fahrzeug:  {DATA['make']} {DATA['model']}        FIN: {DATA['vin']}")

    # Rastergeometrie aus den vorhandenen Produktionsmustern (300-DPI-Vorlage).
    x_left, x_code_left, x_mid, x_code_right, x_right = 787, 822, 1626, 1656, 2392
    y_top, y_bottom, row_count = 48, 1193, 23
    pitch = (y_bottom - y_top) / row_count
    y_rows = [y_top + i * pitch for i in range(row_count + 1)]
    remarks_row = 16
    left_strip = {0: "B", 1: "J", 2: "E", 3: "D.1", 4: "D.2", 8: "D.3", 9: "2", 10: "5", 12: "V.9", 13: "14", 14: "P.3", 15: "10", 16: "22"}
    right_strip = {0: "L", 1: "18", 2: "20", 3: "12", 4: "V.7", 5: "7.1", 6: "8.1", 7: "U.1", 8: "O.1", 9: "15.1", 10: "15.2", 11: "15.3", 12: "R", 13: "K", 14: "6", 15: "21"}
    left_inline = {0: [("2.1", 1105), ("2.2", 1305)], 1: [("4", 1155)], 2: [("3", 1405)], 15: [("14.1", 1027), ("P.1", 1297)]}
    right_inline = {
        0: [("9", 1765), ("P.2/P.4", 1905), ("T", 2166)], 1: [("19", 2045)], 2: [("G", 2045)],
        3: [("13", 1866), ("Q", 2166)], 4: [("F.1", 1866), ("F.2", 2166)], 5: [("7.2", 1866), ("7.3", 2166)],
        6: [("8.2", 1866), ("8.3", 2166)], 7: [("U.2", 1866), ("U.3", 2166)],
        8: [("O.2", 1866), ("S.1", 2166), ("S.2", 2300)], 12: [("11", 2120)], 14: [("17", 2046), ("16", 2120)],
    }
    merged_strip = {5, 6, 7, 11, 17, 18, 19, 20, 21, 22}
    box_min_width = 30
    box_height_share = 0.52
    pixel_width = x_right - x_left
    scale = (width - 2 * margin) / pixel_width
    grid_top = height - 68 * mm

    def x(px: float) -> float:
        return margin + (px - x_left) * scale

    def y(px: float) -> float:
        return grid_top - (px - y_top) * scale

    def box_width(text: str) -> float:
        return max(box_min_width, 7 * len(text) + 8)

    def horizontal(ypx: float, xa: float, xb: float, line_width: float = 0.5, color=GRID_GREEN) -> None:
        c.setStrokeColorRGB(*color)
        c.setLineWidth(line_width)
        c.line(x(xa), y(ypx), x(xb), y(ypx))

    def vertical(xpx: float, ya: float, yb: float, line_width: float = 0.5, color=GRID_GREEN) -> None:
        c.setStrokeColorRGB(*color)
        c.setLineWidth(line_width)
        c.line(x(xpx), y(ya), x(xpx), y(yb))

    values = {
        "B": DATA["first_registration"], "2.1": "3003", "2.2": "AYV", "L": "2", "9": "1", "P.2/P.4": "96/3750", "T": "203",
        "J": DATA["vehicle_class"], "4": "AF", "18": "4585", "19": "1804", "E": DATA["vin"], "3": "-", "20": "1460-1470", "G": "1395",
        "D.1": DATA["make"], "12": "-", "13": "70", "Q": "-", "D.2": f"Typ {DATA['type']}", "V.7": "115", "F.1": "1890", "F.2": "1890",
        "7.1": "1100", "7.2": "980", "7.3": "-", "8.1": "1100", "8.2": "980", "8.3": "-", "U.1": "75,00", "U.2": "2813", "U.3": "66,00",
        "D.3": "308 SW", "O.1": "1300", "O.2": "695", "S.1": "5", "S.2": "-", "2": "PEUGEOT (F)",
        "15.1": "205/55 R16 88H", "15.2": "205/55 R16 88H", "15.3": "-", "5": "Fz.z.Pers.bef.b. 8 Spl.",
        "V.9": "715/2007*2018/1832AP", "R": DATA["color"], "11": "9", "14": "EURO6;WLTP;AP;PI/CI; M, N1 I",
        "K": DATA["approval"], "P.3": "Diesel", "6": DATA["first_registration"], "17": "-", "16": "-", "10": "0002", "14.1": "36AP", "P.1": "1499", "21": "-",
    }
    continuation = {5: f"Var. {DATA['variant']}", 6: f"Vers. {DATA['version']}", 11: "Mehrzweckfahrzeug"}

    def fit_text(text: str, xa: float, xb: float, baseline: float, size: float = 8, minimum: float = 4.4) -> None:
        text = str(text)
        available = xb - xa
        current = size
        if available <= 2:
            return
        while current > minimum and c.stringWidth(text, FONT, current) > available:
            current -= 0.3
        if c.stringWidth(text, FONT, current) > available:
            while text and c.stringWidth(text + "...", FONT, current) > available:
                text = text[:-1]
            text += "..."
        c.setFillColorRGB(*BLACK)
        c.setFont(FONT, current)
        c.drawString(xa, baseline, text)

    # Feiner Guilloche-Unterdruck wie im vorhandenen Datenblattraster.
    c.saveState()
    path = c.beginPath()
    path.rect(x(x_left), y(y_bottom), x(x_right) - x(x_left), y(y_top) - y(y_bottom))
    c.clipPath(path, stroke=0, fill=0)
    for frequency_a, frequency_b, phase, amplitude, spacing, color in [
        (0.075, 0.030, 0.0, 3.0, 3.2, (0.62, 0.80, 0.69)),
        (0.052, 0.041, 1.7, 2.4, 3.2, (0.70, 0.84, 0.74)),
    ]:
        c.setStrokeColorRGB(*color)
        c.setLineWidth(0.25)
        baseline = y(y_bottom) - 8
        while baseline < y(y_top) + 8:
            wave = c.beginPath()
            px = x(x_left)
            first = True
            while px <= x(x_right):
                py = baseline + amplitude * math.sin(frequency_a * (px - x(x_left)) + phase) + 0.6 * amplitude * math.sin(frequency_b * (px - x(x_left)) + 2 * phase)
                (wave.moveTo if first else wave.lineTo)(px, py)
                first = False
                px += 2.2
            c.drawPath(wave, stroke=1, fill=0)
            baseline += spacing
    c.restoreState()

    horizontal(y_top, x_left, x_right, 0.9, GREEN)
    horizontal(y_bottom, x_left, x_right, 0.9, GREEN)
    for index in range(1, row_count):
        horizontal(y_rows[index], x_code_left if index in merged_strip else x_left, x_right)
    vertical(x_left, y_top, y_bottom, 0.9, GREEN)
    vertical(x_right, y_top, y_bottom, 0.9, GREEN)
    vertical(x_code_left, y_top, y_bottom)
    vertical(x_mid, y_top, y_rows[remarks_row])
    vertical(x_code_right, y_top, y_rows[remarks_row])
    for row, items in left_inline.items():
        for _, position in items:
            vertical(position, y_rows[row], y_rows[row + 1])
    for row, items in right_inline.items():
        for _, position in items:
            vertical(position, y_rows[row], y_rows[row + 1])

    def draw_strip(mapping: dict[int, str], center: float, end: int = row_count) -> None:
        items = sorted(mapping.items())
        for index, (row, text) in enumerate(items):
            next_row = items[index + 1][0] if index + 1 < len(items) else end
            midpoint = y_rows[row] + (y_rows[next_row] - y_rows[row]) / 2 - pitch / 2
            c.setFillColorRGB(*GREEN)
            c.setFont(FONT, 5 if len(text) <= 3 else 4)
            c.drawCentredString(center, y(midpoint) - pitch * scale * 0.42, text)

    draw_strip(left_strip, (x(x_left) + x(x_code_left)) / 2)
    draw_strip({key: value for key, value in right_strip.items() if key < remarks_row}, (x(x_mid) + x(x_code_right)) / 2, remarks_row)

    def code_box(text: str, position: float, row: int) -> None:
        top = y_rows[row]
        bw = box_width(text) * scale
        bh = pitch * box_height_share * scale
        bx = x(position)
        c.setStrokeColorRGB(*BOX_GREEN)
        c.setLineWidth(0.4)
        c.rect(bx, y(top) - bh, bw, bh, stroke=1, fill=0)
        c.setFillColorRGB(*GREEN)
        c.setFont(FONT, 5 if len(text) <= 3 else 4)
        c.drawCentredString(bx + bw / 2, y(top) - pitch * scale * 0.42, text)

    for row, items in left_inline.items():
        for text, position in items:
            code_box(text, position, row)
    for row, items in right_inline.items():
        for text, position in items:
            code_box(text, position, row)

    def value_y(row: int) -> float:
        return y(y_rows[row]) - pitch * scale * 0.78

    for row in range(remarks_row):
        inline = left_inline.get(row, [])
        base_code = left_strip.get(row)
        base_value = values.get(base_code) if base_code else continuation.get(row)
        next_x = inline[0][1] if inline else x_mid
        if base_value:
            fit_text(base_value, x(x_code_left) + 2, x(next_x) - 2, value_y(row))
        for index, (code, position) in enumerate(inline):
            next_x = inline[index + 1][1] if index + 1 < len(inline) else x_mid
            if values.get(code):
                fit_text(values[code], x(position) + box_width(code) * scale + 1.5, x(next_x) - 2, value_y(row))

    for row in range(remarks_row):
        inline = right_inline.get(row, [])
        base_code = right_strip.get(row)
        base_value = values.get(base_code) if base_code else None
        next_x = inline[0][1] if inline else x_right
        if base_value:
            fit_text(base_value, x(x_code_right) + 2, x(next_x) - 2, value_y(row))
        for index, (code, position) in enumerate(inline):
            next_x = inline[index + 1][1] if index + 1 < len(inline) else x_right
            if values.get(code):
                fit_text(values[code], x(position) + box_width(code) * scale + 1.5, x(next_x) - 2, value_y(row))

    grid_bottom = y(y_bottom)
    note = (
        f"Fiktive Musterdaten in der Struktur der EG-Typgenehmigung {DATA['approval']} und eines ausländischen Fahrzeugbriefs "
        f"(Brief-Nr. MUSTER, FIN {DATA['vin']}). Dieses Anschauungsmuster ist keine amtliche Bescheinigung und nicht zur Vorlage bestimmt."
    )
    c.setFillColorRGB(*BLACK)
    c.setFont(FONT, 7.4)
    text_y = grid_bottom - 7 * mm
    for line in textwrap.wrap(note, 120):
        c.drawString(margin, text_y, line)
        text_y -= 4.3 * mm

    draw_unsigned_block(c, margin, max(text_y - 12 * mm, 40 * mm), width - 2 * margin)
    c.setStrokeColorRGB(*BLACK)
    c.setLineWidth(0.4)
    c.line(margin, 15 * mm, width - margin, 15 * mm)
    c.setFont(FONT, 7)
    c.drawRightString(width - margin, 11.5 * mm, "Seite 1 von 1")
    c.showPage()
    draw_blank_back(c, width, height)
    c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def build_vin() -> None:
    target = OUTPUT_DIR / "fin-bestaetigung-muster.pdf"
    width, height = A4
    margin = 18 * mm
    c = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    set_metadata(c, "Bestätigung der Fahrzeug-Identifizierungsnummer - Muster")
    draw_company_header(
        c,
        width,
        height,
        "Bestätigung der Fahrzeug-Identifizierungsnummer (FIN)",
        "Confirmation of the Vehicle Identification Number",
    )
    text_y = height - 66 * mm
    c.setFont(FONT, 9)
    intro = (
        "Hiermit wird bestätigt, dass die nachstehend bezeichnete Fahrzeug-Identifizierungsnummer (FIN) am Fahrzeug "
        "an der angegebenen Stelle angebracht ist und mit den vorliegenden Fahrzeugpapieren übereinstimmt."
    )
    for line in textwrap.wrap(intro, 96):
        c.drawString(margin, text_y, line)
        text_y -= 5 * mm
    text_y -= 4 * mm
    rows = [
        ("Fahrzeug-Identifizierungsnummer (FIN)", DATA["vin"]),
        ("Amtliches Kennzeichen (entwertet)", f"{DATA['country']}, {DATA['plate']}"),
        ("Fabrikmarke", DATA["make"]),
        ("Handelsbezeichnung", DATA["model"]),
        ("Typ / Variante / Version", f"{DATA['type']} / {DATA['variant']} / {DATA['version']}"),
        ("EG-Typgenehmigungsnummer", DATA["approval"]),
        ("Fahrzeugklasse", DATA["vehicle_class"]),
        ("Erstzulassung", DATA["first_registration"]),
        ("Anbringungsstelle der FIN", DATA["vin_location"]),
        ("Farbe des Fahrzeugs", DATA["color"]),
    ]
    box_height = len(rows) * 7.6 * mm + 4 * mm
    c.setLineWidth(0.4)
    c.rect(margin, text_y - box_height, width - 2 * margin, box_height, stroke=1, fill=0)
    row_y = text_y - 7 * mm
    for label, value in rows:
        c.setFont(FONT, 8.5)
        c.drawString(margin + 4 * mm, row_y, label + ":")
        c.setFont(FONT_BOLD, 10 if label.startswith("Fahrzeug-Ident") else 9)
        c.drawString(margin + 80 * mm, row_y, str(value))
        row_y -= 7.6 * mm
    text_y = text_y - box_height - 10 * mm
    c.setFont(FONT_ITALIC, 8)
    c.drawString(margin, text_y, "Die FIN wurde am Fahrzeug geprüft (Sicht- und Abgleichprüfung gegen die Fahrzeugpapiere).")
    draw_unsigned_block(c, margin, 42 * mm, width - 2 * margin)
    c.setStrokeColorRGB(*BLACK)
    c.setLineWidth(0.4)
    c.line(margin, 18 * mm, width - margin, 18 * mm)
    c.setFont(FONT, 7)
    c.drawRightString(width - margin, 14 * mm, "Seite 1 von 1")
    c.showPage()
    draw_blank_back(c, width, height)
    c.showPage()
    c.save()
    shutil.copy2(target, PUBLIC_DIR / target.name)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    build_type_approval()
    build_technical()
    build_vin()
    print(f"Created reference-based sample PDFs in {OUTPUT_DIR} and {PUBLIC_DIR}")


if __name__ == "__main__":
    main()
