# AgriConnect API Endpoints

Authentication
- POST /api/auth/register — Register new user (role: FARMER/BUYER)
- POST /api/auth/login — Authenticate; returns JWT and user data
- GET /api/auth/me — Get current user profile

Crops
- GET /api/crops — List crops (supports pagination, filters: name, priceMin, priceMax, location, organic)
- GET /api/crops/:id — Get crop details
- POST /api/crops — Create crop (FARMER only)
- PUT /api/crops/:id — Update crop (owner only)
- DELETE /api/crops/:id — Delete crop (owner or ADMIN)

Negotiations
- POST /api/negotiations — Create offer (BUYER)
- GET /api/negotiations/crop/:cropId — List negotiations for a crop (FARMER)
- PUT /api/negotiations/:id — Update negotiation (counter/accept/reject)

Cart & Orders
- POST /api/cart — Add to cart (buyer session-based or DB-backed)
- POST /api/orders — Place order
- GET /api/orders/:id — Get order details
- GET /api/orders/user/:userId — List orders for user
- PUT /api/orders/:id/status — Update order status (FARMER/ADMIN)

Payments
- POST /api/payments/charge — Simulate payment charge
- GET /api/payments/:id — Get payment details

Reviews
- POST /api/reviews — Submit review for an order
- GET /api/reviews/crop/:cropId — Get reviews for crop

Admin
- GET /api/admin/metrics — Get dashboard metrics
- PUT /api/admin/users/:id/suspend — Suspend user
- DELETE /api/admin/crops/:id — Remove listing

Notes:
- Use JWT auth header `Authorization: Bearer <token>` for protected routes.
- Implement pagination via `?page=1&size=20` and sorting via `?sort=price,asc`.
