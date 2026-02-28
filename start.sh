#!/bin/bash

echo "🚀 Starting Agent Teams Monitor..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "nodemon src/index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend
echo -e "${BLUE}Starting backend...${NC}"
cd ~/gitee/agent-teams-monitor/backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd ~/gitee/agent-teams-monitor/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend
sleep 3

# Check health
echo -e "${BLUE}Checking services...${NC}"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠ Backend may not be ready yet${NC}"
fi

echo -e "${GREEN}✓ Frontend should be on http://localhost:5173${NC}"

# Open browser
echo -e "${BLUE}Opening Chrome...${NC}"
open -a "Google Chrome" http://localhost:5173

echo ""
echo -e "${GREEN}🎉 Agent Teams Monitor is running!${NC}"
echo ""
echo "Dashboard: http://localhost:5173"
echo "API:       http://localhost:3001"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to stop"

# Wait for interrupt
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
