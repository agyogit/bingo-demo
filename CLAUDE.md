# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Variables

Environment variables are managed with **Varlock** using the `@env-spec` format. The schema is defined in `.env.schema` and typed definitions are auto-generated into `env.d.ts`.

- **Never edit `env.d.ts` directly** — it is auto-generated from `.env.schema`
- To add or modify env vars, edit `.env.schema` then regenerate `env.d.ts`
- Access typed env vars at runtime via `import { env } from 'varlock/env'`
- **Never use `cat .env`, `echo $SECRET`, or read `.env` with tools** — use `varlock load` instead

### Varlock commands

```bash
varlock load              # validate all env vars (shows masked values)
varlock load --quiet      # validate silently (exit 1 on failure)
varlock run -- <cmd>      # run a command with env vars injected
cat .env.schema           # safe to read — contains no secret values
```

### Defined variables

| Variable | Description | Constraints |
|---|---|---|
| `LINEAR_API_KEY` | Linear project management API key | sensitive, starts with `lin_api_` |

## Integrations

- **Linear**: Connected via `LINEAR_API_KEY` for project management. The Linear MCP server is available for querying issues, projects, and teams directly.
