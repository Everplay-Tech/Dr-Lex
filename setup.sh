
#!/usr/bin/env bash
set -e
echo "Installing dependencies..."; npm install
echo "Starting Dr Lex (dev)..."; npm run dev &
PID=$!; sleep 2
echo "Seeding ledger with $1000 seed capital..."
curl -s -X POST http://localhost:8787/api/treasury/ledger -H "Content-Type: application/json" -d '{"inflow":1000,"desc":"seed capital"}' || true
echo "Open http://localhost:8787 in your browser."
wait $PID
