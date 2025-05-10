---
title: Kong API Gateway Setup
description: Placeholder content for Kong API Gateway Setup.
order: 2
---

# Kong API Gateway Setup

I'll guide you through implementing Kong API Gateway with an existing FastAPI application step-by-step. Kong is a powerful API gateway that can handle routing, authentication, rate-limiting, and more, while FastAPI is a modern Python web framework for building APIs quickly.

Here’s a detailed guide:

---

### Prerequisites
1. **Existing FastAPI App**: I assume you already have a FastAPI app running (e.g., on `localhost:8000`).
2. **Docker**: Kong is easiest to set up with Docker, so install Docker if you don’t have it.
3. **Basic Knowledge**: Familiarity with APIs, HTTP, and terminal commands.

---

### Step 1: Understand the Architecture
- **FastAPI App**: Your backend service (e.g., running at `http://localhost:8000`).
- **Kong Gateway**: Will sit in front of your FastAPI app, handling requests (e.g., running at `http://localhost:8080`).
- **Kong Admin API**: Used to configure Kong (runs at `http://localhost:8001` by default).

Kong will act as a reverse proxy, forwarding requests to your FastAPI app while adding features like authentication, logging, or rate-limiting.

---

### Step 2: Install and Run Kong with Docker
Kong requires a database (PostgreSQL or Cassandra) for persistence. For simplicity, we’ll use PostgreSQL.

1. **Run PostgreSQL**:
   ```bash
   docker run -d --name kong-database \
     -p 5432:5432 \
     -e "POSTGRES_USER=kong" \
     -e "POSTGRES_DB=kong" \
     -e "POSTGRES_PASSWORD=kongpass" \
     postgres:13
   ```

2. **Bootstrap Kong Database**:
   Run Kong migrations to set up the database schema:
   ```bash
   docker run --rm \
     --link kong-database:kong-database \
     -e "KONG_DATABASE=postgres" \
     -e "KONG_PG_HOST=kong-database" \
     -e "KONG_PG_USER=kong" \
     -e "KONG_PG_PASSWORD=kongpass" \
     kong:latest kong migrations bootstrap
   ```

3. **Run Kong**:
   Start Kong Gateway with Docker:
   ```bash
   docker run -d --name kong \
     --link kong-database:kong-database \
     -e "KONG_DATABASE=postgres" \
     -e "KONG_PG_HOST=kong-database" \
     -e "KONG_PG_USER=kong" \
     -e "KONG_PG_PASSWORD=kongpass" \
     -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
     -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
     -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
     -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
     -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
     -e "KONG_ADMIN_GUI_URL=http://localhost:8002" \
     -p 8000:8000 \
     -p 8443:8443 \
     -p 8001:8001 \
     -p 8002:8002 \
     kong:latest
   ```

   - `8000`: Proxy port (client requests go here).
   - `8001`: Admin API port (for configuration).
   - `8002`: Kong Manager GUI (optional, for visual management).

4. **Verify Kong is Running**:
   Test the Admin API:
   ```bash
   curl http://localhost:8001
   ```
   You should get a JSON response with Kong’s version and configuration details.

---

### Step 3: Configure Kong to Route to Your FastAPI App
Kong uses two main concepts:
- **Services**: Represent your upstream app (e.g., FastAPI).
- **Routes**: Define how requests are matched and forwarded to a Service.

1. **Register Your FastAPI Service**:
   Assuming your FastAPI app runs on `http://localhost:8000`, register it as a Service:
   ```bash
   curl -i -X POST http://localhost:8001/services \
     --data "name=fastapi-service" \
     --data "url=http://host.docker.internal:8000"
   ```
   - `name`: A unique identifier for your service.
   - `url`: Points to your FastAPI app. Use `host.docker.internal` to refer to your local machine from Docker (works on macOS/Windows; for Linux, use your local IP).

2. **Add a Route**:
   Create a Route to forward requests to your FastAPI app:
   ```bash
   curl -i -X POST http://localhost:8001/services/fastapi-service/routes \
     --data "paths[]=/api" \
     --data "strip_path=false"
   ```
   - `paths[]=/api`: Matches requests like `http://localhost:8000/api/*`.
   - `strip_path=false`: Keeps the `/api` prefix when forwarding to FastAPI.

3. **Test the Proxy**:
   If your FastAPI app has an endpoint like `/api/hello`, test it through Kong:
   ```bash
   curl http://localhost:8000/api/hello
   ```
   Kong should forward the request to your FastAPI app and return the response.

---

### Step 4: Enhance with Kong Plugins (Optional)
Kong’s power comes from its plugins. Here are a few useful ones:

1. **Rate Limiting**:
   Limit requests per consumer:
   ```bash
   curl -X POST http://localhost:8001/services/fastapi-service/plugins \
     --data "name=rate-limiting" \
     --data "config.minute=5" \
     --data "config.policy=local"
   ```
   - Limits to 5 requests per minute.

2. **Key Authentication**:
   Require an API key:
   ```bash
   curl -X POST http://localhost:8001/services/fastapi-service/plugins \
     --data "name=key-auth"
   ```

   Create a consumer:
   ```bash
   curl -X POST http://localhost:8001/consumers \
     --data "username=test-user"
   ```

   Assign an API key:
   ```bash
   curl -X POST http://localhost:8001/consumers/test-user/key-auth \
     --data "key=your-api-key"
   ```

   Test with the key:
   ```bash
   curl http://localhost:8000/api/hello -H "apikey: your-api-key"
   ```

3. **Request Logging**:
   Log requests for debugging:
   ```bash
   curl -X POST http://localhost:8001/services/fastapi-service/plugins \
     --data "name=file-log" \
     --data "config.path=/tmp/kong.log"
   ```

---

### Step 5: Run Your FastAPI App
Ensure your FastAPI app is running (e.g., with Uvicorn):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
- `main:app`: Replace with your FastAPI app’s module and instance name.
- `0.0.0.0`: Allows external access (e.g., from Kong).

---

### Step 6: Debugging and Troubleshooting
- **Check Kong Logs**:
  ```bash
  docker logs kong
  ```
- **Verify Service and Route**:
  List services:
  ```bash
  curl http://localhost:8001/services
  ```
  List routes:
  ```bash
  curl http://localhost:8001/routes
  ```
- **Common Issues**:
  - FastAPI not reachable? Ensure the `url` in the Service matches your app’s address.
  - 404 errors? Check your Route’s `paths` and FastAPI endpoint alignment.

---

### Step 7: Optional - Use Kong Manager GUI
Access `http://localhost:8002` in your browser to manage Kong visually instead of using `curl`.

---

### Example FastAPI App for Testing
If you don’t have one, here’s a simple FastAPI app:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}
```
Run it with:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

### Final Notes
- **Production**: Use a proper domain (e.g., `yourdomain.com`) instead of `localhost`, secure with HTTPS, and consider Kong’s declarative configuration (YAML) for scalability.
- **Scaling**: Deploy FastAPI and Kong on separate containers or servers as needed.

Let me know if you hit any snags or need help with specific plugins!

If Jenkins is already using port `8080` on your machine and you want to run Kong alongside it, you'll need to avoid the port conflict. Additionally, you mentioned using a reverse proxy like Caddy or Nginx to manage traffic. I'll guide you through resolving the port conflict with Kong and setting up a reverse proxy (both Caddy and Nginx options) to route traffic to Jenkins, Kong, and your FastAPI app.

---

### Step 1: Resolve Port Conflict Between Jenkins and Kong
By default, Kong’s proxy listens on port `8080`. Since Jenkins is already using `8080`, you can reconfigure Kong to use a different port (e.g., `8081` for the proxy).

#### Modify Kong’s Proxy Port
When running Kong with Docker, update the port mapping in the `docker run` command:
```bash
docker run -d --name kong \
  --link kong-database:kong-database \
  -e "KONG_DATABASE=postgres" \
  -e "KONG_PG_HOST=kong-database" \
  -e "KONG_PG_USER=kong" \
  -e "KONG_PG_PASSWORD=kongpass" \
  -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
  -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
  -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
  -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
  -e "KONG_PROXY_LISTEN=0.0.0.0:8081" \  # Change proxy port to 8081
  -e "KONG_ADMIN_GUI_URL=http://localhost:8002" \
  -p 8081:8081 \                          # Map host 8081 to container 8081
  -p 8443:8443 \
  -p 8001:8001 \
  -p 8002:8002 \
  kong:latest
```

- **Key Change**: `-e "KONG_PROXY_LISTEN=0.0.0.0:8081"` tells Kong to listen on `8081` instead of `8080`, and `-p 8081:8081` maps it to your host.
- Test Kong’s proxy:
  ```bash
  curl http://localhost:8081
  ```
  You should get a "No Route matched" response, indicating Kong is running on `8081`.

Now:
- Jenkins runs on `8080`.
- Kong’s proxy runs on `8081`.
- Your FastAPI app runs on `8000` (as before).

---

### Step 2: Set Up a Reverse Proxy
A reverse proxy like Caddy or Nginx can route traffic based on domain names or paths, avoiding port conflicts and providing a clean setup. I'll show you how to configure both.

#### Option 1: Using Caddy
Caddy is simple to set up and automatically handles HTTPS (if you use domains). Here’s how to configure it:

1. **Install Caddy**:
   - On Ubuntu: `sudo apt install caddy`
   - On macOS: `brew install caddy`
   - Or download from [Caddy’s website](https://caddyserver.com/).

2. **Create a Caddyfile**:
   In a file named `Caddyfile` (e.g., in `/etc/caddy/Caddyfile` or your working directory):
   ```
   :80 {
       # Route to Jenkins
       reverse_proxy /jenkins* localhost:8080

       # Route to Kong (for API traffic)
       reverse_proxy /api* localhost:8081

       # Route to FastAPI directly (optional)
       reverse_proxy /fastapi* localhost:8000
   }
   ```
   - `:80`: Caddy listens on port `80`.
   - `/jenkins*`: Requests to `http://<your-ip>/jenkins` go to Jenkins.
   - `/api*`: Requests to `http://<your-ip>/api` go to Kong.
   - `/fastapi*`: (Optional) Direct access to FastAPI.

3. **Run Caddy**:
   ```bash
   caddy run --config /path/to/Caddyfile
   ```
   Or, if installed system-wide:
   ```bash
   sudo systemctl restart caddy
   ```

4. **Test**:
   - Jenkins: `curl http://localhost/jenkins`
   - Kong: `curl http://localhost/api`
   - FastAPI: `curl http://localhost/fastapi/hello` (if configured).

5. **For Domains (Optional)**:
   If you have domains (e.g., `jenkins.example.com`, `api.example.com`), update the Caddyfile:
   ```
   jenkins.example.com {
       reverse_proxy localhost:8080
   }

   api.example.com {
       reverse_proxy localhost:8081
   }

   fastapi.example.com {
       reverse_proxy localhost:8000
   }
   ```
   Caddy will auto-provision HTTPS via Let’s Encrypt.

---

#### Option 2: Using Nginx
Nginx is widely used and highly configurable. Here’s how to set it up:

1. **Install Nginx**:
   - On Ubuntu: `sudo apt update && sudo apt install nginx`
   - On macOS: `brew install nginx`
   - Or download from [Nginx’s website](https://nginx.org/).

2. **Configure Nginx**:
   Edit the Nginx config file (e.g., `/etc/nginx/sites-available/default` or create a new file):
   ```nginx
   server {
       listen 80;
       server_name localhost;  # Replace with your domain if applicable

       # Route to Jenkins
       location /jenkins/ {
           proxy_pass http://localhost:8080/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # Route to Kong
       location /api/ {
           proxy_pass http://localhost:8081/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # Route to FastAPI (optional)
       location /fastapi/ {
           proxy_pass http://localhost:8000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Test and Reload Nginx**:
   ```bash
   sudo nginx -t  # Test config
   sudo systemctl Risks reload nginx  # Reload config
   ```

4. **Test**:
   - Jenkins: `curl http://localhost/jenkins/`
   - Kong: `curl http://localhost/api/`
   - FastAPI: `curl http://localhost/fastapi/hello` (if configured).

5. **For Domains (Optional)**:
   Use separate `server` blocks for each domain:
   ```nginx
   server {
       listen 80;
       server_name jenkins.example.com;
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
       }
   }

   server {
       listen 80;
       server_name api.example.com;
       location / {
           proxy_pass http://localhost:8081;
           proxy_set_header Host $host;
       }
   }
   ```

---

### Step 3: Update Kong Routes (If Using Path-Based Routing)
If you’re using a path like `/api` with Kong (as in the previous guide), ensure your Kong Route matches:
```bash
curl -i -X POST http://localhost:8001/services/fastapi-service/routes \
  --data "paths[]=/api" \
  --data "strip_path=false"
```
Requests to `http://localhost/api/hello` will go through Caddy/Nginx → Kong → FastAPI.

---

### Step 4: Verify Setup
- Jenkins: `http://localhost/jenkins` (or `jenkins.example.com`).
- Kong API: `http://localhost/api/hello` (or `api.example.com/hello`).
- FastAPI direct (optional): `http://localhost/fastapi/hello`.

---

### Choosing Between Caddy and Nginx
- **Caddy**: Easier setup, automatic HTTPS, less configuration.
- **Nginx**: More control, widely supported, better for complex setups.

---

### Additional Tips
- **HTTPS**: For production, configure SSL/TLS with Caddy (automatic) or Nginx (manual cert setup).
- **Docker Networking**: If Jenkins/FastAPI are also in Docker, use Docker networks instead of `localhost`.
- **Logs**: Check Caddy/Nginx logs if routing fails:
  - Caddy: `journalctl -u caddy` or console output.
  - Nginx: `/var/log/nginx/error.log`.

Let me know if you need help with specific tweaks or run into issues!