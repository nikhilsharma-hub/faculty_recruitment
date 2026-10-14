#!/usr/bin/env bash
# Run the XSS suite. Loads .env if present. Pass args straight to playwright.
#   ./run.sh                 # both specs, headless
#   ./run.sh --headed        # watch the browser
#   ./run.sh tests/01-form-xss.spec.js
set -e
cd "$(dirname "$0")"
if [ -f .env ]; then set -a; . ./.env; set +a; fi
npx playwright test "$@"
echo ""
echo "HTML report:  npx playwright show-report"
