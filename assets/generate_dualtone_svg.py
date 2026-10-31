import os

P_LEFT_EAR = (74.00, 104.38)
P_RIGHT_EAR = (503.00, 104.38)
P_INNER_VALLEY = (310.76, 236.00)
P_RIGHT_EAR_BASE = (465.51, 341.00)
P_SLASH_END = (461.36, 369.00)
P_LEFT_EYE_TOP = (169.85, 379.00)
P_LEFT_CHEEK = (122.55, 412.00)
P_RIGHT_CHEEK = (454.00, 412.00)
P_CHIN = (288.50, 524.00)

mid_ear_base = (
    (P_INNER_VALLEY[0] + P_RIGHT_EAR_BASE[0]) / 2.0,
    (P_INNER_VALLEY[1] + P_RIGHT_EAR_BASE[1]) / 2.0
)

star = [
    (364.00, 374.13),
    (378.00, 395.64),
    (407.00, 378.83),
    (399.49, 411.00),
    (380.63, 421.00),
    (370.00, 450.25),
    (361.00, 430.40),
    (349.00, 435.44),
    (305.60, 439.00),
    (359.55, 407.00),
]

slit = [
    (169.85, 379.00),
    (176.67, 408.00),
    (179.00, 412.19),
    (224.00, 434.50),
    (271.00, 439.42),
]

def make_d(pts):
    return 'M ' + ' L '.join(f'{x:.2f} {y:.2f}' for x, y in pts) + ' Z'

f_lower = [P_LEFT_EYE_TOP, P_LEFT_CHEEK, P_CHIN, P_RIGHT_CHEEK, P_SLASH_END]
d_lower_compound = f"{make_d(f_lower)} {make_d(star)} {make_d(slit)}"

f_m_left = [P_LEFT_CHEEK, P_LEFT_EAR, P_LEFT_EYE_TOP]
f_z_body = [P_LEFT_EYE_TOP, P_LEFT_EAR, P_SLASH_END]
f_m_right = [P_INNER_VALLEY, P_RIGHT_EAR, mid_ear_base]
f_z_right = [mid_ear_base, P_RIGHT_EAR, P_RIGHT_EAR_BASE]

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 585 580" width="585" height="580">
  <defs>
    <style>
      :root {{
        --logo-face: #12151c;
        --logo-m: #f59e0b;
        --logo-m-dark: #d97706;
        --logo-z: #00e5ff;
        --logo-z-dark: #00b4d8;
      }}
      .logo-face {{ fill: var(--logo-face, #12151c); }}
      .logo-m {{ fill: var(--logo-m, #f59e0b); }}
      .logo-m-inner {{ fill: var(--logo-m-dark, #d97706); }}
      .logo-z {{ fill: var(--logo-z, #00e5ff); }}
      .logo-z-ear {{ fill: var(--logo-z-dark, #00b4d8); }}
    </style>
  </defs>

  <!-- Base Mask (Jaw & Cheeks with Eye Cutouts) -->
  <path class="logo-face" fill-rule="evenodd" d="{d_lower_compound}" />

  <!-- Monogram M: Left Flank -->
  <path class="logo-m logo-m-left" d="{make_d(f_m_left)}" />

  <!-- Monogram Z: Forehead Wedge (Lines 1 & 2) -->
  <path class="logo-z logo-z-body" d="{make_d(f_z_body)}" />

  <!-- Monogram M: Right Ear Inner V-Slope -->
  <path class="logo-m logo-m-inner" d="{make_d(f_m_right)}" />

  <!-- Monogram Z: Right Ear Outer Stroke (Line 3) -->
  <path class="logo-z logo-z-ear" d="{make_d(f_z_right)}" />
</svg>
'''

output_path = os.path.join(os.path.dirname(__file__), "logo-dualtone.svg")
with open(output_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Successfully wrote {output_path} ({len(svg_content)} bytes).")
