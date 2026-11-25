---
name: backend-tests
description: Write JUnit 5 / Mockito unit tests, TestContainers integration tests, and MockMvc controller tests for a backend Spring Boot service, and measure coverage with JaCoCo. Use when asked to add tests, improve coverage, or test a service/controller/repository in backend/.
---

# Backend tests

Coverage today is very low: only `patient-service` and `doctor-service` have tests (`unit/service/*ServiceTest.java`). CLAUDE.md targets 80% overall, 70%+ unit.

Reference style: `backend/patient-service/src/test/java/com/medical/patient/unit/service/PatientServiceTest.java`.

## Layout (CLAUDE.md)

```
src/test/java/com/medical/<service>/
├── unit/service/        <Name>ServiceTest.java      (Mockito, no Spring context)
├── unit/mapper/         (only if the service has mappers)
├── integration/repository/  <Name>RepositoryIT.java (TestContainers Postgres + Flyway)
└── integration/controller/  <Name>ControllerTest.java (@WebMvcTest + MockMvc)
```

## Prereqs — check the service pom first

Many services (e.g. lab, pharmacy, inventory) lack test deps. Copy from `backend/patient-service/pom.xml`: `org.testcontainers:postgresql`, `org.testcontainers:junit-jupiter`, and the `jacoco-maven-plugin` block. Versions come from the parent pom (`testcontainers.version`, `jacoco.version`, `mockito.version`, `byte-buddy.version` — the last two are pinned for the newer JDK).

## Unit tests (service layer)

- `@ExtendWith(MockitoExtension.class)`, `@DisplayName` on class and each test
- `@Mock` repositories / other deps, `@InjectMocks` the service
- Build fixtures with entity/DTO `.builder()` in `@BeforeEach`
- Given / When / Then comments, AssertJ (`assertThat`, `assertThatThrownBy`)
- Cover for each public method: happy path, not-found → `ResourceNotFoundException`, validation/business-rule branches, partial update (null fields untouched), soft delete sets `active=false`
- For `Specification` list methods: `when(repo.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(...))` and assert `PageResponse` fields
- Use `ArgumentCaptor` to assert what was saved
- Fake data only — no realistic PHI

## Controller tests

- `@WebMvcTest(<Name>Controller.class)` + `@MockBean <Name>Service`; also `@Import(GlobalExceptionHandler.class)` if not auto-picked
- Assert status codes per CLAUDE.md (201 on create, 404 on missing, 400 on invalid body) and `$.success`, `$.data` JSON paths

## Integration tests (repository)

- `@DataJpaTest` + `@AutoConfigureTestDatabase(replace = NONE)` + `@Testcontainers`
- `@Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:15-alpine")` + `@DynamicPropertySource` for url/user/password
- Flyway runs the real migrations — this also catches entity/SQL drift
- Requires Docker running

## Run

From `backend/`, match the JDK image to `<java.version>` in `backend/pom.xml`:
```bash
docker run --rm -v "$(pwd)":/app -v "$HOME/.m2":/root/.m2 -v /var/run/docker.sock:/var/run/docker.sock -w /app maven:3.9-eclipse-temurin-<JAVA_VERSION> mvn -pl shared-library,<service> -am verify
```
Or `./scripts/run-backend-tests.sh` from the repo root for everything. Report: tests run/failed and the JaCoCo line coverage from `target/site/jacoco/index.html` (or `jacoco.csv`). If tests fail, show the failure output — don't weaken assertions to make them pass.

Commit: `test(<service>): add unit tests for <Name>Service`
