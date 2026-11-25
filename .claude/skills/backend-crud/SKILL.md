---
name: backend-crud
description: Add a new entity/resource with CRUD REST endpoints to an existing Spring Boot service in backend/ following this repo's conventions (ApiResponse/PageResponse wrappers, JPA Specification filtering, soft delete, Flyway, DTOs). Use when asked to add an endpoint, resource, entity, or API to patient/appointment/doctor/inventory/pharmacy/lab or any other backend service.
---

# Backend CRUD resource

Reference: `backend/lab-service` — `TestCatalogueController`, `TestCatalogueService`, `TestCatalogue`, `CreateCatalogueRequest`, `UpdateCatalogueRequest`, `TestCatalogueDto`. Read the matching files in the **target** service first; if it differs from lab-service (e.g. patient-service uses MapStruct mappers), follow the target service.

## Files to create (package `com.medical.<service>`)

1. **Flyway migration** — see the `flyway-migration` skill. `ddl-auto: validate` means the entity must match the SQL exactly or the service will not start.
2. **entity/`<Name>`.java**
   - `@Entity @Table(name="snake_case", indexes=...)`, `@EntityListeners(AuditingEntityListener.class)`
   - Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
   - `@Id @GeneratedValue(strategy = IDENTITY) Long id`
   - Explicit `@Column(name=..., length=..., nullable=...)` for every field; `BigDecimal` with `precision/scale` for money
   - Enums nested in the entity, `@Enumerated(EnumType.STRING)`
   - `@Builder.Default Boolean active = true` when soft-deleting
   - `@CreatedDate createdAt` (updatable=false), `@LastModifiedDate updatedAt`
   - Parent→child: `@OneToMany(mappedBy=..., cascade=ALL, fetch=EAGER)` with `@Builder.Default List<> = new ArrayList<>()`; child side `@ManyToOne(fetch=LAZY)`. EAGER on the parent avoids `LazyInitializationException` in `toDto()`.
3. **dto/** — `<Name>Dto` (response, `@Data @Builder`), `Create<Name>Request` (`@Data` + jakarta validation `@NotBlank/@NotNull/...`), `Update<Name>Request` (all fields nullable for partial update). Never return entities from controllers.
4. **repository/`<Name>Repository`** — `extends JpaRepository<Name, Long>, JpaSpecificationExecutor<Name>`.
   - Optional filters go through `Specification`, **not** JPQL `(:param IS NULL OR ...)` — that fails on PostgreSQL with a type error.
   - Counts/aggregates can be `@Query` with `@Param`.
5. **service/`<Name>Service`** — `@Service @RequiredArgsConstructor`
   - `@Transactional(readOnly = true)` on reads, `@Transactional` on writes
   - List method builds a `Specification`, uses `PageRequest.of(page, size, Sort...)`, returns `PageResponse.<Dto>builder()...build()`
   - `findById` throws `com.medical.shared.exception.ResourceNotFoundException` (→ 404 via shared `GlobalExceptionHandler`)
   - Update applies only non-null fields
   - Delete = set `active=false` unless the user explicitly wants hard delete
   - Private `toDto()` (or mapper if the service already has one)
6. **controller/`<Name>Controller`** — `@RestController @RequestMapping("/api/v1/<service>/<plural>") @CrossOrigin(origins="*") @RequiredArgsConstructor`
   - Return `ResponseEntity<ApiResponse<T>>` using `ApiResponse.success(data)` / `success("msg", data)`
   - GET list: `keyword`, `page=0`, `size=20` request params → `ApiResponse<PageResponse<Dto>>`
   - POST: `@Valid @RequestBody`, `HttpStatus.CREATED`
   - PUT `/{id}`, DELETE `/{id}`
   - Do **not** add `allowCredentials(true)` anywhere — it conflicts with `origins="*"`.

## Gateway

If the path is under an existing prefix (e.g. `/api/v1/lab/**`) no gateway change is needed. A new top-level prefix needs a route in `backend/api-gateway/src/main/resources/application.yml`.

## Compliance checks (CLAUDE.md)

- Don't log request bodies or PHI (names, phone, DOB, diagnoses). Log IDs only.
- Validate every input on the Create request.
- Add the endpoint to the OpenAPI annotations if the service uses springdoc annotations.

## Finish

- Write unit tests with the `backend-tests` skill.
- Build the module (command in `new-microservice` skill §4).
- If a frontend is needed, continue with `ionic-feature`.
- Commit: `feat(<service>): add <resource> endpoints`
