# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.1] - 2026-10-27

Documentation-only release: no runtime, API or behavioural changes.

### Changed

- `README.md`: the npm version badge is now served by shields.io, which reflects
  a new release within minutes — the previous badge provider cached the version
  for up to three days and could display a stale number.
- `README.md`: "current release" reference bumped to `3.0.1`.

## [3.0.0] - 2026-10-27

Full alignment with the provider API schemas as of October 2026, hardened
error and retry handling, and a cleanup pass over unused modules.

This release is **breaking**: every provider now talks to a different endpoint
and/or request shape, and unsupported parameters (such as `temperature` on
reasoning-only endpoints) are no longer forwarded.

### Breaking changes

- **OpenAI** — migrated from Chat Completions to the **Responses API**
  (`POST https://api.openai.com/v1/responses`).
  - The prompt is sent as `input[].content[].input_text`, the system prompt is
    passed as `instructions` instead of a `system` message.
  - `max_tokens` is replaced by `max_output_tokens`.
  - Reasoning depth is controlled with `reasoning.effort`.
  - `store` defaults to `false` (the API default of `true` keeps requests for
    30 days), so prompts are not persisted unless explicitly requested.
  - The answer is concatenated from `output[].content[].text`, and
    `finishReason` is derived from the response `status` and
    `incomplete_details`.
- **Anthropic** — Messages API updated to the current schema.
  - `anthropic-version` header is now `2026-10-21`.
  - `temperature` is no longer sent; reasoning depth is controlled with
    `output_config.effort`.
  - Extended thinking is opt-in through `thinking` (model default or
    `request.thinking`).
  - Only `text` blocks are concatenated — `thinking` blocks carry no `.text`
    field and are skipped instead of producing `undefined` in the output.
- **Google** — migrated from `generateContent` to the **Interactions API**.
  - Endpoint is `POST /v1beta/interactions`, authenticated with the
    `x-goog-api-key` header.
  - Parameters moved into `generation_config` (`max_output_tokens`,
    `thinking_level`); `temperature` is not supported by this endpoint.
  - The answer is read from `steps[].content[]` (previously `outputs`).
  - `status` is mapped to `finishReason`, and `total_thought_tokens` is
    included in `completionTokens`, so
    `totalTokens === promptTokens + completionTokens` holds.
- **Model configuration** — `config/models.json` now describes real 2026 model
  ids with explicit `capabilities` (`temperature`, `thinking`, `effort`),
  `api`, `apiTier` and per-model defaults. Model identifiers changed, and
  `gemini-3.8-flash` was removed (the endpoint returned a sustained `503`)
  in favour of `gemini-3.6-flash`.
- **Node.js** — `engines.node` is now `>=20.10.0`.

### Changed

- **DeepSeek** — request body aligned with the current API: reasoning depth is
  sent as `reasoning_effort`, extended thinking as `thinking`, and
  `temperature` is only forwarded for models whose
  `capabilities.temperature` is not `false`.
- **Billing** — pricing tiers refreshed for the new models; cached input
  tokens and Anthropic cache writes are billed at their own rates, and
  reasoning/thinking tokens are billed as output tokens.
- **BaseProvider** — shared prompt/parameter plumbing so every provider builds
  the same request from the unified `generate()` input.
- **Dependencies** — `undici` raised to `^7.30.1`; versions `7.0.0`–`7.30.0`
  are affected by high-severity advisories (response desynchronization via the
  retry interceptor, CRLF injection, cache disclosure, DoS). Staying on the
  `7.x` line keeps `engines.node >=20.10.0` valid — `undici@8` requires
  Node.js `>=22.19.0`. `npm audit` now reports zero vulnerabilities.
- **README** — rewritten around the current API surface: response shape,
  plugin events, retry semantics, per-provider endpoint table and known
  provider-side limitations.

### Added

- `AIError` now exposes `code`, `model`, `duration`, `retryAfter` and
  `requestId`, so failures can be handled programmatically instead of by
  parsing messages.
- `HttpClient` wraps undici/network failures into `AIError` (previously they
  escaped as raw `TypeError`), extracts the error message with `||` so an
  empty body no longer hides the HTTP status, and parses `Retry-After` and
  request-id headers.
- `Retry` honours `Retry-After` (capped at 30 seconds) and retries
  `408`, `429`, `500`, `502`, `503`, `504`, `529` as well as network error
  codes (`ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`, `EPIPE`, `EAI_AGAIN`,
  `UND_ERR_*`) with exponential backoff.

### Fixed

- `AIClient` error enrichment used `??=`, which never fired because `AIError`
  initialises those fields to empty strings — provider, model and duration
  were silently lost on failures. Replaced with explicit falsy checks.
- Task-oriented prompt handling no longer leaks an `undefined` entry into the
  response text when a provider returns non-text blocks.

### Removed

- `src/types/AIRequest.js` and `src/types/AIResponse.js` — JSDoc-only files
  that were never imported.
- `src/constants/HttpStatus.js` — superseded by the numeric codes in `Retry`.
- `src/utils/Cost.js` — superseded by `plugins/BillingPlugin/Billing.js`.

## [2.0.0] - 2026-07-20

Plugin architecture and event system.

### Added

- `EventEmitter`-based lifecycle events: `request:start`, `request:success`,
  `request:error`, `request:finish`.
- `Plugin` base class plus dynamic registration/unregistration.
- `TelemetryPlugin` (logging and metrics) and `BillingPlugin` (cost tracking).

### Breaking changes

- Client telemetry is configured through plugins instead of the constructor
  `telemetry` option.

## [1.0.2] - 2026-03-14

### Fixed

- OpenAI: native handling for next-generation reasoning models (`gpt-5`,
  `gpt-5-mini` and the `o`-series); `temperature` is only sent to models that
  support it.

## [1.0.0] - 2026-02-01

### Added

- Initial release: a unified `AIClient` for OpenAI, Anthropic, Google and
  DeepSeek with automatic retries, cost tracking and telemetry.

[Unreleased]: https://github.com/testapiw/ai-providers/compare/v3.0.1...HEAD
[3.0.1]: https://github.com/testapiw/ai-providers/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/testapiw/ai-providers/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/testapiw/ai-providers/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/testapiw/ai-providers/compare/v1.0.0...v1.0.2
[1.0.0]: https://github.com/testapiw/ai-providers/releases/tag/v1.0.0
