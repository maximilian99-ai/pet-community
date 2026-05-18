#!/bin/bash

# Pet Community Security Test Script
# This script tests the security features implemented in the application

echo "🔒 Pet Community Security Test"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${1:-http://localhost:5001}"
FRONTEND_URL="${2:-http://localhost:3000}"

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test 1: Bot Detection
echo "Test 1: Bot Detection"
echo "---------------------"
echo -n "Testing bot User-Agent blocking... "
response=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: python-requests/2.28.0" "$BACKEND_URL/health")
if [ "$response" == "403" ]; then
    echo -e "${GREEN}✓ PASS${NC} (403 Forbidden)"
else
    echo -e "${RED}✗ FAIL${NC} (Got $response, expected 403)"
fi

echo -n "Testing legitimate User-Agent... "
response=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "$BACKEND_URL/health")
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (200 OK)"
else
    echo -e "${RED}✗ FAIL${NC} (Got $response, expected 200)"
fi
echo ""

# Test 2: Missing User-Agent
echo "Test 2: Missing User-Agent"
echo "--------------------------"
echo -n "Testing request without User-Agent... "
response=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent:" "$BACKEND_URL/api/posts")
if [ "$response" == "403" ]; then
    echo -e "${GREEN}✓ PASS${NC} (403 Forbidden)"
else
    echo -e "${RED}✗ FAIL${NC} (Got $response, expected 403)"
fi
echo ""

# Test 3: Rate Limiting (commented out by default as it takes time)
# echo "Test 3: Rate Limiting"
# echo "---------------------"
# echo -n "Testing rate limit (sending 101 requests)... "
# for i in {1..101}; do
#     response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
#     if [ $i -eq 101 ] && [ "$response" == "429" ]; then
#         echo -e "${GREEN}✓ PASS${NC} (429 Too Many Requests)"
#         break
#     fi
# done
# echo ""

# Test 4: Security Headers (Backend)
echo "Test 4: Security Headers (Backend)"
echo "-----------------------------------"
headers=$(curl -s -I "$BACKEND_URL/health")

echo -n "X-Content-Type-Options: "
if echo "$headers" | grep -i "X-Content-Type-Options: nosniff" > /dev/null; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

echo -n "X-Frame-Options: "
if echo "$headers" | grep -i "X-Frame-Options:" > /dev/null; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

echo -n "X-XSS-Protection: "
if echo "$headers" | grep -i "X-XSS-Protection:" > /dev/null; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

echo -n "Referrer-Policy: "
if echo "$headers" | grep -i "Referrer-Policy:" > /dev/null; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi
echo ""

# Test 5: Suspicious Pattern Detection
echo "Test 5: Suspicious Pattern Detection"
echo "-------------------------------------"
echo -n "Testing SQL injection pattern... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/posts?id=1%20OR%201=1")
if [ "$response" == "400" ] || [ "$response" == "403" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($response)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Got $response, expected 400 or 403)"
fi

echo -n "Testing XSS pattern... "
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d '{"content":"<script>alert(1)</script>"}' "$BACKEND_URL/api/posts")
if [ "$response" == "400" ] || [ "$response" == "403" ] || [ "$response" == "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($response)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Got $response)"
fi
echo ""

# Test 6: robots.txt
echo "Test 6: robots.txt"
echo "------------------"
echo -n "Testing robots.txt availability... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/robots.txt")
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (200 OK)"
    echo "Content preview:"
    curl -s "$FRONTEND_URL/robots.txt" | head -n 10
else
    echo -e "${RED}✗ FAIL${NC} (Got $response, expected 200)"
fi
echo ""

# Test 7: sitemap.xml
echo "Test 7: sitemap.xml"
echo "-------------------"
echo -n "Testing sitemap.xml availability... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/sitemap.xml")
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (200 OK)"
else
    echo -e "${RED}✗ FAIL${NC} (Got $response, expected 200)"
fi
echo ""

# Test 8: security.txt
echo "Test 8: security.txt"
echo "--------------------"
echo -n "Testing security.txt availability... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/.well-known/security.txt")
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (200 OK)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Got $response, expected 200)"
fi
echo ""

# Summary
echo "================================"
echo "🏁 Security Test Complete"
echo ""
echo "Note: Some tests may fail if the servers are not running."
echo "Start the servers with:"
echo "  Backend:  cd backend && pnpm dev"
echo "  Frontend: cd frontend && pnpm dev"
echo ""
echo "For production testing, use:"
echo "  ./test-security.sh https://your-backend.vercel.app https://your-frontend.vercel.app"
