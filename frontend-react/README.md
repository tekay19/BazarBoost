# SEO Optimize Studio - React Frontend

Modern React + TypeScript frontend for SEO optimization platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Payment.tsx
│   └── Admin.tsx
├── services/        # API services
│   └── api.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🔧 Configuration

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

## 🎨 Features

- ✅ Modern React with TypeScript
- ✅ Tailwind CSS for styling
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Protected routes
- ✅ Authentication context
- ✅ Responsive design
- ✅ Professional UI/UX

## 📦 Dependencies

- React 19
- React Router DOM
- Axios
- Tailwind CSS
- Heroicons
- TypeScript

## 🌐 Backend Connection

Make sure the backend is running on `http://localhost:8000` (or configure `VITE_API_BASE_URL`).

## 🔐 Authentication

- Login/Register pages
- JWT token management
- Protected routes
- Auto-logout on 401

## 💳 Payment Integration

Payment packages:
- Starter: 10 credits - ₺49
- Pro: 50 credits - ₺149
- Scale: 200 credits - ₺399

## 👨‍💼 Admin Panel

Access admin panel at `/admin` (requires admin email in `VITE_ADMIN_EMAILS`).
