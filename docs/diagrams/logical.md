# Diagrama Lógico de Dados

```mermaid
erDiagram

    USER {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        timestamp created_at
        timestamp updated_at
    }

    GROUP {
        uuid id PK
        text name UK
        text description
        timestamp created_at
    }

    USER_GROUP {
        uuid id PK
        text user_id FK
        uuid group_id FK
        timestamp created_at
    }

    PERMISSION {
        uuid id PK
        text key UK
        text description
        timestamp created_at
    }

    GROUP_PERMISSION {
        uuid id PK
        uuid group_id FK
        uuid permission_id FK
    }

    USER_PERMISSION {
        uuid id PK
        text user_id FK
        uuid permission_id FK
        smallint type
    }

    SESSION {
        text id PK
        text user_id FK
        text token UK
        timestamp expires_at
        text ip_address
        text user_agent
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNT {
        text id PK
        text user_id FK
        text account_id
        text provider_id
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password
        timestamp created_at
        timestamp updated_at
    }

    VERIFICATION {
        text id PK
        text identifier
        text value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    PRESENTATION {
        uuid id PK
        text code UK
        text slug UK
        text user_id FK
        text title
        text user_prompt
        text system_prompt
        smallint language
        smallint aspect_ratio
        smallint slide_count
        array keywords
        smallint visibility
        smallint status
        integer views_count
        jsonb usage
        timestamp created_at
        timestamp updated_at
    }

    PRESENTATION_MEMBER {
        uuid id PK
        uuid presentation_id FK
        text user_id FK
        text invited_by FK
        smallint role
        timestamp created_at
    }

    OUTLINE {
        uuid id PK
        uuid presentation_id FK
        smallint order
        smallint type
        text title
        text description
        array concepts
        smallint representation
        smallint layout
        real score
        timestamp created_at
        timestamp updated_at
    }

    SLIDE {
        uuid id PK
        uuid presentation_id FK
        uuid outline_id FK
        smallint order
        jsonb elements
        jsonb app_state
        jsonb files
        text thumbnail
        smallint status
        timestamp created_at
        timestamp updated_at
    }

    GENERATION {
        uuid id PK
        uuid presentation_id FK
        smallint type
        smallint status
        jsonb framework
        jsonb usage
        jsonb model
        jsonb context
        jsonb info
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }

    LOG {
        uuid id PK
        text user_id FK
        uuid generation_id FK
        smallint level
        text message
        jsonb context
        timestamp created_at
    }

    USER         ||--o{ SESSION             : "user_id"
    USER         ||--o{ ACCOUNT             : "user_id"
    USER         ||--o{ VERIFICATION        : "identifier"
    USER         ||--o{ PRESENTATION        : "user_id"
    USER         ||--o{ PRESENTATION_MEMBER : "user_id"
    USER         ||--o{ LOG                 : "user_id"
    USER         ||--o{ USER_GROUP          : "user_id"
    USER         ||--o{ USER_PERMISSION     : "user_id"
    GROUP        ||--o{ USER_GROUP          : "group_id"
    GROUP        ||--o{ GROUP_PERMISSION    : "group_id"
    PERMISSION   ||--o{ GROUP_PERMISSION    : "permission_id"
    PERMISSION   ||--o{ USER_PERMISSION     : "permission_id"
    PRESENTATION ||--o{ PRESENTATION_MEMBER : "presentation_id"
    PRESENTATION ||--o{ OUTLINE             : "presentation_id"
    PRESENTATION ||--o{ SLIDE               : "presentation_id"
    PRESENTATION ||--o{ GENERATION          : "presentation_id"
    OUTLINE      ||--||  SLIDE              : "outline_id"
    GENERATION   ||--o{ LOG                 : "generation_id"
```

---

## Enums

| Tabela | Campo | Valores |
|---|---|---|
| `user_permission` | `type` | `0` grant · `1` deny |
| `presentation` | `status` | `0` draft · `1` active · `2` inactive · `3` trash |
| `presentation` | `visibility` | `0` public · `1` private |
| `presentation` | `language` | `0` en · `1` es · `2` fr · `3` de · `4` it · `5` pt-BR · `6` ru · `7` zh · `8` ja · `9` ko |
| `presentation` | `aspect_ratio` | `0` 16:9 · `1` 4:3 · `2` 9:16 · `3` 1:1 · `4` A4 · `5` custom |
| `presentation_member` | `role` | `0` viewer · `1` editor |
| `outline` | `type` | `0` cover · `1` agenda · `2` content · `3` summary · `4` closing |
| `outline` | `representation` | `0` auto · `1` flowchart · `2` mindmap · `3` orgchart · `4` sequence · `5` class · `6` er · `7` gantt · `8` timeline · `9` tree · `10` network · `11` architecture · `12` dataflow · `13` state · `14` swimlane · `15` fishbone · `16` pyramid · `17` venn · `18` matrix · `19` funnel · `20` infographic |
| `outline` | `layout` | `0` auto · `1` title_only · `2` title_content · `3` two_column · `4` image_text · `5` full_image · `6` bullets · `7` blank |
| `slide` | `status` | `0` active · `1` inactive · `2` trash |
| `generation` | `type` | `0` outline · `1` slide |
| `generation` | `status` | `0` pending · `1` running · `2` completed · `3` failed |
| `log` | `level` | `0` debug · `1` info · `2` warn · `3` error |
