---
title: "Docker Best Practices for Production Workloads"
date: 2026-01-28
description: "Practical Docker best practices for production workloads: multi-stage builds, security hardening, image optimization, and health checks."
tags: ["Docker", "Containers", "Security", "DevOps"]
readTime: "10 min read"
image: "https://placehold.co/780x400/111827/60a5fa?text=Docker+Production+Best+Practices"
imageAlt: "Docker Production Best Practices"
---

Docker has become the standard for packaging and deploying applications, but there's a significant gap between "it works on my machine" Docker usage and production-ready containerization. After running hundreds of containers in production across multiple e-commerce platforms, here are the practices that have made the biggest difference.

## Multi-Stage Builds

If you're still using single-stage Dockerfiles, you're shipping unnecessary build tools, source code, and dependencies to production. Multi-stage builds are the single most impactful optimization you can make.

![Size comparison between single and multi-stage builds](https://placehold.co/780x250/111827/c084fc?text=Single+Stage+(1.2GB)+vs+Multi-Stage+(180MB))

Here's a real-world example from one of our Node.js services:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    cp -R node_modules prod_modules && \
    npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

This pattern reduced our image size from 1.2GB to 180MB -- a 85% reduction. Smaller images mean faster pulls, faster scaling, and a smaller attack surface.

## Security Hardening

Running containers as root is one of the most common security mistakes. Here's a checklist we follow for every production image:

### 1. Never Run as Root

Always create a dedicated user and switch to it with the `USER` directive. If your app needs to bind to port 80, use a reverse proxy or `setcap` instead of running as root.

### 2. Use Minimal Base Images

- `alpine` variants are great for most workloads (5MB base)
- `distroless` images from Google for maximum security (no shell, no package manager)
- Avoid `:latest` tag -- always pin to a specific version

### 3. Scan for Vulnerabilities

We run `trivy` in our CI pipeline on every build:

```yaml
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: 'sarif'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

> A container vulnerability scanner in CI is not optional for production workloads. It's the bare minimum. The earlier you catch vulnerabilities, the cheaper they are to fix.

## Layer Optimization

Docker image layers are cached, so the order of your Dockerfile instructions matters significantly for build performance:

![Docker layer caching strategy diagram](https://placehold.co/780x300/111827/4ade80?text=Layer+Caching+Strategy)

1. **Base image and system packages** -- changes rarely, cache forever
2. **Dependency files** (`package.json`, `requirements.txt`) -- changes occasionally
3. **Install dependencies** -- only re-runs when dependency files change
4. **Application source code** -- changes frequently, should be last

The key insight: **put things that change least frequently at the top of your Dockerfile**. Every instruction after a cache-busting change has to re-run.

## Health Checks

Always include a `HEALTHCHECK` in your Dockerfile. Without one, your orchestrator (ECS, Kubernetes, Docker Swarm) has no way to know if your application is actually working -- only that the process is running.

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

The `--start-period` flag is often overlooked but crucial -- it gives your application time to start up before health checks begin. Without it, slow-starting applications will be killed before they're ready.

## Resource Limits

Always set memory and CPU limits in your container orchestration config. A runaway process shouldn't be able to take down the entire host:

```yaml
# docker-compose.yml
services:
  api:
    image: myapp:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Summary

Production Docker isn't complicated, but it requires intentionality. The practices that give you the most return:

- Multi-stage builds for smaller, cleaner images
- Non-root users and minimal base images for security
- Layer ordering optimization for faster builds
- Health checks for reliable orchestration
- Resource limits to prevent noisy neighbors
- Vulnerability scanning in CI as a gate

---

Next up: how we use Terraform to manage our AWS infrastructure across multiple environments with a single codebase.
