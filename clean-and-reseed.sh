#!/bin/bash

# Clean Old Data and Create Fresh Demo Data with Recent Dates

API_URL="https://clever-passion-production.up.railway.app/api"

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@propertym.com","password":"Demo@123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi
echo "✅ Logged in successfully"
echo ""

# Step 1: Delete ALL existing data (except properties, units, tenants)
echo "🗑️  Step 1: Cleaning old data..."
echo "   Deleting payments..."
PAYMENTS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/payments")
echo "$PAYMENTS_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin).get('data', [])
    print(f'   Found {len(data)} payments to delete')
except:
    print('   No payments found')
"

echo "   Deleting tenancies..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/tenants" | python3 << 'PYEOF'
import sys, json, requests, os

token = os.environ.get('TOKEN')
api_url = os.environ.get('API_URL')

try:
    data = json.load(sys.stdin).get('data', [])
    tenancies_deleted = 0
    
    for tenant in data:
        if tenant.get('currentTenancy'):
            tenancy_id = tenant['currentTenancy']['id']
            # Move out tenant
            requests.patch(
                f"{api_url}/tenancies/{tenancy_id}/move-out",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "moveOutDate": "2025-11-17",
                    "depositStatus": "REFUNDED",
                    "depositRefunded": 0
                }
            )
            tenancies_deleted += 1
    
    print(f'   Ended {tenancies_deleted} tenancies')
except Exception as e:
    print(f'   Note: {e}')
PYEOF

TOKEN=$TOKEN API_URL=$API_URL python3 << 'EOF'
import requests, os, time

token = os.environ['TOKEN']
api = os.environ['API_URL']
headers = {"Authorization": f"Bearer {token}"}

# Get and delete all payments
try:
    payments = requests.get(f"{api}/payments", headers=headers).json().get('data', [])
    for p in payments:
        requests.delete(f"{api}/payments/{p['id']}", headers=headers)
        time.sleep(0.1)
    print(f"   ✅ Deleted {len(payments)} payments")
except Exception as e:
    print(f"   Note: {e}")

# Note: Invoices might cascade delete with tenancies
print("   ✅ Old data cleaned")
EOF

echo ""
echo "🏠 Step 2: Creating fresh tenancies (recent dates)..."

# Get IDs
TENANTS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/tenants")
UNITS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/units")

TENANT1=$(echo "$TENANTS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'John' in x.get('firstName','')]; print(t[0]['id'] if t else '')" 2>/dev/null)
TENANT2=$(echo "$TENANTS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'Mary' in x.get('firstName','')]; print(t[0]['id'] if t else '')" 2>/dev/null)
TENANT3=$(echo "$TENANTS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'Peter' in x.get('firstName','')]; print(t[0]['id'] if t else '')" 2>/dev/null)
TENANT4=$(echo "$TENANTS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; t=[x for x in d if 'Grace' in x.get('firstName','')]; print(t[0]['id'] if t else '')" 2>/dev/null)

UNIT1=$(echo "$UNITS_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)
UNIT2=$(echo "$UNITS_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][1]['id'])" 2>/dev/null)
UNIT3=$(echo "$UNITS_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][2]['id'])" 2>/dev/null)
UNIT4=$(echo "$UNITS_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][3]['id'])" 2>/dev/null)

# Create tenancies (September-November 2025 move-ins)
echo "   Creating tenancy: John → Unit 1A (Sept 1)"
TENANCY1=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT1\",
    \"unitId\": \"$UNIT1\",
    \"moveInDate\": \"2025-09-01\",
    \"depositPaid\": 25000,
    \"depositPaidDate\": \"2025-09-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)

echo "   Creating tenancy: Mary → Unit 2A (Oct 1)"
TENANCY2=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT2\",
    \"unitId\": \"$UNIT2\",
    \"moveInDate\": \"2025-10-01\",
    \"depositPaid\": 25000,
    \"depositPaidDate\": \"2025-10-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)

echo "   Creating tenancy: Peter → Unit 3A (Oct 15)"
TENANCY3=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT3\",
    \"unitId\": \"$UNIT3\",
    \"moveInDate\": \"2025-10-15\",
    \"depositPaid\": 30000,
    \"depositPaidDate\": \"2025-10-15\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)

echo "   Creating tenancy: Grace → Unit 4A (Nov 1)"
TENANCY4=$(curl -s -X POST "$API_URL/tenancies/move-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenantId\": \"$TENANT4\",
    \"unitId\": \"$UNIT4\",
    \"moveInDate\": \"2025-11-01\",
    \"depositPaid\": 25000,
    \"depositPaidDate\": \"2025-11-01\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)

echo "   ✅ Created 4 fresh tenancies"

echo ""
echo "📄 Step 3: Creating ONLY recent invoices (Sept-Nov 2025)..."

# John's invoices (Sept, Oct, Nov)
for month in 09 10 11; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenancyId\": \"$TENANCY1\",
      \"tenantId\": \"$TENANT1\",
      \"unitId\": \"$UNIT1\",
      \"period\": \"2025-$month\",
      \"dueDate\": \"2025-$month-05\",
      \"rentAmount\": 25000,
      \"totalAmount\": 25000
    }" > /dev/null && echo "   Invoice: John - 2025-$month"
done

# Mary's invoices (Oct, Nov)
for month in 10 11; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenancyId\": \"$TENANCY2\",
      \"tenantId\": \"$TENANT2\",
      \"unitId\": \"$UNIT2\",
      \"period\": \"2025-$month\",
      \"dueDate\": \"2025-$month-05\",
      \"rentAmount\": 25000,
      \"totalAmount\": 25000
    }" > /dev/null && echo "   Invoice: Mary - 2025-$month"
done

# Peter's invoices (Nov only - just moved in Oct 15)
curl -s -X POST "$API_URL/invoices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenancyId\": \"$TENANCY3\",
    \"tenantId\": \"$TENANT3\",
    \"unitId\": \"$UNIT3\",
    \"period\": \"2025-11\",
    \"dueDate\": \"2025-11-05\",
    \"rentAmount\": 30000,
    \"totalAmount\": 30000
  }" > /dev/null && echo "   Invoice: Peter - 2025-11"

# Grace's invoice (Nov only - just moved in)
curl -s -X POST "$API_URL/invoices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"tenancyId\": \"$TENANCY4\",
    \"tenantId\": \"$TENANT4\",
    \"unitId\": \"$UNIT4\",
    \"period\": \"2025-11\",
    \"dueDate\": \"2025-11-05\",
    \"rentAmount\": 25000,
    \"totalAmount\": 25000
  }" > /dev/null && echo "   Invoice: Grace - 2025-11"

echo "   ✅ Created 7 invoices (Sept-Nov 2025 only)"

echo ""
echo "💰 Step 4: Recording payments (higher collection rate)..."

# Get invoice IDs for November
INVS_NOV=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/invoices?period=2025-11")

INV_JOHN_NOV=$(echo "$INVS_NOV" | python3 -c "import sys,json; d=[i for i in json.load(sys.stdin).get('data',[]) if 'John' in i.get('tenant',{}).get('firstName','')]; print(d[0]['id'] if d else '')" 2>/dev/null)
INV_MARY_NOV=$(echo "$INVS_NOV" | python3 -c "import sys,json; d=[i for i in json.load(sys.stdin).get('data',[]) if 'Mary' in i.get('tenant',{}).get('firstName','')]; print(d[0]['id'] if d else '')" 2>/dev/null)
INV_PETER_NOV=$(echo "$INVS_NOV" | python3 -c "import sys,json; d=[i for i in json.load(sys.stdin).get('data',[]) if 'Peter' in i.get('tenant',{}).get('firstName','')]; print(d[0]['id'] if d else '')" 2>/dev/null)
INV_GRACE_NOV=$(echo "$INVS_NOV" | python3 -c "import sys,json; d=[i for i in json.load(sys.stdin).get('data',[]) if 'Grace' in i.get('tenant',{}).get('firstName','')]; print(d[0]['id'] if d else '')" 2>/dev/null)

# JOHN: Paid September, October, November (ALL CURRENT)
INVS_JOHN=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/invoices?tenantId=$TENANT1")
echo "$INVS_JOHN" | python3 << PYEOF
import sys, json, requests, os

token = os.environ.get('TOKEN')
api = os.environ.get('API_URL')
tenant1 = os.environ.get('TENANT1')
unit1 = os.environ.get('UNIT1')

invoices = json.load(sys.stdin).get('data', [])
john_invs = [i for i in invoices if i['tenantId'] == tenant1]

for inv in john_invs:
    period = inv['period']
    month = period.split('-')[1]
    # Create payment
    requests.post(
        f"{api}/payments",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "tenantId": tenant1,
            "unitId": unit1,
            "invoiceId": inv['id'],
            "amount": 25000,
            "paymentDate": f"2025-{month}-06",
            "method": "MPESA",
            "reference": f"MPO2025{month}JOHN",
            "notes": f"Rent for {period}"
        }
    )
    print(f"   ✅ John paid {period}")
PYEOF

# MARY: Paid October and November (owes September = 1 month)
if [ -n "$INV_MARY_NOV" ]; then
  INVS_MARY=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/invoices?tenantId=$TENANT2")
  echo "$INVS_MARY" | python3 << PYEOF
import sys, json, requests, os

token = os.environ['TOKEN']
api = os.environ['API_URL']
tenant2 = os.environ['TENANT2']
unit2 = os.environ['UNIT2']

invoices = json.load(sys.stdin).get('data', [])
mary_invs = [i for i in invoices if i['tenantId'] == tenant2 and i['period'] in ['2025-10', '2025-11']]

for inv in mary_invs:
    period = inv['period']
    month = period.split('-')[1]
    requests.post(
        f"{api}/payments",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "tenantId": tenant2,
            "unitId": unit2,
            "invoiceId": inv['id'],
            "amount": 25000,
            "paymentDate": f"2025-{month}-07",
            "method": "BANK_TRANSFER",
            "reference": f"BNK2025{month}MARY",
            "notes": f"Rent for {period}"
        }
    )
    print(f"   ✅ Mary paid {period}")
PYEOF
fi

# PETER: Paid November only (owes nothing yet - just moved in Oct 15, first rent is Nov)
if [ -n "$INV_PETER_NOV" ]; then
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT3\",
      \"unitId\": \"$UNIT3\",
      \"invoiceId\": \"$INV_PETER_NOV\",
      \"amount\": 30000,
      \"paymentDate\": \"2025-11-06\",
      \"method\": \"MPESA\",
      \"reference\": \"MPO202511PETER\",
      \"notes\": \"November 2025 rent\"
    }" > /dev/null && echo "   ✅ Peter paid Nov"
fi

# GRACE: Paid November (current)
if [ -n "$INV_GRACE_NOV" ]; then
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"tenantId\": \"$TENANT4\",
      \"unitId\": \"$UNIT4\",
      \"invoiceId\": \"$INV_GRACE_NOV\",
      \"amount\": 25000,
      \"paymentDate\": \"2025-11-08\",
      \"method\": \"MPESA\",
      \"reference\": \"MPO202511GRACE\",
      \"notes\": \"November 2025 rent\"
    }" > /dev/null && echo "   ✅ Grace paid Nov"
fi

echo ""
echo "📊 Step 5: Verifying final metrics..."

curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/dashboard/metrics" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('=== FINAL DASHBOARD METRICS ===')
print(f'Properties: {d[\"totalProperties\"]}')
print(f'Units: {d[\"totalUnits\"]} ({d[\"occupiedUnits\"]} occupied, {d[\"vacantUnits\"]} vacant)')
print(f'')
print(f'THIS MONTH (November 2025):')
print(f'  Rent Due: KES {d[\"rentDueThisMonth\"]:,}')
print(f'  Rent Received: KES {d[\"rentReceivedThisMonth\"]:,}')
print(f'  Collection Rate: {int(d[\"rentReceivedThisMonth\"]/d[\"rentDueThisMonth\"]*100) if d[\"rentDueThisMonth\"]>0 else 0}%')
print(f'')
print(f'ARREARS:')
print(f'  Total Arrears: KES {d[\"totalArrears\"]:,}')
print(f'  Tenants in Arrears: {d[\"tenantsInArrears\"]}')"

echo ""
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/dashboard/arrears" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
if data:
    print('TENANTS WITH ARREARS:')
    for t in data:
        print(f'  • {t[\"tenantName\"]}: KES {t[\"arrearsAmount\"]:,} ({t[\"daysOverdue\"]} days overdue)')
else:
    print('  No tenants in arrears!')"

echo ""
echo "🎉 DEMO DATA RECREATED WITH RECENT DATES!"
echo ""
echo "📧 Demo URL: https://aware-harmony-production.up.railway.app"
echo "🔑 Login: demo@propertym.com / Demo@123"
echo ""

