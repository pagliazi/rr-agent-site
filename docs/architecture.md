# 系统架构（高层概念）

> 仅展示**高层逻辑分层与调用关系**，**不涉及主机、IP、内网拓扑、技术栈或部署细节**。

## 分层与调用

```mermaid
flowchart TB
  subgraph ACCESS["接入层"]
    UI[Web 控制台]
    API[API / MCP]
    CLI["命令行 (rragent / rr-agent)"]
  end

  subgraph AGENT["RR-Agent · 智能体层（调用方）"]
    ORCH[LLM 编排 · 多 provider]
    QUANT[因子挖掘 / ML 选股 / 组合优化 / 回测]
    EXEC[交易执行工具 · 用户自主]
  end

  subgraph SVC["ReachRich · 数据服务层（被调用）"]
    GW[数据 API 网关]
    CACHE[(缓存 / 加速)]
  end

  subgraph DATA["数据底座 · 多源 · 高可用"]
    ING[多源采集]
    XCHK[交叉校验 / 复权一致]
    STORE[(实时 + 历史存储)]
  end

  XCUT["贯穿能力：风控 · 自愈 · 多源容错 · 审计留痕"]

  ACCESS --> AGENT
  AGENT ==>|调用 API / MCP 取数| SVC
  SVC --> CACHE --> GW
  GW --> DATA
  ING --> XCHK --> STORE
  STORE --> CACHE
  XCUT -.贯穿.-> AGENT
  XCUT -.贯穿.-> SVC
  XCUT -.贯穿.-> DATA
```

## 关键设计（健壮性）

- **调用解耦**：RR-Agent（智能体）通过 API / MCP **调用** ReachRich（数据服务），两者职责分离、独立演进。
- **多源容错**：数据底座多源采集 + 交叉校验，单源异常自动降级/切换。
- **缓存加速**：高频/可缓存数据经缓存层，降低回源压力。
- **自愈与监控**：核心服务异常自动恢复 + 中央健康监测 + 告警。
- **审计留痕**：交易与信号可追溯、可对账。

> 本页为概念性分层说明，用于理解系统职责与调用关系；不代表也不公开实际部署架构。
