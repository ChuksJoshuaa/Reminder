# Call Me Reminder

A premium full-stack reminder application that automatically calls you at scheduled times and speaks your reminder message using Vapi voice AI.

## ✨ Features

- 📞 **Automated Voice Calls** - Receive phone calls at scheduled times with your custom message
- 🎨 **Premium UI/UX** - Professional, responsive design with shadcn/ui components
- 🌓 **Dark/Light Mode** - Full theme support with system detection
- 🔍 **Search & Filter** - Powerful filtering by status and search functionality
- ⏰ **Real-time Countdown** - Live countdown timers for upcoming reminders
- ✏️ **Full CRUD** - Create, read, update, and delete reminders
- 🌍 **Timezone Support** - Handle reminders across different timezones
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🧪 **E2E Tested** - Comprehensive Cypress test coverage
- 🐳 **Docker Ready** - One-command deployment with Docker Compose

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality accessible components
- **TanStack Query** (React Query) - Powerful data fetching
- **React Hook Form** - Performant form validation
- **Zod** - Runtime type validation
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **Cypress** - E2E testing

### Backend
- **FastAPI** (Python) - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Embedded database
- **APScheduler** - Background task scheduling
- **Vapi** - AI voice call integration
- **Pydantic** - Data validation

## 📁 Project Structure

```
reminder/
├── client/                    # Next.js Frontend
│   ├── app/                  # App Router pages & layouts
│   │   ├── page.tsx         # Main dashboard
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css      # Global styles
│   │   └── providers.tsx    # React Query & Theme providers
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── reminder-form.tsx
│   │   ├── reminder-card.tsx
│   │   ├── empty-state.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── use-reminders.ts
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   ├── utils.ts        # Helper functions
│   │   ├── validation.ts   # Zod schemas
│   │   └── date-utils.ts   # Date formatting
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── cypress/            # E2E tests
│   │   ├── e2e/
│   │   └── support/
│   └── Dockerfile
│
├── server/                   # FastAPI Backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   │   └── reminder.py
│   │   ├── schemas/        # Pydantic schemas
│   │   │   └── reminder.py
│   │   ├── routers/        # API routes
│   │   │   └── reminders.py
│   │   ├── services/       # Business logic
│   │   │   ├── vapi_service.py
│   │   │   └── scheduler_service.py
│   │   ├── database.py     # Database config
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── scripts/                 # Utility scripts
│   ├── start.sh           # Start with Docker
│   └── stop.sh            # Stop containers
│
├── docker-compose.yml      # Docker orchestration
├── .env.example           # Environment template
└── README.md
```

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Vapi Account](https://vapi.ai) with API key

### Setup

1. **Clone and navigate to project**
```bash
cd reminder
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Vapi credentials:
```env
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here
```

3. **Start the application**
```bash
./scripts/start.sh
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Stop the application
```bash
./scripts/stop.sh
```

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Vapi Account** with API key

### Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Vapi credentials

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at http://localhost:8000

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will run at http://localhost:3000

## 🔑 Getting Vapi Credentials

1. **Sign up** at [vapi.ai](https://vapi.ai)
2. **Get API Key**:
   - Go to your Vapi dashboard
   - Navigate to API Keys section
   - Copy your API key
3. **Get Phone Number ID**:
   - In Vapi dashboard, go to Phone Numbers
   - Purchase or configure a phone number (uses Twilio)
   - Copy the Phone Number ID
4. **Add to `.env`**:
```env
VAPI_API_KEY=sk_live_xxxxx
VAPI_PHONE_NUMBER_ID=pn_xxxxx
```

## 📋 Environment Variables

### Root `.env` (for Docker)
```env
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
```

### Backend `server/.env` (for manual setup)
```env
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
```

### Frontend `client/.env.local` (for manual setup)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔄 How Scheduling Works

The backend uses **APScheduler** with a background scheduler:

1. **Background Worker**: Runs continuously while the FastAPI server is active
2. **Check Interval**: Every 30 seconds, the scheduler checks for due reminders
3. **Query Database**: Finds reminders with status "scheduled" and `scheduled_for` <= current time
4. **Trigger Call**: For each due reminder:
   - Makes Vapi API call to initiate phone call
   - Vapi handles the call with your custom message
   - Updates reminder status to "completed" or "failed"
5. **Status Update**: Database is updated with the call result

## 🧪 Testing the Call Workflow

### Quick 2-Minute Test

1. **Start the application** (Docker or manual)
2. **Open** http://localhost:3000
3. **Click** "New Reminder"
4. **Fill the form**:
   - **Title**: "Test Call"
   - **Message**: "This is a test reminder. It's working!"
   - **Phone Number**: Your phone in E.164 format (e.g., `+18263349907`)
   - **Date & Time**: 2 minutes from now
   - **Timezone**: Your timezone
5. **Click** "Create Reminder"
6. **Watch** the dashboard - countdown timer appears
7. **Wait** ~2 minutes
8. **Answer** your phone when it rings
9. **Verify** reminder status changes to "Completed"

### Phone Number Format
Always use **E.164 format**:
- ✅ `+18263349907` (US)
- ✅ `+442071234567` (UK)
- ✅ `+33123456789` (France)
- ❌ `4155552671` (Missing +)
- ❌ `(415) 555-2671` (Wrong format)

## 🧪 Running E2E Tests

### Install Dependencies
```bash
cd client
npm install
```

### Run Tests (Interactive)
```bash
npm run e2e
```

### Run Tests (Headless)
```bash
npm run e2e:headless
```

### Test Coverage
The E2E tests cover:
- ✅ Homepage rendering
- ✅ Create reminder dialog
- ✅ Form validation
- ✅ Creating reminders
- ✅ Displaying reminders
- ✅ Filtering by status
- ✅ Search functionality
- ✅ Deleting reminders
- ✅ Empty states
- ✅ Loading states

## 🌓 Dark Mode

The application includes full dark/light mode support:

- **Theme Toggle**: Click the sun/moon icon in the header
- **Options**:
  - 🌞 Light - Light theme
  - 🌙 Dark - Dark theme
  - 💻 System - Follow system preference
- **Persistence**: Theme choice is saved to localStorage
- **Smooth Transitions**: All colors transition smoothly

## 📡 API Endpoints

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reminders` | List all reminders |
| `GET` | `/reminders/{id}` | Get reminder by ID |
| `POST` | `/reminders` | Create new reminder |
| `PUT` | `/reminders/{id}` | Update reminder |
| `DELETE` | `/reminders/{id}` | Delete reminder |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |

### Example Request

**Create Reminder**
```bash
curl -X POST http://localhost:8000/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Standup",
    "message": "Time for the daily standup meeting",
    "phoneNumber": "+18263349907",
    "scheduledFor": "2024-01-15T09:00:00Z",
    "timezone": "America/New_York"
  }'
```

**Response**
```json
{
  "id": "abc123",
  "title": "Morning Standup",
  "message": "Time for the daily standup meeting",
  "phoneNumber": "+18263349907",
  "scheduledFor": "2024-01-15T09:00:00Z",
  "timezone": "America/New_York",
  "status": "scheduled",
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T10:30:00Z"
}
```

## 🎨 UI/UX Features

### Design System
- **Consistent Spacing**: 4px base unit
- **Typography Scale**: Responsive font sizes
- **Color Palette**: Semantic color system
- **Component Variants**: Multiple button/badge variants
- **Shadows**: Layered shadow system

### Micro-interactions
- ✨ Smooth hover transitions
- ✨ Focus states for accessibility
- ✨ Toast notifications
- ✨ Loading skeletons
- ✨ Fade-in animations
- ✨ Dropdown animations

### Accessibility
- ♿ Keyboard navigation
- ♿ ARIA labels
- ♿ Focus indicators
- ♿ Screen reader support
- ♿ Semantic HTML

## 🐛 Troubleshooting

### Docker Issues

**Containers won't start**
```bash
# Clean rebuild
docker-compose down -v
docker-compose up --build
```

**Port conflicts**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Backend Issues

**Module not found**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Database locked**
```bash
# Stop all processes, delete database, restart
rm server/reminders.db
uvicorn app.main:app --reload
```

### Frontend Issues

**Dependencies error**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Build fails**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Vapi Issues

**Calls not triggering**
- ✅ Verify API key in `.env`
- ✅ Check Phone Number ID is correct
- ✅ Ensure backend is running
- ✅ Check backend logs for errors
- ✅ Verify Vapi dashboard for call logs
- ✅ Ensure scheduled time is in the future

**Call fails immediately**
- ✅ Check Vapi account credits
- ✅ Verify phone number has calling enabled
- ✅ Check phone number format (must be E.164)

## 🚧 Production Deployment

### Considerations

1. **Database**:
   - Migrate from SQLite to PostgreSQL or MySQL
   - Use a managed database service

2. **Environment Variables**:
   - Use secure secret management
   - Never commit `.env` files

3. **Scheduler**:
   - Consider dedicated worker (Celery, Redis Queue)
   - Use cloud cron jobs or scheduled tasks

4. **Security**:
   - Add authentication (JWT, OAuth)
   - Implement rate limiting
   - Use HTTPS only
   - Restrict CORS to your domain

5. **Monitoring**:
   - Add error tracking (Sentry)
   - Set up logging
   - Monitor API usage

6. **Scaling**:
   - Use container orchestration (Kubernetes)
   - Implement caching (Redis)
   - Add load balancing

## 📝 Scripts Reference

### Docker
```bash
./scripts/start.sh    # Start all services
./scripts/stop.sh     # Stop all services
```

### Frontend (client/)
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run cypress      # Open Cypress UI
npm run e2e          # Run E2E tests
```

### Backend (server/)
```bash
uvicorn app.main:app --reload              # Development
uvicorn app.main:app --host 0.0.0.0        # Production
python -m pytest                            # Run tests (if added)
```

## 🤝 Contributing

This is a take-home project. For production use:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component system
- **Vapi** - Voice AI platform
- **Vercel** - Next.js framework
- **FastAPI** - Modern Python framework

---

**Built with ❤️ for the take-home challenge**

For questions or issues, please open a GitHub issue.
