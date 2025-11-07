# Next.js Authentication with Supabase (Role-Based Access Control Implementation)

This is a Next.js project implementing a complete role-based access control system with Supabase and Tailwind CSS.

## Features

- User Registration with Email/Password
- User Login with Email/Password
- Session Management
- Protected Dashboard Route
- Role-Based Access Control (RBAC)
- User Management (Create, Read, Update, Delete)
- Role Management (Create, Read, Update, Delete)
- Permission System (User Management, Role Management)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Supabase project:
   - Create a new project at [Supabase](https://supabase.io/)
   - Get your project URL and anon key from the project settings
   - Enable email authentication in the Supabase auth settings

4. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the database migrations:
   - Execute the SQL scripts in the `/supabase/migrations` directory in order
   - Or use the Supabase CLI to apply migrations

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Role-Based Access Control

The system includes the following roles by default:
- **Super Admin**: Full access to all features
- **Admin**: Full access to user and role management
- **Moderator**: Limited access (no management permissions)
- **User**: Basic access (no management permissions)

Each role has specific permissions that control access to different parts of the application.

## Project Structure

- `/src/app/login` - Login page
- `/src/app/register` - Registration page
- `/src/app/dashboard` - Protected dashboard with role-based access control
- `/src/hooks/useAuth.ts` - Authentication hook with login/register functions
- `/src/lib/supabaseClient.ts` - Supabase client configuration
- `/src/middleware.ts` - Route protection middleware
- `/supabase/migrations` - Database migration scripts

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.io/docs) - learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.