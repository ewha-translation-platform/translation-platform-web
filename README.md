# Translation Platform - Web

## Required Stack

---

- Core
  - Typescript
  - [React](https://ko.reactjs.org)
- Styling
  - [Tailwindcss](https://tailwindcss.com)
- Utils
  - [react-hook-form](https://react-hook-form.com)
  - [wavesurfer.js](https://wavesurfer-js.org)

## Conventions

---

### 1. Commit Messages

```
[type] message
```

**commit types**

- [feat]: 새로운 기능을 추가
- [fix]: 버그 수정
- [refactor]: 코드 리팩토링
- [style]: 코드 스타일 변경(동작에 영향을 주는 코드 변경 없음)
- [test]: 테스트 코드에 대한 모든 변경사항
- [docs]: 문서 수정
- [chore]: 기타 사항

**example**

```
[feat] add Auth page
[docs] create README.md
```

### 2. index.ts

모든 모듈은 직접 import하지 않고, index.ts를 통해 import한다.

**example**

pages/index.ts

```js
export { default as Auth } from "./Auth";
export { default as Register } from "./Register";
```

app.ts

```js
import { Auth, Register } from '@/pages'
...
```
