# Cloudflare Pages 환경 변수 설정 가이드

## 🎯 목표
jsblind.com 프로덕션 사이트에 Cloudinary 환경 변수를 추가하여 이미지 업로드 기능을 활성화합니다.

---

## 📋 설정할 환경 변수

다음 두 개의 환경 변수를 추가해야 합니다:

```
VITE_CLOUDINARY_CLOUD_NAME = dfrg9mnwj
VITE_CLOUDINARY_UPLOAD_PRESET = jsblind_products
```

---

## 🚀 단계별 가이드

### 1단계: Cloudflare Dashboard 접속

1. 브라우저에서 https://dash.cloudflare.com 접속
2. Cloudflare 계정으로 로그인

### 2단계: Pages 프로젝트 찾기

1. 왼쪽 사이드바에서 **"Pages"** 클릭
2. 또는 상단 메뉴에서 **"Workers & Pages"** → **"Pages"** 선택

### 3단계: jsblind.com 프로젝트 선택

1. 프로젝트 목록에서 **jsblind.com** 또는 **jsblindcom** 찾기
2. 프로젝트 이름 클릭

### 4단계: Settings로 이동

1. 프로젝트 페이지 상단의 **"Settings"** 탭 클릭

### 5단계: Environment Variables 섹션 찾기

1. Settings 페이지에서 아래로 스크롤
2. **"Environment variables"** 섹션 찾기
3. 또는 왼쪽 메뉴에서 **"Environment variables"** 클릭

### 6단계: 첫 번째 환경 변수 추가

1. **"Add variable"** 또는 **"Edit variables"** 버튼 클릭
2. 다음 정보 입력:

```
Variable name: VITE_CLOUDINARY_CLOUD_NAME
Value: dfrg9mnwj
```

3. **Environment** 선택:
   - ✅ **Production** (체크)
   - ✅ **Preview** (선택사항, 권장)

4. **"Save"** 또는 **"Add variable"** 클릭

### 7단계: 두 번째 환경 변수 추가

1. 다시 **"Add variable"** 버튼 클릭
2. 다음 정보 입력:

```
Variable name: VITE_CLOUDINARY_UPLOAD_PRESET
Value: jsblind_products
```

3. **Environment** 선택:
   - ✅ **Production** (체크)
   - ✅ **Preview** (선택사항, 권장)

4. **"Save"** 또는 **"Add variable"** 클릭

### 8단계: 변경사항 저장

1. 모든 변경사항이 저장되었는지 확인
2. 페이지 하단의 **"Save"** 버튼 클릭 (있는 경우)

---

## 🔄 재배포 (중요!)

환경 변수를 추가한 후 **반드시 재배포**해야 적용됩니다:

### 방법 1: 자동 재배포 (권장)

Git 푸시가 이미 완료되었으므로 Cloudflare가 자동으로 재배포합니다.
- **Deployments** 탭에서 진행 상황 확인
- 보통 2-5분 소요

### 방법 2: 수동 재배포

1. **Deployments** 탭 클릭
2. 최신 배포 찾기
3. 우측의 **"..."** (더보기) 메뉴 클릭
4. **"Retry deployment"** 또는 **"Redeploy"** 선택

---

## ✅ 확인 방법

재배포가 완료되면:

1. https://jsblind.com/admin 접속
2. 비밀번호 입력 (123456)
3. **Products** → **Add New Product**
4. **Product Image** 섹션으로 스크롤
5. "Choose Image" 버튼 확인
6. "Powered by Cloudinary" 텍스트 확인
7. 이미지 업로드 테스트

---

## 🎨 화면 예시

### Environment Variables 페이지:

```
┌─────────────────────────────────────────────────────────┐
│ Environment variables                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Variable name                    Value        Env       │
│ ─────────────────────────────────────────────────────── │
│ VITE_CLOUDINARY_CLOUD_NAME      dfrg9mnwj   Production │
│ VITE_CLOUDINARY_UPLOAD_PRESET   jsblind...  Production │
│                                                         │
│ [+ Add variable]                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ 주의사항

1. **환경 변수 이름 정확히 입력**
   - `VITE_CLOUDINARY_CLOUD_NAME` (대소문자 구분)
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

2. **값에 공백 없이 입력**
   - ❌ ` dfrg9mnwj ` (앞뒤 공백)
   - ✅ `dfrg9mnwj` (공백 없음)

3. **Production 환경 선택**
   - Production에 체크해야 프로덕션 사이트에 적용됩니다

4. **재배포 필수**
   - 환경 변수만 추가하고 재배포하지 않으면 적용되지 않습니다

---

## 🔍 문제 해결

### "Cloudinary is not configured" 오류

**원인**: 환경 변수가 설정되지 않았거나 재배포되지 않음

**해결**:
1. Cloudflare Pages에서 환경 변수 확인
2. Production 환경에 체크되어 있는지 확인
3. 재배포 실행
4. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 환경 변수가 보이지 않음

**원인**: 잘못된 프로젝트를 선택했거나 권한 부족

**해결**:
1. 올바른 프로젝트(jsblind.com)인지 확인
2. 계정 권한 확인 (Owner 또는 Admin 필요)

### 재배포 후에도 작동하지 않음

**원인**: 브라우저 캐시 또는 빌드 캐시

**해결**:
1. 브라우저 캐시 삭제
2. Cloudflare Pages에서 "Clear build cache" 후 재배포
3. 5-10분 대기 후 다시 시도

---

## 📚 참고 자료

- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ 체크리스트

완료한 항목에 체크하세요:

- [ ] Cloudflare Dashboard 로그인
- [ ] Pages 프로젝트 선택
- [ ] Settings → Environment variables 이동
- [ ] VITE_CLOUDINARY_CLOUD_NAME 추가
- [ ] VITE_CLOUDINARY_UPLOAD_PRESET 추가
- [ ] Production 환경 선택
- [ ] 변경사항 저장
- [ ] 재배포 확인
- [ ] jsblind.com/admin에서 테스트

모두 완료하셨다면 프로덕션에서 이미지 업로드가 작동합니다! 🎉

---

**문의사항이 있으시면 언제든지 말씀해주세요!**
