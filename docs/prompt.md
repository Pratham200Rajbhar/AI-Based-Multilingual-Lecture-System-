# Implementation Guide

## Phase 1: Setup & Backend Foundation (Week 1)

### Step 1: Initialize Backend
```bash
mkdir lecture-system && cd lecture-system
mkdir backend && cd backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs dotenv cors express-validator multer
npm install --save-dev nodemon
```

**Create server.js:**
- Set up Express app
- Connect to MongoDB
- Add middleware (CORS, JSON parser)
- Create basic health check route
- Start server on port 5000

### Step 2: Database Models
Create models in order:
1. **User.js** - email, password, name, role, institution, department
2. **Institution.js** - name, code, address
3. **Department.js** - name, code, institution reference
4. **Course.js** - name, code, department reference, semester
5. **Lecture.js** - title, description, fileUrl, course reference
6. **Quiz.js** - title, course, questions array, deadline
7. **QuizResult.js** - quiz, student, answers array, totalScore

### Step 3: Authentication System
**Create:**
- `middleware/auth.js` - JWT verification middleware
- `middleware/roleCheck.js` - Role-based access control
- `controllers/authController.js` - register, login, getProfile
- `routes/auth.js` - POST /register, POST /login, GET /profile

**Implement:**
- Hash passwords with bcrypt (10 rounds)
- Generate JWT tokens (24h expiry)
- Protect routes with auth middleware

---

## Phase 2: Core Features (Week 2)

### Step 4: Lecture Management
**Backend:**
- `controllers/lectureController.js`
- Routes: GET, POST, PUT, DELETE /api/lectures
- Add file upload with multer
- Implement filtering by course/semester

**Frontend Setup:**
```bash
cd .. && npx create-react-app frontend
cd frontend
npm install axios react-router-dom
```

**Create Components:**
- `LectureList.js` - Display all lectures
- `LectureUpload.js` - Upload form (professor only)
- `LectureDetail.js` - View/download lecture

### Step 5: Quiz System
**Backend:**
- `controllers/quizController.js`
- Routes: POST /create, POST /:id/submit, GET /:id/results
- Auto-evaluate MCQ answers
- Store quiz results

**Frontend:**
- `QuizList.js` - Display available quizzes
- `QuizCreate.js` - Create quiz form (professor)
- `QuizAttempt.js` - Take quiz (timer, submit)
- `QuizResults.js` - View score and answers

---

## Phase 3: Admin & UI Polish (Week 3)

### Step 6: Admin Panel
**Backend:**
- User management routes (CRUD)
- Department/Course management
- Progress reports endpoint

**Frontend:**
- `AdminDashboard.js` - Overview statistics
- `UserManagement.js` - Add/edit/delete users
- `CourseManagement.js` - Manage courses

### Step 7: Dashboard & Navigation
**Create:**
- `Dashboard.js` - Role-based landing page
- `Navbar.js` - Navigation with logout
- `PrivateRoute.js` - Protected route component
- Role-based rendering (student vs professor vs admin views)

### Step 8: Progress Tracking
**Implement:**
- Student: Personal quiz history
- Professor: Class performance analytics
- Charts using Chart.js or Recharts (optional)

---

## Phase 4: Testing & Deployment (Week 4)

### Step 9: Security Hardening
- Add helmet for HTTP headers
- Implement rate limiting
- Input validation on all routes
- Sanitize MongoDB queries
- HTTPS in production

### Step 10: Testing
**Manual Testing:**
- Test all user roles and permissions
- Test file upload/download
- Test quiz submission and evaluation
- Test authentication flow

### Step 11: Deployment
**Backend (Render/Railway):**
1. Push to GitHub
2. Connect repo to hosting service
3. Set environment variables
4. Deploy backend

**Frontend (Vercel/Netlify):**
1. Build: `npm run build`
2. Deploy build folder
3. Set REACT_APP_API_URL to production backend

**Database:**
- Use MongoDB Atlas (free tier)
- Whitelist deployment IP addresses

---

## Quick Start Commands

**Start Development:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## AI Coding Prompts

### Prompt 1: Backend Setup
```
Create an Express.js server with:
- MongoDB connection using Mongoose
- CORS enabled
- JSON body parser
- Error handling middleware
- Health check route at /api/health
Include .env configuration for PORT and MONGODB_URI
```

### Prompt 2: User Model & Auth
```
Create a Mongoose User model with:
- email (unique, required, lowercase)
- password (hashed with bcrypt)
- name, role (enum: student/professor/dept_admin/inst_admin/super_admin)
- institution and department references
- timestamps

Then create JWT-based authentication with:
- Register route (hash password, create user, return token)
- Login route (validate credentials, return token)
- Auth middleware to verify JWT and attach user to req
```

### Prompt 3: Lecture CRUD
```
Create lecture management system with:
- Mongoose Lecture model (title, description, fileUrl, course ref)
- Controller with: getAllLectures (filter by course), getLectureById, createLecture (professor only), updateLecture, deleteLecture
- Express routes with auth and role middleware
- File upload using multer (store file path in database)
```

### Prompt 4: Quiz System
```
Create quiz system with:
- Quiz model (title, questions array with type/options/correctAnswer, deadline)
- QuizResult model (quiz ref, student ref, answers array, totalScore)
- Routes: createQuiz (professor), getAllQuizzes, getQuizById, submitQuiz (auto-calculate score for MCQs)
- Add timer validation (reject if submitted after deadline)
```

### Prompt 5: React Dashboard
```
Create React dashboard with:
- AuthContext for user state management
- Axios instance with JWT interceptor
- PrivateRoute component for protected routes
- Role-based navigation (different menu for student/professor/admin)
- Login/Logout functionality
- Dashboard page showing user-specific data
```

### Prompt 6: Lecture Frontend
```
Create React lecture management with:
- LectureList component (fetch and display lectures in cards)
- LectureUpload component (form with title, description, file upload, course selection) - professor only
- File download functionality
- Filter by course and semester
- Responsive design with loading states
```

### Prompt 7: Quiz Interface
```
Create React quiz interface with:
- QuizCreate form (add questions dynamically, set MCQ options, timer)
- QuizAttempt component (countdown timer, question navigation, submit button)
- QuizResults component (display score, correct/wrong answers)
- Prevent re-submission after deadline
```

### Prompt 8: Admin Panel
```
Create admin panel with:
- User management table (view all users, add/edit/delete)
- Course management (create courses, assign to departments)
- Department management
- Statistics dashboard (total users, lectures, quizzes)
- Role-based access (only admins can access)
```

---

## Troubleshooting

**MongoDB Connection Issues:**
- Check MONGODB_URI format
- Ensure MongoDB service is running
- Whitelist IP in Atlas

**CORS Errors:**
- Add frontend URL to CORS origin
- Check credentials: true in axios

**JWT Issues:**
- Verify JWT_SECRET is consistent
- Check token expiry time
- Ensure token is sent in Authorization header

**File Upload Fails:**
- Check multer configuration
- Verify file size limits
- Ensure upload directory exists
