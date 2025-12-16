# IronFuel — Gym Supplements (Mini e-commerce) + Admin CRUD + Auth (JWT cookie)

## Co to jest?
**IronFuel** to mini “sklep” z suplementami:
- publiczny katalog (bez logowania),
- konto klienta (rejestracja/logowanie),
- koszyk + checkout (płatność **MOCK** na potrzeby projektu),
- historia zamówień,
- panel admina (2 encje CRUD: **Products** i **Categories**).

## Wymagania zaliczenia (mapowanie)
- ✅ 2 encje CRUD end-to-end: Products + Categories (DB → API → UI)
- ✅ RDBMS: SQLite + migracje SQL
- ✅ REST: GET list / GET {id} / POST / PUT / DELETE + kody HTTP
- ✅ Auth: register + login, JWT w **HTTP-only cookie**
- ✅ Ochrona zasobów: klient bez logowania dostaje **401**
- ✅ Strona publiczna: `/` działa bez logowania
- ✅ UI: estetyczny front (landing + auth + shop + admin)
- ✅ Testy minimalne (Vitest + Supertest)

> Node.js: na Windows zalecany **Node LTS 22 lub 20**.

---

## Konta demo
- **ADMIN:** `admin` / `admin12345` (ma dostęp do panelu admina)
- Klient: możesz zrobić przez **Create account**.

---

## Uruchomienie

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend: http://localhost:4000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

---

## Ścieżki w UI
- `/` — publiczny katalog suplementów
- `/login`, `/register` — auth
- `/cart` — koszyk (wymaga logowania)
- `/orders` — zamówienia (wymaga logowania)
- `/admin/...` — panel admina (wymaga roli ADMIN)

---

## API (skrót)
Public:
- `GET /public/products?limit=...`
- `GET /public/categories`

Auth:
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

Shop (USER):
- `GET /api/cart`
- `POST /api/cart` { productId, qty }
- `PUT /api/cart/:productId` { qty }
- `DELETE /api/cart/:productId`
- `POST /api/checkout` → tworzy zamówienie (MOCK payment)
- `GET /api/orders`
- `GET /api/orders/:id`

Admin (ADMIN):
- `/api/admin/products` (GET/POST/PUT/DELETE)
- `/api/admin/categories` (GET/POST/PUT/DELETE)


## Product images
Images are local SVG files in `frontend/public/ironfuel/` so they work offline.

## External integrations (REST API)

### Weather (Open‑Meteo)
Backend endpoint:
- `GET /external/weather?city=Warsaw`
- `GET /external/weather?lat=52.23&lon=21.01`

Example response (simplified):
```json
{
  "source": "open-meteo",
  "location": { "city": "Warsaw", "latitude": 52.23, "longitude": 21.01 },
  "current": { "temperatureC": 12.3, "time": "2025-12-16T12:00" },
  "nextHours": [{ "time": "2025-12-16T13:00", "temperatureC": 12.8 }]
}
```

### Currency rates (exchangerate.host)
Backend endpoint:
- `GET /external/rates?base=EUR&symbols=PLN,USD,GBP`

Example response:
```json
{
  "source": "exchangerate.host",
  "base": "EUR",
  "date": "2025-12-16",
  "rates": [{ "symbol": "PLN", "rate": 4.33 }]
}
```

UI pages:
- `/weather` and `/rates` (loading state + errors)

Tests:
- `backend/tests/external.int.test.ts`
