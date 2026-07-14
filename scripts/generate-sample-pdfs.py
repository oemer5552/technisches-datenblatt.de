from __future__ import annotations

import importlib
import os
import shutil
import sys
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "beispiele"
REFERENCE_ROOT = Path("C:/Users/aslan/OneDrive/Desktop/COC und Datenblatt")
ENGINE_DIR = REFERENCE_ROOT / "COC_Format_Vorlage" / "engine"
COC_TOOL_DIR = REFERENCE_ROOT / "coc_tool"

SAMPLE_DATA = {
    "marke": "PEUGEOT",
    "typ": "L",
    "variante": "C",
    "version": "YHZK-R20000",
    "handelsname": "308 SW 1.5 BlueHDi 130",
    "klasse": "M1",
    "hersteller_adresse": "AUTOMOBILES PEUGEOT, 2-10 BOULEVARD DE L'EUROPE, 78300 POISSY (FRANKREICH)",
    "vin_ort": "im Motorraum, rechts am Federbeindom",
    "vin": "VF3LCYHZKMS000001",
    "ez": "30.03.2021",
    "f6": "01.09.2020",
    "K": "e2*2007/46*0405*33",
    "antrieb": "Vorderradantrieb",
    "radstand": "2730",
    "laenge": "4585",
    "breite": "1804",
    "hoehe": "1460-1470",
    "masse_fahrbereit": "1395",
    "masse_tatsaechlich": "1468",
    "zgg": "1890",
    "achse1": "1100",
    "achse2": "980",
    "zugkomb": "3190",
    "ahk_gebremst": "1300",
    "ahk_ungebremst": "695",
    "stuetzlast": "70",
    "motorhersteller": "AUTOMOBILES PEUGEOT",
    "motorcode": "YH01",
    "arbeitsverfahren": "Diesel, Selbstzündung, Turbo, 4-Takt",
    "zylinder": "4, Reihe",
    "hubraum": "1499",
    "kraftstoff": "Diesel",
    "leistung": "96",
    "leistung_rpm": "3750",
    "drehmoment": "300",
    "drehmoment_rpm": "1750",
    "vmax": "203",
    "getriebe": "8-Gang Automatikgetriebe",
    "spur1": "1550",
    "spur2": "1545",
    "reifen_liste": ["205/55 R16 88H - 7Jx16 ET44 (montiert)", "225/45 R17 88H - 7,5Jx17 ET44"],
    "reifen_montiert": "205/55 R16 88H",
    "aufbau": "AF – Mehrzweckfahrzeug",
    "farbe": "SCHWARZ",
    "tueren": "4+1",
    "sitze": "5",
    "dachlast": "80",
    "ger_stand": "75",
    "ger_stand_rpm": "2813",
    "ger_fahrt": "66",
    "abgasnorm": "EURO 6 AP",
    "abgasregelung": "715/2007*2018/1832AP",
    "em_co": "0,0449",
    "em_nox": "0,0336",
    "em_pm": "0,00033",
    "em_pn": "0,04",
    "co2_wltp": "115",
    "co2_nedc": "—",
    "briefquelle": "fiktiven ausländischen Fahrzeugbrief",
    "briefnr": "MUSTER",
    "kz_land": "Frankreich",
    "kennzeichen": "AB-123-CD (Muster)",
    "hsn": "3003",
    "tsn": "AYV",
    "f11": "9",
    "f14": "EURO6;WLTP;AP;PI/CI; M, N1 I",
    "f10": "0002",
    "f141": "36AP",
    "f17": "—",
    "f16": "—",
    "f13": "70",
}


def load_authoritative_renderers():
    required = [ENGINE_DIR / "render.py", ENGINE_DIR / "render2.py", COC_TOOL_DIR / "DejaVuSans.ttf"]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError("Verbindliche COC-Vorlage fehlt: " + ", ".join(missing))

    os.environ["COC_TOOL"] = str(COC_TOOL_DIR)
    sys.path.insert(0, str(ENGINE_DIR))
    render = importlib.import_module("render")
    render2 = importlib.import_module("render2")
    return render, render2


def sample_overlay(width: float, height: float):
    stream = BytesIO()
    overlay = canvas.Canvas(stream, pagesize=(width, height))
    box_width = 84 * mm
    box_height = 5.4 * mm
    x = (width - box_width) / 2
    y = height - 7.2 * mm
    overlay.setFillColorRGB(1.0, 0.95, 0.95)
    overlay.setStrokeColorRGB(0.61, 0.08, 0.08)
    overlay.setLineWidth(0.45)
    overlay.roundRect(x, y, box_width, box_height, 1.2 * mm, fill=1, stroke=1)
    overlay.setFillColorRGB(0.61, 0.08, 0.08)
    overlay.setFont("DVB", 6.2)
    overlay.drawCentredString(width / 2, y + 1.75 * mm, "MUSTER - FIKTIVE DATEN - NICHT ZUR VORLAGE")
    overlay.save()
    stream.seek(0)
    return PdfReader(stream).pages[0]


def mark_as_sample(source: Path, target: Path, title: str) -> None:
    reader = PdfReader(source)
    writer = PdfWriter()
    for page in reader.pages:
        page.merge_page(sample_overlay(float(page.mediabox.width), float(page.mediabox.height)))
        writer.add_page(page)
    writer.add_metadata({
        "/Title": title,
        "/Author": "Autohaus Dörrschuck Handels GmbH",
        "/Subject": "Fiktives Anschauungsmuster ohne amtliche Gültigkeit",
        "/Keywords": "Muster, fiktive Daten, technisches Datenblatt, Typgenehmigungsdaten, FIN",
    })
    with target.open("wb") as output:
        writer.write(output)


def main() -> None:
    render, render2 = load_authoritative_renderers()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    documents = [
        ("coc-typgenehmigungsdatenblatt-muster.pdf", render.render_coc, "Erklärung Typgenehmigungsdaten - Muster"),
        ("technisches-datenblatt-muster.pdf", render2.render_datenblatt, "Bestätigung der Technischen Daten - Muster"),
        ("fin-bestaetigung-muster.pdf", render2.render_fin, "FIN-Bestätigung - Muster"),
    ]

    for filename, renderer, title in documents:
        raw = OUTPUT_DIR / f"raw-{filename}"
        target = OUTPUT_DIR / filename
        renderer(SAMPLE_DATA, str(raw))
        mark_as_sample(raw, target, title)
        raw.unlink()
        shutil.copy2(target, PUBLIC_DIR / filename)

    print("Muster-PDFs mit den verbindlichen Renderern aus COC_Format_Vorlage erzeugt.")


if __name__ == "__main__":
    main()
