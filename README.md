# DevDrawer

<div align="center">
  <h3>Plan. Draw. Build.</h3>
  <p>Interactive whiteboard and planner for developers</p>
</div>

---

## 📋 Overview

**DevDrawer** is a full-stack web application that provides developers with an interactive whiteboard tool for planning, sketching, and organizing software projects. Built with modern web technologies, it offers a seamless experience for creating visual diagrams, flowcharts, and project plans.

### Key Features

- 🎨 **Interactive Whiteboard** - Draw, write, add shapes, images, and more using tldraw
- 👤 **User Authentication** - Secure email/password authentication with email verification
- 📝 **Planner Management** - Create, rename, duplicate, and delete planners
- 💾 **Auto-save** - Changes are automatically saved to the database
- 🌓 **Dark/Light Mode** - Beautiful theme switching with smooth transitions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Password Security** - Strong password requirements (10+ chars, uppercase, lowercase, numbers, special chars)
- ✉️ **Email Notifications** - Email verification and password reset functionality

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Next.js 16** (App Router) - React framework with SSR/SSG
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **tldraw** - Interactive whiteboard library
- **Zustand** - Lightweight state management
- **Geist Font** - Modern typography

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7** - Modern ORM for database access
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **Resend** - Email delivery service

### Infrastructure
- **Vercel** - Hosting and deployment
- **Neon** - Serverless PostgreSQL database
- **Docker** - Local database containerization

## 📁 Project Structure

```
devdrawer/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── config.ts              # Prisma configuration
├── public/
│   └── assets/               # Static assets (images)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── dashboard/
│   │   │   └── profile/
│   │   ├── planner/[id]/      # Planner whiteboard page
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── planner/
│   │   │   └── profile/
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── GlobalLoader.tsx
│   │   ├── Whiteboard.tsx
│   │   ├── CreatePlannerPopover.tsx
│   │   └── PlannerCardMenu.tsx
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── email.ts           # Email sending functions
│   │   └── password-validation.ts
│   ├── store/                 # Zustand stores
│   │   └── app.ts             # Global app state
│   └── generated/             # Generated Prisma client
└── docker-compose.yml         # Docker configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **Docker Desktop** (for local database)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devdrawer.git
   cd devdrawer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://devdrawer:devdrawer123@localhost:5432/devdrawer?schema=public"
   RESEND_API_KEY="your_resend_api_key"
   FROM_EMAIL="onboarding@resend.dev"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Start the database**
   ```bash
   npm run db:up
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Script | Description |
|-------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:up` | Start PostgreSQL (Docker) |
| `npm run db:down` | Stop PostgreSQL (Docker) |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:deploy` | Run Prisma migrations (production) |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:generate` | Generate Prisma Client |

## 🔐 Authentication Flow

1. **Registration**
   - User creates account with username, email, and password
   - Password must meet requirements (10+ chars, uppercase, lowercase, number, special char)
   - Verification email is sent automatically
   - User can login immediately but should verify email

2. **Login**
   - User can login with email or username
   - Sessions are stored in database with HTTP-only cookies
   - Sessions expire after 30 days

3. **Email Verification**
   - Click link in verification email
   - Email status updated in database

4. **Password Reset**
   - Click "Forgot password" on login page
   - Enter email address
   - Receive reset link via email
   - Set new password (must meet requirements)

## 🎨 Features in Detail

### Whiteboard (tldraw)
- Drawing tools (pen, highlighter)
- Shapes (rectangles, circles, arrows, etc.)
- Text editing with formatting
- Images support
- Zoom and pan
- Multi-select and group operations
- Undo/redo
- Auto-save every few seconds

### Planner Management
- Create new planners with title and description
- Rename planners inline (click on title)
- Duplicate planners (creates copy with "(copy)" suffix)
- Delete planners with confirmation
- Sort by name or creation date
- Responsive grid layout

### User Profile
- View account information
- Update username
- Change email (requires re-verification)
- Change password (requires current password)
- Email verification status

## 🗄️ Database Schema

### User
- `id` - Unique identifier
- `username` - Unique username
- `email` - Unique email address
- `passwordHash` - Hashed password
- `emailVerified` - Verification status
- `verificationToken` - Email verification token
- `resetToken` - Password reset token
- `createdAt` / `updatedAt` - Timestamps

### Session
- `id` - Unique identifier
- `token` - Session token
- `userId` - Foreign key to User
- `expiresAt` - Expiration timestamp

### Planner
- `id` - Unique identifier
- `title` - Planner title
- `description` - Optional description
- `content` - JSON whiteboard data (tldraw format)
- `userId` - Foreign key to User
- `createdAt` / `updatedAt` - Timestamps

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from GitHub
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL=postgresql://...?sslmode=require
   RESEND_API_KEY=re_xxxxx
   FROM_EMAIL=onboarding@resend.dev
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy Database Migrations**
   
   Run migrations on production database:
   ```bash
   DATABASE_URL="your_production_db_url" npm run db:migrate:deploy
   ```

5. **Deploy**
   - Vercel will automatically deploy on push to main
   - Or trigger manual deploy from dashboard

### Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables
5. Run migrations (see step 4 above)

## 🔒 Security Features

- **Password Hashing** - bcrypt with 12 rounds
- **Session Management** - HTTP-only cookies, secure tokens
- **Email Verification** - Prevents fake accounts
- **Password Requirements** - Strong password policy enforced
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **XSS Protection** - React's built-in escaping
- **CSRF Protection** - Next.js built-in protection

## 🎯 Password Requirements

Passwords must meet all of the following:
- Minimum 10 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

## 📧 Email Configuration

### Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. For testing: Use `onboarding@resend.dev` (no verification needed)
4. For production: Verify your domain in Resend dashboard

### Email Templates

- **Verification Email** - Sent on registration
- **Password Reset Email** - Sent when user requests reset

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure Docker is running: `npm run db:up`
- Check DATABASE_URL in `.env`
- Verify database is accessible: `npm run db:studio`

### Migration Errors
- Ensure database is running
- Check Prisma schema matches migrations
- Try: `npm run db:generate` then `npm run db:migrate`

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Regenerate Prisma Client: `npm run db:generate`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Created by [fvdev](https://f-vdev.vercel.app/) for developers.

## 🙏 Acknowledgments

- [tldraw](https://tldraw.com/) - Amazing whiteboard library
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Vercel](https://vercel.com/) - Hosting platform
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

<div align="center">
  <p>Made with ❤️ for developers</p>
  <p>Plan. Draw. Build.</p>
</div>
