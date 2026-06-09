# Moti Backend API Reference

Base URL: `https://moti-be.onrender.com`

---

## Auth Overview

- **All endpoints require auth by default** (global JWT guard).
- `@Public()` = no auth needed.
- `@Roles(ADMIN, SUPER_ADMIN)` = requires valid JWT + admin role.
- `@Roles(SUPER_ADMIN)` = requires super-admin role.

### Login

```http
POST /auth/login
Body: { "email": "...", "password": "..." }
Response: { "access_token": "..." }
```

---

## Shared: Pagination

Used by all `GET .../` list endpoints. Query params:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | int | 1 | min 1 |
| `limit` | int | 10 | min 1, max 100 |
| `sort` | string | `newest` | `newest` or `oldest` |

Response shape: `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`

---

## Enums Reference

| Enum | Values |
|------|--------|
| `Status` | `ACTIVE`, `INACTIVE` |
| `Role` | `ADMIN`, `SUPER_ADMIN` |
| `OrganizationType` | `PARTNER`, `CLIENT`, `VENDOR` |
| `CareerType` | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE` |
| `ContactSubject` | `GENERAL_INQUIRY`, `PRODUCT_QUOTE`, `PARTNERSHIP`, `TECHNICAL_SUPPORT`, `CAREER_OPPORTUNITY`, `COFFEE_EXPORT`, `OTHER` |
| `ContactStatus` | `NEW`, `READ`, `RESPONDED` |
| `ApplicationStatus` | `NEW`, `REVIEWED`, `ACCEPTED`, `REJECTED` |
| `BlogPostType` | `BLOG`, `NEWS` |
| `ProcessingMethod` | `WASHED`, `NATURAL`, `HONEY`, `SEMI_WASHED`, `WET_HULLED` |
| `AcidityLevel` | `HIGH`, `MEDIUM`, `LOW` |
| `BodyLevel` | `FULL`, `MEDIUM`, `LIGHT`, `LIGHT_TO_MEDIUM`, `MEDIUM_TO_FULL`, `DELICATE`, `CREAMY` |
| `HarvestMonth` | `JANUARY` — `DECEMBER` |
| `CoffeeGradeStatus` | `AVAILABLE`, `COMING_SOON`, `UNAVAILABLE` |

---

## Admin

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/admin/dashboard` | ADMIN+ |
| `GET` | `/admin/search?q=...` | ADMIN+ |

Dashboard returns counts: `{ totalProducts, totalProjects, totalBlogPosts, totalTestimonials, totalCoffeeTypes, totalUsers, newContactMessages, newApplications }`

Search returns: `{ products[], projects[], blogPosts[] }` (top 5 each, case-insensitive).

---

## Users

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/users?page=&limit=&role=&status=` | any auth |
| `POST` | `/users` | SUPER_ADMIN |
| `PATCH` | `/users/:id` | SUPER_ADMIN |
| `DELETE` | `/users/:id` | SUPER_ADMIN |

**Create body:** `{ email*, name*, password*, role?, status? }`

**Update body:** `{ email?, name?, password?, role?, status? }`

---

## Product Categories

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/product-categories?page=&limit=&sort=` | Public |
| `GET` | `/product-categories/:id` | Public |
| `POST` | `/product-categories` | ADMIN+ |
| `PATCH` | `/product-categories/:id` | ADMIN+ |
| `DELETE` | `/product-categories/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description? }`

---

## Products

Accepts multipart `images` (max 5 files, jpg/png/gif/webp, max 10 MB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/products?page=&limit=&sort=&categoryId=&status=&search=` | Public |
| `GET` | `/products/:id` | Public |
| `POST` | `/products` | ADMIN+ |
| `PATCH` | `/products/:id` | ADMIN+ |
| `DELETE` | `/products/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description?, categoryId* (int), status? }` + `images` files

**Image serving:** `GET /product-images/:id` (returns raw image binary)

---

## Project Categories

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/project-categories?page=&limit=&sort=` | Public |
| `GET` | `/project-categories/:id` | Public |
| `POST` | `/project-categories` | ADMIN+ |
| `PATCH` | `/project-categories/:id` | ADMIN+ |
| `DELETE` | `/project-categories/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description? }`

---

## Projects

Accepts multipart `images` (max 5 files, jpg/png/gif/webp, max 10 MB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/projects?page=&limit=&sort=&categoryId=&clientId=&status=` | Public |
| `GET` | `/projects/:id` | Public |
| `POST` | `/projects` | ADMIN+ |
| `PATCH` | `/projects/:id` | ADMIN+ |
| `DELETE` | `/projects/:id` | ADMIN+ |

**Create body:** `{ title* (min 2), description?, categoryId* (int), clientId* (int), status? }` + `images` files

**Image serving:** `GET /project-images/:id` (returns raw image binary)

---

## Blog Categories

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/blog-categories?page=&limit=&sort=` | Public |
| `GET` | `/blog-categories/:id` | Public |
| `POST` | `/blog-categories` | ADMIN+ |
| `PATCH` | `/blog-categories/:id` | ADMIN+ |
| `DELETE` | `/blog-categories/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description? }`

---

## Blog Tags

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/blog-tags?page=&limit=&sort=` | Public |
| `POST` | `/blog-tags` | ADMIN+ |
| `PATCH` | `/blog-tags/:id` | ADMIN+ |
| `DELETE` | `/blog-tags/:id` | ADMIN+ |

**Create body:** `{ name* (min 2) }`

Note: No `GET /blog-tags/:id` single-tag endpoint.

---

## Blog Posts

Accepts single `image` upload (jpg/png/gif/webp, stored to `uploads/blog-posts/`).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/blog-posts?page=&limit=&sort=&categoryIds=&tagIds=&type=&status=&search=` | Public |
| `GET` | `/blog-posts/:id` | Public |
| `POST` | `/blog-posts` | ADMIN+ |
| `PATCH` | `/blog-posts/:id` | ADMIN+ |
| `DELETE` | `/blog-posts/:id` | ADMIN+ |

**Create body:** `{ title* (min 2), excerpt?, content*, type? (BlogPostType), status?, categoryIds? (int[]), tagIds? (int[]) }` + `image` file

**Query:** `categoryIds` and `tagIds` accept comma-separated or repeated params (e.g. `?categoryIds=1&categoryIds=2`)

---

## Departments

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/departments?page=&limit=&sort=&status=` | Public |
| `GET` | `/departments/:id` | Public |
| `POST` | `/departments` | ADMIN+ |
| `PATCH` | `/departments/:id` | ADMIN+ |
| `DELETE` | `/departments/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description?, status? }`

---

## Team

Accepts single `image` upload (jpg/png/gif/webp, max 10 MB, base64-encoded in DB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/team?page=&limit=&sort=&departmentId=&status=` | Public |
| `GET` | `/team/:id` | Public |
| `POST` | `/team` | ADMIN+ |
| `PATCH` | `/team/:id` | ADMIN+ |
| `DELETE` | `/team/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), departmentId* (int), position*, imageUrl?, bio?, order? (int), status? }` + `image` file

**Image serving:** `GET /team/:id/image` (returns raw image binary)

---

## Clients (Organizations)

Accepts single `logo` upload (jpg/png/gif/webp/svg, max 10 MB, base64-encoded in DB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/clients?page=&limit=&sort=&type=&status=&search=` | Public |
| `GET` | `/clients/:id` | Public |
| `POST` | `/clients` | ADMIN+ |
| `PATCH` | `/clients/:id` | ADMIN+ |
| `POST` | `/clients/:id/logo` | ADMIN+ |
| `DELETE` | `/clients/:id/logo` | ADMIN+ |
| `DELETE` | `/clients/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), type* (OrganizationType), website?, description?, logo?, status? }` + `logo` file

**Image serving:** `GET /clients/:id/logo` (returns raw image binary)

---

## Testimonials

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/testimonials?page=&limit=&sort=` | Public (ACTIVE only) |
| `GET` | `/testimonials/all?page=&limit=&sort=&status=` | ADMIN+ (all statuses) |
| `POST` | `/testimonials` | ADMIN+ |
| `PATCH` | `/testimonials/:id` | ADMIN+ |
| `DELETE` | `/testimonials/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), company*, message* (min 10), rating* (int 1-5), status? }`

---

## Careers

CV upload accepts PDF/DOC/DOCX only, stored to `uploads/cvs/`.

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/careers?page=&limit=&sort=&type=&departmentId=&status=` | Public |
| `GET` | `/careers/:id` | Public |
| `GET` | `/careers/applications?page=&limit=&sort=&status=&careerId=` | ADMIN+ |
| `GET` | `/careers/:id/applications?page=&limit=&sort=&status=` | ADMIN+ |
| `POST` | `/careers` | ADMIN+ |
| `PATCH` | `/careers/:id` | ADMIN+ |
| `DELETE` | `/careers/:id` | ADMIN+ |
| `POST` | `/careers/:id/apply` | Public |

**Create career body:** `{ title* (min 3), departmentId* (int), type* (CareerType), description* (req), requirements?, location?, salary?, status? }`

**Apply body:** `{ fullName* (min 2), email* (valid email), phoneNumber?, coverLetter? }` + `cv` file (required)

---

## Contact Messages

| Method | URL | Auth |
|--------|-----|------|
| `POST` | `/contact-messages` | Public |
| `GET` | `/contact-messages?page=&limit=&sort=&status=&subject=` | ADMIN+ |

**Create body:** `{ fullName* (min 2), email* (valid email), phoneNumber?, companyName?, subject* (ContactSubject), message* (min 10) }`

---

## Gallery Categories

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/gallery-categories?page=&limit=&sort=` | Public |
| `GET` | `/gallery-categories/all` | Public (unpaginated) |
| `GET` | `/gallery-categories/:id` | Public |
| `POST` | `/gallery-categories` | ADMIN+ |
| `PATCH` | `/gallery-categories/:id` | ADMIN+ |
| `DELETE` | `/gallery-categories/:id` | ADMIN+ |

**Create body:** `{ name* (min 2), description? }`

---

## Gallery Images

Accepts single `image` upload (jpg/png/gif/webp, max 10 MB, base64-encoded in DB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/gallery-images?page=&limit=&sort=&categoryId=&status=` | Public |
| `GET` | `/gallery-images/:id` | Public |
| `POST` | `/gallery-images` | ADMIN+ |
| `PATCH` | `/gallery-images/:id` | ADMIN+ |
| `DELETE` | `/gallery-images/:id` | ADMIN+ |

**Create body:** `{ title* (min 2), categoryId* (int), imageUrl?, description?, status? }` + `image` file

**Image serving:** `GET /gallery-images/:id` (returns raw image binary)

---

## Coffee Types

Accepts single `image` upload (jpg/png/gif/webp, max 10 MB, base64-encoded in DB).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/coffee-types?page=&limit=&sort=&status=` | Public (ACTIVE only) |
| `GET` | `/coffee-types/:id` | Public |
| `POST` | `/coffee-types` | ADMIN+ |
| `PATCH` | `/coffee-types/:id` | ADMIN+ |
| `DELETE` | `/coffee-types/:id` | ADMIN+ |

**Create body (JSON):** `{ name*, origin*, grade*, description?, imageUrl?, altitude?, processing? (ProcessingMethod), acidity? (AcidityLevel), body? (BodyLevel), harvestSeason? (HarvestMonth[]), tastingNotes? (string[]), badgeText?, gradeIds? (int[]), status? }` + `image` file

**Create body (multipart):** Same fields as form fields. `harvestSeason` and `tastingNotes` as comma-separated strings. `gradeIds` as comma-separated (e.g. `1,6`).

**Image serving:** `GET /coffee-types/:id/image` (returns raw image binary)

### Example Response

```json
{
  "id": 1,
  "name": "Yirgacheffe Premium",
  "slug": "yirgacheffe-premium",
  "origin": "Yirgacheffe, Gedeo Zone",
  "grade": "Grade 1",
  "description": "Bright acidity with floral and citrus notes...",
  "imageUrl": "/coffee-types/1/image",
  "altitude": "1800-2200m",
  "processing": "WASHED",
  "acidity": "HIGH",
  "body": "LIGHT",
  "harvestSeason": ["OCTOBER", "NOVEMBER", "DECEMBER"],
  "tastingNotes": ["Jasmine", "Lemon", "Bergamot", "Honey"],
  "badgeText": "Best Seller",
  "status": "ACTIVE",
  "grades": [
    {
      "coffeeGradeId": 1,
      "coffeeGrade": { "id": 1, "grade": "Grade 1", "qualityLevel": "Specialty", "defects": "0-3 per 300g", "status": "AVAILABLE" }
    }
  ],
  "createdAt": "2026-06-05T...",
  "updatedAt": "2026-06-05T..."
}
```

---

## Coffee Grades

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/coffee-grades?page=&limit=&sort=` | Public |
| `GET` | `/coffee-grades/all` | Public (unpaginated) |
| `GET` | `/coffee-grades/:id` | Public |
| `POST` | `/coffee-grades` | ADMIN+ |
| `PATCH` | `/coffee-grades/:id` | ADMIN+ |
| `DELETE` | `/coffee-grades/:id` | ADMIN+ |

**Create body:** `{ grade* (string), qualityLevel* (string), defects* (string), status? (CoffeeGradeStatus) }`

---

## Settings

Singleton config. First `GET` auto-creates a default row. All update fields are optional (partial updates).

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/settings` | Public |
| `PATCH` | `/settings` | ADMIN+ |

**Update body (all optional):**

```json
{
  "siteName": "Moti Coffee",
  "siteDescription": "Premium Ethiopian Coffee Exporter",
  "maintenanceMode": false,
  "maintenanceMessage": "We'll be back soon.",
  "estimatedEndTime": "2026-06-10T00:00:00Z",
  "email": "info@moticoffee.com",
  "phone": "+251-11-123-4567",
  "address": "Addis Ababa, Ethiopia",
  "facebook": "https://facebook.com/moticoffee",
  "linkedIn": "https://linkedin.com/company/moticoffee",
  "twitter": "https://twitter.com/moticoffee",
  "instagram": "https://instagram.com/moticoffee"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `siteName` | string | — |
| `siteDescription` | string | — |
| `maintenanceMode` | boolean | — |
| `maintenanceMessage` | string | — |
| `estimatedEndTime` | ISO datetime | Optional |
| `email` | string | — |
| `phone` | string | — |
| `address` | string | — |
| `facebook` | string | URL |
| `linkedIn` | string | URL |
| `twitter` | string | URL |
| `instagram` | string | URL |

---

## Image Endpoints

All return raw image binary with correct Content-Type.

| URL | Auth |
|-----|------|
| `GET /product-images/:id` | Public |
| `GET /project-images/:id` | Public |
| `GET /team/:id/image` | Public |
| `GET /clients/:id/logo` | Public |
| `GET /gallery-images/:id` | Public |
| `GET /coffee-types/:id/image` | Public |
