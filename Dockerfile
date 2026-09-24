# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the SPA
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy the SPA build output
COPY --from=build /app/dist/client /usr/share/nginx/html

# SPA fallback — send all routes to _shell.html
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index _shell.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /_shell.html;\n\
    }\n\
\n\
    # Cache static assets aggressively\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # Security headers\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
