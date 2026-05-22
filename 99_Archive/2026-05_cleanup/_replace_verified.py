"""
Replace AI-generated TOP5_FOOD arrays with verified data from Korean media directories
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
        return m.group(1)
    return None

def replace_array_in_main(main, name, new_array):
    pattern = rf'const {name}: Top5Item\[\] = \[[\s\S]*?\];'
    if re.search(pattern, main):
        main = re.sub(pattern, new_array, main, count=1)
        print(f'  ✅ Replaced {name}')
        return main
    else:
        print(f'  ⚠️  {name} not found in main file — skipping')
        return main

print('Reading verified files...')
files = {
    'us_a':     clean_ts(open(f'{BASE}\\verified_us_tier_a.ts',  encoding='utf-8', errors='replace').read()),
    'sea':      clean_ts(open(f'{BASE}\\verified_sea.ts',         encoding='utf-8', errors='replace').read()),
    'europe':   clean_ts(open(f'{BASE}\\verified_europe.ts',      encoding='utf-8', errors='replace').read()),
    'oceania':  clean_ts(open(f'{BASE}\\verified_oceania.ts',     encoding='utf-8', errors='replace').read()),
    'jk':       clean_ts(open(f'{BASE}\\verified_japan_korea.ts', encoding='utf-8', errors='replace').read()),
    'can_mil':  clean_ts(open(f'{BASE}\\verified_canada_mil.ts',  encoding='utf-8', errors='replace').read()),
}

# Map: array_name -> source_file_key
replacements = {
    # US Tier A verified
    'TOP5_FOOD_CHICAGO':       'us_a',
    'TOP5_FOOD_DC':            'us_a',
    'TOP5_FOOD_SANDIEGO':      'us_a',
    'TOP5_FOOD_PHOENIX':       'us_a',
    # SE Asia verified
    'TOP5_FOOD_SINGAPORE':     'sea',
    'TOP5_FOOD_BANGKOK':       'sea',
    'TOP5_FOOD_HOCHIMINH':     'sea',
    # Europe + Dubai verified
    'TOP5_FOOD_LONDON':        'europe',
    'TOP5_FOOD_FRANKFURT':     'europe',
    'TOP5_FOOD_BERLIN':        'europe',
    'TOP5_FOOD_PARIS':         'europe',
    'TOP5_FOOD_DUBAI':         'europe',
    # Oceania + Sao Paulo verified
    'TOP5_FOOD_SYDNEY':        'oceania',
    'TOP5_FOOD_MELBOURNE':     'oceania',
    'TOP5_FOOD_BRISBANE':      'oceania',
    'TOP5_FOOD_PERTH':         'oceania',
    'TOP5_FOOD_AUCKLAND':      'oceania',
    'TOP5_FOOD_SAOPAULO':      'oceania',
    # Japan + Korea verified
    'TOP5_FOOD_TOKYO':         'jk',
    'TOP5_FOOD_OSAKA':         'jk',
    'TOP5_FOOD_SEOUL':         'jk',
    'TOP5_FOOD_BUSAN':         'jk',
    # Canada + Military verified
    'TOP5_FOOD_CALGARY':       'can_mil',
    'TOP5_FOOD_EDMONTON':      'can_mil',
    'TOP5_FOOD_OTTAWA':        'can_mil',
    'TOP5_FOOD_WINNIPEG':      'can_mil',
    'TOP5_FOOD_KILLEEN':       'can_mil',
    'TOP5_FOOD_FAYETTEVILLE':  'can_mil',
    'TOP5_FOOD_ANCHORAGE':     'can_mil',
}

print(f'\nReading HebronGuide.tsx ({len(open(TSX, encoding="utf-8", errors="replace").read()):,} chars)...')
main = open(TSX, encoding='utf-8', errors='replace').read()
orig_len = len(main)

replaced = 0
skipped = 0
print('\nReplacing arrays with verified data...')
for name, src_key in replacements.items():
    new_array = extract_array(files[src_key], name)
    if new_array:
        main = replace_array_in_main(main, name, new_array)
        replaced += 1
    else:
        print(f'  ❌ {name} not found in {src_key} — keeping existing')
        skipped += 1

print(f'\nResults: {replaced} replaced, {skipped} skipped')
print(f'File: {orig_len:,} → {len(main):,} chars')
open(TSX, 'w', encoding='utf-8').write(main)
print('✅ HebronGuide.tsx updated with verified restaurant data!')
