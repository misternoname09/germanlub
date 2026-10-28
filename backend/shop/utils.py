import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from django.conf import settings
from datetime import datetime

def generate_invoice_pdf(order):
    """
    Generates a premium PDF invoice/quote for a given order and returns the file path.
    """
    invoices_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
    os.makedirs(invoices_dir, exist_ok=True)
    
    safe_invoice_number = order.invoice_number.replace('/', '_')
    filename = f"facture_{safe_invoice_number}.pdf"
    filepath = os.path.join(invoices_dir, filename)
    
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # --- Brand Colors ---
    BRAND_COLOR = colors.HexColor('#ea580c') # Tailwind orange-600
    TEXT_COLOR = colors.HexColor('#1f2937')  # Tailwind gray-800
    LIGHT_BG = colors.HexColor('#f3f4f6')    # Tailwind gray-100
    
    # 1. HEADER
    c.setFillColor(BRAND_COLOR)
    c.rect(0, height - 15, width, 15, fill=1, stroke=0) # Top thin accent bar
    
    # Logo LES (Lubricants Engineering Solutions)
    les_logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'les_logo.jpg')
    if os.path.exists(les_logo_path):
        try:
            # Placé en haut à gauche (à la place de l'ancien logo)
            c.drawImage(les_logo_path, 40, height - 100, width=80, height=80, preserveAspectRatio=True, anchor='nw')
        except Exception:
            pass
            
    # Logo GermanLub
    logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'logo.jpg')
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, 140, height - 90, width=120, height=60, preserveAspectRatio=True, anchor='nw')
        except Exception:
            pass
    # Title
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica-Bold", 28)
    doc_title = "DEVIS" if getattr(order, 'is_quote', False) else "FACTURE"
    c.drawRightString(width - 40, height - 60, doc_title)
    
    # Doc Info
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    doc_label = "Devis N°" if getattr(order, 'is_quote', False) else "Facture N°"
    c.drawRightString(width - 40, height - 80, f"{doc_label} : {order.invoice_number}")
    c.drawRightString(width - 40, height - 95, f"Date : {order.created_at.strftime('%d/%m/%Y')}")
    
    # Company Info
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(TEXT_COLOR)
    c.drawString(40, height - 135, "LUBRICANTS ENGINEERING SOLUTIONS")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawString(40, height - 150, "Dakar, Sénégal")
    c.drawString(40, height - 165, "Tél: +221 78 717 18 18 / 33 892 66 50")
    c.drawString(40, height - 180, "Email: les@les.sn")
    
    # Customer Info Box
    c.setStrokeColor(LIGHT_BG)
    c.setFillColor(LIGHT_BG)
    c.roundRect(width/2 + 20, height - 180, 240, 80, 5, fill=1, stroke=0)
    
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica-Bold", 10)
    billed_to_text = "Préparé pour :" if getattr(order, 'is_quote', False) else "Facturé à :"
    c.drawString(width/2 + 35, height - 120, billed_to_text)
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(width/2 + 35, height - 140, order.customer_name)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawString(width/2 + 35, height - 155, f"Tél : {order.customer_phone}")
    c.drawString(width/2 + 35, height - 170, order.customer_address[:35] + ('...' if len(order.customer_address) > 35 else ''))
    
    # 2. ITEMS TABLE
    data = [["Description", "Qté", "Prix Unitaire", "Total"]]
    for item in order.items.all():
        product_name = item.product.name if item.product else "Produit supprimé"
        data.append([
            product_name[:45], 
            str(item.quantity), 
            f"{int(item.price):,} F CFA".replace(',', ' '), 
            f"{int(item.price * item.quantity):,} F CFA".replace(',', ' ')
        ])
        
    table = Table(data, colWidths=[240, 50, 110, 110])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'), # Quantities and prices right-aligned
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('TOPPADDING', (0,0), (-1,0), 10),
        
        # Data rows
        ('TEXTCOLOR', (0,1), (-1,-1), TEXT_COLOR),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('LINEBELOW', (0,1), (-1,-1), 1, LIGHT_BG),
    ]))
    
    w, h = table.wrapOn(c, width, height)
    table.drawOn(c, 40, height - 220 - h)
    
    # 3. TOTALS
    tot_y = height - 240 - h
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawRightString(width - 150, tot_y, "Sous-total :")
    c.setFillColor(TEXT_COLOR)
    c.drawRightString(width - 40, tot_y, f"{int(order.subtotal):,} F CFA".replace(',', ' '))
    
    if order.coupon:
        tot_y -= 20
        c.setFont("Helvetica", 10)
        c.setFillColor(BRAND_COLOR)
        c.drawRightString(width - 150, tot_y, f"Réduction ({order.coupon.code}) :")
        c.drawRightString(width - 40, tot_y, f"- {int(order.discount_amount):,} F CFA".replace(',', ' '))
        
    tot_y -= 30
    c.setFillColor(LIGHT_BG)
    c.rect(width - 250, tot_y - 10, 210, 30, fill=1, stroke=0)
    
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 150, tot_y, "Total TTC :")
    c.drawRightString(width - 40, tot_y, f"{int(order.total_amount):,} F CFA".replace(',', ' '))
    
    # 4. FOOTER
    c.setFillColor(colors.gray)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(width/2, 50, "LUBRICANTS ENGINEERING SOLUTIONS")
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 38, "N.I.N.E.A: 004998350 / R.C: SN.DKR.2025.A.895 / Adresse: Dakar, Sénégal")
    c.drawCentredString(width/2, 26, "Contacts: +221 78 717 18 18 / 33 892 66 50 / Website: www.les.sn / Email: les@les.sn")
    
    c.save()
    return filepath

def generate_delivery_slip_pdf(order):
    """
    Generates a premium PDF delivery slip (Bordereau de Livraison) for a given order.
    Contains product list and quantities but NO prices. Includes signature zones.
    """
    invoices_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
    os.makedirs(invoices_dir, exist_ok=True)
    
    safe_invoice_number = order.invoice_number.replace('/', '_')
    filename = f"bordereau_{safe_invoice_number}.pdf"
    filepath = os.path.join(invoices_dir, filename)
    
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # --- Brand Colors ---
    BRAND_COLOR = colors.HexColor('#ea580c')
    TEXT_COLOR = colors.HexColor('#1f2937')
    LIGHT_BG = colors.HexColor('#f3f4f6')
    
    # 1. HEADER
    c.setFillColor(BRAND_COLOR)
    c.rect(0, height - 15, width, 15, fill=1, stroke=0)
    
    # Logo LES
    les_logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'les_logo.jpg')
    if os.path.exists(les_logo_path):
        try:
            c.drawImage(les_logo_path, 40, height - 100, width=80, height=80, preserveAspectRatio=True, anchor='nw')
        except Exception:
            pass
            
    # Logo GermanLub
    logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'logo.jpg')
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, 140, height - 90, width=120, height=60, preserveAspectRatio=True, anchor='nw')
        except Exception:
            pass

    # Title
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica-Bold", 22)
    c.drawRightString(width - 40, height - 50, "BORDEREAU DE")
    c.drawRightString(width - 40, height - 75, "LIVRAISON")
    
    # Doc Info
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawRightString(width - 40, height - 95, f"BL N° : BL-{order.invoice_number}")
    c.drawRightString(width - 40, height - 110, f"Date : {order.created_at.strftime('%d/%m/%Y')}")
    
    # Company Info
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(TEXT_COLOR)
    c.drawString(40, height - 135, "LUBRICANTS ENGINEERING SOLUTIONS")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawString(40, height - 150, "Dakar, Sénégal")
    c.drawString(40, height - 165, "Tél: +221 78 717 18 18 / 33 892 66 50")
    c.drawString(40, height - 180, "Email: les@les.sn")
    
    # Customer Info Box
    c.setStrokeColor(LIGHT_BG)
    c.setFillColor(LIGHT_BG)
    c.roundRect(width/2 + 20, height - 195, 240, 95, 5, fill=1, stroke=0)
    
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(width/2 + 35, height - 120, "Livré à :")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(width/2 + 35, height - 140, order.customer_name)
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.gray)
    c.drawString(width/2 + 35, height - 155, f"Tél : {order.customer_phone}")
    c.drawString(width/2 + 35, height - 170, order.customer_address[:35] + ('...' if len(order.customer_address) > 35 else ''))
    if order.invoice_number:
        c.drawString(width/2 + 35, height - 185, f"Réf. Commande : {order.invoice_number}")
    
    # 2. ITEMS TABLE (NO PRICES)
    data = [["N°", "Description", "Quantité"]]
    for idx, item in enumerate(order.items.all(), 1):
        product_name = item.product.name if item.product else "Produit supprimé"
        data.append([
            str(idx),
            product_name[:50], 
            str(item.quantity),
        ])
        
    table = Table(data, colWidths=[40, 360, 110])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BRAND_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('TOPPADDING', (0,0), (-1,0), 10),
        
        # Data rows
        ('TEXTCOLOR', (0,1), (-1,-1), TEXT_COLOR),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('LINEBELOW', (0,1), (-1,-1), 1, LIGHT_BG),
    ]))
    
    w, h = table.wrapOn(c, width, height)
    table.drawOn(c, 40, height - 220 - h)
    
    # 3. TOTAL ITEMS COUNT
    tot_y = height - 240 - h
    total_items = sum(item.quantity for item in order.items.all())
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(TEXT_COLOR)
    c.drawString(40, tot_y, f"Nombre total d'articles : {total_items}")
    
    # 4. OBSERVATIONS
    obs_y = tot_y - 40
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(TEXT_COLOR)
    c.drawString(40, obs_y, "Observations :")
    c.setStrokeColor(LIGHT_BG)
    c.line(40, obs_y - 15, width - 40, obs_y - 15)
    c.line(40, obs_y - 35, width - 40, obs_y - 35)
    
    # 5. SIGNATURE ZONES
    sig_y = obs_y - 80
    
    # Livreur signature
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(TEXT_COLOR)
    c.drawString(60, sig_y, "Signature du livreur")
    c.setStrokeColor(colors.gray)
    c.rect(40, sig_y - 65, 220, 60, fill=0, stroke=1)
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.gray)
    c.drawString(50, sig_y - 75, "Date : ____/____/________")
    
    # Client signature
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(TEXT_COLOR)
    c.drawString(width - 240, sig_y, "Signature du client")
    c.setStrokeColor(colors.gray)
    c.rect(width - 260, sig_y - 65, 220, 60, fill=0, stroke=1)
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.gray)
    c.drawString(width - 250, sig_y - 75, "Date : ____/____/________")
    
    # 6. FOOTER
    c.setFillColor(colors.gray)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(width/2, 50, "LUBRICANTS ENGINEERING SOLUTIONS")
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 38, "N.I.N.E.A: 004998350 / R.C: SN.DKR.2025.A.895 / Adresse: Dakar, Sénégal")
    c.drawCentredString(width/2, 26, "Contacts: +221 78 717 18 18 / 33 892 66 50 / Website: www.les.sn / Email: les@les.sn")
    
    c.save()
    return filepath

