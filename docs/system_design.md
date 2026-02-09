# System Design

## Architecture Overview
**Three-Tier Architecture**: Frontend → Backend → Database

```
┌─────────────────┐
│   React Client  │ (Port 3000)
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │ (Port 5000)
└────────┬────────┘
         │ Mongoose
         │
┌────────▼────────┐
│    MongoDB      │ (Port 27017)
└─────────────────┘
```

## Database Schema

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: Enum ['student', 'professor', 'dept_admin', 'inst_admin', 'super_admin'],
  institution: ObjectId (ref: Institution),
  department: ObjectId (ref: Department),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Institutions Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String (unique),
  address: String,
  createdAt: Date
}
```

### 3. Departments Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String,
  institution: ObjectId (ref: Institution),
  createdAt: Date
}
```

### 4. Courses Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String (unique),
  department: ObjectId (ref: Department),
  semester: Number,
  createdAt: Date
}
```

### 5. Lectures Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  fileUrl: String (required),
  fileType: Enum ['pdf', 'video', 'document'],
  course: ObjectId (ref: Course),
  uploadedBy: ObjectId (ref: User),
  semester: Number,
  createdAt: Date
}
```

### 6. Quizzes Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  course: ObjectId (ref: Course),
  questions: [{
    question: String,
    type: Enum ['mcq', 'descriptive'],
    options: [String], // for MCQ only
    correctAnswer: String, // for MCQ only
    points: Number
  }],
  timeLimit: Number (minutes),
  deadline: Date,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### 7. QuizResults Collection
```javascript
{
  _id: ObjectId,
  quiz: ObjectId (ref: Quiz),
  student: ObjectId (ref: User),
  answers: [{
    questionId: ObjectId,
    answer: String,
    isCorrect: Boolean, // auto for MCQ
    pointsEarned: Number
  }],
  totalScore: Number,
  maxScore: Number,
  submittedAt: Date
}
```

## API Structure

### Authentication Routes
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
POST   /api/auth/logout
```

### Lecture Routes
```
GET    /api/lectures              (with filters)
GET    /api/lectures/:id
POST   /api/lectures              (professor only)
PUT    /api/lectures/:id          (professor only)
DELETE /api/lectures/:id          (professor only)
```

### Quiz Routes
```
GET    /api/quizzes               (list all)
GET    /api/quizzes/:id           (get details)
POST   /api/quizzes               (create - professor)
POST   /api/quizzes/:id/submit    (submit answers)
GET    /api/quizzes/:id/results   (view results)
```

### User Management Routes
```
GET    /api/users                 (admin only)
GET    /api/users/:id
POST   /api/users                 (admin only)
PUT    /api/users/:id             (admin only)
DELETE /api/users/:id             (admin only)
```

### Admin Routes
```
GET    /api/admin/departments
POST   /api/admin/departments
GET    /api/admin/courses
POST   /api/admin/courses
GET    /api/admin/reports
```

## Middleware Stack

1. **CORS Middleware** - Cross-origin requests
2. **Body Parser** - JSON request parsing
3. **Auth Middleware** - JWT verification
4. **Role Middleware** - Role-based access control
5. **Validation Middleware** - Input validation
6. **Error Handler** - Centralized error handling

## Security Implementation

### JWT Authentication Flow
```
1. User sends email + password
2. Server validates credentials
3. Server generates JWT token (expires in 24h)
4. Client stores token in localStorage
5. Client sends token in Authorization header
6. Server validates token on protected routes
```

### Password Security
```
1. User registration: bcrypt.hash(password, 10)
2. User login: bcrypt.compare(inputPassword, hashedPassword)
```

### Role-Based Access Control
```javascript
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

## File Upload Strategy

**Lectures/Documents:**
- Store files in cloud storage (AWS S3 / Cloudinary)
- Store file URL in MongoDB
- Set file size limits (max 100MB)
- Validate file types (pdf, mp4, docx)

## Folder Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lecture.js
│   │   ├── Quiz.js
│   │   └── QuizResult.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── lectures.js
│   │   ├── quizzes.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── lectureController.js
│   │   └── quizController.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Lectures/
    │   │   ├── Quizzes/
    │   │   └── Admin/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Lectures.js
    │   │   └── Quizzes.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env
```

## Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lecture_system
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```
