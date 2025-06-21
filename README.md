# TaskCollab - Simple Task Management and Collaboration Tool

A full-stack task management application built with the T3 stack (Next.js, TypeScript, tRPC, Prisma, NextAuth.js, and Tailwind CSS). This project demonstrates modern web development practices and provides a complete solution for team collaboration and project management.

## 🚀 Features

- **Project Management**: Create and manage projects with team collaboration
- **Task Management**: Create, assign, and track tasks with priorities and deadlines
- **User Profiles**: Manage personal information and preferences
- **Real-time Collaboration**: Comment on tasks and collaborate with team members
- **Dashboard**: Overview of projects, tasks, deadlines, and team activities
- **Authentication**: Secure email/password and OAuth authentication
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: tRPC, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email/password and OAuth providers
- **UI Components**: Headless UI, Heroicons
- **Deployment**: Ready for AWS deployment with SST (Serverless Stack)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🏗 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd easyslr
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskcollab"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📖 Usage

### Getting Started

1. **Sign Up/Sign In**: Create an account or sign in with your credentials
2. **Create a Project**: Start by creating your first project
3. **Add Team Members**: Invite team members to your project
4. **Create Tasks**: Add tasks with descriptions, priorities, and deadlines
5. **Assign Tasks**: Assign tasks to team members
6. **Track Progress**: Monitor task progress and update statuses
7. **Collaborate**: Use comments to discuss tasks with team members

### Key Pages

- **Dashboard** (`/dashboard`): Overview of all projects and tasks
- **Projects** (`/projects`): Manage projects and view project details
- **Tasks** (`/tasks`): View and manage all tasks
- **Profile** (`/profile`): Update personal information and preferences

## 🗄 Database Schema

The application uses the following main entities:

- **User**: User accounts with profile information
- **Project**: Projects with team members and settings
- **Task**: Tasks with assignments, priorities, and deadlines
- **Tag**: Categorization tags for tasks
- **Comment**: Task comments for collaboration

## 🔧 API Routes

The application uses tRPC for type-safe API routes:

- `api.project.*`: Project management operations
- `api.task.*`: Task management operations
- `api.user.*`: User profile operations
- `api.tag.*`: Tag management operations

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Unit Tests

The project includes unit tests for:
- Database operations
- tRPC procedures
- Utility functions
- Component logic

## 🚀 Deployment

### AWS Deployment with SST

1. Install SST:
```bash
npm install -g sst
```

2. Configure AWS credentials
3. Deploy to AWS:
```bash
sst deploy
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Migration

For production deployment:

```bash
npx prisma migrate deploy
```

## 🏗 Architecture

### Frontend
- **Next.js** with TypeScript for the React framework
- **Tailwind CSS** for styling
- **tRPC** for type-safe API communication
- **NextAuth.js** for authentication

### Backend
- **tRPC** for API layer
- **Prisma** for database ORM
- **PostgreSQL** for data storage
- **NextAuth.js** for session management

### Development Workflow
1. Database schema changes via Prisma migrations
2. Type-safe API development with tRPC
3. Component development with TypeScript
4. Testing with Jest/Testing Library

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/) for the excellent development stack
- [Tailwind UI](https://tailwindui.com/) for design inspiration
- [Heroicons](https://heroicons.com/) for the beautiful icons

---

Built with ❤️ using the T3 Stack
