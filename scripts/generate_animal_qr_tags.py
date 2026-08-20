"""
🐄 Digital Farm Management Portal: Persistent Livestock QR Tag Generator
Generates permanent QR code badges for all livestock linking to their Food Safety Passport.
"""

import os
import json
import urllib.parse

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    os.system("pip install qrcode pillow")
    import qrcode
    from PIL import Image, ImageDraw, ImageFont

BASE_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "generated_qr_tags")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sample livestock herd data
ANIMALS = [
    {
        "id": "a101",
        "farm_id": "FARM-NORTH-01",
        "animal_code": "COW-101",
        "species": "Cattle (Cow)",
        "breed": "Gir",
        "dob": "2022-03-15",
        "sex": "Female",
        "weight_kg": 380,
        "purpose": "Dairy (Milk)",
        "qr_token": "QR-COW-101"
    },
    {
        "id": "a102",
        "farm_id": "FARM-NORTH-01",
        "animal_code": "COW-102",
        "species": "Cattle (Cow)",
        "breed": "HF Cross",
        "dob": "2021-08-10",
        "sex": "Female",
        "weight_kg": 430,
        "purpose": "Dairy (Milk)",
        "qr_token": "QR-COW-102"
    },
    {
        "id": "a103",
        "farm_id": "FARM-NORTH-01",
        "animal_code": "BUF-201",
        "species": "Buffalo",
        "breed": "Murrah",
        "dob": "2020-05-20",
        "sex": "Female",
        "weight_kg": 510,
        "purpose": "Dairy (Milk)",
        "qr_token": "QR-BUF-201"
    },
    {
        "id": "a104",
        "farm_id": "FARM-NORTH-01",
        "animal_code": "COW-103",
        "species": "Cattle (Cow)",
        "breed": "Sahiwal",
        "dob": "2023-01-12",
        "sex": "Female",
        "weight_kg": 360,
        "purpose": "Dairy (Milk)",
        "qr_token": "QR-COW-103"
    }
]

def generate_ear_tag_badge(animal):
    """
    Creates a composite high-resolution printable ear tag badge (400x520) with:
    - Forest green header with Food Safety logo
    - High-contrast scannable QR Code
    - Animal Tag Code, Breed, Farm ID, and Verification Notice
    """
    qr_url = f"{BASE_URL}/qr/{urllib.parse.quote(animal['qr_token'])}"
    
    # 1. Generate QR Image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#1B5E20", back_color="#FFFFFF").convert("RGB")
    qr_img = qr_img.resize((260, 260), Image.Resampling.LANCZOS)
    
    # 2. Create Badge Canvas
    badge_w, badge_h = 420, 560
    badge = Image.new("RGB", (badge_w, badge_h), "#FFFFFF")
    draw = ImageDraw.Draw(badge)
    
    # Header Banner (Forest Green)
    draw.rectangle([(0, 0), (badge_w, 90)], fill="#1B5E20")
    draw.text((badge_w // 2, 28), "FARMSHIELD LIVESTOCK PASSPORT", fill="#FFFFFF", anchor="mm")
    draw.text((badge_w // 2, 58), "MRL & AMU Food Safety Certified", fill="#C8E6C9", anchor="mm")
    
    # Paste QR Code
    badge.paste(qr_img, ((badge_w - 260) // 2, 110))
    
    # Draw Animal Info Box
    draw.rectangle([(20, 390), (badge_w - 20, 500)], fill="#F1F8E9", outline="#A5D6A7", width=2)
    draw.text((badge_w // 2, 415), f"TAG ID: {animal['animal_code']}", fill="#1B5E20", anchor="mm")
    draw.text((badge_w // 2, 445), f"{animal['species']} • {animal['breed']} • {animal['sex']}", fill="#2E7D32", anchor="mm")
    draw.text((badge_w // 2, 475), f"Farm: {animal['farm_id']} | Scan to Verify MRL", fill="#558B2F", anchor="mm")
    
    # Footer Notice
    draw.text((badge_w // 2, 530), "🔒 Scannable for Milk Collection & Abattoir Clearance", fill="#757575", anchor="mm")
    
    # Save Image
    out_file = os.path.join(OUTPUT_DIR, f"tag_{animal['animal_code']}.png")
    badge.save(out_file)
    print(f"[OK] Generated persistent QR badge: {out_file}")
    return out_file

def generate_html_printable_sheet(animals):
    """
    Generates a printable HTML sheet containing all cattle ear tags
    """
    html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Printable Livestock QR Food Safety Badges</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
        .card { background: white; border: 2px solid #1B5E20; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: #1B5E20; color: white; margin: -24px -24px 20px -24px; padding: 16px; border-radius: 18px 18px 0 0; }
        .header h2 { margin: 0; font-size: 16px; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; }
        .tag-id { font-size: 24px; font-weight: 900; color: #1B5E20; margin: 12px 0 4px 0; }
        .details { font-size: 13px; font-weight: 600; color: #424242; margin-bottom: 12px; }
        .qr-box { background: #f9fbf9; padding: 12px; border-radius: 16px; display: inline-block; border: 1px solid #c8e6c9; }
        .notice { font-size: 11px; font-weight: 600; color: #616161; margin-top: 12px; }
        @media print { body { background: white; padding: 0; } .card { page-break-inside: avoid; box-shadow: none; } }
    </style>
</head>
<body>
    <h1 style="text-align:center; color:#1B5E20; margin-bottom: 24px;">🐄 FarmShield Livestock Ear Tag Badges (MRL & AMU Verified)</h1>
    <div class="grid">
"""
    for a in animals:
        badge_path = f"tag_{a['animal_code']}.png"
        html_content += f"""
        <div class="card">
            <div class="header">
                <h2>FARMSHIELD FOOD SAFETY PASSPORT</h2>
                <p>MRL & AMU Withdrawal Compliance</p>
            </div>
            <div class="qr-box">
                <img src="{badge_path}" style="width: 220px; height: 220px; object-fit: contain;" alt="QR {a['animal_code']}" />
            </div>
            <div class="tag-id">{a['animal_code']}</div>
            <div class="details">{a['species']} • {a['breed']} • {a['sex']} ({a['weight_kg']} kg)</div>
            <div style="font-size:12px; color:#2E7D32; font-weight:bold;">Purpose: {a['purpose']} | Farm: {a['farm_id']}</div>
            <div class="notice">🔍 Scan with any smartphone to verify clearance status</div>
        </div>
"""
    html_content += """
    </div>
</body>
</html>
"""
    html_file = os.path.join(OUTPUT_DIR, "printable_ear_tags.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[OK] Generated printable HTML sheet: {html_file}")

if __name__ == "__main__":
    print("[INFO] Generating Persistent Livestock QR Badges...")
    for animal in ANIMALS:
        generate_ear_tag_badge(animal)
    generate_html_printable_sheet(ANIMALS)
    print(f"[SUCCESS] All QR Badges saved to: {OUTPUT_DIR}")
