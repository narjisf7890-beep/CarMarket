# CarMarket

A car marketplace where people can list used and new cars for sale, and buyers can search, filter, compare and contact sellers. Built with **React + Vite** (frontend) and **Flask + SQLite** (backend).

## Features

**For buyers**
- Search by brand or model, with filters for city, area/sector, max price, fuel type, transmission, body type and New/Used
- Sorting (newest, price, year, mileage) and server-side pagination
- Filters are saved in the URL, so a search can be shared
- Car cards with specs and description, plus a popup viewer with all photos, the video and full details
- Compare up to 3 cars side by side
- Save favorite cars
- Contact the seller on WhatsApp or by phone
- Seller profile pages
- Report suspicious listings
- Inspection checklist and legal help guide

**For sellers**
- Add, edit and delete listings (owner only)
- Up to 20 photos and one short video (15 to 30 seconds)
- City and area selection (for example Islamabad sectors such as F-10, G-11)
- Paint condition, New/Used condition and minimum price check
- Mark a car as Sold or Available
- View counter for every listing

**Admin**
- Dashboard with site stats
- Review and resolve reports
- Delete any listing

**Security**
- JWT login with 24-hour tokens
- Rate limiting on login, register and password reset
- Password reset by email link (30 minute expiry, single use)
- Image validation (type, size, real image check)
- Input validation and owner-only edit/delete
- CORS limited to the frontend

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React, Vite, React Router, lucide-react |
| Backend | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Limiter, Flask-CORS |
| Database | SQLite |
| Media | Pillow (images), mutagen (video duration) |

## Project structure

```
CarMarket
├── backend
│   ├── app.py            # Flask app and all API routes
│   ├── db.py             # SQLAlchemy instance
│   ├── models.py         # User, Car, CarImage, Favorite, Report
│   ├── requirements.txt
│   ├── uploads/          # uploaded photos and videos (not in git)
│   └── instance/         # SQLite database (not in git)
└── frontend
    ├── public/           # brand logos and hero images
    └── src
        ├── pages/        # Home, CarDetails, EditCar, MyListings, ...
        ├── App.jsx
        ├── App.css
        └── config.js     # API_URL
```

## Getting started

### Requirements
- Python 3.10 or newer
- Node.js 18 or newer

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env` (see `.env.example`):

```
JWT_SECRET_KEY=put_a_long_random_string_here
FRONTEND_URL=http://localhost:5173
MAIL_USER=your_email@gmail.com
MAIL_APP_PASSWORD=your_gmail_app_password
FLASK_DEBUG=1
```

Generate a secret key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the server:

```bash
python app.py
```

The API runs at `http://127.0.0.1:5000`. The database and all tables are created automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The API address is set in `frontend/src/config.js`.

### 3. Create an admin

Register a normal account first, then make it an admin. Create `backend/make_admin.py`:

```python
import os
import sqlite3

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db")
conn = sqlite3.connect(db_path)
email = input("Admin email: ").strip().lower()
cur = conn.execute("UPDATE user SET is_admin = 1 WHERE email = ?", (email,))
conn.commit()
print("Admin set." if cur.rowcount else "Email not found.")
conn.close()
```

```bash
python make_admin.py
```

Log out and log in again so the admin link appears.

## Optional setup

- **Password reset emails:** use a Gmail App Password (Google Account, 2-Step Verification, App Passwords). Without it, the reset link is printed in the backend terminal.
- **Hero slideshow photos:** add `slide1.jpg`, `slide2.jpg`, `slide3.jpg` to `frontend/public/hero/`. Without them, purple gradients are shown.
- **Brand logos:** add PNG files to `frontend/public/brands/` named after the brand (for example `toyota.png`).

## API overview

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/forgot-password`, `/reset-password`, `GET /api/auth/me` |
| Cars | `GET/POST /api/cars`, `GET/PUT/DELETE /api/cars/<id>`, `PATCH /api/cars/<id>/status` |
| Extras | `POST /api/cars/<id>/view`, `GET /api/cars/<id>/similar`, `POST /api/cars/<id>/report` |
| Users | `GET /api/my-cars`, `GET /api/sellers/<id>`, `GET /api/cities` |
| Favorites | `GET /api/favorites`, `POST/DELETE /api/favorites/<id>` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/reports`, `PATCH /api/admin/reports/<id>`, `DELETE /api/admin/cars/<id>` |

## Deployment notes

Before going live:
- Replace SQLite with PostgreSQL
- Store photos and videos on Cloudinary or S3 (local `uploads/` is wiped on restart on most hosts)
- Use a production server such as gunicorn and set `FLASK_DEBUG=0`
- Use a new secret key and update `FRONTEND_URL` and `API_URL`
- Add database migrations (Flask-Migrate)

## Roadmap

- Make an Offer and inquiry form
- Car feature checkboxes (AC, sunroof, ABS, and so on)
- In-site chat
- Seller reviews and ratings
- Inspection report uploads
- Toast messages, loading skeletons, mobile polish

## License

This project is for learning and personal use.