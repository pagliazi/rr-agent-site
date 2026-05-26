# RR-Agent

A quantitative **research agent**. On top of a clean data layer it runs the full chain — **factor mining → ML selection → portfolio optimization → backtest → execution (user-driven)** — with multi-provider LLMs throughout. Available via a web console, the `rragent` / `rr-agent` CLI, and API / MCP.

> Capability showcase only. For data-research purposes only; not investment advice, reference, recommendation, or managed accounts. All decisions and P&L are the user's own.

**[reachrich.ai](https://reachrich.ai)** · Docs: [Overview](docs/rr-agent.md) · [Methodology](docs/methodology.md) · [Performance](docs/performance.md) · [Factors](docs/factors.md) · [Interfaces](docs/interfaces.md)

## Data comes from ReachRich

RR-Agent does not collect data itself. As the **caller**, it requests quotes, news, fundamentals, and flows from **ReachRich** (a separate multi-market data platform) via API / MCP, then runs research and execution locally. The two are separated and evolve independently.

## Research chain

Factor mining (7 categories) → ML selection → portfolio optimization (industry-neutral + risk constraints) → backtest (CPCV + DSR + cost gate) → execution tools (user-driven). Multi-provider LLMs run throughout.

## Why it's trustworthy

- Backtests are always labeled "backtest"; **never presented as live**. Live curves use real positions × real closes and are reconcilable.
- Factors must pass **out-of-sample + DSR + cost gate** to enter the live candidate pool.
- We publish the **validation method and out-of-sample results**, not the factors themselves — names, formulas, parameters, and model weights are IP and not disclosed.

## Disclaimer

Showcase repository. No backend code, credentials, keys, model weights, or deployment details. Backtest figures are backtest-basis, not live; live typically underperforms backtest. Not investment advice or a promise of return.
