import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

docs_dir = os.path.dirname(os.path.abspath(__file__))

def create_styled_pdf(filename, title, content_paragraphs):
    pdf_path = os.path.join(docs_dir, filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1B4332'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2D6A4F'),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#081C15'),
        spaceBefore=12,
        spaceAfter=6
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2D6A4F'),
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#212529'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    story = []
    
    # Header banner
    story.append(Paragraph(title, title_style))
    story.append(Paragraph("No Food Waste — Food Rescue & Redistribution Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#40916C'), spaceAfter=14))
    
    for item in content_paragraphs:
        itype = item[0]
        text = item[1]
        if itype == 'h1':
            story.append(Paragraph(text, h1_style))
        elif itype == 'h2':
            story.append(Paragraph(text, h2_style))
        elif itype == 'bullet':
            story.append(Paragraph(f"&bull; {text}", bullet_style))
        elif itype == 'table':
            # table data item[1] is list of rows
            headers = [Paragraph(f"<b>{c}</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)) for c in text[0]]
            data = [headers]
            for row in text[1:]:
                data.append([Paragraph(str(c), body_style) for c in row])
            t = Table(data, colWidths=item[2] if len(item) > 2 else None)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2D6A4F')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D3D3D3')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8F9FA')])
            ]))
            story.append(Spacer(1, 4))
            story.append(t)
            story.append(Spacer(1, 8))
        else:
            story.append(Paragraph(text, body_style))
            
    doc.build(story)
    print(f"Generated: {pdf_path}")

# 1. Code for Good Brief
brief_content = [
    ('h1', 'Mission & Organization Overview'),
    ('p', '<b>Organization:</b> No Food Waste (www.nofoodwaste.org)<br/>No Food Waste is a non-profit organization dedicated to bridging the gap between food surplus and hunger. Its mission is to recover excess, untouched, and hygienic food from weddings, restaurants, and institutions and redistribute it to people in need. No Food Waste aims to create a world with zero hunger and minimal food waste, aligning its efforts with global sustainability goals of Zero Hunger and responsible consumption.'),
    ('h1', 'Context & Problem Statement'),
    ('p', 'India faces a dual crisis: millions of people go hungry daily, while over 68 million tons of food is wasted annually. No Food Waste is dedicated to bridging this gap by collecting and distributing surplus food across locations in India, including Chennai, Coimbatore, and Hyderabad. Operations involve a 12-member team, dedicated kitchens, volunteers, and vehicles.'),
    ('p', 'Excess food requests arrive manually through helpline numbers, causing resource constraints and high rejection rates during peak periods. Coordination currently depends on spreadsheets and WhatsApp groups. Smaller quantities are frequently rejected, and distribution during the critical "golden hour" is severely bottlenecked.'),
    ('h1', 'Strategic Objectives & Future Platform'),
    ('bullet', 'Develop a comprehensive, technology-driven platform to optimize operations and manage food donation requests, volunteer availability, and logistics in real time.'),
    ('bullet', 'Minimize resource constraints and reduce rejected requests by aggregating small-batch food collections.'),
    ('bullet', 'Automate data collection and communication to eliminate spreadsheet/WhatsApp overhead.'),
    ('bullet', 'Map hunger hotspots using geospatial density calculations to guide rapid distribution within the golden hour.'),
    ('bullet', 'Establish volunteer onboarding, verification, training, and certification pathways.')
]
create_styled_pdf("01_No_Food_Waste_Code_For_Good_Brief.pdf", "code for <good> — Project Brief", brief_content)

# 2. TRD
trd_content = [
    ('h1', '1. Recommended Technology Stack'),
    ('bullet', 'Frontend: React + Vite + Tailwind CSS'),
    ('bullet', 'Backend: Node.js + Express.js'),
    ('bullet', 'Database: MongoDB Atlas + Mongoose'),
    ('bullet', 'Authentication: JWT + bcrypt (Roles: DONOR, VOLUNTEER, ADMIN)'),
    ('bullet', 'Real-Time Communication: Socket.IO for request-scoped chat and notifications'),
    ('bullet', 'Maps & Location: MapLibre GL JS / Leaflet, Geocoding, reverse geocoding, route calculations'),
    ('bullet', 'File Storage: Object storage for delivery proofs and photos, URLs saved in MongoDB'),
    ('h1', '2. Core API Specifications'),
    ('table', [
        ['Method', 'Endpoint', 'Access', 'Description'],
        ['POST', '/api/auth/register', 'Donor/Volunteer', 'Register account'],
        ['POST', '/api/auth/login', 'All', 'Login and receive JWT'],
        ['GET', '/api/auth/me', 'All', 'Current user & role profile'],
        ['POST', '/api/requests', 'Donor', 'Create donation request with location & food details'],
        ['GET', '/api/requests/mine', 'Donor', 'List own requests'],
        ['GET', '/api/requests/available', 'Volunteer', 'Available requests in region, sorted by priority score'],
        ['POST', '/api/requests/:id/accept', 'Volunteer', 'Atomic request claiming by volunteer'],
        ['POST', '/api/requests/:id/delivery-proof', 'Volunteer', 'Upload GPS location + food + delivery spot photos'],
        ['GET', '/api/admin/analytics/overview', 'Admin', 'Food totals, deliveries, and request metrics'],
        ['GET', '/api/admin/analytics/hotspots', 'Admin', 'Aggregated delivery coordinates for hunger heatmap']
    ], [50, 160, 90, 220]),
    ('h1', '3. Priority Engine & Hotspot Intelligence'),
    ('p', '<b>Priority Scoring Formula:</b> Priority Score = (Distance Weight x Distance Score) + (Quantity Weight x Quantity Score). Weights are centrally configurable.'),
    ('p', '<b>Hunger Hotspots:</b> Delivery coordinates are aggregated using geospatial density clustering to identify recurring delivery concentrations and visualize high-need zones.')
]
create_styled_pdf("02_Technical_Requirements_Document.pdf", "Technical Requirements Document (TRD)", trd_content)

# 3. PRD
prd_content = [
    ('h1', '1. User Roles & Responsibilities'),
    ('table', [
        ['Role', 'Main Responsibility'],
        ['Donor', 'Submit surplus-food requests, track status, view donor statistics, chat with volunteer.'],
        ['Volunteer', 'Discover prioritized requests, claim tasks, track pickup & delivery, upload proof photos.'],
        ['Admin', 'Manage volunteers/regions, review delivery proofs, monitor analytics and hunger hotspots.']
    ], [100, 420]),
    ('h1', '2. Request Lifecycle State Machine'),
    ('p', '<b>Standard flow:</b> PENDING -> ACCEPTED -> IN_PROGRESS -> DELIVERED'),
    ('p', '<b>Alternative flows:</b> PENDING -> CANCELLED (by Donor); ACCEPTED -> PENDING (Volunteer rejection with reason)'),
    ('h1', '3. End-to-End User Flow'),
    ('bullet', 'Donor registers and creates a food donation request specifying food type, quantity, servings, expiry, and pickup location.'),
    ('bullet', 'System prioritizes the request for nearby active volunteers using the distance and quantity scoring formula.'),
    ('bullet', 'A volunteer accepts the request atomically. Donor is notified immediately in real time.'),
    ('bullet', 'Volunteer navigates to pickup location, marks collection in progress, and coordinates via request-scoped chat.'),
    ('bullet', 'Volunteer delivers to beneficiaries/shelters and submits Delivery Proof (GPS coordinates, food photo, and delivery spot photo).'),
    ('bullet', 'Request transitions to DELIVERED; Donor, Volunteer, and Admin statistics and hunger hotspot data automatically update.')
]
create_styled_pdf("03_Product_Functional_Requirements_Document.pdf", "Product / Functional Requirements Document", prd_content)
