#!/bin/bash
# Start script for QTBM CRYPTO dev server
# Detaches completely from the calling shell.
cd /home/z/my-project

# Kill any existing dev servers
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "bun run dev" 2>/dev/null
sleep 2

# Start dev server in a fully detached screen-like fashion
# Using bash + setsid to create a new session
nohup setsid bash -c '
  cd /home/z/my-project
  exec bun run dev
' > /home/z/my-project/dev.log 2>&1 < /dev/null &

DEV_PID=$!
disown $DEV_PID 2>/dev/null

# Wait for server to be ready
for i in $(seq 1 30); do
  if ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "Dev server is ready (PID $DEV_PID)"
    ss -tlnp 2>/dev/null | grep ":3000"
    exit 0
  fi
  sleep 1
done

echo "Dev server failed to start in time"
tail -30 /home/z/my-project/dev.log
exit 1
