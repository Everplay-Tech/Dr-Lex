
## Engine A — spawn offer draft
curl -s -X POST http://localhost:8787/api/bots/spawn -H "Content-Type: application/json" -d '{"intent":"demo.merchant.offer","policy_id":"lex-default","energy_limit":200,"params":{"engine":"A"}}'

## Engine B — compile data pack plan
curl -s -X POST http://localhost:8787/api/bots/spawn -H "Content-Type: application/json" -d '{"intent":"demo.catalog.build","policy_id":"lex-default","energy_limit":200,"params":{"topics":["pricing-tools","vendor-matrix"]}}'

## Engine C — draft strategy memo
curl -s -X POST http://localhost:8787/api/bots/spawn -H "Content-Type: application/json" -d '{"intent":"demo.scribe.memo","policy_id":"lex-default","energy_limit":200,"params":{"topic":"Pricing Strategy for SaaS $29→$49"}}'
