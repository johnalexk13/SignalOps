#!/bin/zsh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="SignalOps PMM Dashboard"
BASE_PORT="${PORT:-3000}"
ACCOUNT_ID="${SIGNALOPS_ACCOUNT:-john}"
PRODUCT_IDS="${SIGNALOPS_PRODUCTS:-ibm-netezza}"
PID_FILE="/tmp/signalops-pmm-dashboard.pid"
PORT_FILE="/tmp/signalops-pmm-dashboard.port"
LOG_FILE="/tmp/signalops-pmm-dashboard.log"
ERR_FILE="/tmp/signalops-pmm-dashboard.err.log"

cd "$PROJECT_DIR"

find_node() {
  local candidate

  for candidate in \
    "/Applications/Codex.app/Contents/Resources/node" \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node" \
    "$HOME/.local/bin/node"; do
    if [[ -x "$candidate" ]]; then
      print -r -- "$candidate"
      return 0
    fi
  done

  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  return 1
}

stop_pid() {
  local pid="$1"

  kill "$pid" >/dev/null 2>&1 || true

  for _ in {1..10}; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  kill -9 "$pid" >/dev/null 2>&1 || true
}

if ! NODE_BIN="$(find_node)"; then
  echo "$APP_NAME could not start because Node.js was not found."
  echo ""
  echo "Install Node.js, or edit this launcher and add your Node path in find_node()."
  echo ""
  read -r "?Press Return to close this window."
  exit 1
fi

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${EXISTING_PID:-}" ]] && kill -0 "$EXISTING_PID" >/dev/null 2>&1; then
    stop_pid "$EXISTING_PID"
  fi
  rm -f "$PID_FILE" "$PORT_FILE"
fi

if [[ -f "/tmp/netezza-dashboard.pid" ]]; then
  LEGACY_PID="$(cat "/tmp/netezza-dashboard.pid" 2>/dev/null || true)"
  if [[ -n "${LEGACY_PID:-}" ]] && kill -0 "$LEGACY_PID" >/dev/null 2>&1; then
    stop_pid "$LEGACY_PID"
  fi
  rm -f "/tmp/netezza-dashboard.pid"
fi

PORT="$BASE_PORT"
while lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  LISTENER_PID="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  LISTENER_DETAILS="$(lsof -p "$LISTENER_PID" 2>/dev/null || true)"

  if print -r -- "$LISTENER_DETAILS" | grep -F "$PROJECT_DIR" >/dev/null 2>&1; then
    stop_pid "$LISTENER_PID"
    sleep 1
  else
    PORT=$((PORT + 1))
  fi
done

echo "Starting $APP_NAME..."
echo "Project: $PROJECT_DIR"
echo "Port: $PORT"
echo "Account: $ACCOUNT_ID"
echo "Products: $PRODUCT_IDS"
echo ""

PORT="$PORT" "$NODE_BIN" server.mjs >"$LOG_FILE" 2>"$ERR_FILE" &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"
echo "$PORT" > "$PORT_FILE"

for _ in {1..30}; do
  if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    DASHBOARD_URL="http://localhost:$PORT/?account=$ACCOUNT_ID&products=$PRODUCT_IDS"
    echo "Opening $DASHBOARD_URL"
    open "$DASHBOARD_URL"
    disown "$SERVER_PID" 2>/dev/null || true
    exit 0
  fi
  sleep 1
done

echo "$APP_NAME did not start successfully."
echo ""
echo "Log: $LOG_FILE"
echo "Error log: $ERR_FILE"
echo ""
read -r "?Press Return to close this window."
exit 1
