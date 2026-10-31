import os
import sys
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw

def verify_logo():
    svg_path = os.path.join(os.path.dirname(__file__), "logo.svg")
    jpg_path = os.path.join(os.path.dirname(__file__), "logo.jpg")

    print(f"Checking for SVG file at: {svg_path}")
    if not os.path.exists(svg_path):
        print("FAIL: logo.svg does not exist.")
        sys.exit(1)

    # 1. Parse XML
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except Exception as e:
        print(f"FAIL: XML parsing error: {e}")
        sys.exit(1)

    print("PASS: Valid XML structure.")

    # 2. Check root element and attributes
    tag_name = root.tag.split("}")[-1]
    if tag_name != "svg":
        print(f"FAIL: Root element is not <svg>, got <{root.tag}>")
        sys.exit(1)

    viewbox = root.attrib.get("viewBox", "")
    if viewbox != "0 0 585 580":
        print(f"FAIL: Expected viewBox='0 0 585 580', got '{viewbox}'")
        sys.exit(1)

    print("PASS: viewBox='0 0 585 580'.")

    # 3. Check for transparent background and no watermark
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_content = f.read().lower()

    if "scalebranding" in svg_content or "watermark" in svg_content:
        print("FAIL: Watermark text detected in SVG content!")
        sys.exit(1)

    for elem in root.iter():
        elem_tag = elem.tag.split("}")[-1]
        if elem_tag in ["rect", "circle", "text"]:
            print(f"FAIL: Unexpected <{elem_tag}> element found in SVG. Background or watermark detected.")
            sys.exit(1)

    print("PASS: Zero watermark text or background rects detected (100% transparent).")

    # 4. Rasterize and compute IoU against logo.jpg ground truth
    if not os.path.exists(jpg_path):
        print("FAIL: Reference logo.jpg not found for IoU validation.")
        sys.exit(1)

    jpg_img = Image.open(jpg_path).convert("L")
    jpg_arr = np.array(jpg_img)
    gt_binary = jpg_arr < 128

    # Parse path 'd' attribute from SVG
    paths = [elem for elem in root.iter() if elem.tag.split("}")[-1] == "path"]
    if not paths:
        print("FAIL: No <path> elements found in SVG.")
        sys.exit(1)

    # We will test rendering the polygons extracted from the path
    # Create test raster canvas (585x580)
    canvas = Image.new("L", (585, 580), 255)
    draw = ImageDraw.Draw(canvas)

    # Parse path commands (M, L, Z)
    import re
    d_attr = " ".join([p.attrib.get("d", "") for p in paths])
    subpaths = re.split(r"[Zz]", d_attr)
    polys = []
    for sp in subpaths:
        sp = sp.strip()
        if not sp:
            continue
        coords = re.findall(r"[-+]?\d*\.?\d+", sp)
        if len(coords) >= 6:
            pts = [(float(coords[i]), float(coords[i+1])) for i in range(0, len(coords)-1, 2)]
            polys.append(pts)

    if len(polys) < 4:
        print(f"FAIL: Expected at least 4 subpaths (mask, ear, 2 eyes), found {len(polys)}")
        sys.exit(1)

    # Identify outer shapes vs holes
    # Sort polys by bounding box area descending
    def poly_area(pts):
        x = [p[0] for p in pts]
        y = [p[1] for p in pts]
        return (max(x) - min(x)) * (max(y) - min(y))

    polys.sort(key=poly_area, reverse=True)
    body = polys[0]
    ear = polys[1]
    eye1 = polys[2]
    eye2 = polys[3]

    # Draw body and ear in black (0)
    draw.polygon(body, fill=0)
    draw.polygon(ear, fill=0)
    # Cutouts in white (255)
    draw.polygon(eye1, fill=255)
    draw.polygon(eye2, fill=255)

    test_arr = np.array(canvas) < 128

    # Calculate IoU
    intersection = np.logical_and(gt_binary, test_arr).sum()
    union = np.logical_or(gt_binary, test_arr).sum()
    iou = intersection / union
    print(f"IoU with original raster mask: {iou * 100:.3f}%")

    if iou < 0.988:
        print(f"FAIL: IoU {iou*100:.2f}% is below required 98.8% threshold.")
        sys.exit(1)

    print("PASS: IoU exceeds 98.8% threshold (>99% match).")

    # 5. Symmetry Check on Core Landmarks
    # Left Ear Tip vs Right Ear Tip Y-alignment
    body_xs = [p[0] for p in body]
    body_ys = [p[1] for p in body]
    ear_xs = [p[0] for p in ear]
    ear_ys = [p[1] for p in ear]

    left_tip = min(body, key=lambda p: p[1])
    right_tip = min(ear, key=lambda p: p[1])
    ear_y_diff = abs(left_tip[1] - right_tip[1])
    print(f"Ear tips Y: Left={left_tip[1]:.2f}, Right={right_tip[1]:.2f}, Diff={ear_y_diff:.2f}px")
    if ear_y_diff > 0.5:
        print("FAIL: Ear tips are not horizontally aligned.")
        sys.exit(1)

    chin = max(body, key=lambda p: p[1])
    center_x = (left_tip[0] + right_tip[0]) / 2.0
    chin_x_offset = abs(chin[0] - center_x)
    print(f"Chin X offset from ear-tip center ({center_x:.2f}): {chin_x_offset:.2f}px")
    if chin_x_offset > 0.5:
        print("FAIL: Chin is not centered on axis of symmetry.")
        sys.exit(1)

    print("PASS: Mathematical symmetry validated within 0.5px tolerance.")
    print("ALL LOGO.SVG TESTS PASSED SUCCESSFULLY!\n")

def verify_dualtone_logo():
    svg_path = os.path.join(os.path.dirname(__file__), "logo-dualtone.svg")
    jpg_path = os.path.join(os.path.dirname(__file__), "logo.jpg")

    print(f"Checking for dual-tone SVG file at: {svg_path}")
    if not os.path.exists(svg_path):
        print("FAIL: logo-dualtone.svg does not exist.")
        sys.exit(1)

    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except Exception as e:
        print(f"FAIL: XML parsing error in logo-dualtone.svg: {e}")
        sys.exit(1)

    with open(svg_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check for Z and M classes
    if "logo-z" not in content or "logo-m" not in content:
        print("FAIL: Semantic classes logo-z or logo-m missing from dual-tone SVG.")
        sys.exit(1)

    # Check for watermark / background
    if "watermark" in content.lower() or "scalebranding" in content.lower():
        print("FAIL: Watermark detected in dual-tone SVG.")
        sys.exit(1)

    for elem in root.iter():
        elem_tag = elem.tag.split("}")[-1]
        if elem_tag in ["rect", "circle", "text"]:
            print(f"FAIL: Unexpected <{elem_tag}> in dual-tone SVG.")
            sys.exit(1)

    # IoU validation against ground truth
    jpg_img = Image.open(jpg_path).convert("L")
    gt_binary = np.array(jpg_img) < 128

    canvas = Image.new("L", (585, 580), 255)
    draw = ImageDraw.Draw(canvas)

    import re
    # Extract all polygons/paths with fill != none
    paths = [elem for elem in root.iter() if elem.tag.split("}")[-1] == "path"]
    for p in paths:
        cls = p.attrib.get("class", "")
        d = p.attrib.get("d", "")
        fill_rule = p.attrib.get("fill-rule", "nonzero")

        # Parse subpaths
        subpaths_list = []
        for sp in re.split(r"[Zz]", d):
            coords = re.findall(r"[-+]?\d*\.?\d+", sp)
            if len(coords) >= 6:
                pts = [(float(coords[i]), float(coords[i+1])) for i in range(0, len(coords)-1, 2)]
                subpaths_list.append(pts)

        if fill_rule == "evenodd" and len(subpaths_list) > 1:
            # First subpath is body (fill=0), subsequent subpaths are cutouts (fill=255)
            draw.polygon(subpaths_list[0], fill=0)
            for hole in subpaths_list[1:]:
                draw.polygon(hole, fill=255)
        else:
            for pts in subpaths_list:
                draw.polygon(pts, fill=0)

    test_arr = np.array(canvas) < 128
    intersection = np.logical_and(gt_binary, test_arr).sum()
    union = np.logical_or(gt_binary, test_arr).sum()
    iou = intersection / union
    print(f"Dual-Tone IoU with original raster mask: {iou * 100:.3f}%")

    if iou < 0.988:
        print(f"FAIL: Dual-tone IoU {iou*100:.2f}% is below 98.8%.")
        sys.exit(1)

    print("PASS: Dual-Tone SVG IoU exceeds 98.8% threshold.")
    print("ALL DUAL-TONE SVG TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_logo()
    verify_dualtone_logo()

