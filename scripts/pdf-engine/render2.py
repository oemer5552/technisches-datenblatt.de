# -*- coding: utf-8 -*-
import os, textwrap, math
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from render import _draft_banner, _logo, SIGN_NAME, SIGN_ROLE, SIGN_ORG

def _fit(c, text, x, y, maxw, font="DV", size=8.2, minsize=5.4):
    text=str(text); s=size
    while s>minsize and c.stringWidth(text,font,s)>maxw: s-=0.2
    if c.stringWidth(text,font,s)>maxw:
        while text and c.stringWidth(text+"…",font,s)>maxw: text=text[:-1]
        text=(text+"…") if text else text
    c.setFont(font,s); c.drawString(x,y,text)

def _head(c, W, H, title, sub):
    c.setFont("DVB",8);  c.drawString(15*mm, H-13*mm, SIGN_ORG)
    c.setFont("DV",7.5); c.drawString(15*mm, H-16.8*mm, "Marienborner Str. 49 · 55128 Mainz")
    c.drawString(15*mm, H-20.2*mm, "Tel. 06131 934070 · info@autohaus-doerrschuck.de")
    _logo(c, W-15*mm-52*mm, H-19*mm, 52*mm)
    c.setFont("DVB",14); c.drawCentredString(W/2, H-50*mm, title)   # Titel 2 cm tiefer
    c.setFont("DVI",8);  c.drawCentredString(W/2, H-54.5*mm, sub)

def _sign(c, x, y, w):
    c.setFont("DVB",8.5); c.drawString(x, y, "Technische Prüfung und Freigabe: ausstehend")
    c.setFont("DV",6.5); c.drawString(x, y-3.5*mm, "Automatisch erstellter Entwurf - keine Unterschrift")
    c.setLineWidth(0.4); c.line(x+w/2+6*mm, y-1*mm, x+w, y-1*mm)
    c.setFont("DV",7); c.drawString(x+w/2+6*mm, y-4.5*mm, "Freigabefeld")
    c.drawString(x+w/2+6*mm, y-7.5*mm, SIGN_NAME)
    c.drawString(x+w/2+6*mm, y-10.5*mm, SIGN_ORG)

# ============================================================ Datenblatt: 1:1 nach Vorlage zb1_raster (Pixel-Geometrie)
def render_datenblatt(d, out):
    W,H = A4; M=15*mm
    c=canvas.Canvas(out, pagesize=A4)
    _draft_banner(c, W, H)
    _head(c, W, H, "Entwurf der Technischen Daten",
          "(als Hilfestellung zum Ausfüllen der Zulassungsbescheinigung Teil I durch die Zulassungsstelle)")
    c.setFont("DV",8)
    c.drawString(M, H-61*mm, f"Amtliches Kennzeichen (entwertet):  {d['kz_land']}, {d['kennzeichen']}")
    c.drawString(M, H-64.6*mm, f"Fahrzeug:  {d['marke']} {d['handelsname']}        FIN: {d['vin']}")

    # ---- Geometrie 1:1 aus zb1_raster.py (Pixel eines 300-DPI-Scans) ----
    X_L,X_CODE_L,X_MID,X_CODE_R,X_R = 787,822,1626,1656,2392
    Y_T,Y_B,N_ROWS = 48,1193,23
    PITCH=(Y_B-Y_T)/N_ROWS; YS=[Y_T+i*PITCH for i in range(N_ROWS+1)]; BEM_ROW=16
    LEFT_STRIP={0:'B',1:'J',2:'E',3:'D.1',4:'D.2',8:'D.3',9:'2',10:'5',12:'V.9',13:'14',14:'P.3',15:'10',16:'22'}
    RIGHT_STRIP={0:'L',1:'18',2:'20',3:'12',4:'V.7',5:'7.1',6:'8.1',7:'U.1',8:'O.1',9:'15.1',10:'15.2',11:'15.3',12:'R',13:'K',14:'6',15:'21'}
    LEFT_INLINE={0:[('2.1',1105),('2.2',1305)],1:[('4',1155)],2:[('3',1405)],15:[('14.1',1027),('P.1',1297)]}
    RIGHT_INLINE={0:[('9',1765),('P.2/P.4',1905),('T',2166)],1:[('19',2045)],2:[('G',2045)],3:[('13',1866),('Q',2166)],
                  4:[('F.1',1866),('F.2',2166)],5:[('7.2',1866),('7.3',2166)],6:[('8.2',1866),('8.3',2166)],
                  7:[('U.2',1866),('U.3',2166)],8:[('O.2',1866),('S.1',2166),('S.2',2300)],12:[('11',2120)],14:[('17',2046),('16',2120)]}
    merged_strip={5,6,7,11,17,18,19,20,21,22}; CB=30; CBH=0.52
    # Pixel -> A4 (auf Nutzbreite skaliert, unter dem Kopf)
    PXW=X_R-X_L; s=(W-2*M)/PXW; gtop=H-68*mm
    def X(px): return M+(px-X_L)*s
    def Y(px): return gtop-(px-Y_T)*s
    def bw_px(txt): return max(CB,7*len(txt)+8)
    GREY=(0.16,0.42,0.30); FRAME=(0.04,0.30,0.19); BOXC=(0.24,0.50,0.36); CODEC=(0.04,0.30,0.19)
    def hl(ypx,x0,x1,w=0.5,col=GREY): c.setStrokeColorRGB(*col); c.setLineWidth(w); c.line(X(x0),Y(ypx),X(x1),Y(ypx))
    def vl(xpx,y0,y1,w=0.5,col=GREY): c.setStrokeColorRGB(*col); c.setLineWidth(w); c.line(X(xpx),Y(y0),X(xpx),Y(y1))

    ac=d["aufbau"].split(" – "); aufcode=ac[0]; auftext=ac[1] if len(ac)>1 else ""
    hh=d["hoehe"].replace(" ",""); modell=d["handelsname"].split(" 1.")[0].strip()
    kw=d["leistung"]; rpm=d["leistung_rpm"]; rf=d["reifen_montiert"]
    V={"B":d["ez"],"2.1":d["hsn"],"2.2":d["tsn"],"L":"2","9":"1","P.2/P.4":f"{kw}/{rpm}","T":d["vmax"],
       "J":d["klasse"],"4":aufcode,"18":d["laenge"],"19":d["breite"],"E":d["vin"],"3":"—","20":hh,"G":(d["masse_tatsaechlich"] if str(d.get("masse_tatsaechlich","—"))!="—" else d["masse_fahrbereit"]),  # REGEL: G = tatsaechliche Masse (CoC 13.2)
       "D.1":d["marke"],"12":"—","13":(d.get("stuetzlast") if str(d.get("stuetzlast","—"))!="—" else d.get("f13","—")),"Q":"—","D.2":f"Typ {d['typ']}","V.7":(d["co2_wltp"] if str(d.get("co2_wltp","—")) not in ("—","") else d.get("co2_nedc","—")),"F.1":d["zgg"],"F.2":d["zgg"],
       "7.1":d["achse1"],"7.2":d["achse2"],"7.3":"—","8.1":d["achse1"],"8.2":d["achse2"],"8.3":"—",
       "U.1":d["ger_stand"],"U.2":d["ger_stand_rpm"],"U.3":d["ger_fahrt"],"D.3":modell,
       "O.1":d["ahk_gebremst"],"O.2":d["ahk_ungebremst"],"S.1":d["sitze"],"S.2":"—","2":d["marke"],
       "15.1":rf,"15.2":rf,"15.3":"—","5":("Fz.z.Pers.bef.b. 8 Spl." if str(d.get('klasse','')).upper().startswith('M1') else "—"),"V.9":d["abgasregelung"],"R":d["farbe"],"11":d["f11"],
       "14":d["f14"],"K":d["K"],"P.3":d["kraftstoff"],"6":d["f6"],"17":d["f17"],"16":d["f16"],"10":d["f10"],"14.1":d["f141"],"P.1":d["hubraum"],"21":"—"}
    CONT={5:f"Var. {d['variante']}",6:f"Vers. {d['version']}",11:auftext}

    def fitpt(t,xa,xb,yb,size=8.0,mins=4.4):
        t=str(t); maxw=xb-xa; ss=size
        if maxw<=2: return
        while ss>mins and c.stringWidth(t,"DV",ss)>maxw: ss-=0.3
        if c.stringWidth(t,"DV",ss)>maxw:
            while t and c.stringWidth(t+"…","DV",ss)>maxw: t=t[:-1]
            t+="…"
        c.setFillColorRGB(0,0,0); c.setFont("DV",ss); c.drawString(xa,yb,t)

    # ---- Guilloche-Unterdruck (Sicherheitsdruck-Anmutung) ----
    def guilloche():
        x0,x1=X(X_L),X(X_R); ytop=Y(Y_T); ybot=Y(Y_B)
        c.saveState(); p=c.beginPath(); p.rect(x0,ybot,x1-x0,ytop-ybot); c.clipPath(p,stroke=0,fill=0)
        for f1,f2,ph,amp,gap,col in [(0.075,0.030,0.0,3.0,3.2,(0.62,0.80,0.69)),(0.052,0.041,1.7,2.4,3.2,(0.70,0.84,0.74))]:
            c.setStrokeColorRGB(*col); c.setLineWidth(0.25); base=ybot-8
            while base<ytop+8:
                pa=c.beginPath(); x=x0; fst=True
                while x<=x1:
                    y=base+amp*math.sin(f1*(x-x0)+ph)+0.6*amp*math.sin(f2*(x-x0)+2*ph)
                    (pa.moveTo if fst else pa.lineTo)(x,y); fst=False; x+=2.2
                c.drawPath(pa,stroke=1,fill=0); base+=gap
        c.restoreState()
    guilloche()

    # ---- Rahmen + Zeilenraster ----
    hl(Y_T,X_L,X_R,0.9,FRAME); hl(Y_B,X_L,X_R,0.9,FRAME)
    for i in range(1,N_ROWS):
        x0=X_CODE_L if i in merged_strip else X_L
        hl(YS[i],x0,X_R)
    vl(X_L,Y_T,Y_B,0.9,FRAME); vl(X_R,Y_T,Y_B,0.9,FRAME); vl(X_CODE_L,Y_T,Y_B)
    yb_blk=YS[BEM_ROW]; vl(X_MID,Y_T,yb_blk); vl(X_CODE_R,Y_T,yb_blk)
    for row,items in LEFT_INLINE.items():
        for _,xp in items: vl(xp,YS[row],YS[row+1])
    for row,items in RIGHT_INLINE.items():
        for _,xp in items: vl(xp,YS[row],YS[row+1])

    # ---- Code-Streifen (Hauptcodes, ohne Box, ggf. über Spannweite zentriert) ----
    def strip(mapping,xc,end=N_ROWS):
        it=sorted(mapping.items())
        for k,(row,txt) in enumerate(it):
            nxt=it[k+1][0] if k+1<len(it) else end
            midtop=YS[row]+(YS[nxt]-YS[row])/2-PITCH/2
            c.setFillColorRGB(*CODEC); c.setFont("DV",5.0 if len(txt)<=3 else 4.0)
            c.drawCentredString(xc,Y(midtop)-PITCH*s*0.42,txt)
    strip(LEFT_STRIP,(X(X_L)+X(X_CODE_L))/2)
    strip({k:v for k,v in RIGHT_STRIP.items() if k<BEM_ROW},(X(X_MID)+X(X_CODE_R))/2,end=BEM_ROW)

    # ---- Inline-Codes (kleine Box) ----
    def cbox(txt,xpx,row):
        yt=YS[row]; bw=bw_px(txt)*s; bh=PITCH*CBH*s; bx=X(xpx)
        c.setStrokeColorRGB(*BOXC); c.setLineWidth(0.4); c.rect(bx,Y(yt)-bh,bw,bh,stroke=1,fill=0)
        c.setFillColorRGB(*CODEC); c.setFont("DV",5.0 if len(txt)<=3 else 4.0)
        c.drawCentredString(bx+bw/2,Y(yt)-PITCH*s*0.42,txt); return bw
    for row,items in LEFT_INLINE.items():
        for txt,xp in items: cbox(txt,xp,row)
    for row,items in RIGHT_INLINE.items():
        for txt,xp in items: cbox(txt,xp,row)

    # ---- Werte einsetzen ----
    def yval(row): return Y(YS[row])-PITCH*s*0.78
    # linker Block
    for row in range(0,BEM_ROW):
        ils=LEFT_INLINE.get(row,[])
        # Streifen-/Fortsetzungswert
        code0=LEFT_STRIP.get(row); val0=V.get(code0) if code0 else CONT.get(row)
        x1=ils[0][1] if ils else X_MID
        if val0: fitpt(val0, X(X_CODE_L)+2, X(x1)-2, yval(row))
        for j,(txt,xp) in enumerate(ils):
            x1=ils[j+1][1] if j+1<len(ils) else X_MID
            v=V.get(txt)
            if v: fitpt(v, X(xp)+bw_px(txt)*s+1.5, X(x1)-2, yval(row))
    # rechter Block
    for row in range(0,BEM_ROW):
        ils=RIGHT_INLINE.get(row,[])
        code0=RIGHT_STRIP.get(row); val0=V.get(code0) if code0 else None
        x1=ils[0][1] if ils else X_R
        if val0: fitpt(val0, X(X_CODE_R)+2, X(x1)-2, yval(row))
        for j,(txt,xp) in enumerate(ils):
            x1=ils[j+1][1] if j+1<len(ils) else X_R
            v=V.get(txt)
            if v: fitpt(v, X(xp)+bw_px(txt)*s+1.5, X(x1)-2, yval(row))
    # Feld 22 bleibt leer (Bemerkungen). Kommentar kommt UNTER das Raster.
    grid_bot=Y(Y_B)
    bem=(f"Automatisch aus dem vorliegenden {d['briefquelle']} ausgelesener Entwurf (Brief-Nr. {d['briefnr']}, FIN {d['vin']}). "
         "Unklare oder nicht enthaltene Werte bleiben offen. Technische Prüfung und Freigabe stehen aus.")
    c.setFillColorRGB(0,0,0); c.setStrokeColorRGB(0,0,0); c.setFont("DV",7.4)
    yy=grid_bot-7*mm
    for ln in textwrap.wrap(bem,120):
        c.drawString(M,yy,ln); yy-=4.3*mm

    # ---- Unterschrift unten ----
    _sign(c, M, max(yy-12*mm, 40*mm), W-2*M)
    c.setLineWidth(0.4); c.setStrokeColorRGB(0,0,0); c.line(M,15*mm,W-M,15*mm)
    c.setFont("DV",7); c.drawRightString(W-M,11.5*mm,"Seite 1 von 1")
    c.showPage(); _draft_banner(c, W, H)
    c.setFont("DV",7); c.setFillColorRGB(.6,.6,.6); c.drawCentredString(W/2,15*mm,"— Rückseite bewusst frei —"); c.setFillColorRGB(0,0,0)
    c.showPage(); c.save()

# ============================================================ FIN-Bestätigung (1 S. + leere Rückseite)
def render_fin(d, out):
    W,H = A4; M=18*mm
    c=canvas.Canvas(out, pagesize=A4)
    _draft_banner(c, W, H)
    _head(c, W, H, "Entwurf zum Abgleich der Fahrzeug-Identifizierungsnummer (FIN)",
          "Confirmation of the Vehicle Identification Number")
    y=H-66*mm; c.setFont("DV",9)
    intro=("Die nachstehende Fahrzeug-Identifizierungsnummer (FIN) wurde automatisiert aus dem eingereichten Foto und "
           "den Fahrzeugpapieren ausgelesen. Eine persönliche Sichtprüfung am Fahrzeug hat nicht stattgefunden.")
    for ln in textwrap.wrap(intro, 96): c.drawString(M, y, ln); y-=5*mm
    y-=4*mm
    rows=[("Fahrzeug-Identifizierungsnummer (FIN)", d["vin"]),("Amtliches Kennzeichen (entwertet)", f"{d['kz_land']}, {d['kennzeichen']}"),
          ("Fabrikmarke", d["marke"]),("Handelsbezeichnung", d["handelsname"]),
          ("Typ / Variante / Version", f"{d['typ']} / {d['variante']} / {d['version']}"),
          ("EG-Typgenehmigungsnummer", d["K"]),("Fahrzeugklasse", d["klasse"]),("Erstzulassung", d["ez"]),
          ("Anbringungsstelle der FIN", d["vin_ort"]),("Farbe des Fahrzeugs", d["farbe"])]
    boxh=len(rows)*7.6*mm+4*mm
    c.setLineWidth(0.4); c.rect(M, y-boxh, W-2*M, boxh, stroke=1, fill=0)
    yy=y-7*mm
    for lab,val in rows:
        c.setFont("DV",8.5); c.drawString(M+4*mm, yy, lab+":")
        c.setFont("DVB",10 if lab.startswith("Fahrzeug-Id") else 9); c.drawString(M+80*mm, yy, str(val)); yy-=7.6*mm
    y=y-boxh-10*mm
    c.setFont("DVI",8); c.drawString(M, y, "Automatischer Foto-/Dokumentenabgleich; technische Sichtprüfung und Freigabe ausstehend.")
    _sign(c, M, 42*mm, W-2*M)
    c.setLineWidth(0.4); c.line(M,18*mm,W-M,18*mm)
    c.setFont("DV",7); c.drawRightString(W-M,14*mm,"Seite 1 von 1")
    c.showPage(); _draft_banner(c, W, H)
    c.setFont("DV",7); c.setFillColorRGB(.6,.6,.6); c.drawCentredString(W/2,15*mm,"— Rückseite bewusst frei —"); c.setFillColorRGB(0,0,0)
    c.showPage(); c.save()

print("render2.py (ZB1-Norm-Layout)")
