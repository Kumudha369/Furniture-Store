# API Documentation — Jothi Industrial And Furniture

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)
| Method | Endpoint             | Auth   | Description           |
|--------|---------------------|--------|-----------------------|
| POST   | /register            | None   | Register new user     |
| POST   | /login               | None   | Login user            |
| GET    | /profile             | Token  | Get own profile       |
| PUT    | /profile             | Token  | Update profile        |
| POST   | /wishlist/:productId | Token  | Toggle wishlist item  |

## Products (`/api/products`)
| Method | Endpoint               | Auth   | Description            |
|--------|------------------------|--------|------------------------|
| GET    | /                      | None   | List with filters/pagination |
| GET    | /:id                   | None   | Single product         |
| POST   | /                      | Admin  | Create product         |
| PUT    | /:id                   | Admin  | Update product         |
| DELETE | /:id                   | Admin  | Delete product         |
| GET    | /meta/categories       | None   | Get all categories     |

Query params: `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `featured`

## Orders (`/api/orders`)
| Method | Endpoint        | Auth   | Description           |
|--------|----------------|--------|-----------------------|
| POST   | /               | Token  | Place order           |
| GET    | /my             | Token  | Get my orders         |
| GET    | /:id            | Token  | Get single order      |
| GET    | /               | Admin  | Get all orders        |
| PUT    | /:id/status     | Admin  | Update order status   |

## Layouts (`/api/layouts`)
| Method | Endpoint  | Auth  | Description       |
|--------|-----------|-------|-------------------|
| POST   | /         | Token | Save layout       |
| GET    | /my       | Token | Get my layouts    |
| GET    | /:id      | Token | Get layout        |
| PUT    | /:id      | Token | Update layout     |
| DELETE | /:id      | Token | Delete layout     |

## Contact (`/api/contact`)
| Method | Endpoint  | Auth  | Description          |
|--------|-----------|-------|----------------------|
| POST   | /         | None  | Submit query         |
| GET    | /         | Admin | List all queries     |
| PUT    | /:id      | Admin | Update query status  |

## Reviews (`/api/reviews`)
| Method | Endpoint           | Auth  | Description     |
|--------|--------------------|-------|-----------------|
| POST   | /:productId        | Token | Add review      |
| GET    | /:productId        | None  | Get reviews     |
| DELETE | /:id               | Token | Delete review   |

## Admin (`/api/admin`)
| Method | Endpoint      | Auth  | Description           |
|--------|--------------|-------|-----------------------|
| GET    | /dashboard   | Admin | Stats & recent orders |
| GET    | /users       | Admin | All users             |
| GET    | /inventory   | Admin | Low stock alert       |
