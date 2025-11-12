# Streaming App

A Netflix-style streaming platform built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/OmriHalpert/streaming-app.git
cd streaming-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/streaming-app
SESSION_SECRET=your_session_secret_key
BCRYPT_SALT_ROUNDS=10
OMDB_API_KEY=your_omdb_api_key
NODE_ENV=development
LOG_LEVEL=info
ITEMS_PER_PAGE=30
FEED_ITEMS_PER_GENRE=10
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the application:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
streaming-app/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── upload.js            # File upload configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── feedController.js    # Content management controllers
│   ├── profilesController.js # Profile CRUD controllers
│   └── userController.js    # User CRUD controllers
├── middleware/
│   ├── auth.js              # Authentication & authorization middleware
│   └── loggerMiddleware.js  # Logging middleware
├── models/
│   ├── Content.js           # Content Mongoose schema
│   ├── contentModel.js      # Content database operations
│   ├── User.js              # User Mongoose schema
│   ├── usersModel.js        # User database operations
│   ├── ProfileInteraction.js # Profile interactions schema
│   └── profileInteractionModel.js # Interactions database operations
├── public/
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client-side JavaScript
│   └── resources/           # Images, videos, thumbnails
├── routes/
│   ├── authRouter.js        # Authentication routes
│   ├── contentRouter.js     # Content API routes
│   ├── pagesRouter.js       # Page rendering routes
│   ├── profilesRouter.js    # Profile management routes
│   ├── progressRouter.js    # Watch progress routes
│   └── usersRouter.js       # User management routes
├── services/
│   ├── contentService.js    # Content business logic
│   ├── userService.js       # User business logic
│   ├── profileInteractionService.js # Interactions logic
│   └── recommendationService.js # Recommendation algorithm
├── views/                   # EJS templates
├── server.js                # Application entry point
└── package.json             # Dependencies and scripts
```

## Main Features

### Authentication & Authorization
- User registration and login with Express session authentication
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Session management with HTTP-only cookies

### User Management
- Create user accounts
- View user details
- Update user information (admin only)
- Delete user accounts (admin only)
- Multiple profiles per user (up to 5)

### Profile Management
- Create, read, update, and delete profiles
- Custom profile names and avatars
- Profile-specific watch history and preferences

### Content Management (Movies & TV Shows)
- Browse content by genre
- Search functionality
- Content details page with cast information
- Add new content (admin only)
- Update existing content (admin only)
- Delete content (admin only)
- OMDB integration for ratings

### Viewing Experience
- Video player for movies and TV episodes
- Episode tracking for TV shows
- Continue watching from last position
- Mark content as watched/completed

### Personalization
- Like/unlike content
- Personalized recommendations based on:
  - Liked content
  - Watch history
  - Genre preferences
- Profile-specific interactions

### Progress Tracking
- Save watch progress for movies and episodes
- Resume playback from last position
- Track completed content
- Clear watch history

### Responsive Design
- Mobile-friendly interface
- Optimized for various screen sizes
- Touch-friendly controls

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /logout` - User logout

### Content
- `GET /api/content/` - Get all content
- `GET /api/content/search` - Search content
- `GET /api/content/:genreName` - Get content by genre
- `POST /api/content/add` - Add new content (admin)
- `PUT /api/content/:contentId` - Update content (admin)
- `DELETE /api/content/:contentId` - Delete content (admin)
- `POST /api/content/like` - Like/unlike content
- `GET /api/content/recommendations/:userId/:profileId` - Get personalized recommendations
- `GET /api/content/rating` - Get OMDB rating for content

### Users
- `GET /api/users/:id` - Get user details
- `GET /api/users/:id/profiles` - Get user profiles
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Profiles
- `POST /api/profiles/add` - Add new profile
- `PUT /api/profiles/update` - Update profile
- `DELETE /api/profiles/delete` - Delete profile

### Progress
- `POST /api/progress/save` - Save watch progress (also marks as watched when isCompleted=true)
- `GET /api/progress/interactions` - Get profile interactions
- `DELETE /api/progress/clear` - Clear watch progress