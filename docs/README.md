# GeoCRUD - Frontend (GitHub Pages)

This is the **static frontend** for the GeoCRUD GIS Application, deployed on GitHub Pages.

## 🌐 Live URLs
- **Frontend (GitHub Pages)**: https://clownqqqqq.github.io/laravel-gis-frontend/
- **Backend API (Hostinger)**: https://geocrud.bytevortexz.com

## 📁 Frontend Structure

```
docs/
├── index.html              # Landing page
├── login.html             # Login page
├── register.html          # Registration page
├── css/
│   └── style.css         # All styles
├── js/
│   ├── config.js         # API configuration
│   └── auth.js           # Authentication logic
└── README.md             # This file
```

## ✨ Features
- 🗺️ Geographic Information System
- 📍 Location Management  
- 🔐 User Authentication (Admin, Staff, Member roles)
- 📊 Admin Dashboard
- 🎨 Modern, Responsive UI

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Laravel 9.52 (PHP) - Running on Hostinger
- **Database**: MySQL
- **API**: RESTful API with CORS enabled
- **Hosting**: 
  - Frontend: GitHub Pages
  - Backend: Hostinger

## 🚀 How It Works

1. **Static Frontend** (this folder) is hosted on GitHub Pages
2. **Laravel Backend** runs on Hostinger
3. Frontend makes **API calls** to backend
4. **CORS** is configured to allow GitHub Pages origin
5. User authentication via **JWT tokens** stored in localStorage

## 📝 API Endpoints

All API calls go to: `https://geocrud.bytevortexz.com/api`

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /gis` - Get all locations
- `POST /gis` - Create location
- `GET /gis/{id}` - Get single location
- `PUT /gis/{id}` - Update location
- `DELETE /gis/{id}` - Delete location

## 🔧 Local Development

1. Open `index.html` in browser
2. Or use a local server:
   ```bash
   python -m http.server 8080
   ```
3. Visit `http://localhost:8080`

## 📤 Deployment

Frontend deploys automatically when you push to GitHub:
```bash
git add docs/
git commit -m "Update frontend"
git push origin main
```

GitHub Pages will rebuild in 1-2 minutes.

## 🐛 Troubleshooting

**CORS Errors?**
- Check `config/cors.php` on Hostinger backend
- Ensure GitHub Pages URL is in `allowed_origins`

**API Not Responding?**
- Test: https://geocrud.bytevortexz.com/up
- Should show "Application up"

**Login Not Working?**
- Check browser console for errors
- Verify API_BASE_URL in `js/config.js`
- Test with Postman first

## 📚 Documentation

See `DEPLOYMENT_INSTRUCTIONS.md` for full deployment guide.

## 👨‍💻 Developer
Created by clownqqqq for BSIT course requirement.


