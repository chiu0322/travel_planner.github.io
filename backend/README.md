# Travel Planner Backend API

A RESTful API backend for the Travel Planner application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Travel Plan CRUD**: Complete CRUD operations for travel plans
- **Security**: Helmet, rate limiting, CORS protection
- **Data Validation**: Input validation and sanitization
- **Cloud Ready**: Easy deployment to Heroku, Railway, or other platforms

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` file with your actual values:

```env
# Database - Use MongoDB Atlas for cloud database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-planner

# JWT Secret - Generate a strong random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Origins - Add your frontend URLs
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,https://yourusername.github.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

#### Option A: MongoDB Atlas (Recommended for production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/travel-planner`

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Travel Plans Endpoints

#### Get All Travel Plans
```http
GET /api/travel-plans
Authorization: Bearer <jwt_token>
```

#### Create Travel Plan
```http
POST /api/travel-plans
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "European Adventure",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "description": "Two weeks in Europe",
  "days": []
}
```

#### Update Travel Plan
```http
PUT /api/travel-plans/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "days": [...]
}
```

#### Delete Travel Plan
```http
DELETE /api/travel-plans/:id
Authorization: Bearer <jwt_token>
```

## 🌐 Deployment Options

### Option 1: Heroku (Recommended)

1. **Install Heroku CLI**
   ```bash
   # Install from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-travel-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV="production"
   heroku config:set CORS_ORIGINS="https://yourusername.github.io"
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Option 2: Railway

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Set Environment Variables**
   - Add all variables from your `.env` file
   - Railway will auto-deploy on every push

### Option 3: Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configuration**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables

## 🔧 Frontend Integration

Update your frontend's `api.js` file with your deployed backend URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : 'https://your-travel-api.herokuapp.com/api'; // Your actual backend URL
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Express-validator for request validation
- **Helmet**: Security headers protection

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/travel-planner` | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000,http://localhost:8000` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your connection string
   - Check if MongoDB service is running
   - Ensure network access is allowed (MongoDB Atlas)

2. **CORS Errors**
   - Add your frontend URL to `CORS_ORIGINS`
   - Check if the frontend is making requests to the correct backend URL

3. **Authentication Issues**
   - Ensure JWT_SECRET is set
   - Check if token is being sent in Authorization header

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 🚦 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use MongoDB Atlas or secure database
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS_ORIGINS
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS
- [ ] Regular security updates

## 📞 Support

If you encounter any issues, please check:
1. Console logs for error messages
2. Network tab for API request/response
3. MongoDB Atlas logs (if using Atlas)
4. Heroku logs (if deployed on Heroku): `heroku logs --tail`

---

**Happy Coding! 🎉** 