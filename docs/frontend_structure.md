# Frontend Folder Structure (per-app)

Each frontend (`farmer-frontend`, `buyer-frontend`, `admin-frontend`) follows this structure:

src/
- api/               # shared axios instance(s) (api.js)
- components/        # reusable UI components
- context/           # React Contexts (AuthContext, CartContext)
- layouts/           # App layouts (Header, Footer, Sidebar)
- pages/             # Role-specific pages
- routes/            # React Router setup
- assets/            # images, icons
- utils/             # helpers (formatters, validators)

Notes:
- Keep API calls in `src/api` and use `context` to provide auth state.
- Use route guards (private routes) that check `useAuth()` role before rendering.
