# Deploying to AWS EC2

Target environment for Assessment 4's live demonstration: a plain
Ubuntu EC2 instance running the production Docker Compose stack
(`docker-compose.prod.yml`). No load balancer, reverse proxy, or TLS —
this is a direct-to-container setup appropriate for a single
demo instance, not a hardened production deployment.

## 1. Launch the instance

- AMI: Ubuntu Server 22.04 LTS (or whatever the provided AWS Academy
  lab image is)
- Instance type: `t3.small` or larger — `t2.micro`/`t3.micro` is tight
  for running Postgres + two Next.js servers simultaneously, especially
  during the `npm run build` step
- Storage: default (8–16 GB) is fine
- Key pair: create or reuse one, you'll need it to SSH in

## 2. Security group — open these inbound ports

| Port | Purpose |
|---|---|
| 22 | SSH |
| 3000 | Frontend (what the browser loads) |
| 4000 | API (the browser's client-side JS calls this directly) |

Postgres (5432) is **not** exposed — `docker-compose.prod.yml` doesn't
publish it to the host at all, only the `api` container can reach it
over the internal Docker network.

## 3. Install Docker on the instance

SSH in (`ssh -i your-key.pem ubuntu@<ec2-public-ip>`), then:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in (or run `newgrp docker`) for the group change to
take effect, then confirm with `docker ps`.

## 4. Get the code onto the instance

```bash
git clone https://github.com/Aaryan-2003/cse3cwa-assessment-1.git
cd cse3cwa-assessment-1
```

## 5. Configure `.env`

```bash
cp .env.example .env
nano .env   # or vim/your editor of choice
```

Set every value to match this instance — **`.env.example`'s
`localhost` defaults are wrong here and will produce a broken
deployment** (the frontend's API calls and the API's CORS check both
depend on these matching the EC2 instance's actual public address):

```ini
POSTGRES_USER=appuser
POSTGRES_PASSWORD=<pick a real password>
POSTGRES_DB=phoneme_builder
FRONTEND_ORIGIN=http://<ec2-public-ip>:3000
NEXT_PUBLIC_API_URL=http://<ec2-public-ip>:4000
```

Find the public IP with `curl -s http://169.254.169.254/latest/meta-data/public-ipv4`
from inside the instance, or from the EC2 console.

## 6. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The initial build compiles both Next.js apps for production (slower
than `docker-compose.yml`'s dev setup — expect a few minutes). `-d`
runs it in the background so it survives your SSH session ending.

Watch startup:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Check everything's healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

`api` and `postgres` should both show `healthy`.

## 7. Verify from outside

From your own machine (not the EC2 instance):

```bash
curl http://<ec2-public-ip>:4000/api/health
```

Then open `http://<ec2-public-ip>:3000` in a browser.

## Updating after a code change

```bash
cd cse3cwa-assessment-1
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Stopping

```bash
docker compose -f docker-compose.prod.yml down
```

Add `-v` only if you also want to delete the Postgres data volume —
don't do that unless you actually want to lose everything stored
there.

## If EC2 is unavailable on the day

Fall back to the local `docker compose up --build` (the regular
`docker-compose.yml`, dev mode) — this is already fully working and
was the setup used throughout Assessment 3. See the root
[`README.md`](./README.md).
