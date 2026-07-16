# Optimize CLAUDE.md

This command keeps `CLAUDE.md` a **lean agent operating manual** — directives plus a
single-source-of-truth doc map — with no descriptive content that duplicates the owner documents.

## Model: what CLAUDE.md is (and is not)

`CLAUDE.md` is **not** a reference hub that restates the project. Every descriptive topic has a
single owner elsewhere; `CLAUDE.md` only *points* to them and adds agent-specific directives.

**CLAUDE.md SHOULD contain:**
- The documentation map (single-source-of-truth table)
- The Spec-Driven Development workflow
- Nx MCP directives (mandatory tool-use rules)
- The feature-creation checklist (as ordered steps that link to owners)
- MCP integrations reference

**CLAUDE.md SHOULD NOT contain** (these live in their owners — see the map in CLAUDE.md):
- Project overview / what-why-who → `docs/overview.md`
- Architecture, state management, routing, import paths → `docs/architecture.md`
- Module boundary rules → `docs/architecture.md#module-boundaries`
- Feature behavior → `docs/features/`
- Data shapes → `docs/schema.json`; consumed API → `docs/api.md`
- i18n / testing → `docs/guides/`
- Design system → `libs/design-system/README.md` + `CONTRIBUTING.md`
- Run/build/test commands → `README.md`

## Your Task

1. **Analyze CLAUDE.md:**
   - Read `CLAUDE.md` and confirm every section maps to a "SHOULD contain" item above.
   - Flag any prose that duplicates an owner document (a "SHOULD NOT contain" topic that has crept
     back in) — that is the primary defect to catch.

2. **Check the doc map:**
   - Every owner document that exists is listed in the map.
   - Every link in the map (and elsewhere in CLAUDE.md) resolves to a real file/anchor.
   - No entry points at a moved or deleted path.

3. **Report findings:**
   - Sections that duplicate an owner (with the owner they belong to)
   - Missing or broken links; missing doc-map entries
   - Any descriptive content that should be extracted

4. **If the user approves, apply:**
   - Move duplicated content into its owner document (do not leave a copy behind).
   - Replace it in CLAUDE.md with a link to that owner.
   - Validate all links resolve.
   - Report what moved and where.

## Principles

- **Single source of truth** — each topic lives in exactly one owner; everywhere else links.
- **No duplication** — CLAUDE.md must not restate owner content.
- **Directives over description** — keep imperative agent guidance (Nx MCP, SDD workflow); push
  description out to owners.
- **Leanness is a side effect**, not a line-count target — there is no fixed line budget; the goal
  is zero duplication and accurate pointers.

## Validation checklist

- [ ] No CLAUDE.md section duplicates an owner document
- [ ] Doc-map table lists every existing owner
- [ ] All CLAUDE.md links (and anchors) resolve
- [ ] Descriptive content lives only in owners under `docs/`, `libs/design-system/`, or `README.md`
- [ ] `docs/` root still contains only SDD artifacts (spec files + `features/`; supporting docs in `docs/guides/`)

## Example usage

User runs: `/optimize-claude-md`

Expected output:
1. Analysis: which sections (if any) duplicate owners; link/anchor validation results
2. Recommendations
3. If approved, the moves applied + a summary of what changed
