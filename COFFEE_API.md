# Coffee Types & Grades API

Base URL: `https://moti-be.onrender.com`

---

## Coffee Grades

### List (paginated)

```http
GET /coffee-grades?page=1&limit=10&sort=newest
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "grade": "Grade 1",
      "qualityLevel": "Specialty",
      "defects": "0-3 per 300g",
      "status": "AVAILABLE",
      "_count": { "coffeeTypes": 3 },
      "createdAt": "2026-06-05T...",
      "updatedAt": "2026-06-05T..."
    }
  ],
  "meta": { "total": 6, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### List all (unpaginated)

```http
GET /coffee-grades/all
```

**Response:**
```json
[
  {
    "id": 1,
    "grade": "Grade 1",
    "qualityLevel": "Specialty",
    "defects": "0-3 per 300g",
    "status": "AVAILABLE",
    "_count": { "coffeeTypes": 3 }
  }
]
```

### Get single

```http
GET /coffee-grades/1
```

### Create (admin)

```http
POST /coffee-grades
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": "Grade 6",
  "qualityLevel": "Commercial",
  "defects": "61-90 per 300g",
  "status": "COMING_SOON"
}
```

### Update (admin)

```http
PATCH /coffee-grades/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": "Grade 1 - Premium",
  "status": "AVAILABLE"
}
```

### Delete (admin)

```http
DELETE /coffee-grades/1
Authorization: Bearer <token>
```

---

## Coffee Types

### List active (default)

```http
GET /coffee-types?page=1&limit=10&sort=newest
```

**Response:**
```json
{
  "data": [
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
          "coffeeGrade": {
            "id": 1,
            "grade": "Grade 1",
            "qualityLevel": "Specialty",
            "defects": "0-3 per 300g",
            "status": "AVAILABLE"
          }
        }
      ],
      "createdAt": "2026-06-05T...",
      "updatedAt": "2026-06-05T..."
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### Get single

```http
GET /coffee-types/1
```

Same shape as list item above.

### Image serving

```http
GET /coffee-types/1/image
```

Returns raw image binary. Use `imageUrl` from API response (`/coffee-types/1/image`) and prepend `NEXT_PUBLIC_API_URL`.

### Create (admin) — with image upload

```http
POST /coffee-types
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "Guji Natural"
origin: "Guji, Oromia"
grade: "Grade 1"
description: "Wild and complex with tropical fruit and floral notes"
altitude: "1800-2100m"
processing: "NATURAL"
acidity: "HIGH"
body: "MEDIUM"
harvestSeason: "OCTOBER,NOVEMBER,DECEMBER"
tastingNotes: "Tropical Fruit,Floral,Berry,Wine"
badgeText: "Limited Edition"
gradeIds: "1,6"
image: @/path/to/photo.jpg
```

### Create (admin) — without image

```http
POST /coffee-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Guji Natural",
  "origin": "Guji, Oromia",
  "grade": "Grade 1",
  "description": "Wild and complex with tropical fruit and floral notes",
  "altitude": "1800-2100m",
  "processing": "NATURAL",
  "acidity": "HIGH",
  "body": "MEDIUM",
  "harvestSeason": ["OCTOBER", "NOVEMBER", "DECEMBER"],
  "tastingNotes": ["Tropical Fruit", "Floral", "Berry", "Wine"],
  "badgeText": "Limited Edition",
  "gradeIds": [1, 6]
}
```

### Update (admin)

Same shape as create, all fields optional.

```http
PATCH /coffee-types/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: "Yirgacheffe Premium - Updated"
processing: "HONEY"
harvestSeason: "OCTOBER,NOVEMBER"
tastingNotes: "Jasmine,Honey,Citrus"
gradeIds: "1,2"
```

### Delete (admin)

```http
DELETE /coffee-types/1
Authorization: Bearer <token>
```

---

## Field Reference

| Field | Type | Values |
|---|---|---|
| `processing` | enum | `WASHED`, `NATURAL`, `HONEY`, `SEMI_WASHED`, `WET_HULLED` |
| `acidity` | enum | `HIGH`, `MEDIUM`, `LOW` |
| `body` | enum | `FULL`, `MEDIUM`, `LIGHT`, `LIGHT_TO_MEDIUM`, `MEDIUM_TO_FULL`, `DELICATE`, `CREAMY` |
| `harvestSeason` | enum[] | `JANUARY`-`DECEMBER` |
| `status` | enum | `ACTIVE`, `INACTIVE` |
| `gradeIds` | number[] | IDs from `/coffee-grades/all` |
| `tastingNotes` | string[] | Array of words |
| `grade` | string | e.g. "Grade 1" — this is the coffee type's own grade label, **not** the CoffeeGrade relation |

---

## Settings

Singleton configuration store. First `GET` auto-creates a row with all defaults.

### Get settings

```http
GET /settings
```

**Response:**
```json
{
  "id": 1,
  "siteName": "",
  "siteDescription": "",
  "maintenanceMode": false,
  "maintenanceMessage": "",
  "estimatedEndTime": null,
  "email": "",
  "phone": "",
  "address": "",
  "facebook": "",
  "linkedIn": "",
  "twitter": "",
  "instagram": "",
  "createdAt": "2026-06-05T...",
  "updatedAt": "2026-06-05T..."
}
```

### Update settings (admin)

```http
PATCH /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteName": "Moti Coffee",
  "siteDescription": "Premium Ethiopian Coffee Exporter",
  "maintenanceMode": false,
  "email": "info@moticoffee.com",
  "phone": "+251-11-123-4567",
  "address": "Addis Ababa, Ethiopia",
  "facebook": "https://facebook.com/moticoffee",
  "linkedIn": "https://linkedin.com/company/moticoffee",
  "twitter": "https://twitter.com/moticoffee",
  "instagram": "https://instagram.com/moticoffee"
}
```

**Request fields** — all optional, partial updates supported:

| Field | Type | Description |
|-------|------|-------------|
| `siteName` | string | Site name |
| `siteDescription` | string | Site tagline/description |
| `maintenanceMode` | boolean | Enable/disable maintenance mode |
| `maintenanceMessage` | string | Message shown during maintenance |
| `estimatedEndTime` | ISO datetime | Optional estimated end time |
| `email` | string | Contact email |
| `phone` | string | Contact phone |
| `address` | string | Physical address |
| `facebook` | string | Facebook URL |
| `linkedIn` | string | LinkedIn URL |
| `twitter` | string | Twitter URL |
| `instagram` | string | Instagram URL |
