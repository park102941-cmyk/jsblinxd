# 관리자 제품 관리 - 이미지 업로드 및 HTML 에디터 사용 가이드

## 🎉 새로운 기능

관리자 제품 관리 페이지에 다음 두 가지 기능이 추가되었습니다:

### 1. 📸 이미지 업로더 (ImageUploader)
- **위치**: Product Image 섹션
- **기능**: Firebase Storage에 직접 이미지 업로드
- **지원 형식**: 모든 이미지 파일 (JPG, PNG, GIF, WebP 등)
- **최대 크기**: 5MB

### 2. ✏️ HTML 에디터 (HTMLEditor)
- **위치**: Product Description (HTML) 섹션
- **기능**: 리치 텍스트 편집 및 HTML 코드 작성
- **미리보기**: 실시간 HTML 렌더링 확인

---

## 📝 사용 방법

### 이미지 업로드하기

1. **Admin Dashboard** → **Products** → **Add New Product** 클릭
2. **Product Image** 섹션으로 스크롤
3. **"Choose Image"** 버튼 클릭
4. 컴퓨터에서 이미지 파일 선택
5. 업로드가 완료되면 미리보기가 표시됩니다
6. 이미지를 변경하려면 **"Change Image"** 버튼 클릭
7. 이미지를 삭제하려면 미리보기 우측 상단의 **X** 버튼 클릭

**참고**: 
- 업로드된 이미지는 Firebase Storage에 자동으로 저장됩니다
- 이미지 URL은 자동으로 `imageUrl` 필드에 저장됩니다
- 업로드 중에는 로딩 애니메이션이 표시됩니다

---

### HTML 에디터 사용하기

#### 기본 사용법

1. **Product Description (HTML)** 섹션으로 스크롤
2. 텍스트 입력 영역에 내용 작성
3. 툴바의 버튼을 사용하여 포맷팅

#### 툴바 기능

| 버튼 | 기능 | HTML 태그 |
|------|------|-----------|
| **Heading** | 제목 (H1-H4) | `<h1>`, `<h2>`, `<h3>`, `<h4>` |
| **B** | 굵게 | `<strong>` |
| **I** | 이탤릭 | `<em>` |
| **U** | 밑줄 | `<u>` |
| **•** | 순서 없는 목록 | `<ul><li>` |
| **1.** | 순서 있는 목록 | `<ol><li>` |
| **🔗** | 링크 | `<a href="">` |
| **🖼️** | 이미지 | `<img src="">` |
| **</>** | 코드 | `<code>` |
| **왼쪽 정렬** | 왼쪽 정렬 | `<div style="text-align: left;">` |
| **가운데 정렬** | 가운데 정렬 | `<div style="text-align: center;">` |
| **오른쪽 정렬** | 오른쪽 정렬 | `<div style="text-align: right;">` |

#### 미리보기 기능

1. **"Preview"** 버튼 클릭
2. HTML이 렌더링된 결과 확인
3. **"Edit"** 버튼을 클릭하여 편집 모드로 돌아가기

#### HTML 직접 작성

툴바를 사용하지 않고 HTML을 직접 작성할 수도 있습니다:

```html
<h2>제품 특징</h2>
<p>이 제품은 <strong>프리미엄</strong> 품질의 블라인드입니다.</p>

<h3>주요 기능</h3>
<ul>
  <li>무료 배송</li>
  <li>1년 보증</li>
  <li>쉬운 설치</li>
</ul>

<p>자세한 정보는 <a href="https://example.com">여기</a>를 클릭하세요.</p>

<img src="https://example.com/image.jpg" alt="제품 이미지" style="max-width: 100%;" />
```

#### HTML Quick Reference

에디터 하단의 **"HTML Quick Reference"**를 클릭하면 자주 사용하는 HTML 태그 목록을 확인할 수 있습니다.

---

## 💡 사용 예시

### 예시 1: 간단한 제품 설명

```html
<h2>Premium Blackout Roller Shades</h2>
<p>완벽한 차광 기능을 제공하는 <strong>프리미엄 롤러 블라인드</strong>입니다.</p>

<h3>특징</h3>
<ul>
  <li>100% 차광</li>
  <li>에너지 절약</li>
  <li>쉬운 설치</li>
</ul>
```

**미리보기 결과:**

---

## Premium Blackout Roller Shades

완벽한 차광 기능을 제공하는 **프리미엄 롤러 블라인드**입니다.

### 특징
- 100% 차광
- 에너지 절약
- 쉬운 설치

---

### 예시 2: 이미지가 포함된 설명

```html
<div style="text-align: center;">
  <img src="https://example.com/product.jpg" alt="제품 이미지" style="max-width: 100%; border-radius: 8px;" />
</div>

<h2>ZSHINE Motorized Zebra Shades</h2>
<p>스마트 홈과 완벽하게 통합되는 <em>모터라이즈드 제브라 블라인드</em>입니다.</p>

<h3>스마트 기능</h3>
<ul>
  <li>Alexa 호환</li>
  <li>Google Home 지원</li>
  <li>앱으로 원격 제어</li>
</ul>

<p><a href="/support">설치 가이드 보기</a></p>
```

---

## 🔧 문제 해결

### 이미지가 업로드되지 않아요
- 파일 크기가 5MB 이하인지 확인하세요
- 이미지 파일 형식인지 확인하세요 (JPG, PNG, GIF, WebP 등)
- 인터넷 연결을 확인하세요
- Firebase Storage 권한을 확인하세요

### HTML이 제대로 표시되지 않아요
- HTML 태그가 올바르게 닫혔는지 확인하세요
- 미리보기 모드에서 결과를 확인하세요
- 브라우저 콘솔에서 오류 메시지를 확인하세요

### 이미지를 삭제했는데 다시 나타나요
- 페이지를 새로고침하세요
- 제품을 저장하지 않고 페이지를 나가면 변경사항이 저장되지 않습니다

---

## 📌 팁

1. **이미지 최적화**: 업로드하기 전에 이미지를 최적화하면 로딩 속도가 빨라집니다
2. **HTML 검증**: 복잡한 HTML을 작성할 때는 미리보기로 확인하세요
3. **백업**: 긴 설명을 작성할 때는 중간중간 저장하세요
4. **스타일링**: 인라인 CSS를 사용하여 텍스트 스타일을 커스터마이즈할 수 있습니다

---

## 🎯 다음 단계

제품을 생성하거나 수정한 후:

1. 모든 필드를 확인하세요
2. **Submit** 버튼을 클릭하여 저장하세요
3. 제품 목록에서 새로 추가된 제품을 확인하세요
4. 웹사이트에서 제품 페이지를 확인하여 이미지와 설명이 올바르게 표시되는지 확인하세요

---

**문의사항이 있으시면 개발팀에 연락해주세요!** 🚀
