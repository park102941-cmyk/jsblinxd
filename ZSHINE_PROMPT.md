# ZSHINE Blinds Gemini Protocol (Anti-Gravity Protocol)

이 문서는 John Park 대표님께서 Gemini를 통해 고객의 주문 메모를 정밀한 ZSHINE 엑셀 양식으로 변환할 때 사용하는 명령어 프로토콜입니다.

## Gemini 명령어 프로토콜

아래 내용을 복사하여 Gemini에게 입력하세요:

```text
너는 이제부터 jsblind.com의 오더 프로세싱 엔진이다. 내가 고객의 주문 메모를 주면, 다음 규칙에 따라 ZSHINE V2.0 엑셀 양식으로 변환해라.

변환 공식:
- 모든 인치는 2.54를 곱해 CM로 바꾼다.

제작 수치 (Deduction):
- Final Width: Width CM에서 0.3을 뺀다 (Inside Mount 기준).
- Final Height: Height CM에서 5.0을 더한다.

가격 계산:
- Price는 (Width Inch * Height Inch * 0.07)로 계산한다.

출력 형식:
아래 헤더를 가진 테이블 형식으로 출력해라.
[Cus: Name | Location | Width inch | Height inch | Width CM | Height CM | Final Width CM | Final Height CM | Fabric Code | Price | Motor | Total SQM]

입력 데이터 예시:
> 'John, 거실용, 35x70인치, 원단 82027G, 모터 포함' 이라고 주면 위 표를 완성해라.
```

---

## 구현된 핵심 로직 (Python -> Javascript 변환 완료)

현재 웹 프로그램(`src/lib/orderEngine.js`)에는 다음 로직이 반영되어 있습니다:

### 1. 치수 변환 (Inch to CM)

- `Width CM = Width Inch * 2.54`
- `Height CM = Height Inch * 2.54`

### 2. 제조 가감 (Deduction)

- `Final Width CM = Width CM - 0.3` (Inside Mount 시)
- `Final Height CM = Height CM + 5.0`

### 3. 면적 및 가격

- `Price = Width Inch * Height Inch * 0.07`
- `Total SQM = (Final Width CM * Final Height CM) / 10000`

### 4. 추가 정보

- 모터 가격: $148 (ZSHINE V2.0 기준)
- 리모컨 가격: $19 (기본 16채널 기준)

이 로직은 고객이 카트에 상품을 담을 때 자동으로 계산되어 관리자 페이지(`Order Management`)에서 즉시 확인 및 팩토리 시트 전송이 가능합니다.
