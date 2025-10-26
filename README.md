
# Dr Lex — MVP Monorepo (v0.5.0)

**Generated:** 2025-10-22T23:02:15.761853Z

This is the self-learning MVP for **Dr Lex**: a Node/TypeScript core (API + Orchestrator),
Python mini-bots, guardrails (policies + budgets), Treasury Loop, Empathy Engine, Templates,
Root Plan mirroring, and a minimal web console.

## Quick Start
```bash
npm install
npm run dev
# open http://localhost:8787
# (optional) seed ledger:
curl -X POST http://localhost:8787/api/treasury/ledger -H "Content-Type: application/json" -d '{"inflow":1000,"desc":"seed capital"}'
```

## Features
- Bot spawn + event streaming (SSE)
- Guardrails (policy sandwich + energy budgets)
- Treasury Loop (Ledger, Orion, Eirene)
- Empathy Engine (feedback → EI)
- Templates (auto-save good missions; replay)
- Root Plan in /docs mirrored to /data
- Self-test endpoint
