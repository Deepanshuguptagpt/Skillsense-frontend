# Eligify Frontend

AI-powered Employability Platform for Indian Students - Complete UI Implementation

## 🎉 What's Built

The complete frontend is now ready with all features:

✅ **Authentication**
- Sign up / Sign in pages with validation
- JWT token management with auto-refresh
- Protected routes

✅ **Dashboard**
- Stats overview (skills, internships)
- Quick actions
- Recent activity

✅ **Profile Management**
- Personal information display
- Education & experience sections
- Resume upload with drag-and-drop
- AI skill extraction (mocked)

✅ **Skill Management**
- Skill graph visualization
- Filter by status and category
- Add skills manually
- Proficiency tracking

✅ **Internship Discovery**
- Three-tab classification (Eligible, Almost Eligible, Not Eligible)
- Match score visualization
- Skill gap analysis
- Search and filters
- Detailed internship modal
- Generate project from missing skills

✅ **Project Generation**
- AI-powered project generation modal
- Project listing with status tabs
- Detailed project roadmap view
- Milestones with tasks
- Tech stack and resources
- Project status management
- Complete project flow

✅ **UI/UX Features**
- Fully responsive (mobile-first, 375px+)
- Toast notifications
- Loading skeletons
- Error boundaries
- Modal dialogs
- Color-coded badges
- Progress indicators

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router pages
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
│   ├── api.ts             # Axios instance with interceptors
│   ├── auth.ts            # Zustand auth store
│   ├── constants.ts       # App constants
│   ├── mockData.ts        # Mock API data
│   ├── notifications.ts   # Notification store
│   ├── queryClient.ts     # React Query client
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── types/                  # TypeScript types
├── styles/                 # Global styles
└── public/                 # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies:**

```bash
cd frontend
npm install
# or
pnpm install
# or
yarn install
```

2. **Set up environment variables:**

The `.env.local` file is already created with mock API enabled:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

3. **Run the development server:**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Go to `/auth/signup` to create an account
2. Sign in with your credentials
3. You'll be redirected to the dashboard
4. All data is currently mocked - no backend required!

## Using the App

### Authentication Flow
1. **Sign Up**: Create account at `/auth/signup`
2. **Sign In**: Login at `/auth/signin`
3. **Auto-redirect**: Authenticated users go to dashboard

### Profile Management
1. Navigate to **Profile** page
2. Click **Upload Resume** to add your resume (simulated)
3. AI will extract skills automatically (mocked)
4. View your education, experience, and skills
5. Manually add skills using the **Add Skill** button

### Internship Discovery
1. Go to **Internships** page
2. Browse three tabs:
   - **Eligible**: Internships you qualify for (80%+ match)
   - **Almost Eligible**: Close matches (50-79%)
   - **Not Eligible**: Need more skills (<50%)
3. Click any internship card to see details
4. View skill gaps and match scores
5. Click **Generate Learning Project** for missing skills

### Project Generation
1. Navigate to **Projects** page
2. Click **Generate Project** button
3. Enter skills you want to learn
4. Select your experience level
5. AI generates a personalized roadmap (takes 3 seconds)
6. View project details with milestones
7. Accept → Start → Complete projects
8. Completing projects verifies skills and unlocks internships!

## Mock Data

The app uses comprehensive mock data including:
- Sample student profile (Rahul Kumar)
- 5 skills (JavaScript, React, Node.js, Python, Docker)
- 3 classified internships (Google, Microsoft, Amazon)
- 1 generated project (PostgreSQL Task Manager)

All API calls are intercepted and return mock responses instantly.

## Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# AWS Cognito (Update when backend is ready)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# Feature Flags
NEXT_PUBLIC_USE_MOCK_API=true
```

## Mock API

The frontend currently uses mock data for development. Set `NEXT_PUBLIC_USE_MOCK_API=true` to use mocks.

Mock data is defined in `lib/mockData.ts` and includes:
- User profile
- Skill graph
- Classified internships
- Generated projects

## Custom Hooks

### Authentication
- `useAuth()` - Sign up, sign in, sign out

### Data Fetching
- `useProfile()` - Fetch and update profile, upload resume
- `useSkillGraph()` - Fetch skills, add skills
- `useInternships()` - Fetch classified internships
- `useProjects()` - Generate projects, update status, complete projects
- `useNotifications()` - Show toast notifications

## Styling

### Tailwind Custom Colors

```js
primary: '#3B82F6'    // Blue
success: '#10B981'    // Green
warning: '#F59E0B'    // Amber
danger: '#EF4444'     // Red
neutral: '#9CA3AF'    // Gray
background: '#F3F4F6' // Light Gray
```

### Custom CSS Classes

- `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- `.input`, `.input-error`
- `.card`, `.card-hover`
- `.badge`, `.badge-success`, etc.
- `.skeleton` - Loading placeholder
- `.modal-overlay`, `.modal-content`

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format
```

## Next Steps

1. Create authentication pages (signup/signin)
2. Build dashboard layout
3. Implement profile management
4. Create internship discovery UI
5. Build project generation interface
6. Add skill graph visualization
7. Integrate with real backend APIs

## Notes

- All API calls are currently mocked
- Replace mock data with real API calls when backend is ready
- Follow the design document for UI/UX specifications
- Ensure mobile-first responsive design (min-width: 375px)
