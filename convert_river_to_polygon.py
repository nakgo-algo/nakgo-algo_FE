import json
import math

def create_buffer_polygon(line_coords, buffer_distance=0.0003):
    """
    선형 좌표를 버퍼를 적용해 폴리곤으로 변환
    buffer_distance: 약 30m (위도 0.0003도 ≈ 33m)
    """
    if len(line_coords) < 2:
        return []

    left_side = []
    right_side = []

    for i in range(len(line_coords)):
        curr = line_coords[i]

        # 방향 벡터 계산
        if i == 0:
            next_pt = line_coords[i + 1]
            dx = next_pt['lng'] - curr['lng']
            dy = next_pt['lat'] - curr['lat']
        elif i == len(line_coords) - 1:
            prev_pt = line_coords[i - 1]
            dx = curr['lng'] - prev_pt['lng']
            dy = curr['lat'] - prev_pt['lat']
        else:
            prev_pt = line_coords[i - 1]
            next_pt = line_coords[i + 1]
            dx = next_pt['lng'] - prev_pt['lng']
            dy = next_pt['lat'] - prev_pt['lat']

        # 정규화
        length = math.sqrt(dx*dx + dy*dy)
        if length == 0:
            continue
        dx /= length
        dy /= length

        # 수직 벡터 (왼쪽, 오른쪽)
        perp_x = -dy
        perp_y = dx

        # 버퍼 적용
        left_side.append({
            "lat": round(curr['lat'] + perp_y * buffer_distance, 6),
            "lng": round(curr['lng'] + perp_x * buffer_distance, 6)
        })
        right_side.append({
            "lat": round(curr['lat'] - perp_y * buffer_distance, 6),
            "lng": round(curr['lng'] - perp_x * buffer_distance, 6)
        })

    # 폴리곤 생성 (왼쪽 + 오른쪽 역순)
    polygon = left_side + right_side[::-1]

    # 폴리곤 닫기
    if polygon:
        polygon.append(polygon[0])

    return polygon

# 대전 하천 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_rivers.json', 'r', encoding='utf-8') as f:
    river_data = json.load(f)

# 제한 내용 정보
restriction_info = """금지행위: 훌치기 낚시 및 떡밥·어분을 사용한 낚시행위
※ 지렁이 및 인조 미끼를 사용한 낚시에 한하여 1인당 1대 허용
위반 시 과태료: 1회 50만원, 2회 100만원, 3회 150만원 이하"""

results = []
id_counter = 1

print("=== 대전 하천 폴리곤 변환 ===\n")

river_sections = {
    "갑천": "금강 합류점 ~ 모세골교 (23.88km)",
    "유등천": "갑천 합류점 ~ 만성교 (11.52km)",
    "대전천": "유등천 합류점 ~ 옥계교 (7.86km)"
}

for river in river_data['rivers']:
    print(f"{river['name']} 변환 중...", end=" ")

    polygon_coords = create_buffer_polygon(river['coordinates'], buffer_distance=0.0004)

    if len(polygon_coords) > 10:
        results.append({
            "id": id_counter,
            "name": river['name'],
            "type": "restricted",  # 제한구역으로 변경
            "restriction": restriction_info,
            "region": "대전광역시",
            "section": river_sections.get(river['name'], ""),
            "geometry": "polygon",  # 폴리곤으로 변경
            "coordinates": polygon_coords
        })
        print(f"✓ {len(polygon_coords)}개 좌표")
        id_counter += 1
    else:
        print("✗ 변환 실패")

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_rivers_polygon.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"rivers": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 하천 폴리곤 저장 ===")
