from __future__ import annotations

import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "beispiele"

GREEN = colors.HexColor("#174B3D")
GREEN_DARK = colors.HexColor("#10251F")
GREEN_LIGHT = colors.HexColor("#E7F1EC")
ACID = colors.HexColor("#DCF59A")
INK = colors.HexColor("#101715")
MUTED = colors.HexColor("#64706C")
LINE = colors.HexColor("#CFD5D1")
PAPER = colors.HexColor("#FBFAF6")
RED = colors.HexColor("#A63232")


def register_fonts() -> tuple[str, str]:
    candidates = [
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf"), "ArialTD"),
        (Path("C:/Windows/Fonts/segoeui.ttf"), Path("C:/Windows/Fonts/segoeuib.ttf"), "SegoeTD"),
    ]
    for regular, bold, family in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont(family, str(regular)))
            pdfmetrics.registerFont(TTFont(f"{family}-Bold", str(bold)))
            return family, f"{family}-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()
BASE = getSampleStyleSheet()

STYLES = {
    "body": ParagraphStyle("body", parent=BASE["BodyText"], fontName=FONT, fontSize=8.2, leading=11.5, textColor=INK, spaceAfter=4),
    "small": ParagraphStyle("small", parent=BASE["BodyText"], fontName=FONT, fontSize=6.7, leading=9, textColor=MUTED),
    "label": ParagraphStyle("label", parent=BASE["BodyText"], fontName=FONT_BOLD, fontSize=6.3, leading=8, textColor=MUTED),
    "value": ParagraphStyle("value", parent=BASE["BodyText"], fontName=FONT, fontSize=7.6, leading=9.3, textColor=INK),
    "section": ParagraphStyle("section", parent=BASE["Heading2"], fontName=FONT_BOLD, fontSize=9, leading=11, textColor=GREEN_DARK, spaceBefore=7, spaceAfter=5),
    "notice": ParagraphStyle("notice", parent=BASE["BodyText"], fontName=FONT_BOLD, fontSize=7.4, leading=10.2, textColor=GREEN_DARK),
    "center": ParagraphStyle("center", parent=BASE["BodyText"], fontName=FONT_BOLD, fontSize=7.1, leading=9.2, textColor=RED, alignment=TA_CENTER),
    "signature": ParagraphStyle("signature", parent=BASE["BodyText"], fontName=FONT, fontSize=7, leading=9, textColor=INK, alignment=TA_LEFT),
}


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, STYLES[style])


def cell(label: str, value: str) -> list[Paragraph]:
    return [p(label.upper(), "label"), p(value, "value")]


def data_table(rows: list[tuple[str, str, str, str]], widths: tuple[float, float, float, float] | None = None) -> Table:
    if widths is None:
        widths = (35 * mm, 51 * mm, 35 * mm, 51 * mm)
    values = []
    for left_label, left_value, right_label, right_value in rows:
        values.append([p(left_label.upper(), "label"), p(left_value, "value"), p(right_label.upper(), "label"), p(right_value, "value")])
    table = Table(values, colWidths=widths, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("BACKGROUND", (0, 0), (0, -1), GREEN_LIGHT),
        ("BACKGROUND", (2, 0), (2, -1), GREEN_LIGHT),
    ]))
    return table


def full_table(rows: list[tuple[str, str]]) -> Table:
    values = [[p(label.upper(), "label"), p(value, "value")] for label, value in rows]
    table = Table(values, colWidths=(48 * mm, 124 * mm), hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), GREEN_LIGHT),
        ("BACKGROUND", (1, 0), (1, -1), PAPER),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def section(title: str, content) -> KeepTogether:
    return KeepTogether([p(title, "section"), content])


def on_page(title: str, subtitle: str, code: str):
    def draw(canvas, doc):
        width, height = A4
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, width, height, fill=1, stroke=0)

        canvas.setFillColor(GREEN_DARK)
        canvas.rect(0, height - 42 * mm, width, 42 * mm, fill=1, stroke=0)
        canvas.setFillColor(ACID)
        canvas.circle(20 * mm, height - 17 * mm, 8 * mm, fill=1, stroke=0)
        canvas.setFillColor(GREEN_DARK)
        canvas.setFont(FONT_BOLD, 9)
        canvas.drawCentredString(20 * mm, height - 19.3 * mm, "TD")
        canvas.setFillColor(colors.white)
        canvas.setFont(FONT_BOLD, 15)
        canvas.drawString(34 * mm, height - 15.2 * mm, title)
        canvas.setFillColor(colors.HexColor("#ADC0B8"))
        canvas.setFont(FONT, 7.5)
        canvas.drawString(34 * mm, height - 21.5 * mm, subtitle)
        canvas.setFillColor(ACID)
        canvas.setFont(FONT_BOLD, 6.7)
        canvas.drawRightString(width - 16 * mm, height - 15.5 * mm, "MUSTER - NICHT ZUR VORLAGE")
        canvas.setFillColor(colors.HexColor("#ADC0B8"))
        canvas.setFont(FONT, 6.4)
        canvas.drawRightString(width - 16 * mm, height - 21.5 * mm, code)

        canvas.saveState()
        try:
            canvas.setFillAlpha(0.055)
        except AttributeError:
            pass
        canvas.setFillColor(GREEN_DARK)
        canvas.setFont(FONT_BOLD, 40)
        canvas.translate(width / 2, height / 2)
        canvas.rotate(32)
        canvas.drawCentredString(0, 0, "MUSTER - FIKTIVE DATEN")
        canvas.restoreState()

        canvas.setStrokeColor(LINE)
        canvas.line(16 * mm, 15 * mm, width - 16 * mm, 15 * mm)
        canvas.setFillColor(MUTED)
        canvas.setFont(FONT, 6.2)
        canvas.drawString(16 * mm, 10 * mm, "technisches-datenblatt.de | Autohaus Dörrschuck Handels GmbH | Marienborner Straße 49 | 55128 Mainz")
        canvas.drawRightString(width - 16 * mm, 10 * mm, f"Seite {doc.page}")
        canvas.restoreState()
    return draw


def build(filename: str, title: str, subtitle: str, code: str, story: list, subject: str) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / filename
    doc = SimpleDocTemplate(
        str(target),
        pagesize=A4,
        rightMargin=19 * mm,
        leftMargin=19 * mm,
        topMargin=49 * mm,
        bottomMargin=20 * mm,
        title=title,
        author="Autohaus Dörrschuck Handels GmbH",
        subject=subject,
        keywords="Muster, technisches Datenblatt, COC, Typgenehmigung, FIN",
    )
    doc.build(story, onFirstPage=on_page(title, subtitle, code), onLaterPages=on_page(title, subtitle, code))
    shutil.copy2(target, PUBLIC_DIR / filename)


def build_type_approval() -> None:
    story = [
        Table([[p("FIKTIVES BEISPIELFAHRZEUG", "notice"), p("Dieses Dokument ist kein Hersteller-COC und keine amtliche Bescheinigung.", "center")]], colWidths=(55 * mm, 117 * mm), style=TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), ACID), ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#F8EAEA")),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 4 * mm),
        p("Die nachfolgenden Angaben zeigen beispielhaft, wie recherchierte Typgenehmigungsdaten strukturiert werden können. Sie ersetzen keine vom Hersteller ausgestellte Übereinstimmungsbescheinigung."),
        section("0. Fahrzeugidentifikation", data_table([
            ("0.1 Fabrikmarke", "Volkswagen", "0.2 Typ", "1K"),
            ("Variante / Version", "MUSTER / DATA20TDI", "0.2.1 Handelsbezeichnung", "Musterwagen 2.0 TDI"),
            ("0.4 Fahrzeugklasse", "M1", "0.10 FIN", "WVWZZZ1KZ9M000000"),
            ("EU-Typgenehmigung", "e1*2001/116*0000*00 (Muster)", "Erstzulassung", "15.03.2019"),
        ])),
        section("1. Allgemeine Baumerkmale und Abmessungen", data_table([
            ("Anzahl Achsen / Räder", "2 / 4", "Antriebsart", "Vorderradantrieb"),
            ("Radstand", "2.578 mm", "Länge", "4.204 mm"),
            ("Breite", "1.759 mm", "Höhe", "1.485 mm"),
        ])),
        section("2. Massen und Anhängelasten", data_table([
            ("Masse fahrbereit", "1.395 kg", "Techn. zul. Gesamtmasse", "1.960 kg"),
            ("Achslast vorn", "1.050 kg", "Achslast hinten", "960 kg"),
            ("Anhängelast gebremst", "1.500 kg", "Anhängelast ungebremst", "700 kg"),
        ])),
        section("3. Antrieb, Leistung und Umwelt", data_table([
            ("Kraftstoff", "Diesel", "Hubraum", "1.968 cm³"),
            ("Nennleistung", "110 kW bei 3.500 min-1", "Höchstgeschwindigkeit", "210 km/h"),
            ("Emissionsklasse", "EURO 6 (Muster)", "CO2 kombiniert", "129 g/km (Musterwert)"),
        ])),
        Spacer(1, 3 * mm),
        Table([[p("WICHTIG", "notice"), p("Ein echtes Certificate of Conformity (COC) wird ausschließlich durch den Fahrzeughersteller oder eine autorisierte Stelle ausgestellt. Dieses Muster zeigt nur die Gestaltung einer privaten Typdatenaufbereitung.", "small")]], colWidths=(28 * mm, 144 * mm), style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN_LIGHT), ("BOX", (0, 0), (-1, -1), 0.6, GREEN),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
    ]
    build("coc-typgenehmigungsdatenblatt-muster.pdf", "COC-/Typgenehmigungsdatenblatt", "Technische Datenaufbereitung | Kein Hersteller-COC", "TD-MUSTER-COC-01", story, "Fiktives Muster eines COC-/Typgenehmigungsdatenblatts")


def build_technical() -> None:
    story = [
        Table([[p("MUSTERDATENSATZ", "notice"), p("Alle Werte, Nummern und Personenangaben sind frei erfunden.", "center")]], colWidths=(55 * mm, 117 * mm), style=TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), ACID), ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#F8EAEA")),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 4 * mm),
        p("Beispielhafte Bestätigung technischer Fahrzeugdaten als Hilfestellung für die Übertragung in nationale Zulassungsfelder. Die zuständige Behörde oder Prüforganisation entscheidet über die Verwendbarkeit."),
        section("Fahrzeugzuordnung", full_table([
            ("Fahrzeug-Identifizierungsnummer (FIN)", "WVWZZZ1KZ9M000000"),
            ("Fahrzeug", "Volkswagen Musterwagen 2.0 TDI"),
            ("Typ / Variante / Version", "1K / MUSTER / DATA20TDI"),
            ("Grundlage der Daten", "Fiktive EU-Typgenehmigung und fiktive ausländische Zulassungsbescheinigung"),
        ])),
        section("Zulassungsrelevante technische Angaben", data_table([
            ("B Erstzulassung", "15.03.2019", "J Fahrzeugklasse", "M1"),
            ("D.1 Marke", "Volkswagen", "D.3 Handelsbez.", "Musterwagen 2.0 TDI"),
            ("E FIN", "WVWZZZ1KZ9M000000", "K Typgenehmigung", "e1*2001/116*0000*00"),
            ("P.1 Hubraum", "1.968 cm³", "P.2/P.4 Leistung", "110 kW / 3.500 min-1"),
            ("P.3 Kraftstoff", "Diesel", "T Höchstgeschw.", "210 km/h"),
            ("F.1/F.2 Gesamtmasse", "1.960 / 1.960 kg", "G Leermasse", "1.395 kg"),
            ("7.1 / 7.2 Achslasten", "1.050 / 960 kg", "O.1/O.2 Anhängelast", "1.500 / 700 kg"),
            ("S.1 Sitzplätze", "5", "R Farbe", "Blau"),
            ("15.1 Bereifung vorn", "205/55 R16 91V", "15.2 Bereifung hinten", "205/55 R16 91V"),
            ("V.7 CO2 kombiniert", "129 g/km (Muster)", "V.9 Emissionsklasse", "EURO 6 (Muster)"),
        ])),
        Spacer(1, 4 * mm),
        p("Die Angaben wurden ausschließlich für dieses Anschauungsmuster zusammengestellt. Es handelt sich weder um eine Betriebserlaubnis noch um ein Gutachten oder eine Garantie für die Zulassung.", "small"),
    ]
    build("technisches-datenblatt-muster.pdf", "Technisches Datenblatt", "Beispielhafte Fahrzeugdaten für Zulassungszwecke", "TD-MUSTER-DATA-01", story, "Fiktives Muster eines technischen Datenblatts")


def build_vin() -> None:
    story = [
        Table([[p("FIN-BESTÄTIGUNG - MUSTER", "notice"), p("Nicht unterschrieben und nicht zur Vorlage bestimmt.", "center")]], colWidths=(72 * mm, 100 * mm), style=TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), ACID), ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#F8EAEA")),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 6 * mm),
        p("Der Käufer / Auftraggeber erklärt, dass die nachstehend bezeichnete Fahrzeug-Identifizierungsnummer (FIN) selbst am Fahrzeug an der angegebenen Stelle abgelesen und mit den vorliegenden Fahrzeugpapieren abgeglichen wurde."),
        Spacer(1, 3 * mm),
        Table([[p("FAHRZEUG-IDENTIFIZIERUNGSNUMMER (FIN)", "label")], [Paragraph("WVWZZZ1KZ9M000000", ParagraphStyle("vin", fontName=FONT_BOLD, fontSize=20, leading=24, textColor=GREEN_DARK, alignment=TA_CENTER, letterSpacing=1.4))]], colWidths=(172 * mm,), style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), GREEN_LIGHT), ("BACKGROUND", (0, 1), (-1, 1), PAPER),
            ("BOX", (0, 0), (-1, -1), 0.8, GREEN), ("LINEBELOW", (0, 0), (-1, 0), 0.45, LINE),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ])),
        Spacer(1, 5 * mm),
        section("Fahrzeugangaben", full_table([
            ("Fabrikmarke", "Volkswagen"),
            ("Handelsbezeichnung", "Musterwagen 2.0 TDI"),
            ("Typ / Variante / Version", "1K / MUSTER / DATA20TDI"),
            ("Erstzulassung", "15.03.2019"),
            ("Anbringungsstelle der FIN", "Im Motorraum rechts, auf dem Längsträger (Musterangabe)"),
            ("Farbe des Fahrzeugs", "Blau"),
            ("Herkunftsland", "Italien (Musterangabe)"),
        ])),
        Spacer(1, 7 * mm),
        p("Die FIN-Prüfung und diese Erklärung erfolgen durch den Käufer / Auftraggeber. Dieses Muster bestätigt keine tatsächlich durchgeführte Identitätsprüfung und enthält keine echte Unterschrift.", "small"),
        Spacer(1, 13 * mm),
        Table([
            [p("________________________________________", "signature"), p("________________________________________", "signature")],
            [p("Ort, Datum", "small"), p("Unterschrift Käufer / Auftraggeber", "small")],
            [p("Musterstadt, __.__.____", "signature"), p("Max Mustermann (fiktiv)", "signature")],
        ], colWidths=(86 * mm, 86 * mm), style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ])),
    ]
    build("fin-bestaetigung-muster.pdf", "FIN-Bestätigung", "Erklärung zur Fahrzeug-Identifizierungsnummer", "TD-MUSTER-FIN-01", story, "Fiktives Muster einer FIN-Bestätigung")


if __name__ == "__main__":
    build_type_approval()
    build_technical()
    build_vin()
    print(f"Created 3 sample PDFs in {OUTPUT_DIR} and {PUBLIC_DIR}")
