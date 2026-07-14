# -*- coding: utf-8 -*-
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
os.environ.setdefault("COC_TOOL", str(ROOT / "assets"))
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")

from render import render_coc  # noqa: E402
from render2 import render_datenblatt, render_fin  # noqa: E402


FIELDS = [
    "marke", "typ", "variante", "version", "handelsname", "klasse", "hersteller_adresse",
    "vin_ort", "vin", "ez", "f6", "K", "antrieb", "radstand", "laenge", "breite",
    "hoehe", "masse_fahrbereit", "masse_tatsaechlich", "zgg", "achse1", "achse2",
    "zugkomb", "ahk_gebremst", "ahk_ungebremst", "stuetzlast", "motorhersteller",
    "motorcode", "arbeitsverfahren", "zylinder", "hubraum", "kraftstoff", "leistung",
    "leistung_rpm", "drehmoment", "drehmoment_rpm", "vmax", "getriebe", "spur1", "spur2", "reifen_montiert",
    "aufbau", "farbe", "tueren", "sitze", "dachlast", "ger_stand", "ger_stand_rpm",
    "ger_fahrt", "abgasnorm", "abgasregelung", "em_co", "em_nox", "em_pm", "em_pn",
    "co2_wltp", "co2_nedc", "briefquelle", "briefnr", "kz_land", "kennzeichen", "hsn",
    "tsn", "f13", "f11", "f14", "f10", "f141", "f16", "f17",
]


def normalized(payload):
    result = {field: "—" for field in FIELDS}
    for field in FIELDS:
        value = payload.get(field)
        if value is not None and str(value).strip():
            result[field] = str(value).strip()
    tires = payload.get("reifen_liste")
    result["reifen_liste"] = [str(item).strip() for item in tires if str(item).strip()] if isinstance(tires, list) else ["—"]
    if result["reifen_montiert"] == "—" and result["reifen_liste"]:
        result["reifen_montiert"] = result["reifen_liste"][0]
    if result["aufbau"] == "—":
        result["aufbau"] = "— – —"
    return result


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: render_order.py OUTPUT_DIRECTORY")
    output = Path(sys.argv[1]).resolve()
    output.mkdir(parents=True, exist_ok=True)
    payload = normalized(json.load(sys.stdin))
    files = {
        "resultCocResearch": output / "coc-typgenehmigungsdaten-entwurf.pdf",
        "resultTechnicalData": output / "technisches-datenblatt-entwurf.pdf",
        "resultVinConfirmation": output / "fin-abgleich-entwurf.pdf",
    }
    render_coc(payload, str(files["resultCocResearch"]))
    render_datenblatt(payload, str(files["resultTechnicalData"]))
    render_fin(payload, str(files["resultVinConfirmation"]))
    print(json.dumps({kind: str(path) for kind, path in files.items()}))


if __name__ == "__main__":
    main()
