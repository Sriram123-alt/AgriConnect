# ER Diagram — AgriConnect

Entities and relationships (textual ER):

- `User` (id, name, email, password_hash, role_id, phone, address, city, state, country, created_at, updated_at)
- `Role` (id, name)
- `Crop` (id, farmer_id -> User.id, name, price_per_kg, quantity_kg, harvest_date, organic BOOLEAN, image_url, location, status, created_at, updated_at)
- `Negotiation` (id, crop_id -> Crop.id, buyer_id -> User.id, farmer_id -> User.id, offer_price, quantity, status ENUM(PENDING, ACCEPTED, REJECTED, COUNTERED), message, created_at, updated_at)
- `Order` (id, buyer_id -> User.id, farmer_id -> User.id, total_amount, commission_amount, status ENUM(PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED), created_at, updated_at)
- `OrderItem` (id, order_id -> Order.id, crop_id -> Crop.id, price_per_kg, quantity_kg, subtotal)
- `Payment` (id, order_id -> Order.id, amount, method, status, transaction_ref, created_at)
- `Review` (id, order_id -> Order.id, reviewer_id -> User.id, rating INT, comment, created_at)
- `CommissionRecord` (id, order_id -> Order.id, percent, amount, created_at)

Relationships:
- `User` 1—* `Crop` (farmer lists many crops)
- `User` 1—* `Order` (buyer places many orders)
- `Crop` 1—* `Negotiation` (negotiations per crop)
- `Order` 1—* `OrderItem`
- `Order` 1—1 `Payment`
- `Order` 1—* `Review` (one review per order typically)

Notes:
- Use separate `OrderItem` table to support multiple crops per order.
- Store `role` as a separate table to support admin/role management.
