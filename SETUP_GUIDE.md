# 🚀 Complete Setup Guide for Travel Planner Backend

Follow these steps to set up your development environment:

## ✅ Step 1: Install Node.js

1. **Download Node.js**:
   - Go to: https://nodejs.org/en/download/
   - Download the **LTS version** (Long Term Support)
   - Choose **Windows Installer (.msi)** for 64-bit

2. **Install Node.js**:
   - Run the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - ✅ Make sure "Add to PATH" is checked (default)
   - Complete the installation

3. **Verify Installation**:
   - **Restart your PowerShell/Command Prompt**
   - Type: `node --version` (should show v18.x.x or similar)
   - Type: `npm --version` (should show 9.x.x or similar)

## ✅ Step 2: Install Git

1. **Download Git**:
   - Go to: https://git-scm.com/download/win
   - Download the latest version for Windows

2. **Install Git**:
   - Run the downloaded installer
   - Use default settings (recommended)
   - Complete the installation

3. **Verify Installation**:
   - **Restart your terminal**
   - Type: `git --version` (should show git version 2.x.x)

## ✅ Step 3: Set Up MongoDB Atlas (Free Cloud Database)

### Why MongoDB Atlas?
- ✅ Free tier available (512MB storage)
- ✅ No local installation needed
- ✅ Production-ready
- ✅ Automatic backups
- ✅ Global access

### Setup Steps:

1. **Create Account**:
   - Go to: https://www.mongodb.com/atlas
   - Click "Try Free"
   - Sign up with email or Google

2. **Create Cluster**:
   - Choose "Shared" (free tier)
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Keep cluster name as "Cluster0"
   - Click "Create Cluster"

3. **Set Up Database Access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `travel-admin` (or your choice)
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://travel-admin:<password>@cluster0.xxxxx.mongodb.net/`)
   - **Save this connection string!**

## ✅ Step 4: Install Backend Dependencies

1. **Open Terminal in Project Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Verify Installation**:
   - You should see a `node_modules` folder created
   - No error messages during installation

## ✅ Step 5: Configure Environment Variables

1. **Create Environment File**:
   ```bash
   copy env.example .env
   ```

2. **Edit `.env` File**:
   Open the `.env` file and update these values:

   ```env
   # Replace with your MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://travel-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/travel-planner

   # Generate a strong random string (you can use https://randomkeygen.com/)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Your frontend URLs (update when you deploy)
   CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,https://yourusername.github.io

   # Rate Limiting (keep defaults)
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Important**: Replace:
   - `YOUR_PASSWORD` with your MongoDB Atlas user password
   - `yourusername.github.io` with your actual GitHub Pages URL
   - Generate a strong JWT_SECRET

## ✅ Step 6: Test Your Setup

1. **Start the Backend Server**:
   ```bash
   npm run dev
   ```

2. **Verify It's Working**:
   - You should see: "🚀 Server running on port 3000"
   - You should see: "✅ MongoDB connected successfully"

3. **Test Health Check**:
   - Open browser and go to: http://localhost:3000/health
   - You should see a JSON response with "success: true"

## 🎉 You're Ready!

If all steps are complete, you can now:
- ✅ Run the backend server
- ✅ Connect to MongoDB Atlas
- ✅ Start developing with user authentication
- ✅ Save travel plans to the cloud

## 🆘 Troubleshooting

### Node.js Issues:
- **"node is not recognized"**: Restart terminal after installation
- **Old version**: Uninstall old Node.js, install latest LTS

### MongoDB Issues:
- **Connection failed**: Check username/password in connection string
- **Network timeout**: Ensure "Allow Access from Anywhere" is set
- **Database name**: Make sure `/travel-planner` is at the end of connection string

### General Issues:
- **Port 3000 in use**: Change PORT in .env to 3001
- **Permission errors**: Run terminal as Administrator

### Quick Verification Commands:
```bash
node --version    # Should show v18+ 
npm --version     # Should show v9+
git --version     # Should show v2+
```

## 📞 Need Help?

If you encounter any issues:
1. Check the error messages carefully
2. Restart your terminal
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas dashboard for connection issues

---

**Once everything is set up, you'll have a professional backend ready for deployment! 🚀** 