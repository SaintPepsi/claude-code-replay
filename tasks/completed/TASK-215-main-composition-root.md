# TASK-215: Refactor main.ts as Pure Composition Root with Dependency Injection

| Field       | Value                                      |
|-------------|-------------------------------------------|
| **Status**  | DONE                                       |
| **Priority**| High                                       |
| **Assignee**| Unassigned                                 |
| **Phase**   | 2 - Refactoring into Components            |
| **Type**    | Refactor                                   |

## Description

Refactor `src/main.ts` to serve exclusively as a **composition root**: the single place where the entire object graph is assembled and dependencies are wired together. No business logic, no DOM manipulation, no event handling should live in `main.ts` -- only instantiation and injection.

Currently, `main.ts` likely mixes bootstrap/wiring code with behavioral logic (event listeners, initialization sequences, glue code between components). This refactor ensures that:

1. **All dependencies flow downward** -- `main.ts` creates concrete instances and injects them into consumers via constructor parameters.
2. **No component instantiates its own dependencies** -- components receive everything they need through their constructor (or a factory function).
3. **The composition root is the only place that references concrete classes** -- all other modules depend on interfaces/abstractions.
4. **Startup sequence is explicit and readable** -- the initialization order is a clear, linear sequence of object creation and wiring.

### Composition Structure

```
main.ts (composition root)
  |-- creates Config (TASK-212)
  |-- creates EventBus (TASK-210)
  |-- creates ScrollManager (TASK-206)
  |-- creates AnimationEngine (TASK-208)
  |-- creates KeyboardHandler (TASK-209)
  |-- creates Renderers (TASK-204, TASK-205)
  |-- creates PlaybackController (TASK-207) <- injected with AnimationEngine, EventBus
  |-- creates ProgressBar (TASK-214) <- injected with TickStrategy
  |-- creates FileUpload (TASK-213) <- injected with Parser, EventBus
  |-- creates TaskManager <- injected with EventBus
  |-- wires EventBus subscriptions
  |-- calls start()
```

### Affected Files

- `src/main.ts` (refactor to pure composition root)
- All component constructors (accept dependencies as parameters)

## Acceptance Criteria

- [ ] `main.ts` contains only object instantiation, dependency wiring, and a single startup call
- [ ] No business logic, DOM queries, or event handler definitions exist in `main.ts`
- [ ] Every component receives its dependencies via constructor injection (no internal `new` calls for peer dependencies)
- [ ] The dependency graph is acyclic and can be read top-to-bottom in `main.ts`
- [ ] All concrete class references are confined to `main.ts`; other modules import only interfaces
- [ ] The initialization sequence is explicit: no hidden startup side effects triggered by module imports
- [ ] The application boots and functions identically to the pre-refactor version
- [ ] A clear separation exists between "construction phase" (building the object graph) and "runtime phase" (the application running)
- [ ] Adding a new component means adding lines to `main.ts` only, not modifying existing components

## Dependencies

- **TASK-204**: Renderer interface must exist so `main.ts` injects `IRenderer`, not `ChatRenderer`
- **TASK-207**: Playback state machine must define its injectable dependencies
- **TASK-208**: AnimationEngine must be extractable for injection
- **TASK-209**: KeyboardHandler must accept commands via registration
- **TASK-210**: EventBus must be instantiable and injectable
- **TASK-212**: Config module must be importable for parameterization

This task should be done **last** in Phase 2, as it integrates all other refactored components.

## Design Principles Applied

- **Dependency Inversion Principle**: The composition root is the only module that knows about concrete implementations. Every other module depends on abstractions (interfaces). This inverts the traditional dependency direction where high-level modules import low-level modules directly.
- **Single Responsibility Principle**: `main.ts` has exactly one responsibility: assembling the object graph. It does not contain business logic, rendering code, or event handling. Each component has one responsibility because cross-cutting concerns (events, animation, scrolling) have been extracted into their own injectable modules.
- **DIP + SRP combined**: Because every dependency is injected, every component can be tested in isolation with mock dependencies. The composition root is the seam where production dependencies are swapped for test doubles.
