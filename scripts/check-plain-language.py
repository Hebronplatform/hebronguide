# -*- coding: utf-8 -*-
# 믿지 않는 사람이 처음 보는 화면에 '교회 안에서만 쓰는 말'이 얼마나 있는지 센다.
# 목사님 지시(2026-09-21): 환대의 정신은 흐르되, 말은 누구나 아는 말로.
import io, os, re
os.chdir(r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide')

# 등급: 3=교회 밖에서 거의 안 씀 / 2=알긴 아는데 종교로 읽힘 / 1=경계
WORDS = {
    3: ['성도', '목장', '간증', '영혼 구원', '영혼구원', '제자 훈련', '제자훈련',
        '전도', '복음', '말씀', '주님', '하나님', '예수', '기도회', '수양회',
        '선교사', '사역', '축복', '은혜', '섬김', '예배', '찬양', '신앙'],
    2: ['교회', '목사', '선교', '나그네', '환대', '공동체', '제단', '연합'],
}

PAGES = [
    ('랜딩 첫 화면',      'index.html'),
    ('환대 게시판',        'hebronguide/public/hospitality-board.html'),
    ('교회 등록',          'hebronguide/public/church-join.html'),
    ('사업체 등록',        'hebronguide/public/biz-join.html'),
    ('컨퍼런스',           'hebronguide/public/event-planting-seed-2026.html'),
]

def visible(p):
    s = io.open(p, encoding='utf-8').read()
    s = re.sub(r'<script.*?</script>', ' ', s, flags=re.S)
    s = re.sub(r'<style.*?</style>', ' ', s, flags=re.S)
    s = re.sub(r'<!--.*?-->', ' ', s, flags=re.S)
    # 영어 span 은 빼고 한글만
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', s)

for label, p in PAGES:
    if not os.path.exists(p):
        print('  (없음) %s' % p); continue
    t = visible(p)
    hits3, hits2 = [], []
    for lvl, ws in WORDS.items():
        for w in ws:
            n = t.count(w)
            if n:
                (hits3 if lvl == 3 else hits2).append('%s×%d' % (w, n))
    print('── %s' % label)
    print('   [교회 안에서만] %s' % (', '.join(hits3) if hits3 else '없음'))
    print('   [종교로 읽힘]   %s' % (', '.join(hits2) if hits2 else '없음'))
    print()
