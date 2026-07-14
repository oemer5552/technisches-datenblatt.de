# -*- coding: utf-8 -*-
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

TOOL = os.environ.get("COC_TOOL") or os.path.join(os.path.dirname(__file__), "assets")
pdfmetrics.registerFont(TTFont("DV",  os.path.join(TOOL,"DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DVB", os.path.join(TOOL,"DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("DVI", os.path.join(TOOL,"DejaVuSans-Oblique.ttf")))
LOGO = os.path.join(TOOL,"logo.png")
SIGN_NAME="Technische Freigabe ausstehend"; SIGN_ROLE=""; SIGN_ORG="Autohaus Dörrschuck Handels GmbH"

def verbrauch(co2, diesel):
    try: f=float(str(co2).replace(",","."))
    except: return "—"
    return f"{f/(2640 if diesel else 2330)*100:.2f}".replace(".",",")

def _logo(c,x,y,w):
    if os.path.isfile(LOGO):
        try: c.drawImage(LOGO,x,y,width=w,height=w*122/900,mask="auto")
        except Exception: pass

def _draft_banner(c, W, H):
    c.saveState()
    c.setFillColorRGB(0.70, 0.05, 0.08)
    c.rect(0, H-6*mm, W, 6*mm, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DVB", 7.5)
    c.drawCentredString(W/2, H-4.2*mm, "KI-ENTWURF - TECHNISCHE PRÜFUNG UND FREIGABE AUSSTEHEND")
    c.restoreState()

# ============================================================ COC (Querformat, 2 Seiten)
def render_coc(d, out):
    W,H = landscape(A4); M=14*mm; GAP=8*mm; COLW=(W-2*M-GAP)/2
    c=canvas.Canvas(out, pagesize=landscape(A4))
    _draft_banner(c, W, H)
    diesel = d["kraftstoff"]=="Diesel"
    verb = verbrauch(d["co2_wltp"], diesel)

    class Col:
        def __init__(s,x,y): s.x=x; s.y=y
        def sec(s,t,pre=4.6):
            s.y-=pre*mm; c.setFont("DVB",9.5); c.drawString(s.x,s.y,t)
            s.y-=1.5*mm; c.setLineWidth(0.5); c.line(s.x,s.y,s.x+COLW,s.y); s.y-=4.6*mm
        def row(s,lab,val="",labw=70,lh=4.5,bold=True):
            c.setFont("DV",8); c.drawString(s.x,s.y,lab)
            if val!="":
                c.setFont("DVB" if bold else "DV",8.5); c.drawString(s.x+labw*mm,s.y,str(val))
            s.y-=lh*mm
        def txt(s,t,font="DV",size=8,lh=4.0,ind=0):
            c.setFont(font,size); c.drawString(s.x+ind*mm,s.y,t); s.y-=lh*mm
        def gap(s,g=2.0): s.y-=g*mm
        def roww(s,lab,val,labw=62,lh=4.5,font="DVB",size=8.5):
            c.setFont("DV",8); c.drawString(s.x,s.y,lab); vx=s.x+labw*mm
            if c.stringWidth(lab,"DV",8) > labw*mm-2*mm: s.y-=lh*mm   # Label zu lang -> Wert in Folgezeile
            maxw=COLW-labw*mm; line=""
            for w in str(val).split(' '):
                t=(line+" "+w).strip()
                if line and c.stringWidth(t,font,size)>maxw:
                    c.setFont(font,size); c.drawString(vx,s.y,line); s.y-=lh*mm; line=w
                else: line=t
            c.setFont(font,size); c.drawString(vx,s.y,line); s.y-=lh*mm

    def footer(p):
        c.setLineWidth(0.4); c.line(M,9*mm,W-M,9*mm)
        if p==2:
            c.setFont("DVI",5.2)
            verm=("Vermerke: Automatisch aus dem vorliegenden "+d["briefquelle"]+
                  " ausgelesener Entwurf (Brief-Nr. "+d["briefnr"]+", FIN "+d["vin"]+"). Technische Freigabe ausstehend.")
            c.drawString(M,5.6*mm,verm)
        c.setFont("DV",7); c.drawRightString(W-M,5.6*mm,f"Seite {p} von 2")

    # ---------- Seite 1 ----------
    y0=H-13*mm; _logo(c,W-M-66*mm,H-16*mm,66*mm)
    c.setFont("DVB",13); c.drawString(M,y0,"Entwurf Typgenehmigungsdaten")
    c.setFont("DV",9); c.drawString(M,y0-5.3*mm,"Certificat de conformité Européen · Declaration of type-approval data")
    c.setFont("DVI",8.5); c.drawString(M,y0-9.6*mm,"für vollständige Fahrzeuge")
    c.setLineWidth(0.8); c.line(M,y0-13*mm,W-M,y0-13*mm)
    yt=y0-18*mm; c.setFont("DV",8)
    c.drawString(M,yt,"Automatisch aus den eingereichten Unterlagen ausgelesener Datenentwurf; technische Prüfung und Freigabe stehen aus.")
    L=Col(M,yt-7*mm); R=Col(M+COLW+GAP,yt-7*mm)
    c.setStrokeColorRGB(.47,.47,.47); c.setLineWidth(0.3)
    c.line(M+COLW+GAP/2,14*mm,M+COLW+GAP/2,yt-2*mm); c.setStrokeColorRGB(0,0,0)

    L.row("0.1   Fabrikmarke (Hersteller):", d["marke"], 62)
    L.row("0.2   Typ:", d["typ"], 62)
    L.row("        Variante:", d["variante"], 62)
    L.row("        Version:", d["version"], 62)
    L.row("0.2.1 Handelsbezeichnung:", d["handelsname"], 62)
    L.row("0.4   Fahrzeugklasse:", d["klasse"], 62)
    L.roww("0.5   Name u. Anschrift des Herstellers:", d["hersteller_adresse"], 62)
    L.roww("0.6   Anbringungsstelle der FIN:", d["vin_ort"], 62)   # REGEL: langer FIN-Ort -> Umbruch auf Folgezeile(n), nie Schrift verkleinern
    L.gap(0.6)
    L.row("0.10 Fahrzeug-Identifizierungsnr.:", d["vin"], 62, 5.6)
    L.row("B      Erstzulassung:", d["ez"], 62)
    L.gap(0.6)
    # Fließtext: Datum normal, Typgenehmigungsnummer FETT, alles in fortlaufender Zeile (Umbruch erst danach)
    _words=[(w,"DV") for w in f"Die Unterlagen nennen am {d['f6']} die Genehmigungsnummer".split()]
    _words.append((str(d["K"]),"DVB"))
    _words+=[(w,"DV") for w in (". Die ausgelesenen Werte sind vor einer Verwendung durch eine fachkundige Person "
             "gegen die Originalunterlagen und die Typgenehmigungsdaten zu prüfen.").split()]
    _cx=L.x
    for _w,_f in _words:
        _ww=c.stringWidth(_w,_f,8)
        if _cx>L.x and _cx+_ww>L.x+COLW:
            L.y-=4.0*mm; _cx=L.x
        c.setFont(_f,8); c.drawString(_cx,L.y,_w); _cx+=_ww+c.stringWidth(" ",_f,8)
    L.y-=4.0*mm
    L.gap(7)
    L.txt("Technische Prüfung und Freigabe: ausstehend","DVB",8.5,5)
    L.txt("Automatisch erstellter Entwurf - keine Unterschrift", "DV",6.5,11)
    c.setLineWidth(0.4); c.line(L.x,L.y,L.x+95*mm,L.y); L.y-=3.5*mm
    L.txt("Stempel und Unterschrift werden erst nach technischer Freigabe ergänzt.","DV",7,4)
    L.txt(SIGN_ORG,"DV",7,4)

    R.sec("Allgemeine Baumerkmale",0)
    _ay=R.y
    c.setFont("DV",8); c.drawString(R.x,_ay,"1.    Anzahl der Achsen:  "); _ax=R.x+c.stringWidth("1.    Anzahl der Achsen:  ","DV",8)
    c.setFont("DVB",8); c.drawString(_ax,_ay,"2"); _ax+=c.stringWidth("2","DVB",8)
    c.setFont("DV",8); c.drawString(_ax,_ay,"     und Räder:  "); _ax+=c.stringWidth("     und Räder:  ","DV",8)
    c.setFont("DVB",8); c.drawString(_ax,_ay,"4"); R.y-=4.5*mm
    R.row("       Antriebsart:", d["antrieb"], 40)
    R.sec("Hauptabmessungen")
    R.row("4.    Radstand:", f"{d['radstand']} mm", 40)
    R.row("5.    Länge:", f"{d['laenge']} mm", 40)
    R.row("6.    Breite:", f"{d['breite']} mm", 40)
    R.row("7.    Höhe:", f"{d['hoehe']} mm", 40)
    R.sec("Massen")
    R.row("13.   Masse des fahrbereiten Fahrzeugs:", f"{d['masse_fahrbereit']} kg", 74)
    R.row("13.2 Tatsächliche Masse des Fahrzeugs:", f"{d['masse_tatsaechlich']} kg", 74)  # REGEL: Nummern = amtl. CoC-Muster (385/2009)
    R.row("16.1 Techn. zul. Gesamtmasse:", f"{d['zgg']} kg", 74)
    R.row("16.2 Zul. Achslast Achse 1:", f"{d['achse1']} kg", 74)
    R.row("        Zul. Achslast Achse 2:", f"{d['achse2']} kg", 74)
    R.row("16.4 Zul. Gesamtmasse Fahrzeugkomb.:", f"{d['zugkomb']} kg", 74)
    R.row("18.1 Anhängelast gebremst:", f"{d['ahk_gebremst']} kg", 74)
    R.row("18.4 Anhängelast ungebremst:", f"{d['ahk_ungebremst']} kg", 74)
    R.row("19.   Zul. Stützlast am Kupplungspunkt:", f"{d['stuetzlast']} kg", 74)
    footer(1); c.showPage()

    # ---------- Seite 2 ----------
    _draft_banner(c, W, H); _logo(c,W-M-46*mm,H-15*mm,46*mm)
    c.setFont("DVB",9); c.drawString(M,H-12*mm,f"Fortsetzung: EU-Genehmigungsnummer: {d['K']}   —   FIN: {d['vin']}")
    c.setLineWidth(0.8); c.line(M,H-14*mm,W-M,H-14*mm)
    yt2=H-19*mm; L2=Col(M,yt2); R2=Col(M+COLW+GAP,yt2)
    c.setStrokeColorRGB(.47,.47,.47); c.setLineWidth(0.3)
    c.line(M+COLW+GAP/2,16*mm,M+COLW+GAP/2,yt2); c.setStrokeColorRGB(0,0,0)

    L2.sec("Antriebsmaschine",0)
    L2.row("20.   Hersteller der Antriebsmaschine:", d["motorhersteller"], 66)
    L2.row("21.   Baumusterbezeichnung Motor:", d["motorcode"], 66)
    L2.row("22.   Arbeitsverfahren:", d["arbeitsverfahren"], 66)
    L2.row("24.   Zahl u. Anordnung der Zylinder:", d["zylinder"], 66)
    L2.row("25.   Hubraum:", f"{d['hubraum']} cm³", 66)
    L2.row("26.   Kraftstoff:", d["kraftstoff"], 66)
    L2.row("27.1 Höchste Nutzleistung:", f"{d['leistung']} kW bei {d['leistung_rpm']} min⁻¹", 66)
    L2.row("        Max. Drehmoment:", f"{d['drehmoment']} Nm bei {d['drehmoment_rpm']} min⁻¹", 66)
    L2.row("29.   Höchstgeschwindigkeit:", f"{d['vmax']} km/h", 66)
    L2.row("        Getriebe:", d["getriebe"], 66)
    L2.sec("Achsen und Räder")
    L2.row("30.   Spurweite Achse 1 / 2:", f"{d['spur1']} / {d['spur2']} mm", 66)
    _tires=d["reifen_liste"] or ["—"]
    _tavail=COLW-66*mm-2*mm
    for _i,_ty in enumerate(_tires):
        if _i==0:
            c.setFont("DV",8); c.drawString(L2.x,L2.y,"35.   Reifen-/Radkombinationen:")
        _vx=L2.x+66*mm
        if " / HA " in _ty:   # Mischbereifung: VA-Zeile + HA-Zeile untereinander (ohne Punkt)
            _va,_ha=_ty.split(" / HA ")
            c.setFont("DVB",8.5); c.drawString(_vx,L2.y,_va); L2.y-=4.0*mm
            c.drawString(_vx,L2.y,"HA "+_ha); L2.y-=4.5*mm
        else:
            c.setFont("DVB",8.5); c.drawString(_vx,L2.y,_ty); L2.y-=4.5*mm
    L2.sec("Aufbau")
    L2.row("38.   Code des Aufbaus:", d["aufbau"], 66)
    L2.row("40.   Farbe des Fahrzeugs:", d["farbe"], 66)
    L2.row("41.   Anzahl der Türen:", d["tueren"], 66)
    L2.row("42.   Sitzplätze (inkl. Fahrer):", d["sitze"], 66)
    L2.row("        Zul. Dachlast:", f"{d['dachlast']} kg", 66)

    R2.sec("Umweltverträglichkeit",0)
    R2.row("46.   Standgeräusch:", f"{d['ger_stand']} dB(A) bei {d['ger_stand_rpm']} min⁻¹", 42)
    R2.row("        Fahrgeräusch:", f"{d['ger_fahrt']} dB(A)", 42)
    R2.row("47.   Abgasnorm:", d["abgasnorm"], 42)
    R2.row("        ", f"({d['abgasregelung']})", 42, 4.5, False)
    R2.txt("48.   Abgasemissionen (Typ 1, WLTP):","DVB",8,4.8)
    R2.row("        CO:", f"{d['em_co']} g/km", 42)
    R2.row("        NOx:", f"{d['em_nox']} g/km", 42)
    R2.row("        Partikelmasse:", f"{d['em_pm']} g/km", 42)
    R2.row("        Partikelanzahl:", f"{d['em_pn']} · 10¹¹ /km", 42)
    R2.gap(1)
    R2.txt("49.   CO₂ / Kraftstoffverbrauch:","DVB",8,4.8)
    R2.row("49.4 CO₂ WLTP kombiniert:", f"{d['co2_wltp']} g/km", 56)
    R2.row("        Verbrauch WLTP komb.:", f"{verb} l/100km", 56)
    R2.row("49.1 CO₂ NEFZ kombiniert:", f"{d['co2_nedc']} g/km", 56)
    footer(2); c.showPage(); c.save()

print("render.py geladen")
