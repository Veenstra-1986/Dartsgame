# 🎯 Marimecs Darts Challenge App

A comprehensive darts scoring and challenge application with head-to-head matches, leaderboards, and real-time features.

![Marimecs Darts](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?style=for-the-badge&logo=prisma)

## 🎯 Features

### 🏆 Player Management
- Add, edit, and delete player profiles
- Player avatars and statistics
- Personal best scores tracking

### 📅 Daily Challenges
- Submit daily challenge scores
- Track progress over time
- Compete with other players

### 📊 Leaderboards
- Today's rankings
- Weekly leaderboards
- All-time overall standings

### 🎮 Training Games
- Multiple training games with instructions:
  - Around the Clock
  - Cricket
  - Killer
  - Baseball
  - Shanghai
  - and more...

### 🎯 Score Tracker
- 101, 301, 501 game modes
- Automatic score calculation
- Bust detection
- Checkout suggestions
- Double-out validation

### 👥 Head-to-Head Matches
- Create matches with other players
- Turn-based scoring (3 darts per turn)
- Live scorecard
- Real-time score updates
- Multiple game types (301, 501, 701, Cricket)

### ✅ Score Verification
- Double confirmation system to prevent fraud
- Dispute mechanism
- Match status management (IN_PROGRESS, COMPLETED, DISPUTED, CANCELLED)

### 💬 Match Chat
- In-match messaging between players
- Message history
- Typing indicators
- Real-time updates (with WebSocket service)

### 🔐 User Authentication
- Secure registration and login
- Password hashing with bcrypt
- Session management with NextAuth.js
- Protected routes

### 📱 Mobile Responsive
- Works on all device sizes
- Touch-friendly interface
- Optimized for mobile gameplay

## ✨ Technology Stack

### 🎯 Core Framework
- **⚡ Next.js 16** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Fetch** - Promise-based HTTP request

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution
- **🐘 PostgreSQL (Supabase)** - Production-ready database hosting

### 🌐 Real-time Features
- **🔌 Socket.IO** - Real-time bidirectional communication
- **💬 In-match chat** - Live messaging during matches
- **📊 Live score updates** - Real-time scorecard updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- A Supabase account (for database)
- A Vercel account (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/marimecs-darts.git
cd marimecs-darts

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Set up the database
# 1. Create a project in Supabase
# 2. Run the setup-database.sql script in Supabase SQL Editor
# 3. Update DATABASE_URL in .env

# Generate Prisma client
bun run db:generate

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 🌐 Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel Settings → Environment Variables, add:
   - `DATABASE_URL` - Your Supabase connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel domain

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

For detailed deployment instructions, see [GITHUB_DEPLOY_GUIDE.md](./GITHUB_DEPLOY_GUIDE.md)

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── matches/         # Match management APIs
│   │   ├── scores/          # Score tracking APIs
│   │   ├── players/         # Player management APIs
│   │   └── challenges/      # Daily challenge APIs
│   ├── dashboard/           # Main dashboard page
│   ├── matches/             # Match pages
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # Reusable React components
│   └── ui/                 # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Utility functions
├── config/                  # Configuration files
└── types/                   # TypeScript type definitions

mini-services/
├── match-service/           # WebSocket service for matches
└── darts-ws/               # General WebSocket service

prisma/
├── schema.prisma           # Database schema
└── schema.postgres.prisma  # PostgreSQL-specific schema

public/                      # Static assets
└── marimecs-logo.png       # App logo
```

## 🎨 Available Pages & Features

### Main Pages
- **Home** - Landing page with app overview
- **Dashboard** - Main hub with challenges, leaderboards, and matches
- **Login/Register** - User authentication
- **Match Detail** - Live match with scoring and chat

### Training Games
- Around the Clock
- Cricket
- Killer
- Baseball
- Shanghai
- 180 Practice
- Checkout Practice

### Dashboard Sections
- Daily Challenges - Submit and track daily scores
- Leaderboards - Today, weekly, and overall rankings
- Active Matches - View and join matches
- Create Match - Start a new match with another player
- Player List - View all registered players

## 🔐 Authentication

The app uses NextAuth.js for secure authentication:
- Email/password registration
- Password hashing with bcrypt
- JWT session strategy
- Protected routes for authenticated users

## 🗄️ Database Schema

The app uses Prisma ORM with PostgreSQL (Supabase):
- **User** - User accounts and authentication
- **Account** - OAuth account linking
- **Session** - User sessions
- **Player** - Player profiles and statistics
- **Challenge** - Daily challenges
- **Score** - Player scores
- **Match** - Head-to-head matches
- **MatchTurn** - Individual turns in matches
- **MatchMessage** - Match chat messages
- **ScoreConfirmation** - Match score confirmations
- **SiteSettings** - App settings and logo

See `prisma/schema.prisma` for complete schema definition.

## 🧪 Testing

```bash
# Run linting
bun run lint

# Test database connection
# Visit: http://localhost:3000/api/health
```

## 📝 Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Create and apply migrations
bun run db:reset     # Reset database
```

## 🔒 Security

- Environment variables for sensitive data (use `.env.example` as template)
- Password hashing with bcrypt
- NextAuth.js for secure authentication
- SQL injection prevention with Prisma ORM
- XSS protection with React's built-in escaping

## 🌟 Future Enhancements

- [ ] Push notifications for match invitations
- [ ] Advanced statistics and analytics
- [ ] Tournament mode
- [ ] Video tutorials for training games
- [ ] Social features (friends, following)
- [ ] More game modes

## 📄 License

This project is private and proprietary to Marimecs.

## 🤝 Contributing

This is an internal project. Please contact the project maintainers before making changes.

## 📞 Support

For issues or questions, please contact the development team.

---

Built with ❤️ for darts enthusiasts. Powered by [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io), and [Supabase](https://supabase.com). 🎯
