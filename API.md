# Moti Backend — API Documentation

Base URL: `http://localhost:3000` (dev) / `https://your-app.onrender.com` (prod)

---

## Authentication

All endpoints require JWT **by default** — a global `JwtAuthGuard` protects every route. Use `@Public()` to opt out.

### 1. Login (get token)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@moti.com",
  "password": "Admin@123456"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJI...",
  "user": {
    "id": 1,
    "email": "admin@moti.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-06-02T...",
    "updatedAt": "2026-06-02T..."
  }
}
```

**Error:** `401 Unauthorized`
```json
{ "message": "Invalid email or password", "error": "Unauthorized", "statusCode": 401 }
```

**Use the token** in all subsequent requests:
```
Authorization: Bearer <access_token>
```

### Roles

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full access — can manage users, create/delete anything |
| `ADMIN` | Can manage all content (products, projects, blog, etc.) but **cannot** create/delete users |

Routes marked **ADMIN** accept both `ADMIN` and `SUPER_ADMIN`.

---

## Pagination, Filtering & Sorting

All `GET` list endpoints support:

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (1+) |
| `limit` | number | `10` | Items per page (1–100) |
| `sort` | string | `newest` | `newest` or `oldest` |

**Response format:**
```json
{
  "data": [ ... ],
  "total": 56,
  "page": 1,
  "lastPage": 6
}
```

Module-specific filters are documented per module below.

---

## Admin Dashboard

```
ADMIN only
```

### GET /admin/dashboard

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/admin/dashboard
```

**Response:**
```json
{
  "totalProducts": 15,
  "totalProjects": 10,
  "totalBlogPosts": 6,
  "totalTestimonials": 6,
  "totalCoffeeTypes": 8,
  "totalUsers": 2,
  "newContactMessages": 4,
  "newApplications": 3
}
```

### GET /admin/search

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/admin/search?q=banking"
```

**Response:**
```json
{
  "products": [ ... ],
  "projects": [ ... ],
  "blogPosts": [ ... ]
}
```

---

## Users

### GET /users

```
AUTH: Any authenticated user
```

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/users?page=1&limit=10&role=ADMIN&status=ACTIVE"
```

| Filter | Type | Values |
|---|---|---|
| `role` | string | `ADMIN`, `SUPER_ADMIN` |
| `status` | string | `ACTIVE`, `INACTIVE` |

### POST /users

```
SUPER_ADMIN only
```

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "email": "editor@moti.com",
    "name": "Editor User",
    "password": "Editor@123"
  }'
```

| Field | Required | Default | Notes |
|---|---|---|---|
| `email` | Yes | — | Unique |
| `name` | Yes | — | Min 2 chars |
| `password` | Yes | — | Min 6 chars |
| `role` | No | `ADMIN` | `ADMIN` or `SUPER_ADMIN` |
| `status` | No | `ACTIVE` | `ACTIVE` or `INACTIVE` |

### PATCH /users/:id

```
SUPER_ADMIN only
```

```bash
curl -X PATCH http://localhost:3000/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Updated Name", "status": "INACTIVE"}'
```

All fields optional.

### DELETE /users/:id

```
SUPER_ADMIN only
```

```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Products

### GET /products

```
Public
```

```bash
curl "http://localhost:3000/products?page=1&limit=10&status=ACTIVE&categoryId=2&sort=newest&search=wallet"
```

| Filter | Type | Description |
|---|---|---|
| `status` | string | `ACTIVE`, `INACTIVE` |
| `categoryId` | number | Product category ID |
| `search` | string | Search in product name |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Amole Wallet Suite",
      "slug": "amole-wallet-suite",
      "description": "Digital wallet platform...",
      "status": "ACTIVE",
      "category": { "id": 1, "name": "Digital Banking Solutions", "slug": "digital-banking-solutions", "description": "..." },
      "images": [
        { "id": 1, "imageUrl": "https://placehold.co/600x400/1B5E20/white?text=Amole+Wallet+Suite", "productId": 1, "createdAt": "..." }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 15,
  "page": 1,
  "lastPage": 2
}
```

### GET /products/:id

```bash
curl "http://localhost:3000/products/1"
```

### POST /products

```
ADMIN only — multipart form (up to 5 images)
```

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Cloud ERP Lite" \
  -F "description=Lightweight ERP for small businesses" \
  -F "categoryId=2" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png"
```

| Field | Required | Type |
|---|---|---|
| `name` | Yes | string (min 2 chars) |
| `description` | No | string |
| `categoryId` | Yes | number |
| `status` | No | `ACTIVE` / `INACTIVE` |
| `images` | No | File(s) — jpg, png, gif, webp, max 5 |

### PATCH /products/:id

```
ADMIN only — multipart form
```

New images replace all old images.

```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Updated Product Name" \
  -F "images=@newphoto.jpg"
```

### DELETE /products/:id

```
ADMIN only
```

```bash
curl -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer <TOKEN>"
```

Deletes product + all image files from disk.

---

## Product Categories

### GET /product-categories

```
Public
```

```bash
curl "http://localhost:3000/product-categories?page=1&limit=10&sort=newest"
```

No extra filters — just pagination.

### GET /product-categories/:id

```bash
curl "http://localhost:3000/product-categories/1"
```

### POST /product-categories

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/product-categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Blockchain Solutions", "description": "Blockchain and DLT platforms"}'
```

| Field | Required |
|---|---|
| `name` | Yes (min 2 chars) |
| `description` | No |

### PATCH /product-categories/:id

```
ADMIN only
```

### DELETE /product-categories/:id

```
ADMIN only
```

Blocks if category has existing products.

---

## Projects

### GET /projects

```
Public
```

```bash
curl "http://localhost:3000/projects?page=1&limit=10&categoryId=1&clientId=2&status=ACTIVE"
```

| Filter | Type | Description |
|---|---|---|
| `categoryId` | number | Project category ID |
| `clientId` | number | Organization (client) ID |
| `status` | string | `ACTIVE`, `INACTIVE` |

**Response includes:** category object, client object, images array.

### GET /projects/:id

```bash
curl "http://localhost:3000/projects/1"
```

### POST /projects

```
ADMIN only — multipart form (up to 5 images)
```

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=E-Commerce Platform" \
  -F "description=Full-featured e-commerce for Ethiopian retailers" \
  -F "categoryId=1" \
  -F "clientId=2" \
  -F "images=@screenshot1.jpg"
```

| Field | Required |
|---|---|
| `title` | Yes (min 2 chars) |
| `description` | No |
| `categoryId` | Yes |
| `clientId` | Yes |
| `status` | No (default `ACTIVE`) |
| `images` | No — up to 5 files |

### PATCH /projects/:id

```
ADMIN only — multipart form
```

New images replace old ones.

### DELETE /projects/:id

```
ADMIN only
```

---

## Project Categories

Same pattern as Product Categories, at `/project-categories`.

### GET /project-categories

```
Public — pagination only
```

### GET /project-categories/:id

```
Public
```

### POST /project-categories

```
ADMIN only
```

### PATCH /project-categories/:id

```
ADMIN only
```

### DELETE /project-categories/:id

```
ADMIN only — blocks if category has projects
```

---

## Blog Posts

### GET /blog-posts

```
Public
```

```bash
curl "http://localhost:3000/blog-posts?page=1&limit=10&status=ACTIVE&categoryId=1&tagId=3&search=fintech"
```

| Filter | Type | Description |
|---|---|---|
| `status` | string | `ACTIVE`, `INACTIVE` |
| `categoryId` | number | Blog category ID |
| `tagId` | number | Blog tag ID |
| `search` | string | Search in title + excerpt |

**Response includes:** categories (with nested category), tags (with nested tag).

### GET /blog-posts/:id

```bash
curl "http://localhost:3000/blog-posts/1"
```

### POST /blog-posts

```
ADMIN only — multipart form (single image)
```

```bash
curl -X POST http://localhost:3000/blog-posts \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=New Blog Post" \
  -F "excerpt=A short summary" \
  -F "content=Full article content in HTML or plain text..." \
  -F "categoryIds=1,2" \
  -F "tagIds=3,5" \
  -F "image=@cover.jpg"
```

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Min 2 chars |
| `excerpt` | No | |
| `content` | Yes | Rich text / HTML |
| `status` | No | Default `ACTIVE` |
| `categoryIds` | No | Comma-separated numbers |
| `tagIds` | No | Comma-separated numbers |
| `image` | No | Single file |

### PATCH /blog-posts/:id

```
ADMIN only — multipart form
```

### DELETE /blog-posts/:id

```
ADMIN only
```

---

## Blog Categories

### GET /blog-categories

```
Public
```

```bash
curl "http://localhost:3000/blog-categories?page=1&limit=10"
```

### GET /blog-categories/:id

```
Public
```

### POST /blog-categories

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/blog-categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Agritech", "description": "Agricultural technology and innovation"}'
```

### PATCH /blog-categories/:id

```
ADMIN only
```

### DELETE /blog-categories/:id

```
ADMIN only — blocks if category has posts
```

---

## Blog Tags

### GET /blog-tags

```
Public
```

```bash
curl "http://localhost:3000/blog-tags?page=1&limit=10"
```

### POST /blog-tags

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/blog-tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Blockchain"}'
```

### PATCH /blog-tags/:id

```
ADMIN only
```

### DELETE /blog-tags/:id

```
ADMIN only
```

---

## Testimonials

### GET /testimonials

```
Public — returns ACTIVE only
```

```bash
curl "http://localhost:3000/testimonials?page=1&limit=10&sort=newest"
```

### GET /testimonials/all

```
ADMIN only — returns ALL (including inactive)
```

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/testimonials/all?status=INACTIVE"
```

| Filter | Type |
|---|---|
| `status` | `ACTIVE`, `INACTIVE` |

### POST /testimonials

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/testimonials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "New Client",
    "company": "Example Corp",
    "message": "Excellent service and support from the Moti team.",
    "rating": 5
  }'
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Min 2 chars |
| `company` | Yes | |
| `message` | Yes | Min 10 chars |
| `rating` | Yes | Integer 1–5 |
| `status` | No | Default `ACTIVE` |

### PATCH /testimonials/:id

```
ADMIN only
```

### DELETE /testimonials/:id

```
ADMIN only
```

---

## Coffee Types

### GET /coffee-types

```
Public — returns ACTIVE only
```

```bash
curl "http://localhost:3000/coffee-types?page=1&limit=10"
```

### GET /coffee-types/:id

```
Public
```

### POST /coffee-types

```
ADMIN only — multipart form (single image)
```

```bash
curl -X POST http://localhost:3000/coffee-types \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Guji Natural" \
  -F "origin=Guji, Oromia" \
  -F "grade=Grade 1" \
  -F "description=Wild and complex with tropical fruit and floral notes" \
  -F "image=@coffee.jpg"
```

| Field | Required |
|---|---|
| `name` | Yes |
| `origin` | Yes |
| `grade` | Yes |
| `description` | No |
| `status` | No (default `ACTIVE`) |
| `image` | No — single file |

### PATCH /coffee-types/:id

```
ADMIN only — multipart form
```

### DELETE /coffee-types/:id

```
ADMIN only
```

---

## Careers

### GET /careers

```
Public
```

```bash
curl "http://localhost:3000/careers?page=1&limit=10&type=FULL_TIME&departmentId=1&status=ACTIVE"
```

| Filter | Type | Values |
|---|---|---|
| `type` | string | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE` |
| `departmentId` | number | Department ID |
| `status` | string | `ACTIVE`, `INACTIVE` |

### GET /careers/:id

```
Public
```

### POST /careers

```
ADMIN only
```

```bash
curl -X POST http://localhost:3000/careers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Senior Frontend Developer",
    "departmentId": 1,
    "type": "FULL_TIME",
    "description": "Build responsive web apps with React and TypeScript",
    "requirements": "3+ years React, TypeScript, Tailwind CSS",
    "location": "Addis Ababa, Ethiopia",
    "salary": "Competitive"
  }'
```

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Min 3 chars |
| `departmentId` | Yes | Must exist |
| `type` | Yes | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE` |
| `description` | Yes | |
| `requirements` | No | |
| `location` | No | |
| `salary` | No | |
| `status` | No | Default `ACTIVE` |

### PATCH /careers/:id

```
ADMIN only
```

### DELETE /careers/:id

```
ADMIN only
```

### POST /careers/:id/apply

```
Public — multipart form (CV upload)
```

```bash
curl -X POST http://localhost:3000/careers/1/apply \
  -F "fullName=Abebe Kebede" \
  -F "email=abebe@email.com" \
  -F "phoneNumber=+251911234567" \
  -F "coverLetter=I am excited to apply for this position..." \
  -F "cv=@resume.pdf"
```

| Field | Required | Notes |
|---|---|---|
| `fullName` | Yes | |
| `email` | Yes | |
| `phoneNumber` | No | |
| `coverLetter` | No | |
| `cv` | Yes | PDF, DOC, DOCX — single file |

### GET /careers/applications

```
ADMIN only
```

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/careers/applications?status=NEW&page=1"
```

| Filter | Type | Values |
|---|---|---|
| `status` | string | `NEW`, `REVIEWED`, `ACCEPTED`, `REJECTED` |

### GET /careers/:id/applications

```
ADMIN only
```

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/careers/1/applications?status=NEW"
```

---

## Clients (Organizations)

### GET /clients

```
Public
```

```bash
curl "http://localhost:3000/clients?page=1&limit=10&type=CLIENT&status=ACTIVE&search=ethio"
```

| Filter | Type | Values |
|---|---|---|
| `type` | string | `CLIENT`, `PARTNER`, `VENDOR` |
| `status` | string | `ACTIVE`, `INACTIVE` |
| `search` | string | Search in name |

**Response includes:** projects array.

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

### DELETE /clients/:id

```
ADMIN only — blocks if client has projects
```

---

## Departments

### GET /departments

```
Public
```

```bash
curl "http://localhost:3000/departments?page=1&limit=10&status=ACTIVE"
```

| Filter | Type | Values |
|---|---|---|
| `status` | string | `ACTIVE`, `INACTIVE` |

**Response includes:** teamMembers array, careers array.

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
ADMIN only — blocks if department has team members or careers
```

---

## Team Members

### GET /team

```
Public
```

```bash
curl "http://localhost:3000/team?page=1&limit=10&departmentId=1&status=ACTIVE"
```

| Filter | Type | Values |
|---|---|---|
| `departmentId` | number | Department ID |
| `status` | string | `ACTIVE`, `INACTIVE` |

**Response includes:** department object.

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
| `image` | No | Single file — jpg, png, gif, webp |
| `bio` | No | |
| `order` | No | Display order |
| `status` | No | Default `ACTIVE` |

### PATCH /team/:id

```
ADMIN only — multipart form
```

### DELETE /team/:id

```
ADMIN only
```

---

## Contact Messages

### POST /contact-messages

```
Public
```

```bash
curl -X POST http://localhost:3000/contact-messages \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Abebe Kebede",
    "email": "abebe@email.com",
    "phoneNumber": "+251911234567",
    "companyName": "Example Corp",
    "subject": "GENERAL_INQUIRY",
    "message": "I would like to learn more about your products and services."
  }'
```

| Field | Required | Notes |
|---|---|---|
| `fullName` | Yes | Min 2 chars |
| `email` | Yes | Valid email |
| `phoneNumber` | No | |
| `companyName` | No | |
| `subject` | Yes | See enum below |
| `message` | Yes | Min 10 chars |

**Subject enum values:**
- `GENERAL_INQUIRY`
- `PRODUCT_QUOTE`
- `PARTNERSHIP`
- `TECHNICAL_SUPPORT`
- `CAREER_OPPORTUNITY`
- `COFFEE_EXPORT`
- `OTHER`

### GET /contact-messages

```
ADMIN only
```

```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/contact-messages?status=NEW&subject=PRODUCT_QUOTE&page=1"
```

| Filter | Type | Values |
|---|---|---|
| `status` | string | `NEW`, `READ`, `RESPONDED` |
| `subject` | string | Same as above |

No PATCH/DELETE — contact messages are immutable.

---

## File Upload Reference

| Endpoint | Field Name | Max | Types | Storage |
|---|---|---|---|---|
| POST `/products` | `images` | 5 | jpg, png, gif, webp | `uploads/products/` |
| PATCH `/products/:id` | `images` | 5 | jpg, png, gif, webp | `uploads/products/` |
| POST `/projects` | `images` | 5 | jpg, png, gif, webp | `uploads/projects/` |
| PATCH `/projects/:id` | `images` | 5 | jpg, png, gif, webp | `uploads/projects/` |
| POST `/blog-posts` | `image` | 1 | jpg, png, gif, webp | `uploads/blog-posts/` |
| PATCH `/blog-posts/:id` | `image` | 1 | jpg, png, gif, webp | `uploads/blog-posts/` |
| POST `/coffee-types` | `image` | 1 | jpg, png, gif, webp | `uploads/coffee-types/` |
| PATCH `/coffee-types/:id` | `image` | 1 | jpg, png, gif, webp | `uploads/coffee-types/` |
| POST `/careers/:id/apply` | `cv` | 1 | pdf, doc, docx | `uploads/cvs/` |
| POST `/team` | `image` | 1 | jpg, png, gif, webp | `uploads/team/` |
| PATCH `/team/:id` | `image` | 1 | jpg, png, gif, webp | `uploads/team/` |

**Image URLs** are served at: `http://localhost:3000/uploads/products/filename.jpg` (static file serving via Express).

---

## Quick Start (Dev)

```bash
cd moti_be
npm install
npm run seed     # idempotent — safe to run anytime
npm run start:dev
```

**Login:** `admin@moti.com` / `Admin@123456` (SUPER_ADMIN)

---

## Deployment (Render)

| Setting | Value |
|---|---|
| **Build Command** | `npm install && npx prisma migrate deploy && npm run seed && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Node Version** | 22.x |

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/moti_db
JWT_SECRET=your-random-secret-key
JWT_EXPIRES_IN=86400
```

---

## Complete Route Map

| Module | Method | Path | Auth |
|---|---|---|---|
| Auth | POST | `/auth/login` | Public |
| Admin | GET | `/admin/dashboard` | ADMIN |
| Admin | GET | `/admin/search` | ADMIN |
| Users | GET | `/users` | JWT |
| Users | POST | `/users` | SUPER_ADMIN |
| Users | PATCH | `/users/:id` | SUPER_ADMIN |
| Users | DELETE | `/users/:id` | SUPER_ADMIN |
| Products | GET | `/products` | Public |
| Products | GET | `/products/:id` | Public |
| Products | POST | `/products` | ADMIN |
| Products | PATCH | `/products/:id` | ADMIN |
| Products | DELETE | `/products/:id` | ADMIN |
| Product Categories | GET | `/product-categories` | Public |
| Product Categories | GET | `/product-categories/:id` | Public |
| Product Categories | POST | `/product-categories` | ADMIN |
| Product Categories | PATCH | `/product-categories/:id` | ADMIN |
| Product Categories | DELETE | `/product-categories/:id` | ADMIN |
| Clients | GET | `/clients` | Public |
| Clients | GET | `/clients/:id` | Public |
| Clients | POST | `/clients` | ADMIN |
| Clients | PATCH | `/clients/:id` | ADMIN |
| Clients | DELETE | `/clients/:id` | ADMIN |
| Departments | GET | `/departments` | Public |
| Departments | GET | `/departments/:id` | Public |
| Departments | POST | `/departments` | ADMIN |
| Departments | PATCH | `/departments/:id` | ADMIN |
| Departments | DELETE | `/departments/:id` | ADMIN |
| Team | GET | `/team` | Public |
| Team | GET | `/team/:id` | Public |
| Team | POST | `/team` | ADMIN |
| Team | PATCH | `/team/:id` | ADMIN |
| Team | DELETE | `/team/:id` | ADMIN |
| Projects | GET | `/projects` | Public |
| Projects | GET | `/projects/:id` | Public |
| Projects | POST | `/projects` | ADMIN |
| Projects | PATCH | `/projects/:id` | ADMIN |
| Projects | DELETE | `/projects/:id` | ADMIN |
| Project Categories | GET | `/project-categories` | Public |
| Project Categories | GET | `/project-categories/:id` | Public |
| Project Categories | POST | `/project-categories` | ADMIN |
| Project Categories | PATCH | `/project-categories/:id` | ADMIN |
| Project Categories | DELETE | `/project-categories/:id` | ADMIN |
| Blog Posts | GET | `/blog-posts` | Public |
| Blog Posts | GET | `/blog-posts/:id` | Public |
| Blog Posts | POST | `/blog-posts` | ADMIN |
| Blog Posts | PATCH | `/blog-posts/:id` | ADMIN |
| Blog Posts | DELETE | `/blog-posts/:id` | ADMIN |
| Blog Categories | GET | `/blog-categories` | Public |
| Blog Categories | GET | `/blog-categories/:id` | Public |
| Blog Categories | POST | `/blog-categories` | ADMIN |
| Blog Categories | PATCH | `/blog-categories/:id` | ADMIN |
| Blog Categories | DELETE | `/blog-categories/:id` | ADMIN |
| Blog Tags | GET | `/blog-tags` | Public |
| Blog Tags | POST | `/blog-tags` | ADMIN |
| Blog Tags | PATCH | `/blog-tags/:id` | ADMIN |
| Blog Tags | DELETE | `/blog-tags/:id` | ADMIN |
| Testimonials | GET | `/testimonials` | Public |
| Testimonials | GET | `/testimonials/all` | ADMIN |
| Testimonials | POST | `/testimonials` | ADMIN |
| Testimonials | PATCH | `/testimonials/:id` | ADMIN |
| Testimonials | DELETE | `/testimonials/:id` | ADMIN |
| Coffee Types | GET | `/coffee-types` | Public |
| Coffee Types | GET | `/coffee-types/:id` | Public |
| Coffee Types | POST | `/coffee-types` | ADMIN |
| Coffee Types | PATCH | `/coffee-types/:id` | ADMIN |
| Coffee Types | DELETE | `/coffee-types/:id` | ADMIN |
| Careers | GET | `/careers` | Public |
| Careers | GET | `/careers/:id` | Public |
| Careers | POST | `/careers` | ADMIN |
| Careers | PATCH | `/careers/:id` | ADMIN |
| Careers | DELETE | `/careers/:id` | ADMIN |
| Careers | POST | `/careers/:id/apply` | Public |
| Careers | GET | `/careers/applications` | ADMIN |
| Careers | GET | `/careers/:id/applications` | ADMIN |
| Contact | POST | `/contact-messages` | Public |
| Contact | GET | `/contact-messages` | ADMIN |

---

## Error Responses

| Code | Meaning |
|---|---|
| `400` | Validation error (bad input) |
| `401` | Missing or invalid JWT token |
| `403` | Insufficient role (e.g., ADMIN trying to create a user) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, category with children, etc.) |

**Validation error format:**
```json
{
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Forbidden format:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```
