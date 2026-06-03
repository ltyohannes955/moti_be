# New Modules — API Reference

Base URL: `http://localhost:3000`

---

## Clients (`/clients`)

Uses the `Organization` table. Already linked to Projects via `Project.clientId`.

### GET /clients

```
Public
```

```bash
curl "http://localhost:3000/clients?page=1&limit=10&type=CLIENT&status=ACTIVE&search=ethio"
```

| Query | Type | Values |
|---|---|---|
| `type` | string | `CLIENT`, `PARTNER`, `VENDOR` |
| `status` | string | `ACTIVE`, `INACTIVE` |
| `search` | string | Search in name |

**Response:** `{ data: [...], total, page, lastPage }` — each item includes `projects[]`.

### GET /clients/:id

```
Public
```

```bash
curl "http://localhost:3000/clients/1"
```

### POST /clients

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Acme Corp", "type": "CLIENT", "website": "https://acme.com", "description": "Global logistics firm"}'
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Min 2 chars |
| `type` | Yes | `CLIENT`, `PARTNER`, `VENDOR` |
| `website` | No | |
| `description` | No | |
| `status` | No | Default `ACTIVE` |

### PATCH /clients/:id

```
ADMIN only
```

All fields optional. Regenerates slug if `name` changes.

```bash
curl -X PATCH http://localhost:3000/clients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status": "INACTIVE"}'
```

### DELETE /clients/:id

```
ADMIN only
```

**Blocks** with `409 Conflict` if client has existing projects.

```bash
curl -X DELETE http://localhost:3000/clients/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Departments (`/departments`)

### GET /departments

```
Public
```

```bash
curl "http://localhost:3000/departments?page=1&limit=10&status=ACTIVE"
```

| Query | Type | Values |
|---|---|---|
| `status` | string | `ACTIVE`, `INACTIVE` |

**Response:** `{ data: [...], total, page, lastPage }` — each item includes `teamMembers[]` and `careers[]`.

### GET /departments/:id

```
Public
```

```bash
curl "http://localhost:3000/departments/1"
```

### POST /departments

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Engineering", "description": "Software development team"}'
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Min 2 chars |
| `description` | No | |
| `status` | No | Default `ACTIVE` |

### PATCH /departments/:id

```
ADMIN only
```

### DELETE /departments/:id

```
ADMIN only
```

**Blocks** with `409 Conflict` if department has team members or careers.

---

## Team Members (`/team`)

### GET /team

```
Public
```

```bash
curl "http://localhost:3000/team?page=1&limit=10&departmentId=1&status=ACTIVE"
```

| Query | Type | Values |
|---|---|---|
| `departmentId` | number | Filter by department |
| `status` | string | `ACTIVE`, `INACTIVE` |

**Response:** `{ data: [...], total, page, lastPage }` — each item includes nested `department` object.

### GET /team/:id

```
Public
```

```bash
curl "http://localhost:3000/team/1"
```

### POST /team

```
ADMIN only — multipart form (single image)
```

```bash
curl -X POST http://localhost:3000/team \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Abebe Kebede" \
  -F "departmentId=1" \
  -F "position=Senior Developer" \
  -F "bio=Full-stack developer with 10 years experience" \
  -F "order=1" \
  -F "image=@photo.jpg"
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Min 2 chars |
| `departmentId` | Yes | Must exist |
| `position` | Yes | |
| `image` | No | Single file — jpg, png, gif, webp. Saved to `uploads/team/` |
| `bio` | No | |
| `order` | No | Display order (integer) |
| `status` | No | Default `ACTIVE` |

### PATCH /team/:id

```
ADMIN only — multipart form
```

All fields optional. New image replaces old one.

```bash
curl -X PATCH http://localhost:3000/team/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -F "position=Lead Developer" \
  -F "image=@newphoto.jpg"
```

### DELETE /team/:id

```
ADMIN only
```

```bash
curl -X DELETE http://localhost:3000/team/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Schema Changes

Two models gained a `status` field:

```
Department.status  Status @default(ACTIVE)
TeamMember.status  Status @default(ACTIVE)
```

Migration: `20260603152214_add_status_to_department_and_team`

---

## Guards

| Method | Auth |
|---|---|
| `GET` | Public |
| `POST` | ADMIN, SUPER_ADMIN |
| `PATCH` | ADMIN, SUPER_ADMIN |
| `DELETE` | ADMIN, SUPER_ADMIN |

All endpoints use the global JWT guard (bypassed via `@Public()` on reads) and `RolesGuard` on mutations.
