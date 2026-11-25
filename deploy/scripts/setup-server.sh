#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-server.sh
# One-time server setup script for DigitalOcean Ubuntu 22.04 droplet
#
# Run as root on the fresh droplet:
#   bash setup-server.sh your-domain.com deploy
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-api.yourdomain.com}"
DEPLOY_USER="${2:-deploy}"
APP_DIR="/opt/medical-app"

echo "═══════════════════════════════════════"
echo " Medical App — Server Setup"
echo " Domain  : $DOMAIN"
echo " Deploy  : $DEPLOY_USER"
echo " App Dir : $APP_DIR"
echo "═══════════════════════════════════════"

# ── 1. System update ──────────────────────────────────────────────────────────
apt-get update -q && apt-get upgrade -y -q

# ── 2. Install Docker ─────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "✅ Docker installed"
fi

# ── 3. Install Docker Compose plugin ─────────────────────────────────────────
if ! docker compose version &>/dev/null; then
  apt-get install -y docker-compose-plugin
  echo "✅ Docker Compose installed"
fi

# ── 4. Install Nginx ──────────────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
  systemctl enable nginx
  echo "✅ Nginx installed"
fi

# ── 5. Install Certbot ────────────────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
  echo "✅ Certbot installed"
fi

# ── 6. Create deploy user ─────────────────────────────────────────────────────
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER"
  mkdir -p /home/$DEPLOY_USER/.ssh
  # Paste your CI/CD public key here OR copy from root
  cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/ 2>/dev/null || true
  chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
  chmod 700 /home/$DEPLOY_USER/.ssh
  chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
  echo "✅ User $DEPLOY_USER created"
fi

# ── 7. Create app directory ───────────────────────────────────────────────────
mkdir -p "$APP_DIR/deploy"
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
echo "✅ App directory created at $APP_DIR"

# ── 8. Configure UFW firewall ─────────────────────────────────────────────────
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (for Let's Encrypt)
ufw allow 443/tcp   # HTTPS
# Deny direct access to service ports from outside
ufw deny 8080/tcp
ufw deny 5432/tcp
echo "✅ Firewall configured"

# ── 9. Nginx site config ──────────────────────────────────────────────────────
# Replace YOURDOMAIN placeholder with the actual domain
sed "s/YOURDOMAIN.com/$DOMAIN/g" \
  "$APP_DIR/deploy/nginx/medical-app.conf" \
  > /etc/nginx/sites-available/medical-app

ln -sf /etc/nginx/sites-available/medical-app /etc/nginx/sites-enabled/medical-app
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

# ── 10. Obtain SSL certificate ────────────────────────────────────────────────
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
  --email admin@"${DOMAIN#api.}" --redirect
echo "✅ SSL certificate obtained"

# ── 11. Auto-renew cron ───────────────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
echo "✅ SSL auto-renew scheduled"

echo ""
echo "═══════════════════════════════════════"
echo " Server setup complete!"
echo " Next steps:"
echo "  1. Copy your .env file to $APP_DIR/deploy/.env"
echo "  2. Push to main → GitHub Actions will deploy"
echo "  3. App will be available at https://$DOMAIN"
echo "═══════════════════════════════════════"
