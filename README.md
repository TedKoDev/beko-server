## 설치하기

```
pnpm install
```

## postsql 로컬 환경 세팅

### 시작하기

docker를 활성화 시켜주세요.

```
mkdir db
pnpm docker:compose
pnpm prisma:init
```

### 마이그레이션

```
pnpm prisma:migrate
```

npx prisma generate --schema=prisma/postsql.prisma

### 스타트

```
pnpm start:dev
```

npx prisma migrate dev --name post_status_default --schema=prisma/postsql.prisma

npx prisma migrate dev --name like_isliked_deleted --schema=prisma/postsql.prisma

### s3 prisigned 서비스

pnpm install @aws-sdk/s3-request-presigner

### google 로그인

pnpm add @nestjs/passport passport passport-google-oauth20

### node-cron

pnpm add node-cron
pnpm add -D @types/node-cron
