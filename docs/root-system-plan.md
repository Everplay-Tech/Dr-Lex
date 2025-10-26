
# Dr Lex — Root System Plan V1

## 1) Financial Roots (choose 2–3 engines)
| Engine | Description | Launch Target | Manual Actions | Bot Support |
|-------|-------------|---------------|----------------|-------------|
| A |  |  |  | Fabricant + Ledger |
| B |  |  |  | Arbitra + Orion |
| C (opt) |  |  |  | Eirene (audit) |

## 2) Daily Ritual Loop (14 days)
- Morning Review → 1 paragraph observation (ethics/economy)
- Mid-day Cycle → run one mission (Fabricant/Arbitra/Ledger)
- Evening Reflection → tag `EI_pre` (expected empathy) and write 1 line lesson

## 3) Wisdom Credits (WC)
| Event | WC | Note |
|-------|----|------|
| Correct bot decision with better outcome | +2 |  |
| Manual profit above projection | +1 |  |
| Ethical call that trades profit for trust | +3 |  |
| Mistake identified + documented | +1 |  |

**Wisdom Score (14d)** = sum(WC) over last 14 days.

## 4) 14-day Timeline
| Day | Focus | Outcome |
|-----|-------|---------|
| 1–3 | Define Engines A/B/C | Plan locked |
| 4–7 | Fabricant + Ledger cycles | First cashflow entries |
| 8–10 | Orion + Eirene | Treasury loop complete |
| 11–14 | Metrics review | Policy v1.1 drafted |

## 5) First-Run Commands
```bash
npm install
npm run dev
# optional: seed ledger
curl -X POST http://localhost:8787/api/treasury/ledger -H "Content-Type: application/json" -d '{"inflow":1000,"desc":"seed capital"}'
# open http://localhost:8787
```
