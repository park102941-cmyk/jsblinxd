# 애니메이션 기능 가이드

JSBlind 웹사이트에 추가된 애니메이션 기능에 대한 완전한 가이드입니다.

## 📦 추가된 컴포넌트

### 1. **ScrollReveal** 컴포넌트
스크롤 시 요소가 나타날 때 애니메이션을 적용하는 래퍼 컴포넌트입니다.

**사용법:**
```jsx
import ScrollReveal from '../components/ScrollReveal';

<ScrollReveal animation="fade" delay={100}>
  <div>애니메이션될 콘텐츠</div>
</ScrollReveal>
```

**Props:**
- `animation`: 애니메이션 타입 (`'fade'`, `'left'`, `'right'`, `'scale'`)
- `delay`: 애니메이션 지연 시간 (밀리초)
- `threshold`: 가시성 임계값 (0-1, 기본값: 0.1)
- `triggerOnce`: 한 번만 트리거할지 여부 (기본값: true)

### 2. **LoadingSpinner** 컴포넌트
로딩 상태를 표시하는 스피너 컴포넌트입니다.

**사용법:**
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

<LoadingSpinner fullScreen text="Loading..." />
```

**Props:**
- `size`: 스피너 크기 (`'small'`, `'medium'`, `'large'`)
- `color`: 스피너 색상 (CSS 색상 값)
- `fullScreen`: 전체 화면 오버레이 여부
- `text`: 로딩 텍스트 (선택사항)

### 3. **PageTransition** 컴포넌트
페이지 전환 시 부드러운 애니메이션을 제공합니다.

**사용법:**
```jsx
import PageTransition from '../components/PageTransition';

<PageTransition>
  <Routes>
    {/* 라우트들 */}
  </Routes>
</PageTransition>
```

## 🎨 CSS 애니메이션 클래스

### 페이드 애니메이션
- `.animate-fade-in` - 페이드 인
- `.animate-fade-in-up` - 아래에서 위로 페이드 인
- `.animate-fade-in-down` - 위에서 아래로 페이드 인
- `.animate-fade-in-left` - 왼쪽에서 페이드 인
- `.animate-fade-in-right` - 오른쪽에서 페이드 인

### 스케일 애니메이션
- `.animate-scale-in` - 스케일 인
- `.animate-pulse` - 펄스 효과 (무한 반복)

### 기타 애니메이션
- `.animate-bounce` - 바운스 효과
- `.animate-shake` - 흔들림 효과
- `.animate-rotate` - 회전 (무한 반복)
- `.animate-shimmer` - 반짝임 효과
- `.animate-glow` - 빛나는 효과 (무한 반복)

### 호버 효과
- `.hover-lift` - 호버 시 위로 들어올림 + 그림자
- `.hover-scale` - 호버 시 확대
- `.hover-glow` - 호버 시 빛나는 효과
- `.hover-brightness` - 호버 시 밝기 증가

### 스크롤 리빌 클래스
- `.scroll-reveal` - 기본 스크롤 리빌 (아래에서 위로)
- `.scroll-reveal-left` - 왼쪽에서 나타남
- `.scroll-reveal-right` - 오른쪽에서 나타남
- `.scroll-reveal-scale` - 스케일 효과로 나타남

**사용 시 `.revealed` 클래스가 자동으로 추가됩니다.**

## 🔧 커스텀 훅

### useScrollReveal
스크롤 애니메이션을 위한 커스텀 훅입니다.

**사용법:**
```jsx
import useScrollReveal from '../hooks/useScrollReveal';

function MyComponent() {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={ref} className={isVisible ? 'visible' : 'hidden'}>
      콘텐츠
    </div>
  );
}
```

## 💡 사용 예시

### 1. 버튼에 호버 효과 추가
```jsx
<button className="btn-primary hover-lift">
  클릭하세요
</button>
```

### 2. 카드에 스크롤 애니메이션 추가
```jsx
<ScrollReveal animation="scale" delay={100}>
  <div className="card hover-lift">
    카드 콘텐츠
  </div>
</ScrollReveal>
```

### 3. 섹션 헤더 애니메이션
```jsx
<ScrollReveal animation="fade">
  <h2>섹션 제목</h2>
</ScrollReveal>
```

### 4. 그리드 아이템 순차 애니메이션
```jsx
{items.map((item, index) => (
  <ScrollReveal key={item.id} animation="scale" delay={index * 100}>
    <ItemCard {...item} />
  </ScrollReveal>
))}
```

### 5. 로딩 상태 표시
```jsx
{loading ? (
  <LoadingSpinner fullScreen text="로딩 중..." />
) : (
  <Content />
)}
```

## 🎯 현재 적용된 위치

### Home 페이지
1. **Hero 섹션**: 페이드 인 애니메이션
2. **컬렉션 그리드**: 스케일 인 애니메이션 (순차적)
3. **스마트 기술 섹션**: 좌우 슬라이드 인 애니메이션
4. **베스트셀러**: 스케일 인 애니메이션 (순차적)
5. **모든 버튼**: 호버 리프트 효과

### 전역
- **페이지 전환**: 모든 페이지 전환 시 부드러운 페이드 애니메이션
- **로딩 상태**: 통일된 로딩 스피너

## 🚀 성능 최적화

- **Intersection Observer API** 사용으로 성능 최적화
- **triggerOnce** 옵션으로 불필요한 재렌더링 방지
- **CSS 트랜지션** 사용으로 GPU 가속 활용
- **지연 시간 조절**로 순차적 애니메이션 구현

## 🎨 커스터마이징

### 애니메이션 속도 조절
`index.css`에서 애니메이션 지속 시간을 조절할 수 있습니다:

```css
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out; /* 0.8s를 원하는 시간으로 변경 */
}
```

### 새로운 애니메이션 추가
`index.css`에 새로운 keyframe을 추가하세요:

```css
@keyframes myCustomAnimation {
  from {
    /* 시작 상태 */
  }
  to {
    /* 끝 상태 */
  }
}

.animate-my-custom {
  animation: myCustomAnimation 1s ease-out;
}
```

## 📱 반응형 고려사항

- 모바일에서는 애니메이션이 더 빠르게 실행될 수 있도록 조정
- 사용자의 `prefers-reduced-motion` 설정을 존중하려면 다음을 추가:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🐛 문제 해결

### 애니메이션이 작동하지 않을 때
1. 컴포넌트가 올바르게 import되었는지 확인
2. CSS 클래스가 올바르게 적용되었는지 확인
3. 브라우저 개발자 도구에서 콘솔 에러 확인
4. Intersection Observer API 지원 여부 확인 (대부분의 최신 브라우저 지원)

### 애니메이션이 너무 빠르거나 느릴 때
- `delay` prop 조절
- CSS에서 `animation-duration` 값 조절

### 스크롤 애니메이션이 트리거되지 않을 때
- `threshold` 값 조절 (0.1 ~ 0.5 권장)
- 요소의 높이가 충분한지 확인
