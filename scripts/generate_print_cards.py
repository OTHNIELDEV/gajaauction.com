import os
import zipfile
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions: 96mm x 56mm at 300 DPI = 1134 x 661 px
W, H = 1134, 661

FONT_SERIF = '/System/Library/Fonts/Supplemental/Times New Roman.ttf'
FONT_SERIF_BOLD = '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf'
FONT_MYUNGJO = '/System/Library/Fonts/Supplemental/AppleMyungjo.ttf'
FONT_GOTHIC = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

def get_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except:
        return ImageFont.load_default()

logo_dark = Image.open('src/assets/images/logo_dark_trans.png').convert('RGBA')
qr_src = Image.open('public/gaja_qr_code.png').convert('RGBA')

THEMES = {
    'navy': {
        'name_kr': '미드나이트 네이비',
        'front_bg': (10, 24, 38),
        'front_text': (248, 244, 230),
        'front_gold': (212, 175, 55),
        'front_sub': (185, 170, 140),
        'back_band_bg': (10, 24, 38),
        'back_main_bg': (252, 250, 245),
        'back_corp': (10, 24, 38),
        'back_name': (15, 25, 35),
        'back_gold': (185, 145, 40),
        'back_sub': (95, 105, 115),
        'back_line': (212, 175, 55, 90),
        'back_contact_val': (25, 35, 45),
        'back_contact_lbl': (185, 145, 40),
        'back_work_bg': (242, 238, 230),
        'back_work_text': (75, 85, 95),
        'back_work_label': (185, 145, 40)
    },
    'ivory': {
        'name_kr': '아키텍처 아이보리',
        'front_bg': (250, 247, 240),
        'front_text': (10, 24, 38),
        'front_gold': (185, 145, 40),
        'front_sub': (100, 110, 120),
        'back_band_bg': (250, 247, 240),
        'back_main_bg': (10, 24, 38),
        'back_corp': (248, 244, 230),
        'back_name': (255, 255, 255),
        'back_gold': (212, 175, 55),
        'back_sub': (175, 185, 195),
        'back_line': (212, 175, 55, 80),
        'back_contact_val': (240, 242, 245),
        'back_contact_lbl': (212, 175, 55),
        'back_work_bg': (15, 32, 48),
        'back_work_text': (175, 185, 195),
        'back_work_label': (212, 175, 55)
    },
    'emerald': {
        'name_kr': '딥 에메랄드',
        'front_bg': (18, 42, 33),
        'front_text': (248, 244, 230),
        'front_gold': (212, 175, 55),
        'front_sub': (180, 195, 185),
        'back_band_bg': (18, 42, 33),
        'back_main_bg': (252, 250, 245),
        'back_corp': (18, 42, 33),
        'back_name': (18, 35, 28),
        'back_gold': (185, 145, 40),
        'back_sub': (85, 105, 95),
        'back_line': (212, 175, 55, 90),
        'back_contact_val': (20, 35, 30),
        'back_contact_lbl': (185, 145, 40),
        'back_work_bg': (238, 243, 240),
        'back_work_text': (70, 90, 80),
        'back_work_label': (185, 145, 40)
    }
}

PEOPLE = {
    'leesangsoo': {
        'name_ko': '이 상 수',
        'name_en': 'SANG SOO LEE',
        'title': '대표이사',
        'cert': '공인중개사 · 투자자산운용사',
        'phone': '010-5439-5353',
        'second_label': 'F.',
        'second_contact': '0504-331-5353',
        'email': 'wise@exitwise.io',
        # 요청: 대출 제외
        'work_content': '경매 · NPL · 투자 · 중개 · 매매 · 컨설팅'
    },
    'jeongjaewon': {
        'name_ko': '정 재 원',
        'name_en': 'JAE WON CHUNG',
        'title': '영업팀장',
        'cert': '',
        'phone': '010-8916-1305',
        'second_label': 'T.',
        'second_contact': '02-6455-7063',
        'email': 'ickra345@gmail.com',
        'work_content': '부동산 컨설팅 · 시장조사 및 분석 · 자산관리 · 사업성 검토'
    }
}

def draw_bold(draw, pos, text, font, fill, weight=1):
    x, y = pos
    for dx in range(weight + 1):
        for dy in range(weight + 1):
            draw.text((x + dx, y + dy), text, font=font, fill=fill)

def draw_tracking(draw, pos, text, font, fill, tracking=2):
    x, y = pos
    cur_x = x
    for ch in text:
        draw.text((cur_x, y), ch, font=font, fill=fill)
        bbox = font.getbbox(ch)
        w = (bbox[2] - bbox[0]) if bbox else 10
        cur_x += w + tracking
    return cur_x - x

def get_tracking_width(text, font, tracking=2):
    w_total = 0
    for ch in text:
        bbox = font.getbbox(ch)
        w = (bbox[2] - bbox[0]) if bbox else 10
        w_total += w + tracking
    return w_total - tracking if text else 0

def render_front(theme_key):
    th = THEMES[theme_key]
    img = Image.new('RGBA', (W, H), th['front_bg'])
    draw = ImageDraw.Draw(img)

    emblem_size = 185
    emblem = logo_dark.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)

    f_corp_paren = get_font(FONT_MYUNGJO, 46)
    f_corp_main = get_font(FONT_MYUNGJO, 55)
    f_en = get_font(FONT_SERIF_BOLD, 22)

    en_text = 'GAJAASSET PARTNERS'
    en_tracking = 4
    en_width = get_tracking_width(en_text, f_en, en_tracking)

    bbox_p = f_corp_paren.getbbox('(주)')
    w_p = bbox_p[2] - bbox_p[0] + 6
    bbox_m = f_corp_main.getbbox('가자에셋파트너스')
    w_m = bbox_m[2] - bbox_m[0]
    corp_total_w = w_p + w_m

    text_block_w = max(corp_total_w, en_width)
    total_brand_w = emblem_size + 42 + text_block_w

    start_x = (W - total_brand_w) // 2
    emblem_y = (H - emblem_size) // 2

    img.paste(emblem, (start_x, emblem_y), emblem)

    text_x = start_x + emblem_size + 42
    corp_y = emblem_y + 38
    draw.text((text_x, corp_y + 6), '(주)', font=f_corp_paren, fill=th['front_text'])
    draw_bold(draw, (text_x + w_p, corp_y), '가자에셋파트너스', f_corp_main, th['front_text'], weight=1)

    en_y = corp_y + 70
    en_x = text_x + corp_total_w - en_width
    draw_tracking(draw, (en_x, en_y), en_text, f_en, th['front_gold'], tracking=en_tracking)

    return img

def render_back(person_key, theme_key, header_style='horizontal'):
    """
    header_style:
      - 'horizontal': (주)가자에셋파트너스 | 가자공인중개사사무소 나란히 배치
      - 'vertical':   (주)가자에셋파트너스 아래에 가자공인중개사사무소 위아래 2단 배치
    """
    th = THEMES[theme_key]
    p = PEOPLE[person_key]
    img = Image.new('RGBA', (W, H), th['back_main_bg'])
    draw = ImageDraw.Draw(img)

    # 1. Left vertical band (상하 완벽 중앙 균형 배치)
    band_w = 300
    draw.rectangle([0, 0, band_w, H], fill=th['back_band_bg'])
    draw.line([(band_w, 0), (band_w, H)], fill=th['back_line'], width=2)

    # Left band content vertically centered
    b_y = 115
    emblem_band_size = 115
    emblem_band = logo_dark.resize((emblem_band_size, emblem_band_size), Image.Resampling.LANCZOS)
    b_x = (band_w - emblem_band_size) // 2
    img.paste(emblem_band, (b_x, b_y), emblem_band)

    f_band_corp = get_font(FONT_MYUNGJO, 23)
    bbox_bc = f_band_corp.getbbox('(주)가자에셋파트너스')
    bc_w = bbox_bc[2] - bbox_bc[0]
    draw_bold(draw, ((band_w - bc_w) // 2, b_y + emblem_band_size + 14), '(주)가자에셋파트너스', f_band_corp, th['front_text'], weight=1)

    f_band_en = get_font(FONT_SERIF_BOLD, 13)
    en_band_text = 'GAJAASSET PARTNERS'
    en_band_track = 2
    en_band_w = get_tracking_width(en_band_text, f_band_en, en_band_track)
    draw_tracking(draw, ((band_w - en_band_w) // 2, b_y + emblem_band_size + 44), en_band_text, f_band_en, th['front_gold'], tracking=en_band_track)

    div_y = b_y + emblem_band_size + 76
    draw.line([(band_w // 2 - 35, div_y), (band_w // 2 + 35, div_y)], fill=th['front_gold'], width=1)

    qr_size = 135
    qr_img = qr_src.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    qr_x = (band_w - qr_size) // 2
    qr_y = div_y + 24
    img.paste(qr_img, (qr_x, qr_y), qr_img)

    f_qr_lbl = get_font(FONT_GOTHIC, 15, index=4)
    bbox_qr = f_qr_lbl.getbbox('WEBSITE')
    qr_lbl_w = bbox_qr[2] - bbox_qr[0]
    draw.text(((band_w - qr_lbl_w) // 2, qr_y + qr_size + 10), 'WEBSITE', font=f_qr_lbl, fill=th['front_gold'])

    # 2. Right Content Area (상하 완벽 중앙 밸런스 배치)
    rx = 360
    has_cert = bool(p['cert'])
    
    if person_key == 'leesangsoo':
        if header_style == 'horizontal':
            # Horizontal header layout (나란히 배치)
            head_y = 72
            name_y = 175
            line_y = 338
            addr_y = 366
            row1_y = 410
            row2_y = 448
            work_line_y = 508
            work_y = 530
        else:
            # Vertical header layout (위아래 배치)
            head_y = 62
            name_y = 182
            line_y = 345
            addr_y = 372
            row1_y = 414
            row2_y = 452
            work_line_y = 512
            work_y = 534
    else:
        # Jeong Jae Won balanced layout
        head_y = 78
        name_y = 192
        line_y = 345
        addr_y = 373
        row1_y = 419
        row2_y = 458
        work_line_y = 518
        work_y = 540

    # Render Header
    if person_key == 'leesangsoo':
        if header_style == 'horizontal':
            # 나란히 배열: (주)가자에셋파트너스  |  가자공인중개사사무소
            f_corp_p = get_font(FONT_MYUNGJO, 27)
            f_corp_m = get_font(FONT_MYUNGJO, 30)
            f_sep = get_font(FONT_GOTHIC, 22, index=2)
            f_realtor = get_font(FONT_MYUNGJO, 27)
            f_head_en = get_font(FONT_SERIF_BOLD, 15)

            # 1. (주)가자에셋파트너스
            draw.text((rx, head_y + 2), '(주)', font=f_corp_p, fill=th['back_corp'])
            bbox_hp = f_corp_p.getbbox('(주)')
            hp_w = bbox_hp[2] - bbox_hp[0] + 4
            draw_bold(draw, (rx + hp_w, head_y), '가자에셋파트너스', f_corp_m, th['back_corp'], weight=1)
            
            bbox_hm = f_corp_m.getbbox('가자에셋파트너스')
            hm_w = bbox_hm[2] - bbox_hm[0]
            cur_x = rx + hp_w + hm_w + 16

            # 2. 구분자 |
            draw.text((cur_x, head_y + 3), '|', font=f_sep, fill=th['back_gold'])
            cur_x += 18

            # 3. 가자공인중개사사무소
            draw_bold(draw, (cur_x, head_y + 2), '가자공인중개사사무소', f_realtor, th['back_corp'], weight=1)

            # 4. 영문 GAJAASSET PARTNERS
            head_en_text = 'GAJAASSET PARTNERS'
            head_en_track = 3
            draw_tracking(draw, (rx, head_y + 44), head_en_text, f_head_en, th['back_gold'], tracking=head_en_track)
        else:
            # 위아래 배열:
            # (주)가자에셋파트너스
            # 가자공인중개사사무소  GAJAASSET PARTNERS
            f_corp_p = get_font(FONT_MYUNGJO, 28)
            f_corp_m = get_font(FONT_MYUNGJO, 33)
            f_realtor = get_font(FONT_MYUNGJO, 27)
            f_head_en = get_font(FONT_SERIF_BOLD, 14)

            draw.text((rx, head_y + 2), '(주)', font=f_corp_p, fill=th['back_corp'])
            bbox_hp = f_corp_p.getbbox('(주)')
            hp_w = bbox_hp[2] - bbox_hp[0] + 4
            draw_bold(draw, (rx + hp_w, head_y), '가자에셋파트너스', f_corp_m, th['back_corp'], weight=1)

            # 행 2: 가자공인중개사사무소
            row2_hy = head_y + 42
            draw_bold(draw, (rx, row2_hy), '가자공인중개사사무소', f_realtor, th['back_gold'], weight=1)

            # 행 3: 영문
            row3_hy = row2_hy + 35
            head_en_text = 'GAJAASSET PARTNERS'
            head_en_track = 2
            draw_tracking(draw, (rx, row3_hy), head_en_text, f_head_en, th['back_sub'], tracking=head_en_track)
    else:
        # Standard Header for Jeong Jae Won
        f_head_paren = get_font(FONT_MYUNGJO, 30)
        f_head_corp = get_font(FONT_MYUNGJO, 35)
        f_head_en = get_font(FONT_SERIF_BOLD, 16)

        draw.text((rx, head_y + 3), '(주)', font=f_head_paren, fill=th['back_corp'])
        bbox_hp = f_head_paren.getbbox('(주)')
        hp_w = bbox_hp[2] - bbox_hp[0] + 4
        draw_bold(draw, (rx + hp_w, head_y), '가자에셋파트너스', f_head_corp, th['back_corp'], weight=1)

        head_en_text = 'GAJAASSET PARTNERS'
        head_en_track = 3
        draw_tracking(draw, (rx, head_y + 44), head_en_text, f_head_en, th['back_gold'], tracking=head_en_track)

    # Person Title & Name
    f_title = get_font(FONT_GOTHIC, 25, index=3)
    f_name = get_font(FONT_MYUNGJO, 46)
    f_en_name = get_font(FONT_SERIF, 23)

    draw.text((rx, name_y + 12), p['title'], font=f_title, fill=th['back_sub'])
    draw_bold(draw, (rx + 130, name_y), p['name_ko'], f_name, th['back_name'], weight=1)

    # English Name
    draw.text((rx, name_y + 68), p['name_en'], font=f_en_name, fill=th['back_name'])

    if has_cert:
        f_cert = get_font(FONT_GOTHIC, 20, index=3)
        draw.text((rx, name_y + 104), p['cert'], font=f_cert, fill=th['back_gold'])

    # Divider line
    draw.line([(rx, line_y), (1060, line_y)], fill=th['back_line'], width=2)

    # Address
    f_addr = get_font(FONT_GOTHIC, 22, index=2)
    draw.text((rx, addr_y), '경기도 성남시 분당구 수내로 54, 삼성보보스쉐르빌 2707호', font=f_addr, fill=th['back_sub'])

    # Contact lines
    f_lbl = get_font(FONT_GOTHIC, 22, index=4)
    f_val = get_font(FONT_GOTHIC, 23, index=3)

    draw.text((rx, row1_y), 'M.', font=f_lbl, fill=th['back_contact_lbl'])
    draw.text((rx + 38, row1_y), p['phone'], font=f_val, fill=th['back_contact_val'])

    col2_x = rx + 325
    draw.text((col2_x, row1_y), p['second_label'], font=f_lbl, fill=th['back_contact_lbl'])
    draw.text((col2_x + 38, row1_y), p['second_contact'], font=f_val, fill=th['back_contact_val'])

    draw.text((rx, row2_y), 'E.', font=f_lbl, fill=th['back_contact_lbl'])
    draw.text((rx + 38, row2_y), p['email'], font=f_val, fill=th['back_contact_val'])

    draw.text((col2_x, row2_y), 'W.', font=f_lbl, fill=th['back_contact_lbl'])
    draw.text((col2_x + 38, row2_y), 'www.gajaasset.com', font=f_val, fill=th['back_name'])

    # Bottom Business Scope
    draw.line([(rx, work_line_y), (1060, work_line_y)], fill=th['back_line'], width=1)

    f_work_lbl = get_font(FONT_GOTHIC, 20, index=4)
    f_work_sep = get_font(FONT_GOTHIC, 19, index=2)
    f_work_txt = get_font(FONT_GOTHIC, 20, index=3)

    draw.text((rx, work_y), '업무', font=f_work_lbl, fill=th['back_work_label'])
    
    bbox_wl = f_work_lbl.getbbox('업무')
    wl_w = bbox_wl[2] - bbox_wl[0]
    sep_x = rx + wl_w + 14
    draw.text((sep_x, work_y), '|', font=f_work_sep, fill=th['back_gold'])

    work_content = p.get('work_content', '경매 · NPL · 투자 · 중개 · 매매 · 컨설팅')
    draw.text((sep_x + 18, work_y), work_content, font=f_work_txt, fill=th['back_work_text'])

    return img

def create_preview_sheet(person_key):
    p = PEOPLE[person_key]
    card_w, card_h = 567, 330
    
    pad_x = 50
    pad_y = 60
    header_h = 175
    theme_gap = 45
    
    sheet_w = pad_x * 2 + card_w * 2 + 50
    sheet_h = header_h + (card_h + theme_gap) * 3 + pad_y
    
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (245, 246, 249, 255))
    sdraw = ImageDraw.Draw(sheet)
    
    f_sheet_title = get_font(FONT_MYUNGJO, 38)
    title_text = f'가자에셋파트너스 {p["title"]} {p["name_ko"]} 명함 인쇄 시안'
    bbox_st = f_sheet_title.getbbox(title_text)
    st_w = bbox_st[2] - bbox_st[0]
    draw_bold(sdraw, ((sheet_w - st_w) // 2, 35), title_text, f_sheet_title, (20, 30, 45), weight=1)
    
    f_sheet_sub = get_font(FONT_GOTHIC, 18, index=3)
    sub_text = '규격: 90×50mm (도련 3mm 포함 96×56mm) · 300 DPI 상업 인쇄용 규격'
    bbox_ss = f_sheet_sub.getbbox(sub_text)
    ss_w = bbox_ss[2] - bbox_ss[0]
    sdraw.text(((sheet_w - ss_w) // 2, 85), sub_text, font=f_sheet_sub, fill=(110, 120, 130))
    
    sdraw.line([(sheet_w // 2 - 180, 118), (sheet_w // 2 + 180, 118)], fill=(212, 175, 55, 120), width=1)
    
    f_label = get_font(FONT_GOTHIC, 21, index=4)
    f_col_lbl = get_font(FONT_GOTHIC, 19, index=4)
    
    current_y = header_h
    
    col1_x = pad_x
    col2_x = pad_x + card_w + 50
    sdraw.text((col1_x + (card_w - 60) // 2, current_y - 32), '[ 앞  면 ]', font=f_col_lbl, fill=(100, 110, 125))
    sdraw.text((col2_x + (card_w - 60) // 2, current_y - 32), '[ 뒷  면 ]', font=f_col_lbl, fill=(100, 110, 125))
    
    for theme in ['navy', 'ivory', 'emerald']:
        th_info = THEMES[theme]
        sdraw.text((pad_x, current_y - 32), f'● {th_info["name_kr"]}', font=f_label, fill=(35, 45, 60))
        
        front_img = render_front(theme).resize((card_w, card_h), Image.Resampling.LANCZOS)
        back_img = render_back(person_key, theme).resize((card_w, card_h), Image.Resampling.LANCZOS)
        
        for off in range(4, 0, -1):
            sdraw.rectangle([col1_x + off, current_y + off, col1_x + card_w + off, current_y + card_h + off], fill=(0, 0, 0, 15))
            sdraw.rectangle([col2_x + off, current_y + off, col2_x + card_w + off, current_y + card_h + off], fill=(0, 0, 0, 15))
            
        sheet.paste(front_img, (col1_x, current_y))
        sheet.paste(back_img, (col2_x, current_y))
        
        sdraw.rectangle([col1_x, current_y, col1_x + card_w, current_y + card_h], outline=(200, 205, 215), width=1)
        sdraw.rectangle([col2_x, current_y, col2_x + card_w, current_y + card_h], outline=(200, 205, 215), width=1)
        
        current_y += card_h + theme_gap
        
    return sheet

def create_leesangsoo_comparison_showcase():
    """
    이상수 대표 미드나이트 네이비 단독 비교 쇼케이스
    - 좌측: 타입 A [나란히 가로 배열]
    - 우측: 타입 B [위아래 2단 배열]
    두 배열을 한눈에 비교할 수 있는 300 DPI 정밀 시안 이미지 생성
    """
    card_w, card_h = 850, 495
    pad_x = 60
    pad_y = 60
    header_h = 165
    gap = 50
    
    sheet_w = pad_x * 2 + card_w * 2 + gap
    sheet_h = header_h + card_h + pad_y + 40
    
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (242, 244, 248, 255))
    sdraw = ImageDraw.Draw(sheet)
    
    # Title
    f_title = get_font(FONT_MYUNGJO, 40)
    title_text = '가자에셋파트너스 대표이사 이상수 [미드나이트 네이비] 배열 비교 시안'
    bbox_t = f_title.getbbox(title_text)
    t_w = bbox_t[2] - bbox_t[0]
    draw_bold(sdraw, ((sheet_w - t_w) // 2, 38), title_text, f_title, (15, 25, 40), weight=1)
    
    f_sub = get_font(FONT_GOTHIC, 19, index=3)
    sub_text = '상하 중간 밸런스 균형 · 업무 대출 제외 · 실물 규격 90×50mm (작업 96×56mm) · 300 DPI'
    bbox_sub = f_sub.getbbox(sub_text)
    sub_w = bbox_sub[2] - bbox_sub[0]
    sdraw.text(((sheet_w - sub_w) // 2, 95), sub_text, font=f_sub, fill=(100, 115, 130))
    
    sdraw.line([(sheet_w // 2 - 240, 130), (sheet_w // 2 + 240, 130)], fill=(212, 175, 55, 150), width=1)
    
    f_lbl = get_font(FONT_GOTHIC, 21, index=4)
    
    col1_x = pad_x
    col2_x = pad_x + card_w + gap
    card_y = header_h + 10
    
    sdraw.text((col1_x + (card_w - 320) // 2, card_y - 35), '[ 타입 A: 나란히 가로 배열 (추천) ]', font=f_lbl, fill=(20, 35, 55))
    sdraw.text((col2_x + (card_w - 270) // 2, card_y - 35), '[ 타입 B: 위아래 2단 배열 ]', font=f_lbl, fill=(20, 35, 55))
    
    img_horizontal = render_back('leesangsoo', 'navy', header_style='horizontal').resize((card_w, card_h), Image.Resampling.LANCZOS)
    img_vertical = render_back('leesangsoo', 'navy', header_style='vertical').resize((card_w, card_h), Image.Resampling.LANCZOS)
    
    for off in range(8, 0, -1):
        sdraw.rectangle([col1_x + off, card_y + off, col1_x + card_w + off, card_y + card_h + off], fill=(0, 0, 0, 12))
        sdraw.rectangle([col2_x + off, card_y + off, col2_x + card_w + off, card_y + card_h + off], fill=(0, 0, 0, 12))
        
    sheet.paste(img_horizontal, (col1_x, card_y))
    sheet.paste(img_vertical, (col2_x, card_y))
    
    sdraw.rectangle([col1_x, card_y, col1_x + card_w, card_y + card_h], outline=(200, 205, 215), width=1)
    sdraw.rectangle([col2_x, card_y, col2_x + card_w, card_y + card_h], outline=(200, 205, 215), width=1)
    
    return sheet

def create_single_card_showcase(person_key, theme_key='navy', header_style='horizontal'):
    p = PEOPLE[person_key]
    th = THEMES[theme_key]
    
    card_w, card_h = 850, 495
    pad_x = 60
    pad_y = 60
    header_h = 160
    gap = 50
    
    sheet_w = pad_x * 2 + card_w * 2 + gap
    sheet_h = header_h + card_h + pad_y + 40
    
    sheet = Image.new('RGBA', (sheet_w, sheet_h), (242, 244, 248, 255))
    sdraw = ImageDraw.Draw(sheet)
    
    f_title = get_font(FONT_MYUNGJO, 40)
    title_text = f'가자에셋파트너스 {p["title"]} {p["name_ko"]} [{th["name_kr"]}] 정밀 인쇄본'
    bbox_t = f_title.getbbox(title_text)
    t_w = bbox_t[2] - bbox_t[0]
    draw_bold(sdraw, ((sheet_w - t_w) // 2, 40), title_text, f_title, (15, 25, 40), weight=1)
    
    f_sub = get_font(FONT_GOTHIC, 19, index=3)
    sub_text = '상하 중간 밸런스 균형 최적화 · 실물 완성선 90×50mm (작업규격 96×56mm) · 300 DPI'
    bbox_sub = f_sub.getbbox(sub_text)
    sub_w = bbox_sub[2] - bbox_sub[0]
    sdraw.text(((sheet_w - sub_w) // 2, 95), sub_text, font=f_sub, fill=(100, 115, 130))
    
    sdraw.line([(sheet_w // 2 - 220, 130), (sheet_w // 2 + 220, 130)], fill=(212, 175, 55, 150), width=1)
    
    f_lbl = get_font(FONT_GOTHIC, 22, index=4)
    
    col1_x = pad_x
    col2_x = pad_x + card_w + gap
    card_y = header_h + 10
    
    sdraw.text((col1_x + (card_w - 140) // 2, card_y - 35), '[ 앞  면 (Front) ]', font=f_lbl, fill=(20, 35, 55))
    sdraw.text((col2_x + (card_w - 140) // 2, card_y - 35), '[ 뒷  면 (Back) ]', font=f_lbl, fill=(20, 35, 55))
    
    front_img = render_front(theme_key).resize((card_w, card_h), Image.Resampling.LANCZOS)
    back_img = render_back(person_key, theme_key, header_style=header_style).resize((card_w, card_h), Image.Resampling.LANCZOS)
    
    for off in range(8, 0, -1):
        sdraw.rectangle([col1_x + off, card_y + off, col1_x + card_w + off, card_y + card_h + off], fill=(0, 0, 0, 12))
        sdraw.rectangle([col2_x + off, card_y + off, col2_x + card_w + off, card_y + card_h + off], fill=(0, 0, 0, 12))
        
    sheet.paste(front_img, (col1_x, card_y))
    sheet.paste(back_img, (col2_x, card_y))
    
    sdraw.rectangle([col1_x, card_y, col1_x + card_w, card_y + card_h], outline=(200, 205, 215), width=1)
    sdraw.rectangle([col2_x, card_y, col2_x + card_w, card_y + card_h], outline=(200, 205, 215), width=1)
    
    return sheet

os.makedirs('public/cards', exist_ok=True)

# 1. Generate individual 300 DPI files with DPI metadata
for theme in ['navy', 'ivory', 'emerald']:
    front = render_front(theme)
    front.save(f'public/cards/card_front_{theme}.png', dpi=(300, 300))

    for person in ['leesangsoo', 'jeongjaewon']:
        back = render_back(person, theme, header_style='horizontal')
        back.save(f'public/cards/card_back_{person}_{theme}.png', dpi=(300, 300))
        if person == 'leesangsoo':
            back_vert = render_back(person, theme, header_style='vertical')
            back_vert.save(f'public/cards/card_back_{person}_{theme}_vertical.png', dpi=(300, 300))

# 2. Generate Print-Ready 300 DPI PDFs (Front + Back in 1 document)
def export_print_pdf(front_img, back_img, pdf_path):
    f_rgb = front_img.convert('RGB')
    b_rgb = back_img.convert('RGB')
    f_rgb.save(pdf_path, 'PDF', resolution=300.0, save_all=True, append_images=[b_rgb])

front_navy = render_front('navy')
back_lee_navy_h = render_back('leesangsoo', 'navy', header_style='horizontal')
back_lee_navy_v = render_back('leesangsoo', 'navy', header_style='vertical')
back_jeong_navy = render_back('jeongjaewon', 'navy', header_style='horizontal')

export_print_pdf(front_navy, back_lee_navy_h, 'public/cards/card_print_leesangsoo_navy_horizontal.pdf')
export_print_pdf(front_navy, back_lee_navy_v, 'public/cards/card_print_leesangsoo_navy_vertical.pdf')
export_print_pdf(front_navy, back_jeong_navy, 'public/cards/card_print_jeongjaewon_navy.pdf')

# 3. Preview Sheets
sheet_lee = create_preview_sheet('leesangsoo')
sheet_lee.save('public/cards/preview_sheet_leesangsoo.png', dpi=(300, 300))

sheet_jeong = create_preview_sheet('jeongjaewon')
sheet_jeong.save('public/cards/preview_sheet_jeongjaewon.png', dpi=(300, 300))

# 4. Showcases
showcase_jeong_navy = create_single_card_showcase('jeongjaewon', 'navy')
showcase_jeong_navy.save('public/cards/showcase_jeongjaewon_navy.png', dpi=(300, 300))

showcase_lee_navy = create_single_card_showcase('leesangsoo', 'navy', header_style='horizontal')
showcase_lee_navy.save('public/cards/showcase_leesangsoo_navy.png', dpi=(300, 300))

showcase_lee_compare = create_leesangsoo_comparison_showcase()
showcase_lee_compare.save('public/cards/showcase_leesangsoo_compare.png', dpi=(300, 300))

# 5. Print Order Guide Text File
order_guide_text = """[가자에셋파트너스 공식 명함 인쇄소 발주 가이드]

1. 기본 인쇄 규격
- 완성 사이즈 (실제 명함 크기): 90mm x 50mm
- 작업(도련) 사이즈: 96mm x 56mm (상하좌우 3mm 재단 여백 포함)
- 해상도: 300 DPI (1134 x 661 px)
- 컬러 모드: RGB / CMYK 자동 변환 지원

2. 권장 인쇄 용지
- 랑데뷰 울트라화이트 310g (도톰한 두께감과 부드러운 질감의 프리미엄 용지, 가장 추천)
- 엑스트라 매트 300g (차분하고 매트한 촉감)
- 아르떼 울트라화이트 310g (고급스러운 인쇄 발색)

3. 추천 후가공
- 샴페인 무광 골드 박(Foil Stamping): 앞면 로고 및 GAJAASSET 슬로건에 박 가공 적용 시 극대화된 럭셔리감 연출
- 모서리 라운딩(귀도리): 3R 또는 4R 부드러운 모서리 마감

4. 파일 구성 안내
- 01_앞면: 미드나이트 네이비 공식 앞면 (300 DPI)
- 02_뒷면: 선택하신 상호 배열(가로 나란히 또는 위아래 2단) 뒷면 (300 DPI)
- 03_인쇄용PDF: 인쇄소 바로 접수용 2페이지 고해상도 PDF
"""
with open('public/cards/인쇄_발주_안내.txt', 'w', encoding='utf-8') as f:
    f.write(order_guide_text)

# 6. Build ZIP Packages for Print Submission
def make_zip(zip_path, file_list):
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for src, arcname in file_list:
            if os.path.exists(src):
                zf.write(src, arcname=arcname)

# Lee Sang Soo Package
lee_files = [
    ('public/cards/card_front_navy.png', '01_Front_MidnightNavy_300DPI.png'),
    ('public/cards/card_back_leesangsoo_navy.png', '02_Back_LeeSangSoo_TypeA_Horizontal_300DPI.png'),
    ('public/cards/card_back_leesangsoo_navy_vertical.png', '02_Back_LeeSangSoo_TypeB_Vertical_300DPI.png'),
    ('public/cards/card_print_leesangsoo_navy_horizontal.pdf', '03_PrintReady_PDF_TypeA_Horizontal_300DPI.pdf'),
    ('public/cards/card_print_leesangsoo_navy_vertical.pdf', '03_PrintReady_PDF_TypeB_Vertical_300DPI.pdf'),
    ('public/cards/showcase_leesangsoo_compare.png', '04_Showcase_Compare_Layouts.png'),
    ('public/cards/showcase_leesangsoo_navy.png', '05_Showcase_Full_FrontBack.png'),
    ('public/cards/인쇄_발주_안내.txt', 'Print_Order_Guide.txt')
]
make_zip('public/cards/gaja_card_leesangsoo_navy_print_package.zip', lee_files)

# Jeong Jae Won Package
jeong_files = [
    ('public/cards/card_front_navy.png', '01_Front_MidnightNavy_300DPI.png'),
    ('public/cards/card_back_jeongjaewon_navy.png', '02_Back_JeongJaeWon_300DPI.png'),
    ('public/cards/card_print_jeongjaewon_navy.pdf', '03_PrintReady_PDF_300DPI.pdf'),
    ('public/cards/showcase_jeongjaewon_navy.png', '04_Showcase_Full_FrontBack.png'),
    ('public/cards/인쇄_발주_안내.txt', 'Print_Order_Guide.txt')
]
make_zip('public/cards/gaja_card_jeongjaewon_navy_print_package.zip', jeong_files)

print('All print cards, PDFs, and ZIP packages generated successfully!')
