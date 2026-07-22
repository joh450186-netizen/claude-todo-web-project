# 📝 나의 할 일 목록 (Todo List)

순수 HTML/CSS/JavaScript로 만든 간단한 할 일 관리 웹 애플리케이션입니다.

## 주요 기능

- 할 일 추가 / 수정 / 삭제
- 완료 여부 체크(완료 항목은 목록 하단으로 자동 정렬)
- 카테고리 분류 (개인 / 공부 / 업무 / 취미) 및 필터링
- 진행률(완료 개수/전체 개수) 표시
- Supabase(Postgres) `todo_tbl` 테이블을 이용한 데이터 저장 (새로고침·기기 변경에도 유지)
- 모바일 반응형 레이아웃

## 파일 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 페이지 구조 |
| `style.css` | 스타일 |
| `app.js` | 할 일 CRUD, 필터링, 진행률, Supabase 연동 로직 |

## 데이터베이스 (Supabase)

`todo_tbl` 테이블 스키마:

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | bigint (identity) | 기본 키 |
| `text` | text | 할 일 내용 |
| `category` | text | 카테고리 (`personal`/`study`/`work`/`hobby`) |
| `completed` | boolean | 완료 여부 |
| `created_at` | timestamptz | 생성 시각 |

`app.js` 상단의 `SUPABASE_URL`, `SUPABASE_ANON_KEY`로 클라이언트를 초기화합니다. anon 키는 RLS 정책으로 보호되는 공개 키이므로 클라이언트 코드에 노출되어도 안전합니다.

## 실행 방법

별도의 빌드 과정이나 서버가 필요 없습니다. `index.html` 파일을 브라우저로 열면 바로 사용할 수 있습니다.

```bash
# 예: VS Code Live Server, 또는
npx serve .
```
