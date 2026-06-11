# LLM Prompt Architecture Optimization Plan

> Date: 2026-06-11
> Scope: LLM dialogue request construction, AI JSON game-control fields, memory injection, provider adaptation.
> Status: Planning

## Purpose

This plan tracks the prompt architecture optimization work for AVG Adventurer Tavern.

The project is not a plain chatbot. AI dialogue can emit JSON fields that interact with game systems, including items, movement, affinity, unlock state, skill learning, clothing, sprites, and long-term memory. Therefore, optimization must preserve this design intent:

**The LLM narrates and declares intent through JSON. Application code validates and settles game state.**

Do not optimize prompt layout in a way that increases the authority of unvalidated AI output.

## Non-Negotiable Invariants

| ID | Invariant | Reason |
|---|---|---|
| I-01 | Real chat history stores only real player messages and displayed assistant dialogue. | Hidden control prompts must not pollute working memory, summaries, or future dialogue. |
| I-02 | AI JSON fields are proposals until validated by application code. | Prevents prompt changes from directly granting items, unlocks, movement, or skills. |
| I-03 | Runtime game state has higher authority than AI narration. | Affinity, unlock gates, skill pools, inventory, scene IDs, and save data are owned by code. |
| I-04 | External or tool/RAG text never enters `system`. | Avoids prompt injection and preserves trust boundaries. |
| I-05 | Dynamic per-turn content must not be inserted into static prefix or history middle. | Preserves prompt-cache stability and avoids history drift. |
| I-06 | Provider fallback must preserve behavior before chasing cache optimization. | OpenAI-format endpoints differ in tail `system`, JSON mode, and compatibility behavior. |

## Execution Order

The order below is mandatory unless a later implementation note explicitly supersedes it.

| Phase | Task | Risk Avoided By Doing This First | Acceptance Criteria | Status |
|---|---|---|---|---|
| 0 | Snapshot current behavior and add focused regression fixtures for AI JSON handling. | Prevents prompt refactors from silently changing game mechanics. | Tests or manual fixtures cover item gain, movement, affinity, unlock, skill learning, clothing, and memory output. | In Progress |
| 1 | Add a centralized AI response normalization and validation layer. | Prevents more reliable prompts from causing more reliable bad state changes. | Parsed AI output is normalized before any handler sees it. Invalid fields are dropped with debug logs. | Complete |
| 1.1 | Validate `affinity_change`: integer, clamp to `-5..5`, preserve session cap behavior. | Prevents model/provider variance from producing extreme relationship changes. | Global affinity remains clamped `0..100`; per-response change is bounded before session accumulation. | Complete |
| 1.2 | Validate `move_to`: known `SceneId`; keep existing forced-location behavior. | Prevents invalid locations and broken ambient/state flow. | Unknown scene IDs are ignored; valid IDs keep current movement lifecycle. | Complete |
| 1.3 | Validate `gain_items`: item exists, count is positive integer, count is bounded, toast only valid items. | Prevents arbitrary inventory injection and UI notifications for invalid items. | Unknown items do not enter inventory or toast queue. | Complete |
| 1.4 | Validate `unlock_request`: known key and `canAttemptUnlock(characterId, key, affinity)` passes. | Prevents AI from bypassing affinity gates or permanent character restrictions. | Failed unlock attempts are ignored and logged; DB is not updated. | Complete |
| 1.5 | Validate `learned_skill`: session not already learned, direct-sex unlock state is present, skill pool has learnable skill. | Prevents accidental skill rewards from unrelated JSON output. | Skill learning remains once per dialogue and still uses code-owned skill selection. | Complete |
| 1.6 | Validate `update_memory`: array shape, length limits, text length limits. | Prevents long or malformed memory injection from polluting long-term memory. | Oversized or malformed memory entries are dropped before DB writes. | Complete |
| 2 | Split request construction from history mutation in `llmService`. | Prevents temporary system tasks from being persisted as user history. | Request builder can send non-persistent task prompts for opening, farewell, movement farewell, summaries, and ambient lines. | Pending |
| 2.1 | Add explicit request options: `persistUser`, `persistAssistant`, `runtimeRules`, `taskType`. | Avoids ambiguous `sendMessage(message)` semantics. | Call sites declare whether a turn is real chat or temporary generation. | Pending |
| 2.2 | Ensure durable chat DB saves only real player text and displayed assistant text. | Keeps AI memory summaries aligned with player-visible story. | Hidden control blocks are absent from saved `chat_messages`. | Pending |
| 3 | Introduce four-part prompt layout. | Improves cache and recency after game-state validation is safe. | Static prefix, stable history, latest user, dynamic tail/session rules are distinct in code. | Pending |
| 3.1 | Static prefix: persona, permanent world rules, JSON protocol, authorization anchor. | Keeps provider-independent stable prefix and trust definitions. | Prefix is byte-stable across turns for same character/config. | Pending |
| 3.2 | Stable history: append-only real `user`/`assistant` messages. | Preserves prompt cache and conversation semantics. | No dynamic runtime state appears between historical messages. | Pending |
| 3.3 | Latest user: current player text plus optional `<search_context>` only for external data. | Keeps untrusted data out of system role. | External/tool/RAG text, if added later, is wrapped as data under latest user. | Pending |
| 3.4 | Dynamic tail: current scene, time, clothing, affinity, unlock status, session caps, memory context. | Gives runtime state recency without contaminating static prefix/history. | Dynamic game facts are rebuilt every request and not persisted as chat history. | Pending |
| 4 | Provider adaptation. | Avoids assuming all OpenAI-format providers support the same message semantics. | Provider policy is centralized and testable. | Pending |
| 4.1 | `openai` and `deepseek`: allow tail `system` for first-party dynamic rules. | Uses stronger role semantics where likely supported. | Request logs show dynamic rules after latest user. | Pending |
| 4.2 | `google`: downgrade dynamic rules into latest user `<session_rules>`. | Gemini OpenAI-compatible layers may move system content to the top. | No tail system is sent for `google`. | Pending |
| 4.3 | `openai_compatible`: default conservative downgrade, with optional explicit tail-system capability flag. | Third-party compatibility is unpredictable. | Unknown endpoints remain behavior-safe by default. | Pending |
| 4.4 | `claude`: do not add Anthropic cache controls until a real Anthropic request path exists. | Avoids sending unsupported fields or assuming absent implementation. | Claude remains unsupported or separately implemented intentionally. | Pending |
| 5 | Reclassify memory injection authority. | Prevents AI-generated summaries/core memories from overriding hard runtime state. | Memory is treated as first-party stored context but cannot override current game state or unlock gates. | Pending |
| 6 | Verify behavior and cache. | Confirms optimization did not break gameplay. | Regression fixtures pass; debug logs show clean history and valid provider layout. | Pending |

## Field-Specific Guardrails

| Field | Current Role | Required Runtime Authority | Notes |
|---|---|---|---|
| `text` | Displayed dialogue | LLM-authored, format-sanitized by app | Preserve markdown/display behavior. |
| `emotion` | Sprite selection | App validates/falls back | Unknown emotions should fall back to default sprite. |
| `clothing` | Clothing state | App validates allowed states and NSFW setting | Only `default`, `nude`, `bondage` unless explicitly expanded. |
| `gain_items` | Inventory mutation | App validates item IDs and counts | AI must not be able to mint arbitrary unknown items. |
| `move_to` | Character forced location | App validates scene and movement lifecycle | Moving may end dialogue; preserve current flow. |
| `affinity_change` | Relationship value | App clamps and applies session rules | Prompt may suggest, code settles. |
| `unlock_request` | Relationship gate mutation | App checks `canAttemptUnlock` and current state | Never rely only on prompt text for affinity gates. |
| `learned_skill` | Player skill reward | App checks session lock and learnable skill pool | AI does not choose the skill ID. |
| `update_memory` | Long-term memory write | App validates shape and length | Consider whether memory is core fact or summary material. |

## Implementation Memo

### Why Validation Comes Before Prompt Layout

Prompt layout changes can increase model compliance. In this project, compliance means not only better dialogue, but also more frequent and more consistent JSON game instructions. If handlers accept those instructions without business validation, prompt optimization can amplify state corruption.

Therefore, Phase 1 must precede Phase 3.

### Why History Cleanup Comes Before Cache Optimization

Current hidden prompts for opening lines, farewell lines, and movement farewells can enter `llmService.history`. If cache optimization is added before separating persistent and non-persistent turns, the system may preserve and cache polluted history more efficiently.

Therefore, Phase 2 must precede cache-focused work.

### Why Provider Downgrade Must Be Conservative

The project supports OpenAI-format providers, but OpenAI-format only describes a surface API. It does not guarantee identical handling of tail `system`, `response_format`, cache behavior, or message ordering. Unknown compatible endpoints must prefer behavior preservation over theoretical prompt priority.

Therefore, provider-specific tail `system` should be opt-in for unknown endpoints.

### Why Memory Must Not Override Runtime State

Core memories and summaries improve continuity, but some are AI-generated. They can describe past events, preferences, and agreements; they must not override current unlock state, affinity gates, clothing state, inventory, skill availability, or scene validity.

Memory context should be near the generation point for recency, but still subordinate to code-owned game state.

## Suggested Milestones

| Milestone | Scope | Exit Condition |
|---|---|---|
| M1 | AI response validation layer | All JSON game fields pass centralized normalization before handlers. |
| M2 | Non-persistent generation requests | Opening/farewell/ambient/task prompts no longer enter real chat history. |
| M3 | Prompt builder extraction | Request layout is generated from named sections instead of ad hoc string concatenation. |
| M4 | Provider policy | `openai`, `deepseek`, `google`, and unknown compatible providers produce expected layouts. |
| M5 | Memory authority cleanup | Memory context is injected dynamically and cannot override current game state. |
| M6 | Regression verification | Existing AI-driven mechanics still work and invalid JSON fields fail safely. |

## Regression Checklist

- [ ] Valid `gain_items` adds inventory and shows toast.
- [ ] Invalid `gain_items` is ignored and does not show toast.
- [ ] Valid `move_to` updates forced location and preserves movement farewell flow.
- [ ] Invalid `move_to` is ignored.
- [ ] `affinity_change` larger than `5` or lower than `-5` is clamped before applying.
- [ ] Positive affinity session cap remains effective.
- [ ] Negative affinity can still trigger angry dialogue end unless `bondage`.
- [ ] `unlock_request` succeeds only when affinity and character restrictions allow it.
- [ ] `unlock_request` fails safely when conditions are insufficient.
- [ ] `learned_skill` triggers at most once per dialogue.
- [ ] `learned_skill` does not choose arbitrary skill IDs.
- [ ] `update_memory` malformed entries are ignored.
- [ ] Opening/farewell/ambient system prompts are not saved as user history.
- [ ] Real player and assistant visible messages still save to AI memory.
- [ ] `google` requests do not rely on tail `system`.
- [ ] Unknown `openai_compatible` providers use conservative layout by default.

## Open Questions

| Question | Why It Matters | Suggested Resolution |
|---|---|---|
| Should `learned_skill` runtime validation inspect dialogue content, or only unlock/session/skill state? | Content inspection is hard, but prompt-only trigger remains weak. | Start with unlock/session/skill checks; add stricter event-state tracking later if needed. |
| Should AI-generated core memories be editable or reviewable? | Incorrect memories can affect future roleplay. | Keep current behavior first; consider memory UI later. |
| Should special character item rewards have explicit code-side trigger tables? | Prevents arbitrary item rewards while preserving character-specific gifts. | Begin with item ID/count validation; add trigger tables only if abuse or drift appears. |
| Should `openai_compatible` expose a UI toggle for tail system support? | Some endpoints may support it well. | Add config only after conservative default is stable. |

## Completion Definition

This optimization is complete only when all of the following are true:

1. AI JSON game fields are centrally normalized and validated.
2. Temporary control prompts are no longer persisted as real chat history.
3. Prompt construction has explicit static/history/latest/dynamic sections.
4. Provider-specific fallback preserves game behavior for OpenAI-format models.
5. Existing AI-driven game mechanics continue to pass regression checks.
6. Debug logs make invalid AI fields and provider layout decisions observable.
