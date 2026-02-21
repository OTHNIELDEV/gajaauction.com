# Deployment & Git Push Checklist

터미널에서 아래 단계를 순서대로 체크하며 진행해 보세요.

## 1. GitHub 로그인 (gh auth login)

- [ ] 터미널에 `gh auth login` 입력
- [ ] Account: `GitHub.com` 선택
- [ ] Protocol: `HTTPS` 선택
- [ ] Authenticate: `Yes` 선택
- [ ] Method: `Login with a web browser` 선택
- [ ] **One-time code** 복사 (터미널에 뜸)
- [ ] 브라우저 창에서 코드 입력 후 [Authorize] 클릭
- [ ] 터미널에서 "Logged in as [username]" 확인

## 2. 코드 업로드 (git push)

- [ ] 터미널에 `git push -u origin main` 입력
- [ ] 에러 없이 업로드 진행률(%)이 나오는지 확인
- [ ] "Branch 'main' set up to track remote branch 'main' from 'origin'" 메시지 확인

## 3. GitHub 확인

- [ ] 브라우저에서 `https://github.com/OTHNIELDEV/gajaauction.com` 접속
- [ ] 파일들이 잘 올라갔는지 확인
