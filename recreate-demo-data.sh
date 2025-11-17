#!/bin/bash

# Recreate Demo Data with Recent Dates and Higher Collection Rate

API_URL="https://clever-passion-production.up.railway.app/api"

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@propertym.com","password":"Demo@123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Logged in"
echo ""

# Delete old payments and invoices
echo "🗑️  Clearing old data..."
PAYMENTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/payments" | python3 -c "import sys,json; [print(p['id']) for p in json.load(sys.stdin).get('data',[])]" 2>/dev/null)
for payment_id in $PAYMENTS; do
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$API_URL/payments/$payment_id" > /dev/null
done
echo "✅ Cleared payments"

INVOICES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/invoices" | python3 -c "import sys,json; [print(i['id']) for i in json.load(sys.stdin).get('data',[])]" 2>/dev/null)
for inv_id in $INVOICES; do
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$API_URL/invoices/$inv_id" > /dev/null 2>&1
done
echo "✅ Cleared invoices"

echo ""
echo "📊 Getting current data..."

# Get tenant and unit IDs
TENANTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/tenants")
UNITS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/units")

TENANT1=$(echo "$TENANTS" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'John' in x['firstName']]; print(t[0]['id'] if t else '')" 2>/dev/null)
TENANT2=$(echo "$TENANTS" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'Mary' in x['firstName']]; print(t[0]['id'] if t else '')" 2>/dev/null)
TENANT3=$(echo "$TENANTS" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'Peter' in x['firstName']]; print(t[0]['id'] if t else '')" 2>/dev/null)

UNIT1=$(echo "$UNITS" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)
UNIT2=$(echo "$UNITS" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][1]['id'])" 2>/dev/null)
UNIT3=$(echo "$UNITS" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][2]['id'])" 2>/dev/null)

echo "Tenants: $TENANT1, $TENANT2, $TENANT3"
echo "Units: $UNIT1, $UNIT2, $UNIT3"
echo ""

# Create recent tenancies (August-October 2025)
echo "🏠 Creating recent tenancies..."

TENANCY1=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT1\",
    \"unitId\": \"$UNIT1\",
    \"moveInDate\": \"2025-08-01\",
    \"depositPaid\": 25000,
    \"depositPaidDate\": \"2025-08-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
echo "✅ John → Unit 1A (August 2025)"

TENANCY2=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT2\",
    \"unitId\": \"$UNIT2\",
    \"moveInDate\": \"2025-09-01\",
    \"depositPaid\": 25000,
    \"depositPaidDate\": \"2025-09-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
echo "✅ Mary → Unit 2A (September 2025)"

TENANCY3=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT3\",
    \"unitId\": \"$UNIT3\",
    \"moveInDate\": \"2025-10-01\",
    \"depositPaid\": 30000,
    \"depositPaidDate\": \"2025-10-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
echo "✅ Peter → Unit 3A (October 2025)"

echo ""
echo "📄 Creating invoices for recent months..."

# John's invoices (Aug, Sept, Oct, Nov 2025)
for month in {8..11}; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenancyId\": \"$TENANCY1\",
      \"tenantId\": \"$TENANT1\",
      \"unitId\": \"$UNIT1\",
      \"period\": \"2025-$(printf '%02d' $month)\",
      \"dueDate\": \"2025-$(printf '%02d' $month)-05\",
      \"rentAmount\": 25000,
      \"totalAmount\": 25000
    }" > /dev/null
done
echo "✅ John: 4 invoices (Aug-Nov)"

# Mary's invoices (Sept, Oct, Nov 2025)
for month in {9..11}; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenancyId\": \"$TENANCY2\",
      \"tenantId\": \"$TENANT2\",
      \"unitId\": \"$UNIT2\",
      \"period\": \"2025-$(printf '%02d' $month)\",
      \"dueDate\": \"2025-$(printf '%02d' $month)-05\",
      \"rentAmount\": 25000,
      \"totalAmount\": 25000
    }" > /dev/null
done
echo "✅ Mary: 3 invoices (Sept-Nov)"

# Peter's invoices (Oct, Nov 2025)
for month in {10..11}; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenancyId\": \"$TENANCY3\",
      \"tenantId\": \"$TENANT3\",
      \"unitId\": \"$UNIT3\",
      \"period\": \"2025-$(printf '%02d' $month)\",
      \"dueDate\": \"2025-$(printf '%02d' $month)-05\",
      \"rentAmount\": 30000,
      \"totalAmount\": 30000
    }" > /dev/null
done
echo "✅ Peter: 2 invoices (Oct-Nov)"

echo ""
echo "💰 Recording payments..."

# John - Paid ALL months (Aug-Nov)
for month in {8..11}; do
  # Get invoice ID
  INV_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/invoices?period=2025-$(printf '%02d' $month)&tenantId=$TENANT1" | \
    python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(d[0]['id'] if d else '')" 2>/dev/null)
  
  if [ -n "$INV_ID" ]; then
    curl -s -X POST "$API_URL/payments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"tenantId\": \"$TENANT1\",
        \"unitId\": \"$UNIT1\",
        \"invoiceId\": \"$INV_ID\",
        \"amount\": 25000,
        \"paymentDate\": \"2025-$(printf '%02d' $month)-05\",
        \"method\": \"MPESA\",
        \"reference\": \"MPO2025$(printf '%02d' $month)JOHN\",
        \"notes\": \"Rent for 2025-$(printf '%02d' $month)\"
      }" > /dev/null
  fi
done
echo "✅ John: Paid ALL 4 months (Aug-Nov) - NO ARREARS"

# Mary - Paid Sept & Nov (owes Oct = 1 month)
for month in 9 11; do
  INV_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/invoices?period=2025-$(printf '%02d' $month)&tenantId=$TENANT2" | \
    python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(d[0]['id'] if d else '')" 2>/dev/null)
  
  if [ -n "$INV_ID" ]; then
    curl -s -X POST "$API_URL/payments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"tenantId\": \"$TENANT2\",
        \"unitId\": \"$UNIT2\",
        \"invoiceId\": \"$INV_ID\",
        \"amount\": 25000,
        \"paymentDate\": \"2025-$(printf '%02d' $month)-08\",
        \"method\": \"BANK_TRANSFER\",
        \"reference\": \"BNK2025$(printf '%02d' $month)MARY\",
        \"notes\": \"Rent for 2025-$(printf '%02d' $month)\"
      }" > /dev/null
  fi
done
echo "✅ Mary: Paid Sept & Nov only - OWES OCTOBER (KES 25,000 arrears)"

# Peter - Paid Nov only (owes Oct = 1 month)
INV_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/invoices?period=2025-11&tenantId=$TENANT3" | \
  python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(d[0]['id'] if d else '')" 2>/dev/null)

if [ -n "$INV_ID" ]; then
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT3\",
      \"unitId\": \"$UNIT3\",
      \"invoiceId\": \"$INV_ID\",
      \"amount\": 30000,
      \"paymentDate\": \"2025-11-10\",
      \"method\": \"MPESA\",
      \"reference\": \"MPO202511PETER\",
      \"notes\": \"November 2025 rent\"
    }" > /dev/null
fi
echo "✅ Peter: Paid Nov only - OWES OCTOBER (KES 30,000 arrears)"

echo ""
echo "📊 Checking final metrics..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/dashboard/metrics" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('=== DASHBOARD METRICS ===')
print(f'Properties: {d[\"totalProperties\"]}')
print(f'Units: {d[\"totalUnits\"]} ({d[\"occupiedUnits\"]} occupied)')
print(f'Rent Due This Month: KES {d[\"rentDueThisMonth\"]:,}')
print(f'Rent Received This Month: KES {d[\"rentReceivedThisMonth\"]:,}')
print(f'Collection Rate: {int(d[\"rentReceivedThisMonth\"]/d[\"rentDueThisMonth\"]*100) if d[\"rentDueThisMonth\"]>0 else 0}%')
print(f'Total Arrears: KES {d[\"totalArrears\"]:,}')
print(f'Tenants in Arrears: {d[\"tenantsInArrears\"]}')"

echo ""
echo "🎉 Demo data recreated with recent dates!"
echo ""
echo "📧 Share with client:"
echo "   URL: https://aware-harmony-production.up.railway.app"
echo "   Email: demo@propertym.com"
echo "   Password: Demo@123"
echo ""

