#!/bin/bash
set -e

WORKSPACE_MCP_DIR="/root/.openclaw/mcp/google-workspace"
WORKSPACE_LOG="/tmp/google-workspace-mcp.log"

if [ -d "$WORKSPACE_MCP_DIR/.venv" ]; then
  (
    while true; do
      GOOGLE_OAUTH_CLIENT_ID="${GOOGLE_OAUTH_CLIENT_ID}" \
      GOOGLE_OAUTH_CLIENT_SECRET="${GOOGLE_OAUTH_CLIENT_SECRET}" \
      WORKSPACE_MCP_TOOLS="${WORKSPACE_MCP_TOOLS:-gmail,calendar,drive}" \
      WORKSPACE_MCP_PORT="8080" \
      WORKSPACE_MCP_HOST="0.0.0.0" \
        "$WORKSPACE_MCP_DIR/.venv/bin/python3" \
        "$WORKSPACE_MCP_DIR/main.py" \
        --single-user \
        --tools gmail calendar drive \
        --transport streamable-http \
        >> "$WORKSPACE_LOG" 2>&1
      echo "[entrypoint] google-workspace MCP exited, restarting in 2s..." >> "$WORKSPACE_LOG"
      sleep 2
    done
  ) &
  echo "[entrypoint] google-workspace MCP started on port 8080 (log: $WORKSPACE_LOG)"
fi

exec openclaw gateway run --bind lan
