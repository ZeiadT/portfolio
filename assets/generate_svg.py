import numpy as np

# Exact mathematical vertices
body = [
    (74.00, 104.38),
    (461.36, 369.00),
    (454.00, 412.00),
    (288.50, 524.00),
    (122.55, 412.00),
]

ear = [
    (503.00, 104.38),
    (465.51, 341.00),
    (310.76, 236.00),
]

star_eye = [
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

slit_eye = [
    (169.85, 379.00),
    (176.67, 408.00),
    (179.00, 412.19),
    (224.00, 434.50),
    (271.00, 439.42),
]

def make_d(pts):
    return 'M ' + ' L '.join(f'{x:.2f} {y:.2f}' for x, y in pts) + ' Z'

d_total = '\n    '.join([
    make_d(body),
    make_d(ear),
    make_d(star_eye),
    make_d(slit_eye)
])

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 585 580" width="585" height="580" fill="currentColor">
  <!-- Clean Vector Cat Mask Logo -->
  <path fill-rule="evenodd" d="
    {d_total}
  " />
</svg>
'''

with open("logo.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Generated logo.svg successfully ({len(svg_content)} bytes).")
