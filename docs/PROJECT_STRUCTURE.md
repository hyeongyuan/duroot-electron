# 프로젝트 구조 문서

## 1. 프로젝트 개요

이 프로젝트는 `Nextron` 기반의 Electron + Next.js 데스크톱 애플리케이션이다. 사용자는 GitHub Personal Access Token으로 인증하고, 자신과 관련된 Pull Request를 빠르게 확인할 수 있다.

구조적으로는 다음 두 런타임이 함께 동작한다.

- `main/`: Electron 메인 프로세스. 트레이, 브라우저 윈도우, IPC, 자동 업데이트, 로컬 저장소를 담당한다.
- `renderer/`: Next.js 렌더러 프로세스. 페이지 라우팅, UI, GitHub API 호출, 상태 관리를 담당한다.

추가로 `app/` 디렉터리는 production 빌드 결과물이므로 소스 코드가 아니라 배포 산출물로 봐야 한다.

## 2. 실행 구조 요약

앱은 트레이 앱 형태로 동작한다. Electron 메인 프로세스가 트레이와 창을 생성하고, 렌더러는 Next.js pages router 기반으로 `/home`, `/auth`, `/pulls`, `/settings` 화면을 전환한다. 렌더러에서 직접 접근할 수 없는 기능은 preload를 통해 `window.ipc` 브리지를 노출하고, 이를 `renderer/utils/ipc.tsx`에서 감싼 뒤 사용한다.

간단한 구조는 아래와 같다.

```text
Electron main (main/background.ts)
  -> TrayWindow 생성
  -> preload.js 연결
  -> IPC handler 등록

preload (main/preload.ts)
  -> window.ipc 노출

renderer (Next.js pages)
  -> home/auth/pulls/settings 라우트 렌더링
  -> Zustand + React Query로 상태/서버 데이터 관리
  -> GitHub API 호출
```

## 3. 최상위 디렉터리 설명

| 경로 | 역할 |
| --- | --- |
| `main/` | Electron 메인 프로세스 소스. 앱 시작, 트레이 아이콘, 창 관리, IPC, 자동 업데이트, 로컬 저장소를 담당한다. |
| `renderer/` | Next.js 렌더러 소스. 페이지, 컴포넌트, 상태 저장소, API 호출, React Query provider가 위치한다. |
| `app/` | production 빌드 결과물. Electron이 배포 환경에서 로드하는 정적 결과물이다. 직접 수정하는 소스가 아니다. |
| `assets/` | 트레이 아이콘 등 Electron 런타임에서 사용하는 정적 자산이 들어 있다. |
| `resources/` | 앱 아이콘과 배포용 리소스가 위치한다. |
| `dist/` | 빌드 결과물 디렉터리다. 플랫폼별 패키징 결과가 생성된다. |

`main/` 내부의 책임 분리는 아래처럼 볼 수 있다.

- `background.ts`: 메인 엔트리 포인트
- `helpers/`: 트레이 생성, 윈도우 생성 보조 로직
- `utils/`: `TrayWindow`, `LocalStorage`, `AppUpdater` 같은 런타임 유틸리티
- `preload.ts`: 렌더러에 노출할 안전한 브리지 정의

`renderer/` 내부의 책임 분리는 아래와 같다.

- `pages/`: Next.js pages router 엔트리
- `components/`: 공통 UI와 GitHub 관련 UI
- `stores/`: Zustand 기반 클라이언트 상태
- `apis/`: GitHub REST API 호출
- `queries/`: React Query에서 사용할 질의 함수
- `providers/`: QueryClientProvider 등 전역 provider
- `utils/`: IPC 래퍼 등 클라이언트 유틸리티
- `types/`: GitHub 응답 타입
- `styles/`: 전역 스타일

## 4. 핵심 런타임 흐름

### 4.1 앱 시작

앱 진입점은 [`package.json`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/package.json)과 [`main/background.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/main/background.ts)다.

- `npm run dev`는 `nextron`을 실행한다.
- Electron 메인 프로세스는 `main/background.ts`에서 시작된다.
- production에서는 `electron-serve`로 `app/` 디렉터리를 서빙한다.
- 개발 환경에서는 로컬 개발 서버 URL을 로드한다.

`main/background.ts`에서 수행하는 주요 작업은 다음과 같다.

1. 앱 준비 완료 후 트레이를 생성한다.
2. macOS에서는 dock 아이콘을 숨긴다.
3. `TrayWindow` 인스턴스를 만들고 트레이 클릭으로 열고 닫는다.
4. 기본 라우트로 `/home`을 로드한다.
5. `electron-store` 기반 `LocalStorage('v1')`를 만들고 IPC 채널을 등록한다.
6. 창이 보일 때 자동 업데이트 확인을 수행한다.

### 4.2 preload와 IPC 브리지

[`main/preload.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/main/preload.ts)에서는 `contextBridge.exposeInMainWorld('ipc', handler)`를 사용해 렌더러에 안전한 인터페이스를 노출한다.

노출되는 기능은 아래와 같다.

- `send(channel, value)`
- `on(channel, callback)`
- `invoke(channel, ...args)`
- `openExternal(url)`

렌더러에서는 [`renderer/utils/ipc.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/utils/ipc.tsx)가 이를 앱 전용 API로 감싸서 사용한다.

### 4.3 인증 진입 흐름

앱이 처음 `/home`으로 열리면 [`renderer/pages/home.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/pages/home.tsx)가 로컬 저장소에서 `auth.token`을 조회한다.

- 토큰이 없으면 `/auth`로 이동한다.
- 토큰이 있으면 GitHub `/user` API로 유효성을 검사한다.
- 유효하면 `useAuthStore`에 사용자와 토큰을 저장하고 `/pulls`로 이동한다.
- 유효하지 않으면 `auth.token`을 삭제하고 `/auth`로 이동한다.

### 4.4 인증 화면

[`renderer/pages/auth.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/pages/auth.tsx)는 사용자가 Personal Access Token을 입력하는 화면이다.

- 입력한 토큰으로 `fetchUser()`를 호출해 즉시 검증한다.
- 성공하면 `auth.token`을 저장하고 `/home`으로 이동한다.
- 실패하면 상태 코드 기반 오류 메시지를 보여준다.

### 4.5 보호된 페이지 접근

[`renderer/hocs/with-auth.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/hocs/with-auth.tsx)는 인증이 필요한 페이지를 감싼다.

- 먼저 Zustand의 `useAuthStore`를 확인한다.
- 메모리에 인증 정보가 없으면 `auth.token`을 다시 읽는다.
- 토큰이 없거나 사용자 조회에 실패하면 `/auth`로 리다이렉트한다.
- 성공하면 `auth={user, token}` 형태의 인증 정보를 주입한다.

현재 `pulls` 페이지는 이 HOC를 사용한다.

### 4.6 Pull Request 목록 화면

[`renderer/pages/pulls.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/pages/pulls.tsx)는 아래 세 가지 큰 UI 조합으로 구성된다.

- `Header`
- `PullsTabs`
- `PullsList`

동작 흐름은 다음과 같다.

1. `PullsTabs`가 4개 탭의 count를 각자 조회한다.
2. 탭은 `myPullRequests`, `requestedPullRequests`, `reviewedPullRequests`, `approvedPullRequests` 쿼리 파라미터로 구분된다.
3. `PullsList`는 현재 탭에 맞는 질의를 실행한다.
4. 응답 데이터에서 라벨 필터를 계산하고, 숨김 라벨 목록을 반영해 표시 대상을 결정한다.
5. 인증 오류가 발생하면 `auth.token`을 삭제하고 `/auth`로 보낸다.
6. Requested PR 개수가 1개 이상이면 트레이 아이콘을 활성 상태 이미지로 바꾼다.

### 4.7 설정 화면

[`renderer/pages/settings.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/pages/settings.tsx)에서는 다음 두 기능을 제공한다.

- IPC `version` 호출로 앱 버전 표시
- `auth.token` 삭제 후 `useAuthStore` 초기화, 그리고 `/auth`로 이동하는 로그아웃

## 5. 주요 페이지, 상태, API 책임

### 5.1 페이지 책임

| 페이지 | 역할 |
| --- | --- |
| `renderer/pages/home.tsx` | 저장된 토큰 확인 후 `/pulls` 또는 `/auth`로 분기하는 초기 라우팅 페이지 |
| `renderer/pages/auth.tsx` | GitHub 토큰 입력 및 유효성 검사 |
| `renderer/pages/pulls.tsx` | 인증이 필요한 핵심 PR 목록 화면 |
| `renderer/pages/settings.tsx` | 앱 버전 표시와 로그아웃 |
| `renderer/pages/_app.tsx` | 전역 스타일 적용, QueryProvider 주입, 탭별 라벨 노출 필터 초기화 |

### 5.2 상태 관리

이 프로젝트는 Zustand를 사용해 최소한의 클라이언트 상태를 유지한다.

| 스토어 | 역할 |
| --- | --- |
| `renderer/stores/auth.ts` | 현재 로그인한 GitHub 사용자와 토큰을 메모리에 보관 |
| `renderer/stores/pulls.ts` | 탭별로 선택한 라벨 노출 목록을 관리하고 `pulls.labels.visibleByTab` 저장소와 동기화 |

`renderer/stores/pulls.ts`의 `filterVisibleLabels()`는 각 탭 목록과 카운트 계산에 공통으로 사용된다.

### 5.3 서버 데이터 조회

GitHub 서버 데이터는 `axios` + React Query 조합으로 관리된다.

- [`renderer/apis/github.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/apis/github.ts)
  - GitHub REST API 호출 정의
  - `/user` 조회
  - 검색 API 기반 PR 목록 조회
  - 개별 PR 리뷰 수 계산
  - `401` 인증 오류 판별
- [`renderer/queries/github.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/queries/github.ts)
  - UI에서 바로 사용할 수 있게 `items`, `lastUpdatedAt` 형태로 데이터 가공

PR 조회는 검색 쿼리 문자열 기반으로 분리되어 있다.

- `fetchPullRequestsBy()`: 내가 작성한 오픈 PR
- `fetchRequestedPullRequests()`: 나에게 리뷰 요청된 오픈 PR
- `fetchReviewedPullRequests()`: 내가 리뷰했지만 아직 승인되지 않은 PR
- `fetchApprovedPullRequests()`: 내가 승인한 PR
- `fetchReviewCount()`: 특정 PR의 승인자 수와 전체 리뷰 대상 수 계산

### 5.4 Query Provider

[`renderer/providers/query-provider.tsx`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/renderer/providers/query-provider.tsx)는 전역 `QueryClient`를 생성한다.

- 기본적으로 실패 시 최대 3번까지 재시도한다.
- 단, `401` 인증 오류는 재시도하지 않는다.

## 6. 저장 데이터와 IPC 인터페이스

### 6.1 로컬 저장 데이터

이 프로젝트는 [`main/utils/local-storage.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/main/utils/local-storage.ts)를 통해 `electron-store`를 래핑한다.

현재 코드에서 확인되는 주요 저장 키는 아래와 같다.

| 키 | 설명 |
| --- | --- |
| `auth.token` | 사용자가 입력한 GitHub Personal Access Token |
| `pulls.labels.visibleByTab` | 탭별로 PR 목록에 노출할 라벨 이름 배열 맵 |

메인 프로세스에서는 `new LocalStorage('v1')`를 사용하므로, 앱 데이터는 `v1` 스토어 네임스페이스 아래 저장된다.

### 6.2 IPC 채널

[`main/background.ts`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/main/background.ts)에서 등록한 IPC 채널은 다음과 같다.

| 채널 | 역할 |
| --- | --- |
| `storage:get` | 저장된 값 조회 |
| `storage:set` | 값 저장 |
| `storage:delete` | 값 삭제 |
| `version` | 앱 버전 조회 |
| `quit` | 앱 종료 |
| `set-tray-icon` | 트레이 아이콘 이미지 변경 |

렌더러는 이를 `ipcHandler`로 감싸 아래처럼 사용한다.

- `getStorage(key)`
- `setStorage(key, value)`
- `deleteStorage(key)`
- `getVersion()`
- `quit()`
- `setTrayIcon(iconName)`
- `openExternal(url)`

## 7. 빌드 및 배포 관련 메모

- `package.json`의 `dev` 스크립트는 `nextron`을 사용한다.
- `build` 스크립트는 `nextron build`로 production 빌드를 생성한다.
- `postinstall`에서는 `electron-builder install-app-deps`를 실행한다.
- [`electron-builder.yml`](/Users/hyeongyu/Documents/Workspaces/duroot-electron/electron-builder.yml)에 패키징 설정이 들어 있다.
- production 환경에서는 `main/background.ts`가 `app/` 디렉터리를 로드한다.
- `app/background.js`, `app/preload.js`, `app/_next/*` 등은 빌드 결과물이므로 구조 파악용 참고는 가능하지만 수정 대상 소스는 아니다.

## 유지보수 시 참고 메모

- 인증 로직은 `/home`, `/auth`, `with-auth`에 나뉘어 있으므로 흐름 변경 시 세 군데를 함께 봐야 한다.
- PR 탭 카운트와 목록 본문은 각각 별도 질의를 수행하므로, API 호출 최적화가 필요할 때는 `PullsTabs`와 `PullsList`를 함께 검토해야 한다.
- 트레이 아이콘 변경은 렌더러에서 IPC를 호출하고, 실제 반영은 메인 프로세스의 `TrayWindow`가 담당한다.
- `app/`과 `dist/`는 결과물 디렉터리이므로 구조 문서나 기능 수정 시에는 우선 `main/`, `renderer/`, 설정 파일을 기준으로 보는 것이 안전하다.
