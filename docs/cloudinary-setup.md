# Cloudinary 설정 가이드

## 🚀 빠른 시작 (5분 완료)

Cloudinary는 Firebase Storage보다 설정이 훨씬 간단합니다!

---

## 1단계: Cloudinary 계정 생성

1. **가입 페이지 접속**: https://cloudinary.com/users/register_free
2. 이메일로 무료 계정 생성
3. 이메일 인증 완료

### 무료 플랜 혜택:
- ✅ 25 GB 저장공간
- ✅ 25 GB 대역폭/월
- ✅ 25,000 변환/월
- ✅ CDN 포함
- ✅ 이미지 자동 최적화

---

## 2단계: Cloud Name 확인

1. Cloudinary Dashboard 로그인
2. 상단에 표시된 **Cloud name** 확인 (예: `dxyz123abc`)
3. 이 값을 복사해두세요

---

## 3단계: Upload Preset 생성

Upload Preset은 업로드 설정을 미리 정의하는 것입니다.

### 방법:

1. Dashboard 왼쪽 메뉴에서 **Settings** (⚙️) 클릭
2. **Upload** 탭 클릭
3. 아래로 스크롤하여 **Upload presets** 섹션 찾기
4. **Add upload preset** 버튼 클릭
5. 다음과 같이 설정:

```
Upload preset name: jsblind_products
Signing Mode: Unsigned (중요!)
Folder: products
```

6. 추가 설정 (선택사항):
   - **Allowed formats**: jpg, png, gif, webp
   - **Max file size**: 10 MB
   - **Image transformations**: 원하는 경우 자동 리사이징 설정

7. **Save** 버튼 클릭

---

## 4단계: .env 파일 설정

프로젝트의 `.env` 파일을 열고 다음 값을 입력하세요:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=여기에_Cloud_Name_입력
VITE_CLOUDINARY_UPLOAD_PRESET=jsblind_products
```

**예시:**
```bash
VITE_CLOUDINARY_CLOUD_NAME=dxyz123abc
VITE_CLOUDINARY_UPLOAD_PRESET=jsblind_products
```

⚠️ **중요**: 
- `your_cloud_name_here`를 실제 Cloud Name으로 바꿔주세요!
- Upload Preset 이름이 다르다면 그에 맞게 수정하세요

---

## 5단계: 개발 서버 재시작

`.env` 파일을 수정했으므로 개발 서버를 재시작해야 합니다:

```bash
# 터미널에서 Ctrl+C로 서버 중지 후
npm run dev
```

또는 브라우저에서 페이지를 새로고침하세요 (Ctrl+Shift+R 또는 Cmd+Shift+R)

---

## 6단계: 테스트

1. Admin Dashboard → Products → Add New Product
2. Product Image 섹션으로 스크롤
3. "Choose Image" 버튼 클릭
4. 이미지 파일 선택
5. 업로드 진행률 확인
6. "Image uploaded successfully to Cloudinary" 메시지 확인

---

## 🎯 업로드된 이미지 확인

### Cloudinary Dashboard에서 확인:

1. Dashboard → Media Library
2. `products` 폴더 클릭
3. 업로드된 이미지 확인

### 이미지 URL 형식:

```
https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/products/[filename]
```

---

## 🔧 문제 해결

### "Cloudinary is not configured" 오류

**원인**: `.env` 파일에 Cloud Name이 설정되지 않았거나 `your_cloud_name_here`로 남아있음

**해결**:
1. `.env` 파일 확인
2. `VITE_CLOUDINARY_CLOUD_NAME`에 실제 Cloud Name 입력
3. 개발 서버 재시작

### "Upload preset not found" 오류

**원인**: Upload Preset이 생성되지 않았거나 이름이 다름

**해결**:
1. Cloudinary Dashboard → Settings → Upload
2. Upload Preset 이름 확인
3. `.env` 파일의 `VITE_CLOUDINARY_UPLOAD_PRESET` 값 확인
4. 일치하지 않으면 수정

### "Signing mode must be unsigned" 오류

**원인**: Upload Preset의 Signing Mode가 "Signed"로 설정됨

**해결**:
1. Cloudinary Dashboard → Settings → Upload
2. 해당 Upload Preset 편집
3. Signing Mode를 **Unsigned**로 변경
4. Save

### 업로드가 느림

**원인**: 이미지 파일이 너무 큼

**해결**:
1. 이미지를 업로드하기 전에 압축
2. 권장 크기: 1920x1080 이하, 2MB 이하
3. 온라인 압축 도구 사용: https://tinypng.com

---

## 💡 고급 기능

### 이미지 자동 최적화

Cloudinary는 업로드된 이미지를 자동으로 최적화할 수 있습니다:

```javascript
// URL에 변환 파라미터 추가
const optimizedUrl = imageUrl.replace('/upload/', '/upload/q_auto,f_auto/');
```

### 이미지 리사이징

```javascript
// 너비 800px로 리사이징
const resizedUrl = imageUrl.replace('/upload/', '/upload/w_800,c_scale/');
```

### 썸네일 생성

```javascript
// 200x200 썸네일
const thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_200,h_200,c_fill/');
```

---

## 📊 사용량 모니터링

1. Cloudinary Dashboard
2. **Analytics** 탭 클릭
3. 저장공간, 대역폭, 변환 횟수 확인

무료 플랜 한도:
- 저장공간: 25 GB
- 대역폭: 25 GB/월
- 변환: 25,000회/월

---

## 🔐 보안 설정 (선택사항)

### Upload Preset 보안 강화:

1. Settings → Upload → Upload Preset 편집
2. **Access control**:
   - Allowed origins: `http://localhost:5174, https://yourdomain.com`
3. **Restrictions**:
   - Max file size: 10 MB
   - Allowed formats: jpg, png, gif, webp

---

## 📚 참고 자료

- [Cloudinary 공식 문서](https://cloudinary.com/documentation)
- [Upload Preset 가이드](https://cloudinary.com/documentation/upload_presets)
- [이미지 변환 가이드](https://cloudinary.com/documentation/image_transformations)
- [React 통합 가이드](https://cloudinary.com/documentation/react_integration)

---

## ✅ 체크리스트

완료한 항목에 체크하세요:

- [ ] Cloudinary 계정 생성
- [ ] Cloud Name 확인
- [ ] Upload Preset 생성 (jsblind_products)
- [ ] `.env` 파일에 Cloud Name 추가
- [ ] `.env` 파일에 Upload Preset 추가
- [ ] 개발 서버 재시작
- [ ] 이미지 업로드 테스트
- [ ] Cloudinary Dashboard에서 이미지 확인

모두 완료하셨다면 이미지 업로드가 정상 작동합니다! 🎉

---

**문의사항이 있으시면 언제든지 말씀해주세요!**
