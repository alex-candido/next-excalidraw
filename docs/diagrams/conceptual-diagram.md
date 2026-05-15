# Diagrama Conceitual

```mermaid
erDiagram
    USER         ||--o{ SESSION      : ""
    USER         ||--o{ ACCOUNT      : ""
    USER         ||--o{ VERIFICATION : ""
    USER         ||--o{ PRESENTATION : ""
    PRESENTATION ||--o{ OUTLINE      : ""
    PRESENTATION ||--o{ SLIDE        : ""
    PRESENTATION ||--o{ GENERATION   : ""
    OUTLINE      ||--||  SLIDE       : ""
```

## Associações

```
User                1:N   Session
User                1:N   Account
User                1:N   Verification
User                1:N   Presentation
User                1:N   PresentationMember
Presentation        1:N   PresentationMember
Presentation        1:N   Outline
Presentation        1:N   Slide
Presentation        1:N   Generation
Outline             1:1   Slide
```
