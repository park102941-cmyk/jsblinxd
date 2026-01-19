# Cloudflare 환경 변수 설정 - 빠른 가이드

## 🎯 설정할 값

```
VITE_CLOUDINARY_CLOUD_NAME = dfrg9mnwj
VITE_CLOUDINARY_UPLOAD_PRESET = jsblind_products
```

---

## 📝 단계 (5분)

### 1. Cloudflare 접속
- https://dash.cloudflare.com 로그인

### 2. Pages 프로젝트 선택
- 왼쪽 메뉴 → **Pages**
- **jsblind.com** 클릭

### 3. Settings → Environment variables
- 상단 **Settings** 탭
- **Environment variables** 섹션

### 4. 변수 추가

**첫 번째 변수:**
```
Name: VITE_CLOUDINARY_CLOUD_NAME
Value: dfrg9mnwj
Environment: ✅ Production
```

**두 번째 변수:**
```
Name: VITE_CLOUDINARY_UPLOAD_PRESET
Value: jsblind_products
Environment: ✅ Production
```

### 5. 저장 및 재배포
- **Save** 클릭
- **Deployments** 탭 → 자동 재배포 확인
- 또는 **Retry deployment** 클릭

### 6. 테스트
- https://jsblind.com/admin 접속
- Products → Add New Product
- 이미지 업로드 테스트

---

## ⚠️ 중요!

- 환경 변수 이름 **정확히** 입력 (대소문자 구분)
- 값에 **공백 없이** 입력
- **Production** 환경 체크
- 저장 후 **반드시 재배포**

---

자세한 가이드: `docs/CLOUDFLARE_ENV_SETUP.md`
