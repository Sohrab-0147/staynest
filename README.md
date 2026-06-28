---

## ⚙️ Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security (JWT Authentication)
- Spring Data JPA
- Hibernate
- REST APIs

### Frontend
- React.js
- TypeScript
- Vite
- Axios
- Context API

### DevOps / Tools
- Maven
- Docker & Docker Compose
- Git & GitHub

---

## 🔐 Authentication Flow

1. User registers / logs in
2. Backend generates JWT token
3. Token stored on client side
4. Token sent in every request header
5. Backend validates token via security filter

---

## 💳 Payment Flow (Stripe)

1. User selects a room and books it
2. Backend creates Stripe payment session
3. Payment processed via Stripe
4. Stripe webhook confirms payment status
5. Booking is marked as confirmed

---

