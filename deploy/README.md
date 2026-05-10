# MakinaRocks DS Demo — Helm chart 배포 가이드

이 디렉토리는 **demo** 앱 (MakinaRocks 디자인 시스템 + 모니터링 콘솔)을
Runway(MLOps) 플랫폼에 Helm chart로 배포하기 위한 자산을 모아둔 곳입니다.

```
deploy/
├── nginx.conf            # SPA fallback + gzip + cache 정책
├── README.md             # ← (이 파일)
└── helm/
    ├── Chart.yaml
    ├── values.yaml       # Runway 환경에 맞춰 수정
    ├── .helmignore
    └── templates/
        ├── _helpers.tpl
        ├── deployment.yaml
        ├── hpa.yaml
        ├── ingress.yaml
        ├── service.yaml
        └── serviceaccount.yaml
```

---

## 1. Docker 이미지 빌드 & 푸시

`Dockerfile`은 레포 루트(`D:/claude/`)에 있고, 빌드 시 `src/` 디자인 시스템 +
`demo/` Vite 앱을 함께 컨텍스트로 사용합니다.

```bash
# 레포 루트에서
cd D:/claude

# 이미지 빌드 (태그는 git sha 또는 v0.1.0 등)
docker build -t gitea.runway.dev/makinarocks/ds-demo:0.1.0 .

# 레지스트리 로그인
docker login gitea.runway.dev

# 푸시
docker push gitea.runway.dev/makinarocks/ds-demo:0.1.0
```

> Runway 환경에서 사용하는 레지스트리(Gitea / Harbor / ECR 등)에 맞춰
> `image.repository` 와 `image.tag` 를 `values.yaml` 또는 `--set`으로 교체하세요.

---

## 2. Helm chart로 배포

### 2.1 직접 install (테스트)

```bash
helm install ds-demo ./deploy/helm \
  --namespace ds-demo --create-namespace \
  --set image.repository=gitea.runway.dev/makinarocks/ds-demo \
  --set image.tag=0.1.0 \
  --set ingress.hosts[0].host=ds-demo.runway.dev
```

업그레이드:

```bash
helm upgrade ds-demo ./deploy/helm -n ds-demo \
  --set image.tag=0.1.1
```

삭제:

```bash
helm uninstall ds-demo -n ds-demo
```

### 2.2 Runway 카탈로그/ArgoCD 연동

Runway는 보통 ArgoCD + Helm chart 등록 흐름을 사용합니다:

1. **Helm 패키징**:
   ```bash
   helm package ./deploy/helm -d ./deploy/dist
   # → ds-demo-0.1.0.tgz 생성
   ```
2. **Helm repo (Gitea, Harbor, ChartMuseum 등)에 업로드**:
   ```bash
   curl --user $USER:$PASS --data-binary "@deploy/dist/ds-demo-0.1.0.tgz" \
     https://gitea.runway.dev/api/packages/makinarocks/helm/api/charts
   ```
3. **Runway 콘솔** → Catalog → Application 등록 → Helm chart URL 또는
   ArgoCD Application manifest로 연결.

---

## 3. 주요 values 커스터마이징 포인트

| 키 | 기본값 | 설명 |
|---|---|---|
| `image.repository` | `gitea.runway.dev/makinarocks/ds-demo` | 푸시한 레지스트리 경로 |
| `image.tag` | `""` (= `appVersion`) | 이미지 태그 |
| `replicaCount` | `1` | 파드 개수 |
| `resources.limits/requests` | `500m/256Mi` / `50m/64Mi` | 정적 SPA라 작게 잡음 |
| `ingress.hosts[0].host` | `ds-demo.runway.dev` | 외부 호스트명 |
| `ingress.tls[0].secretName` | `ds-demo-tls` | cert-manager TLS |
| `autoscaling.enabled` | `false` | HPA on/off |
| `service.port` | `80` | k8s service 포트 |
| `service.targetPort` | `8080` | 컨테이너 nginx 포트 |

---

## 4. 헬스체크

- nginx가 `GET /healthz` 에 200 `ok` 응답 (nginx.conf 참조)
- liveness / readiness 모두 이 엔드포인트 사용

---

## 5. 배포 후 확인

```bash
kubectl -n ds-demo get pod,svc,ing
kubectl -n ds-demo logs -l app.kubernetes.io/name=makinarocks-ds-demo

# port-forward로 빠르게 검증
kubectl -n ds-demo port-forward svc/ds-demo 8080:80
# → http://localhost:8080
```

---

## 6. 로컬에서 Docker 이미지 검증

```bash
docker build -t ds-demo:local .
docker run --rm -p 8080:8080 ds-demo:local
# → http://localhost:8080
```
