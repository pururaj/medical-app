---
name: flyway-migration
description: Create a Flyway SQL migration for a backend service (new table, new column, index, seed data) and keep the JPA entity in sync. Use when asked to change a database schema, add a column/table/index, or "create a migration" in any backend/*-service.
---

# Flyway migration

Migrations live in `backend/<service>/src/main/resources/db/migration/`. All services run `spring.jpa.hibernate.ddl-auto: validate`, so a mismatch between SQL and entity stops the service at startup.

## Steps

1. **Find the next version** — never edit or renumber an existing file (it's already applied in someone's DB and checksummed):
   ```bash
   ls backend/<service>/src/main/resources/db/migration/
   ```
   Name: `V<next>__<snake_case_description>.sql` (two underscores). Examples in repo: `V4__add_gst_fields.sql`, `V3__add_barcode_to_medicine.sql`.

2. **Write PostgreSQL SQL** in the repo's style:
   - `BIGSERIAL PRIMARY KEY`, `VARCHAR(n)` matching entity `length`, `NUMERIC(p,s)` for money, `BOOLEAN NOT NULL DEFAULT TRUE` for `active`, `created_at TIMESTAMP NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMP`
   - Enums stored as `VARCHAR(20)` (entity uses `EnumType.STRING`)
   - FKs: `<parent>_id BIGINT NOT NULL REFERENCES <parent>(id)`; add an index on every FK
   - `CREATE TABLE IF NOT EXISTS` for new tables
   - New `NOT NULL` column on an existing table → add it with a `DEFAULT` (or add nullable, backfill, then `SET NOT NULL`) so existing rows don't break
   - Seed rows only for reference/catalogue data, never patient data

3. **Update the entity** to match exactly: column name, length, nullability, precision/scale, and `@Index` entries in `@Table(indexes=...)`. Update DTOs, request classes, `toDto()`/mapper, and the frontend interface in `frontend/medical-app-ui/src/app/core/services/<service>.service.ts`.

4. **Check** each new column appears in: SQL, entity, DTO, toDto, (Create/Update request if writable), frontend TS interface.

5. **Verify**: build the module, then start it against its local DB (ports in project memory / `application.yml`) and confirm Flyway logs `Successfully applied 1 migration` with no Hibernate validation error.

## Gotchas
- Destructive changes (DROP COLUMN/TABLE, type narrowing) — confirm with the user first; this is medical data and retention rules apply.
- Don't put real PHI in seed data.

Commit: `feat(<service>): add migration V<n> for <change>`
