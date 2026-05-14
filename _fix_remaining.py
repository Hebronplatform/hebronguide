import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\_temp_content'
TSX  = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide\src\app\components\HebronGuide.tsx'

def clean(c):
    c = re.sub(r'```\w*\s*', '', c)
    c = c.replace('export const ', 'const ')
    return c

def get_array(content, src_name):
    p = rf'(const {src_name}: Top5Item\[\] = \[[\s\S]*?\];)'
    m = re.search(p, content)
    return m.group(1) if m else None

def replace_renamed(main, target_name, array_str):
    """Replace target array in main, renaming the array to target_name"""
    old_name = re.match(r'const (\w+):', array_str).group(1)
    renamed = array_str.replace(f'const {old_name}:', f'const {target_name}:', 1)
    pattern = rf'const {target_name}: Top5Item\[\] = \[[\s\S]*?\];'
    if re.search(pattern, main):
        result = re.sub(pattern, renamed, main, count=1)
        print(f'  OK: {old_name} -> {target_name}')
        return result
    else:
        print(f'  MISS: {target_name} not in main')
        return main

main = open(TSX, encoding='utf-8', errors='replace').read()

# DC
us_a = clean(open(BASE + r'\verified_us_tier_a.ts', encoding='utf-8', errors='replace').read())
arr = get_array(us_a, 'TOP5_FOOD_DC_ANNANDALE')
if arr: main = replace_renamed(main, 'TOP5_FOOD_DC', arr)

# SanDiego
arr = get_array(us_a, 'TOP5_FOOD_SAN_DIEGO')
if arr: main = replace_renamed(main, 'TOP5_FOOD_SANDIEGO', arr)

# HoChiMinh
sea = clean(open(BASE + r'\verified_sea.ts', encoding='utf-8', errors='replace').read())
arr = get_array(sea, 'TOP5_FOOD_HO_CHI_MINH')
if arr: main = replace_renamed(main, 'TOP5_FOOD_HOCHIMINH', arr)

# SaoPaulo
oc = clean(open(BASE + r'\verified_oceania.ts', encoding='utf-8', errors='replace').read())
arr = get_array(oc, 'TOP5_FOOD_SAO_PAULO')
if arr: main = replace_renamed(main, 'TOP5_FOOD_SAOPAULO', arr)

open(TSX, 'w', encoding='utf-8').write(main)
print('Done!')
