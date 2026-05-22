"""
HebronGuide International City Integration Script
Integrates TOP5_FOOD arrays and Seoul/Busan data into HebronGuide.tsx
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE  = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\_temp_content'
TSX   = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide\src\app\components\HebronGuide.tsx'

def clean_ts(content):
    content = re.sub(r'```typescript\s*', '', content)
    content = re.sub(r'```\s*', '', content)
    content = re.sub(r'interface\s+Top5Item\s*\{[^}]+\}', '', content, flags=re.DOTALL)
    content = content.replace('export const ', 'const ')
    return content.strip()

def extract_array(content, name):
    pattern = rf'(const {name}: Top5Item\[\] = \[[\s\S]*?\];)'
    m = re.search(pattern, content)
    if m:
        print(f'  ✅ {name}')
        return m.group(1)
    else:
        print(f'  ❌ MISSING: {name}')
        return f'// MISSING: {name}\nconst {name}: Top5Item[] = [];'

# Read temp files
print('Reading temp files...')
jk  = clean_ts(open(f'{BASE}\\japan_korea.ts',       encoding='utf-8', errors='replace').read())
eu  = clean_ts(open(f'{BASE}\\europe.ts',            encoding='utf-8', errors='replace').read())
sea = clean_ts(open(f'{BASE}\\sea_me.ts',            encoding='utf-8', errors='replace').read())
oc  = clean_ts(open(f'{BASE}\\oceania_latam.ts',     encoding='utf-8', errors='replace').read())

print('\nExtracting arrays...')

# --- TOP5_FOOD arrays ---
food_block = '\n\n'.join([
    '/* ─────────────────────────────────────────',
    '   국제도시 TOP5_FOOD — 한국 레스토랑',
    '   Tokyo · Osaka · Seoul · Busan',
    '   Europe · SE Asia · Oceania',
    '────────────────────────────────────────── */',
    extract_array(jk,  'TOP5_FOOD_TOKYO'),
    extract_array(jk,  'TOP5_FOOD_OSAKA'),
    extract_array(jk,  'TOP5_FOOD_SEOUL'),
    extract_array(jk,  'TOP5_FOOD_BUSAN'),
    extract_array(eu,  'TOP5_FOOD_LONDON'),
    extract_array(eu,  'TOP5_FOOD_PARIS'),
    extract_array(eu,  'TOP5_FOOD_BERLIN'),
    extract_array(eu,  'TOP5_FOOD_FRANKFURT'),
    extract_array(sea, 'TOP5_FOOD_SINGAPORE'),
    extract_array(sea, 'TOP5_FOOD_BANGKOK'),
    extract_array(sea, 'TOP5_FOOD_HOCHIMINH'),
    extract_array(sea, 'TOP5_FOOD_DUBAI'),
    extract_array(oc,  'TOP5_FOOD_SYDNEY'),
    extract_array(oc,  'TOP5_FOOD_MELBOURNE'),
    extract_array(oc,  'TOP5_FOOD_BRISBANE'),
    extract_array(oc,  'TOP5_FOOD_PERTH'),
    extract_array(oc,  'TOP5_FOOD_AUCKLAND'),
    extract_array(oc,  'TOP5_FOOD_SAOPAULO'),
])

# --- Seoul/Busan SETTLE + EXPLORE ---
seoul_busan_block = '\n\n'.join([
    '/* ── 서울 (SEOUL) ── */',
    extract_array(jk, 'TOP5_SETTLE_SEOUL'),
    extract_array(jk, 'TOP5_EXPLORE_SEOUL'),
    '/* ── 부산 (BUSAN) ── */',
    extract_array(jk, 'TOP5_SETTLE_BUSAN'),
    extract_array(jk, 'TOP5_EXPLORE_BUSAN'),
])

# --- CITY_RESTAURANT_TOP5_MAP additions ---
map_additions = """
  // 국제도시 추가
  sydney:        TOP5_FOOD_SYDNEY,
  melbourne:     TOP5_FOOD_MELBOURNE,
  brisbane:      TOP5_FOOD_BRISBANE,
  perth:         TOP5_FOOD_PERTH,
  auckland:      TOP5_FOOD_AUCKLAND,
  saopaulo:      TOP5_FOOD_SAOPAULO,
  london:        TOP5_FOOD_LONDON,
  paris:         TOP5_FOOD_PARIS,
  berlin:        TOP5_FOOD_BERLIN,
  frankfurt:     TOP5_FOOD_FRANKFURT,
  singapore:     TOP5_FOOD_SINGAPORE,
  bangkok:       TOP5_FOOD_BANGKOK,
  hochiminh:     TOP5_FOOD_HOCHIMINH,
  dubai:         TOP5_FOOD_DUBAI,
  tokyo:         TOP5_FOOD_TOKYO,
  osaka:         TOP5_FOOD_OSAKA,
  seoul:         TOP5_FOOD_SEOUL,
  busan:         TOP5_FOOD_BUSAN,"""

# Read main file
print('\nReading HebronGuide.tsx...')
main = open(TSX, encoding='utf-8', errors='replace').read()
original_len = len(main)

# ── STEP 1: Insert food_block before CITY_RESTAURANT_TOP5_MAP
TARGET1 = '// 도시 slug → 검증된 맛집 TOP5 목록 반환 (맛집 탭 카드용)\nconst CITY_RESTAURANT_TOP5_MAP'
if TARGET1 in main:
    main = main.replace(TARGET1, food_block + '\n\n' + TARGET1, 1)
    print('✅ STEP 1: Inserted TOP5_FOOD arrays before CITY_RESTAURANT_TOP5_MAP')
else:
    print('❌ STEP 1 FAILED: Could not find CITY_RESTAURANT_TOP5_MAP target')

# ── STEP 2: Insert Seoul/Busan settle/explore before Tokyo block
TARGET2 = '/* ── 도쿄 (TOKYO) ── */'
if TARGET2 in main:
    main = main.replace(TARGET2, seoul_busan_block + '\n\n' + TARGET2, 1)
    print('✅ STEP 2: Inserted Seoul/Busan settle/explore before Tokyo')
else:
    print('❌ STEP 2 FAILED: Could not find Tokyo block target')

# ── STEP 3: Add international cities to CITY_RESTAURANT_TOP5_MAP
TARGET3 = '  monterrey:     TOP5_RESTAURANTS_MONTERREY,\n};'
REPLACEMENT3 = '  monterrey:     TOP5_RESTAURANTS_MONTERREY,' + map_additions + '\n};'
if TARGET3 in main:
    main = main.replace(TARGET3, REPLACEMENT3, 1)
    print('✅ STEP 3: Added 18 cities to CITY_RESTAURANT_TOP5_MAP')
else:
    print('❌ STEP 3 FAILED: Could not find monterrey line in map')

# ── STEP 4: Add Seoul/Busan to SETTLE chain
TARGET4 = '            useCityConfig().slug === "seattle"    ? TOP5_SETTLE :'
REPLACEMENT4 = ('            useCityConfig().slug === "seoul"       ? TOP5_SETTLE_SEOUL :\n'
                '            useCityConfig().slug === "busan"       ? TOP5_SETTLE_BUSAN :\n'
                + TARGET4)
if TARGET4 in main:
    main = main.replace(TARGET4, REPLACEMENT4, 1)
    print('✅ STEP 4: Added Seoul/Busan to SETTLE chain')
else:
    print('❌ STEP 4 FAILED: Could not find SETTLE chain target')

# ── STEP 5: Add Seoul/Busan to EXPLORE chain
TARGET5 = '              slug === "seattle"      ? TOP5_EXPLORE :'
REPLACEMENT5 = ('              slug === "seoul"          ? TOP5_EXPLORE_SEOUL :\n'
                '              slug === "busan"          ? TOP5_EXPLORE_BUSAN :\n'
                + TARGET5)
if TARGET5 in main:
    main = main.replace(TARGET5, REPLACEMENT5, 1)
    print('✅ STEP 5: Added Seoul/Busan to EXPLORE chain')
else:
    print('❌ STEP 5 FAILED: Could not find EXPLORE chain target')

# Write result
print(f'\nFile size: {original_len:,} → {len(main):,} chars (+{len(main)-original_len:,})')
open(TSX, 'w', encoding='utf-8').write(main)
print('✅ HebronGuide.tsx written successfully!')
