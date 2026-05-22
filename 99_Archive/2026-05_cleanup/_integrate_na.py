"""
HebronGuide NA Extended Cities Integration Script
Adds TOP5_FOOD for 19 remaining NA cities
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\_temp_content'
TSX  = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide\src\app\components\HebronGuide.tsx'

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
        return f'const {name}: Top5Item[] = [];'

print('Reading temp files...')
tier_a  = clean_ts(open(f'{BASE}\\na_tier_a.ts',   encoding='utf-8', errors='replace').read())
tier_b  = clean_ts(open(f'{BASE}\\na_tier_b.ts',   encoding='utf-8', errors='replace').read())
mil     = clean_ts(open(f'{BASE}\\na_military.ts', encoding='utf-8', errors='replace').read())
can     = clean_ts(open(f'{BASE}\\canada_tier_b.ts',encoding='utf-8', errors='replace').read())

print('\nExtracting arrays...')
food_block = '\n\n'.join([
    '/* ─────────────────────────────────────────',
    '   북미 확장 도시 TOP5_FOOD',
    '   Chicago · DC · San Diego · Honolulu · Portland · Denver',
    '   Phoenix · Charlotte · Raleigh · Columbus · Minneapolis',
    '   Tucson · Fayetteville · Killeen · Anchorage',
    '   Calgary · Edmonton · Ottawa · Winnipeg',
    '────────────────────────────────────────── */',
    extract_array(tier_a, 'TOP5_FOOD_CHICAGO'),
    extract_array(tier_a, 'TOP5_FOOD_DC'),
    extract_array(tier_a, 'TOP5_FOOD_SANDIEGO'),
    extract_array(tier_a, 'TOP5_FOOD_HONOLULU'),
    extract_array(tier_a, 'TOP5_FOOD_PORTLAND'),
    extract_array(tier_a, 'TOP5_FOOD_DENVER'),
    extract_array(tier_b, 'TOP5_FOOD_PHOENIX'),
    extract_array(tier_b, 'TOP5_FOOD_CHARLOTTE'),
    extract_array(tier_b, 'TOP5_FOOD_RALEIGH'),
    extract_array(tier_b, 'TOP5_FOOD_COLUMBUS'),
    extract_array(tier_b, 'TOP5_FOOD_MINNEAPOLIS'),
    extract_array(mil,    'TOP5_FOOD_TUCSON'),
    extract_array(mil,    'TOP5_FOOD_FAYETTEVILLE'),
    extract_array(mil,    'TOP5_FOOD_KILLEEN'),
    extract_array(mil,    'TOP5_FOOD_ANCHORAGE'),
    extract_array(can,    'TOP5_FOOD_CALGARY'),
    extract_array(can,    'TOP5_FOOD_EDMONTON'),
    extract_array(can,    'TOP5_FOOD_OTTAWA'),
    extract_array(can,    'TOP5_FOOD_WINNIPEG'),
])

map_additions = """
  // 북미 확장 도시
  chicago:       TOP5_FOOD_CHICAGO,
  dc:            TOP5_FOOD_DC,
  sandiego:      TOP5_FOOD_SANDIEGO,
  honolulu:      TOP5_FOOD_HONOLULU,
  portland:      TOP5_FOOD_PORTLAND,
  denver:        TOP5_FOOD_DENVER,
  phoenix:       TOP5_FOOD_PHOENIX,
  charlotte:     TOP5_FOOD_CHARLOTTE,
  raleigh:       TOP5_FOOD_RALEIGH,
  columbus:      TOP5_FOOD_COLUMBUS,
  minneapolis:   TOP5_FOOD_MINNEAPOLIS,
  tucson:        TOP5_FOOD_TUCSON,
  fayetteville:  TOP5_FOOD_FAYETTEVILLE,
  killeen:       TOP5_FOOD_KILLEEN,
  anchorage:     TOP5_FOOD_ANCHORAGE,
  calgary:       TOP5_FOOD_CALGARY,
  edmonton:      TOP5_FOOD_EDMONTON,
  ottawa:        TOP5_FOOD_OTTAWA,
  winnipeg:      TOP5_FOOD_WINNIPEG,"""

print('\nReading HebronGuide.tsx...')
main = open(TSX, encoding='utf-8', errors='replace').read()
orig_len = len(main)

# Insert food block before the existing international cities comment
TARGET1 = '/* ─────────────────────────────────────────\n   국제도시 TOP5_FOOD — 한국 레스토랑'
if TARGET1 in main:
    main = main.replace(TARGET1, food_block + '\n\n' + TARGET1, 1)
    print('✅ STEP 1: Inserted 19 city TOP5_FOOD arrays')
else:
    # Fallback: insert before CITY_RESTAURANT_TOP5_MAP comment
    TARGET1B = '// 도시 slug → 검증된 맛집 TOP5 목록 반환 (맛집 탭 카드용)\nconst CITY_RESTAURANT_TOP5_MAP'
    if TARGET1B in main:
        main = main.replace(TARGET1B, food_block + '\n\n' + TARGET1B, 1)
        print('✅ STEP 1 (fallback): Inserted 19 city TOP5_FOOD arrays')
    else:
        print('❌ STEP 1 FAILED')

# Add to map - after the international cities section
TARGET2 = '  busan:         TOP5_FOOD_BUSAN,\n};'
if TARGET2 in main:
    main = main.replace(TARGET2, '  busan:         TOP5_FOOD_BUSAN,' + map_additions + '\n};', 1)
    print('✅ STEP 2: Added 19 cities to CITY_RESTAURANT_TOP5_MAP')
else:
    print('❌ STEP 2 FAILED: busan entry not found in map')
    # Try alternate
    TARGET2B = '  monterrey:     TOP5_RESTAURANTS_MONTERREY,\n  // 국제도시 추가'
    if TARGET2B in main:
        print('  Found alternate target')

print(f'\nFile: {orig_len:,} → {len(main):,} chars (+{len(main)-orig_len:,})')
open(TSX, 'w', encoding='utf-8').write(main)
print('✅ HebronGuide.tsx updated!')
