import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
tsx = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide\src\app\components\HebronGuide.tsx'
c = open(tsx, encoding='utf-8', errors='replace').read()

# Find and replace the church hub tab section
old_start = '        {/* ── TAB 5: 허브교회 네트워크 ── */}'
old_end = "          </div>\n        )}"

# Find the section
start_idx = c.find(old_start)
if start_idx == -1:
    print('START NOT FOUND')
    exit()

# Find the closing of this tab's content - look for the next tab or end of tabs section
# Find )} after the tab content
search_from = start_idx + len(old_start)
# Find the matching close
depth = 0
i = search_from
while i < len(c):
    if c[i:i+2] == '{s' or c[i:i+2] == '{{':
        depth += 1
    elif c[i] == '{':
        depth += 1
    elif c[i] == '}':
        depth -= 1
        if depth < 0:
            break
    i += 1

end_idx = c.find('\n        )}\n', start_idx + 100)
if end_idx == -1:
    print('END NOT FOUND')
    # Try alternate ending
    end_idx = c.find('        )}\n      </div>', start_idx)
    print('Alt end:', end_idx)
    exit()

end_idx += len('\n        )}\n')
old_section = c[start_idx:end_idx]
print(f'Found section: {len(old_section)} chars')
print('First 200:', old_section[:200])
print('Last 200:', old_section[-200:])
