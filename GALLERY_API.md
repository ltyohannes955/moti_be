# Gallery CRUD Endpoints

Base URL: `https://moti-be.onrender.com`

**Auth**: POST/PATCH/DELETE require `Authorization: Bearer <token>` and `ADMIN`/`SUPER_ADMIN` role.

---

## Gallery Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery-categories` | Public | List categories (paginated) |
| GET | `/gallery-categories/:id` | Public | Get single category with images |
| POST | `/gallery-categories` | Admin | Create category |
| PATCH | `/gallery-categories/:id` | Admin | Update category |
| DELETE | `/gallery-categories/:id` | Admin | Delete category (fails if has images) |

### POST /gallery-categories

```json
{
  "name": "Events",
  "description": "Photos from company events"
}
```

### PATCH /gallery-categories/:id

```json
{
  "name": "Events & Conferences",
  "description": "Updated description"
}
```

---

## Gallery Images

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery-images` | Public | List images (paginated, filterable) |
| GET | `/gallery-images/:id` | Public | Get single image with category |
| POST | `/gallery-images` | Admin | Create image (multipart/form-data) |
| PATCH | `/gallery-images/:id` | Admin | Update image (multipart/form-data) |
| DELETE | `/gallery-images/:id` | Admin | Delete image |

### GET /gallery-images

**Query params**: `page`, `limit`, `sort` (newest/oldest), `categoryId`, `status` (ACTIVE/INACTIVE)

Response:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Annual Tech Conference 2026 Keynote",
      "slug": "annual-tech-conference-2026-keynote",
      "imageUrl": "/gallery-images/1",
      "description": "CEO delivering keynote",
      "status": "ACTIVE",
      "categoryId": 1,
      "category": { "id": 1, "name": "Events", "slug": "events" },
      "createdAt": "2026-06-05T...",
      "updatedAt": "2026-06-05T..."
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### POST /gallery-images

`multipart/form-data`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Image title (min 2 chars) |
| categoryId | number | yes | Gallery category ID |
| description | string | no | Image description |
| status | string | no | ACTIVE or INACTIVE (default ACTIVE) |
| image | file | no | JPEG/PNG/GIF/WEBP, max 10MB |

### PATCH /gallery-images/:id

Same fields as POST, all optional. `multipart/form-data`.

### DELETE /gallery-images/:id

Returns `{ "message": "Gallery image deleted successfully" }`.

---

## Binary Image Serving

Gallery images are served via dedicated binary endpoint:

**`GET /gallery-images/:id`** — Returns raw image binary with correct `Content-Type` header.

The `imageUrl` field in API responses returns a short path like `/gallery-images/1`. On the frontend, prepend the API base URL (`NEXT_PUBLIC_API_URL`) to display the image.

---

## Curl Examples

### Authentication (login first)
```bash
curl -X POST https://moti-be.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moti.com","password":"Admin@123456"}'
# Save token: export TOKEN="<token>"
```

### Gallery Categories

```bash
# List categories (public)
curl https://moti-be.onrender.com/gallery-categories

# List with pagination
curl "https://moti-be.onrender.com/gallery-categories?page=1&limit=5&sort=newest"

# Get single category (public)
curl https://moti-be.onrender.com/gallery-categories/1

# Create category (admin)
curl -X POST https://moti-be.onrender.com/gallery-categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Workshops","description":"Training and workshop photos"}'

# Update category (admin)
curl -X PATCH https://moti-be.onrender.com/gallery-categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Events & Workshops","description":"Updated description"}'

# Delete category (admin) — fails if has images
curl -X DELETE https://moti-be.onrender.com/gallery-categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Gallery Images

```bash
# List images (public)
curl "https://moti-be.onrender.com/gallery-images?page=1&limit=10&sort=newest"

# Filter by category
curl "https://moti-be.onrender.com/gallery-images?categoryId=1"

# Filter by status
curl "https://moti-be.onrender.com/gallery-images?status=ACTIVE"

# Get single image (public)
curl https://moti-be.onrender.com/gallery-images/1

# Create image with file upload (admin)
curl -X POST https://moti-be.onrender.com/gallery-images \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Team Photo" \
  -F "categoryId=1" \
  -F "description=Group photo from team building" \
  -F "status=ACTIVE" \
  -F "image=@/path/to/photo.jpg"

# Create image without file (admin) — uses placeholder
curl -X POST https://moti-be.onrender.com/gallery-images \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Team Photo" \
  -F "categoryId=1"

# Update image (admin)
curl -X PATCH https://moti-be.onrender.com/gallery-images/1 \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "image=@/path/to/new-photo.jpg"

# Delete image (admin)
curl -X DELETE https://moti-be.onrender.com/gallery-images/1 \
  -H "Authorization: Bearer $TOKEN"

# View raw image binary in browser
# https://moti-be.onrender.com/gallery-images/1
```
