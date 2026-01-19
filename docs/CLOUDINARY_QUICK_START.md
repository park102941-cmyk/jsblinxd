# Cloudinary 빠른 설정 (5분)

## 📋 체크리스트

### 1. Cloudinary 계정 생성
- [ ] https://cloudinary.com/users/register_free 접속
- [ ] 무료 계정 생성 및 이메일 인증

### 2. Cloud Name 확인
- [ ] Dashboard에서 Cloud Name 복사 (예: `dxyz123abc`)

### 3. Upload Preset 생성
- [ ] Settings → Upload → Add upload preset
- [ ] 이름: `jsblind_products`
- [ ] Signing Mode: **Unsigned** ⚠️ 중요!
- [ ] Folder: `products`
- [ ] Save

### 4. .env 파일 수정
```bash
VITE_CLOUDINARY_CLOUD_NAME=여기에_실제_Cloud_Name_입력
VITE_CLOUDINARY_UPLOAD_PRESET=jsblind_products
```

### 5. 서버 재시작
```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

### 6. 테스트
- [ ] Admin → Products → Add New Product
- [ ] 이미지 업로드 테스트
- [ ] "Image uploaded successfully to Cloudinary" 메시지 확인

---

## 🎯 완료!

모든 체크리스트를 완료하셨다면 이미지 업로드가 작동합니다!

자세한 가이드: `docs/cloudinary-setup.md` 참고
