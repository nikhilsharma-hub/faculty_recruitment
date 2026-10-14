#!/usr/bin/env bash
# One-shot setup: installs Node deps and the Chromium browser for Playwright.
set -e
cd "$(dirname "$0")"

echo "==> Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found. Install Node 18+ from https://nodejs.org and re-run." >&2
  exit 1
fi
echo "    node $(node -v)"

echo "==> Installing npm dependencies..."
npm install

echo "==> Installing Chromium for Playwright..."
npx playwright install chromium

if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> Created .env from .env.example — edit it to set target/creds."
fi

echo ""
echo "Setup complete. Run the suite with:  ./run.sh   (or: npm test)"
