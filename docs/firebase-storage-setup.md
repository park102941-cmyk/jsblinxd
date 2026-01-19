# Firebase Storage 설정 가이드

## 문제 상황
이미지 업로드 시 `net::ERR_FAILED` 오류가 발생하며 업로드가 실패합니다.

## 원인
Firebase Storage의 보안 규칙이 업로드를 차단하고 있거나, Storage가 활성화되지 않았을 수 있습니다.

---

## 해결 방법

### 1단계: Firebase Console 접속

1. 브라우저에서 https://console.firebase.google.com 접속
2. **jsblind** 프로젝트 선택

### 2단계: Storage 활성화 확인

1. 왼쪽 메뉴에서 **Build** → **Storage** 클릭
2. Storage가 활성화되어 있지 않다면 **Get Started** 버튼 클릭
3. 기본 설정으로 진행

### 3단계: Storage 규칙 설정

#### 옵션 A: 개발 환경용 (모든 접근 허용)

⚠️ **주의**: 프로덕션 환경에서는 사용하지 마세요!

1. Storage 페이지에서 **Rules** 탭 클릭
2. 다음 규칙으로 변경:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Publish** 버튼 클릭

#### 옵션 B: 프로덕션 환경용 (권장)

더 안전한 규칙:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 모든 사용자가 읽기 가능
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // 인증된 사용자만 업로드 가능
    match /products/{fileName} {
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024  // 5MB 제한
                   && request.resource.contentType.matches('image/.*');  // 이미지만 허용
    }
  }
}
```

### 4단계: CORS 설정 (필요한 경우)

로컬 개발 환경에서 CORS 오류가 발생하는 경우:

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. **jsblind** 프로젝트 선택
3. **Cloud Shell** 활성화 (상단 우측 아이콘)
4. 다음 명령어 실행:

```bash
# CORS 설정 파일 생성
cat > cors.json << EOF
[
  {
    "origin": ["http://localhost:5174", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
EOF

# CORS 설정 적용
gsutil cors set cors.json gs://jsblind.firebasestorage.app
```

5. 설정 확인:

```bash
gsutil cors get gs://jsblind.firebasestorage.app
```

---

## 테스트

1. Firebase Console에서 규칙을 저장한 후
2. 웹사이트를 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
3. Admin → Products → Add New Product
4. Product Image 섹션에서 이미지 업로드 시도
5. 브라우저 콘솔(F12)에서 오류 확인

---

## 문제가 계속되는 경우

### 1. 브라우저 콘솔 확인

F12를 눌러 개발자 도구를 열고 Console 탭에서 오류 메시지 확인:

- `FirebaseError: Firebase Storage: User does not have permission` 
  → Storage 규칙 문제
  
- `net::ERR_FAILED` 또는 `CORS error`
  → CORS 설정 필요
  
- `FirebaseError: Firebase Storage: Object 'products/xxx' does not exist`
  → 정상 (업로드 전 상태)

### 2. Firebase Authentication 확인

현재 코드는 인증 없이 업로드를 시도합니다. 프로덕션 환경에서는 Admin 사용자만 업로드할 수 있도록 수정해야 합니다.

임시 해결책: Storage 규칙에서 `if request.auth != null` 조건을 제거하거나 `if true`로 변경

---

## 대안: Cloudinary 사용

Firebase Storage 설정이 복잡하다면 Cloudinary를 사용하는 것도 좋은 대안입니다:

### 장점:
- 무료 플랜 제공 (25 GB 저장, 25 GB 대역폭/월)
- 간단한 설정
- 이미지 최적화 자동 지원
- CDN 포함

### 설정 방법:
1. https://cloudinary.com 가입
2. Dashboard에서 API 키 확인
3. `.env` 파일에 추가:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Cloudinary로 전환하려면 말씀해주세요!

---

## 참고 자료

- [Firebase Storage 보안 규칙](https://firebase.google.com/docs/storage/security)
- [Firebase Storage CORS 설정](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/configuring-cors)
