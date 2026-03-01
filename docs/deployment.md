# Deployment & Docker

Local Docker Compose (development):

1. Build and run:

```bash
docker-compose up --build
```

2. Services:
- `db` — MySQL (3306)
- `backend` — Spring Boot (8080)
- `farmer-app` — Nginx serving built React (3001)
- `buyer-app` — Nginx serving built React (3002)
- `admin-app` — Nginx serving built React (3003)

3. Environment variables and build-time `VITE_API_BASE`:
- When building frontends for production, pass `VITE_API_BASE` to point to your backend hostname (e.g., `http://backend:8080` inside Docker network or `https://api.example.com` for production).

Example build step inside Dockerfile (using build-arg in docker-compose):

```yaml
# in docker-compose.yml service build:
# args:
#   VITE_API_BASE: http://backend:8080
```

4. Production notes:
- Use a reverse proxy (NGINX) or load balancer to route `/api` to the Spring Boot backend and static assets to frontends.
- Enable HTTPS and configure JWT secret via environment variables.

