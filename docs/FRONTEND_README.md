# GeoCRUD - Frontend Application

🌐 **Live Demo**: https://clownqqqq.github.io/laravel-gis-frontend/

This repository contains the **frontend** for the GeoCRUD Geographic Information System application.

## 📁 Repository Structure

```
laravel-gis-frontend/
└── docs/                  # Frontend static files
    ├── index.html        # Landing page
    ├── login.html        # Login page
    ├── register.html     # Registration page
    ├── css/
    │   └── style.css    # Styles
    └── js/
        ├── config.js    # API configuration
        └── auth.js      # Authentication logic
```

## 🚀 Features

- 📍 Geographic Information System Interface
- 🔐 User Authentication (Login/Register)
- 🎨 Modern, Responsive UI
- 🌐 Connects to Laravel Backend API

## 🛠️ Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling  
- **Vanilla JavaScript** - Functionality
- **Backend API**: Laravel (hosted separately)

## 🌍 Live URLs

- **Frontend**: https://clownqqqq.github.io/laravel-gis-frontend/
- **Backend API**: https://geocrud.bytevortexz.com

## 📖 How It Works

1. Frontend is hosted on **GitHub Pages** (static files)
2. Backend API runs on **Hostinger** (Laravel)
3. Frontend makes API calls to backend
4. CORS enabled for cross-origin requests

## 🔧 API Configuration

The frontend connects to the backend API at:
```javascript
API_BASE_URL = 'https://geocrud.bytevortexz.com/api'
```

Edit `docs/js/config.js` to change the API endpoint.

## 📱 Pages

- **Landing Page** (`index.html`) - Welcome page with app info
- **Login** (`login.html`) - User login form
- **Register** (`register.html`) - New user registration

## 🎓 Academic Project

This is a frontend application developed for:
- **Course**: BSIT (Bachelor of Science in Information Technology)
- **Purpose**: Web Development / GIS Application Project
- **Developer**: clownqqqq

## 📄 License

Educational project for academic purposes.

---

**Note**: This repository contains ONLY the frontend. The Laravel backend is deployed separately on Hostinger.


