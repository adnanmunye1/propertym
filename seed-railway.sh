#!/bin/bash

# Seed Railway Database with Comprehensive Demo Data

API_URL="https://clever-passion-production.up.railway.app/api"

# Login and get token
echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@propertym.com","password":"Demo@123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed! Make sure FRONTEND_URL is set in backend variables."
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get existing data
echo "📊 Fetching existing data..."
UNITS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/units")
TENANTS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/tenants")

# Parse unit IDs (get first 4)
UNIT1=$(echo "$UNITS_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
UNIT2=$(echo "$UNITS_JSON" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
UNIT3=$(echo "$UNITS_JSON" | grep -o '"id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
UNIT4=$(echo "$UNITS_JSON" | grep -o '"id":"[^"]*"' | sed -n '4p' | cut -d'"' -f4)

# Parse tenant IDs (get first 4)
TENANT1=$(echo "$TENANTS_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
TENANT2=$(echo "$TENANTS_JSON" | grep -o '"id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
TENANT3=$(echo "$TENANTS_JSON" | grep -o '"id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)
TENANT4=$(echo "$TENANTS_JSON" | grep -o '"id":"[^"]*"' | sed -n '4p' | cut -d'"' -f4)

echo "Found:"
echo "  Units: $UNIT1, $UNIT2, $UNIT3, $UNIT4"
echo "  Tenants: $TENANT1, $TENANT2, $TENANT3, $TENANT4"
echo ""

# Create Tenancies (Move-ins)
echo "🏠 Creating tenancies..."

if [ -n "$TENANT1" ] && [ -n "$UNIT1" ]; then
  curl -s -X POST "$API_URL/tenancy" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT1\",
      \"unitId\": \"$UNIT1\",
      \"moveInDate\": \"2024-06-01\",
      \"depositPaid\": 25000,
      \"depositPaidDate\": \"2024-06-01\"
    }" > /dev/null
  echo "✅ John Kamau → Unit 1A (June 2024)"
fi

if [ -n "$TENANT2" ] && [ -n "$UNIT2" ]; then
  curl -s -X POST "$API_URL/tenancy" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT2\",
      \"unitId\": \"$UNIT2\",
      \"moveInDate\": \"2024-07-01\",
      \"depositPaid\": 25000,
      \"depositPaidDate\": \"2024-07-01\"
    }" > /dev/null
  echo "✅ Mary Wanjiru → Unit 2A (July 2024)"
fi

if [ -n "$TENANT3" ] && [ -n "$UNIT3" ]; then
  curl -s -X POST "$API_URL/tenancy" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT3\",
      \"unitId\": \"$UNIT3\",
      \"moveInDate\": \"2024-08-01\",
      \"depositPaid\": 30000,
      \"depositPaidDate\": \"2024-08-01\"
    }" > /dev/null
  echo "✅ Peter Ochieng → Unit 3A (Aug 2024)"
fi

echo ""
echo "💰 Creating payments..."

# Payments for Tenant 1 (John) - Paid up to October, owes November
if [ -n "$TENANT1" ] && [ -n "$UNIT1" ]; then
  # Deposit
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT1\",
      \"unitId\": \"$UNIT1\",
      \"amount\": 25000,
      \"paymentDate\": \"2024-06-01\",
      \"method\": \"MPESA\",
      \"reference\": \"MPO123456789\",
      \"notes\": \"Security deposit\"
    }" > /dev/null
    
  # June-October rent (paid)
  for month in {6..10}; do
    curl -s -X POST "$API_URL/payments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"tenantId\": \"$TENANT1\",
        \"unitId\": \"$UNIT1\",
        \"amount\": 25000,
        \"paymentDate\": \"2024-$(printf '%02d' $month)-05\",
        \"method\": \"MPESA\",
        \"reference\": \"MPO$(date +%s)$month\",
        \"notes\": \"Rent payment\"
      }" > /dev/null
  done
  echo "✅ John Kamau: Deposit + 5 months rent (June-Oct) - CURRENT"
fi

# Payments for Tenant 2 (Mary) - Paid deposit and 2 months, owes 3 months (IN ARREARS)
if [ -n "$TENANT2" ] && [ -n "$UNIT2" ]; then
  # Deposit
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT2\",
      \"unitId\": \"$UNIT2\",
      \"amount\": 25000,
      \"paymentDate\": \"2024-07-01\",
      \"method\": \"BANK_TRANSFER\",
      \"reference\": \"BNK987654321\",
      \"notes\": \"Security deposit\"
    }" > /dev/null
    
  # July and August only (owes Sept, Oct, Nov)
  for month in {7..8}; do
    curl -s -X POST "$API_URL/payments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"tenantId\": \"$TENANT2\",
        \"unitId\": \"$UNIT2\",
        \"amount\": 25000,
        \"paymentDate\": \"2024-$(printf '%02d' $month)-05\",
        \"method\": \"MPESA\",
        \"reference\": \"MPO$(date +%s)$month\",
        \"notes\": \"Rent payment\"
      }" > /dev/null
  done
  echo "✅ Mary Wanjiru: Deposit + 2 months only - OWES 3 MONTHS (KES 75,000 arrears)"
fi

# Payments for Tenant 3 (Peter) - Paid deposit, owes ALL rent (HEAVY ARREARS)
if [ -n "$TENANT3" ] && [ -n "$UNIT3" ]; then
  # Only deposit, no rent payments
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT3\",
      \"unitId\": \"$UNIT3\",
      \"amount\": 30000,
      \"paymentDate\": \"2024-08-01\",
      \"method\": \"CASH\",
      \"reference\": \"CASH001\",
      \"notes\": \"Security deposit\"
    }" > /dev/null
  echo "✅ Peter Ochieng: Deposit only - OWES 4 MONTHS (KES 120,000+ arrears)"
fi

echo ""
echo "🎉 Demo data created successfully!"
echo ""
echo "📊 Summary:"
echo "  - 2 Properties"
echo "  - 6+ Units"
echo "  - 4 Tenants"
echo "  - 3 Active Tenancies"
echo "  - 8 Payments recorded"
echo "  - 2 Tenants with ARREARS"
echo ""
echo "🔴 Arrears Scenarios:"
echo "  - Mary Wanjiru: KES 75,000 (3 months)"
echo "  - Peter Ochieng: KES 120,000+ (4 months)"
echo ""
echo "🌐 Login at: https://aware-harmony-production.up.railway.app"
echo "📧 Email: demo@propertym.com"
echo "🔑 Password: Demo@123"
echo ""
echo "⚠️  IMPORTANT: Add FRONTEND_URL variable to backend for login to work!"
echo "   Variable: FRONTEND_URL"
echo "   Value: https://aware-harmony-production.up.railway.app"
echo ""

