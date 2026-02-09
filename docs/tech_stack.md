# Technology Stack

## Frontend
```
Framework: React.js 18+
Language: JavaScript (ES6+)
Styling: CSS3 / Tailwind CSS (recommended)
HTTP Client: Axios
State Management: React Context API / Redux (optional)
Routing: React Router v6
```

## Backend
```
Runtime: Node.js 18+
Framework: Express.js 4.x
Authentication: JSON Web Tokens (JWT)
Password Hashing: bcrypt
Validation: express-validator
File Upload: multer
CORS: cors middleware
```

## Database
```
Database: MongoDB 6+
ODM: Mongoose
Cloud Option: MongoDB Atlas
```

## Development Tools
```
Package Manager: npm / yarn
Version Control: Git
API Testing: Postman / Thunder Client
Code Editor: VS Code
```

## Deployment (Production)
```
Frontend: Vercel / Netlify
Backend: Render / Railway / Heroku
Database: MongoDB Atlas
File Storage: AWS S3 / Cloudinary (for lectures)
```

## Environment Setup
```
Node.js: v18 or higher
MongoDB: v6 or higher
npm: v9 or higher
```

## Key NPM Packages

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "express-validator": "^7.0.0"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.11.0",
  "axios": "^1.4.0"
}
```

## Security Libraries
- helmet (HTTP headers security)
- express-rate-limit (API rate limiting)
- express-mongo-sanitize (NoSQL injection prevention)
