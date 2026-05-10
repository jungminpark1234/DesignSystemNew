# ──────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the demo app (Vite)
# Demo은 ../src 의 디자인 시스템 파일을 alias("@ds")로 참조하므로
# 빌드 컨텍스트에 src/ + demo/ 두 디렉토리를 모두 포함시켜야 합니다.
# ──────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Demo의 package*.json 만 먼저 복사 → npm install 캐시 활용
COPY demo/package.json demo/package-lock.json ./demo/
RUN cd demo && npm ci

# 2. 소스 복사 (디자인 시스템 + demo)
COPY src ./src
COPY demo ./demo

# 3. Production build → demo/dist
RUN cd demo && npm run build

# ──────────────────────────────────────────────────────────────────────────
# Stage 2 — Serve static files with nginx
# ──────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# SPA 라우팅 fallback 설정
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Built assets
COPY --from=builder /app/demo/dist /usr/share/nginx/html

# Non-root readiness — nginx default user는 nginx (uid 101)
EXPOSE 8080

# nginx default.conf에서 listen 8080 — k8s에서는 root가 아닌 8080 포트가 권장
CMD ["nginx", "-g", "daemon off;"]
