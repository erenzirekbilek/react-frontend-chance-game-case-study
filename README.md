# 🎰 Chance Game - Frontend README

---

## 📋 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Backend Çalıştır
```bash
# Backend http://127.0.0.1:8000'de çalışıyor olmalı
```

### 3. Frontend Başlat
```bash
npm start
# http://localhost:3000 açılır
```

### 4. Test Et
```bash
# Login/Signup → Dashboard → Oda Oluştur/Katıl → Oyun
```

### 5. Production Build
```bash
npm run build
```

---

## 🏗️ Mimari Yaklaşım

### Veri Akışı

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
    ┌────┴──────┬────────────┐
    │            │            │
  REST API   REST API    WebSocket
    │            │            │
 Login       Rooms/Games   Game Events
 Signup      Bet Levels    (Join, Guess)
  Users      Transactions
    │            │            │
    └────────┬───┴────────┬───┘
             │            │
        ┌────▼────────────▼────┐
        │  Django REST API     │
        │  + Django Channels   │
        └────┬───────────┬─────┘
             │           │
        ┌────▼───────────▼────┐
        │       SQLite        │
        └─────────────────────┘
```

### Component Yapısı

```
App.jsx
├── Routes
│   ├── /login → Login (public)
│   ├── /signup → Signup (public)
│   ├── /dashboard → ProtectedRoute → GamePanel (user)
│   ├── /admin → ProtectedRoute → AdminPanel (admin)
│   ├── /admin/users → UserManagement
│   ├── /admin/settings → BetSettings
│   ├── /admin/transactions → AdminTransactions
│   ├── /admin/bet-levels → BetLevelsAdmin
│   └── /admin/rooms → RoomsAdmin
```

### State Yönetimi

**GamePanel'de:**
```javascript
// Auth
username, token, userId, coin, role (localStorage)

// Rooms
rooms, myRooms, betLevels, selectedRoom

// Game
gameStarted, gamePlayers, currentTurn, currentTurnUsername
gameMessages, gameOver, winner, secretNumber

// UI
loading, wsConnected, guessInput, form
```

### localStorage Keys

```javascript
token              // JWT token
username           // Kullanıcı adı
user_id            // Kullanıcı ID
coin               // Bakiye
role               // 'user' veya 'admin'
```

---

## 📐 Varsayımlar

### Backend API Endpoints

```javascript
// Auth
POST /api/users/login/
POST /api/users/signup/
GET /api/users/me/

// Games
GET /api/games/rooms/
POST /api/games/rooms/
DELETE /api/games/rooms/{id}/
POST /api/games/rooms/{id}/join/
GET /api/games/bet-levels/

// Admin
GET /admin/users/
PATCH /admin/users/{id}/
DELETE /admin/users/{id}/
GET /admin/transactions/
GET /admin/bet-levels/
POST /admin/bet-levels/
```

### Login Yanıtı

```javascript
{
  access: "JWT_TOKEN",
  user_id: 1,
  username: "oyuncu1",
  role: "user",
  coin: 1000
}
```

### Room Yapısı

```javascript
{
  id: 1,
  name: "Oda 1",
  creator: { id: 1, username: "oyuncu1" },
  max_players: 2,
  bet_level: { id: 1, level_name: "Düşük" },
  users: [{ id: 1, username: "oyuncu1" }, ...],
  status: "waiting" | "playing" | "finished"
}
```

### WebSocket Mesajları

**Client → Server:**
```javascript
{
  type: "guess",
  guess: 50,        // 1-100
  user_id: 1
}
```

**Server → Client:**
```javascript
// player_joined
{ type: "player_joined", username: "...", players: {...} }

// game_start
{ type: "game_start", players: {...}, turn: 1, turn_username: "...", secret: 50 }

// guess_result
{ type: "guess_result", username: "...", correct: false, hint: "higher", next_turn: 2, next_turn_username: "..." }

// game_over
{ type: "game_over", winner_username: "...", winner_id: 1, prize: 100 }

// error
{ type: "error", message: "..." }
```

### Token Format

- JWT access token
- Header: `Authorization: Bearer {token}`
- Geçersiz token (401) → localStorage temizle → /login'e yönlendir

### Authorization

```javascript
PUBLIC:
├── /login
└── /signup

PROTECTED (authenticated):
├── /dashboard (role: user)
│   └── Rooms oluştur/katıl, tahmin yap
│
└── /admin/* (role: admin)
    ├── /admin → Dashboard
    ├── /admin/users → Kullanıcı yönetimi
    ├── /admin/bet-levels → Bahis seviyeleri
    ├── /admin/rooms → Odaları görüntüle
    ├── /admin/settings → Ayarlar
    └── /admin/transactions → İşlem geçmişi
```

---

## ⚠️ Bilerek Yapılmayanlar

### 1. Redux / State Management Library

**Neden Eklemedim:**
- MVP’de component sayısı az ve prop drilling minimal olduğundan Redux veya benzeri state management eklenmedi; ileride component sayısı arttığında ve global state yönetimi kritik hale geldiğinde eklenecek.

---

### 2. React.memo, useMemo, useCallback Optimizations

**Neden Eklemedim:**
- Erken optimizasyon gereksiz olduğundan ve re-render sorunları minimal olduğundan performans optimizasyonları eklenmedi; ileride component sayısı artınca ve profiling gerekirse uygulanacak.

---

### 3. Suspense & React.lazy Code Splitting

**Neden Eklemedim:**
- Proje küçük ve bundle size düşük olduğundan kod bölme ve lazy loading yapılmadı; bundle büyüyüp performans kritik olursa eklenecek.

---

### 4. Concurrent Features (useTransition, useDeferredValue)

**Neden Eklemedim:**
- MVP’de heavy background task veya input blocking olmadığı için concurrent features kullanılmadı; ileride UI responsive kalması gerekirse eklenecek.

---

### 5. HTTP-Only Cookies (Secure Token Storage)

**Neden Eklemedim:**
- Basit MVP’de token yönetimi için HTTP-only cookie gerekli olmadığından eklenmedi; production aşamasında güvenli token saklama gerektiğinde eklenecek.

---

### 6. Custom Hooks (useDebounce, useLocalStorage, useFetch)

**Neden Eklemedim:**
- Basit MVP’de token yönetimi için HTTP-only cookie gerekli olmadığından eklenmedi; production aşamasında güvenli token saklama gerektiğinde eklenecek.

---

### 7. React Hook Form + Validation

**Neden Eklemedim:**
- MVP’de form sayısı az ve inline validation yeterli olduğundan react-hook-form kullanılmadı; ileride form sayısı ve validation complexity arttığında eklenecek.

---

## 📁 Proje Dosya Yapısı

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── user/
│   │   ├── GamePanel.jsx
│   │   └── GameRoomContainer.jsx
│   └── admin/
│       ├── AdminPanel.jsx
│       ├── AdminTransactions.jsx
│       ├── BetSettings.jsx
│       └── UserManagement.jsx
│
├── components/
│   ├── layout/
│   │   ├── admin/
│   │   │   ├── AdminNavbar.jsx
│   │   │   ├── BetLevelsAdmin.jsx
│   │   │   └── RoomsAdmin.jsx
│   │   └── user/
│   │       └── UserNavbar.jsx
│   └── ProtectedRoute.jsx
│
├── App.jsx
└── index.jsx
```

---

## ⚡ Hızlı Başlangıç

```bash
# Terminal 1
npm start

# Terminal 2 (opsiyonel - Backend test)
curl http://127.0.0.1:8000/api/games/rooms/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tarayıcı
http://localhost:3000
```

---

**Son Güncelleme:** Aralık 2024  
**Durum:** 🚧 Development  
**License:** MIT
