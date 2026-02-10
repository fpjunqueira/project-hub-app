## Signal-based forms refactor

This project now uses Angular signals as the single source of truth for form state.
Template-driven bindings were removed in favor of native input/change events that
write directly to signal-backed draft objects and selection signals.

### What changed
- Removed `FormsModule` from form components.
- Replaced `ngModel` bindings with `[value]` plus `(input)` or `(change)` handlers.
- Multi-selects now read selected options from the DOM and update signal arrays.

### Updated form components
- `src/app/components/addresses/form/addresses-form.component.*`
- `src/app/components/files/form/files-form.component.*`
- `src/app/components/owners/form/owners-form.component.*`
- `src/app/components/projects/form/projects-form.component.*`
- `src/app/components/telecom/form/telecom-form.component.*`

### Notes
- The signal state in each component remains the single source of truth.
- Form values are now derived directly from signals without `ngModel`.
