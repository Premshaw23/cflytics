# CFlytics - Authentication Plan (Guest + Connected)

This project uses a **dual system**:

- **Guest mode (no login)**: all analytics work; **bookmarks/notes/goals are stored locally** (per device).
- **Connected mode (verified handle)**: you verify you own a Codeforces handle by putting a short token in your Codeforces profile. CFlytics then creates a secure session cookie and **syncs bookmarks/notes/goals in the database**.

## Why not OAuth?

Codeforces API supports **public + apiKey/apiSig** access, but it **does not provide OAuth2 endpoints** like `/oauth2/authorize` / `/oauth2/token` for “Sign in with Codeforces”.

So instead of OAuth, CFlytics implements **Proof-of-Handle verification**.

## How the Connected flow works (implemented)

1. Go to `/connect`
2. Enter your handle → CFlytics generates a token like `cflytics-verify-...`
3. Put that token into your Codeforces profile **Organization** field: `https://codeforces.com/settings/social`
4. Click “Verify & Connect”

Server endpoints:
- `POST /api/auth/challenge`
- `POST /api/auth/verify`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Database support:
- Prisma model: `LoginChallenge`

## Required environment variables

```env
# Session encryption (>= 32 characters)
CFLYTICS_SESSION_PASSWORD=replace-with-a-long-random-string

# Database
DATABASE_URL=postgresql://...
```

---

## DEPRECATED (old OAuth/NextAuth plan)

The remaining content below was an earlier “OAuth2 + NextAuth” plan and is kept only for reference. It is **not valid for Codeforces** and should not be followed as-is.


## **WEEK 1: OAuth Authentication Setup**

### **Day 1 (Monday) - Environment & Dependencies**

#### **Step 1: Create `.env.local`**
```bash
# Create .env.local in root directory
touch .env.local
```

#### **Step 2: Add credentials to `.env.local`**
```env
# (DEPRECATED) Codeforces OAuth (not supported by Codeforces)
CODEFORCES_CLIENT_ID=<REDACTED>
CODEFORCES_CLIENT_SECRET=<REDACTED>

# NextAuth Configuration
NEXTAUTH_SECRET=generate-this-with-openssl
NEXTAUTH_URL=http://localhost:3000

# Database (you'll set this up later)
DATABASE_URL=postgresql://...

# Redis (optional, for caching)
REDIS_URL=redis://...
```

#### **Step 3: Generate NEXTAUTH_SECRET**
```bash
openssl rand -base64 32
```
Copy the output and replace `generate-this-with-openssl` in `.env.local`

#### **Step 4: Update `.gitignore`**
```bash
# Add to .gitignore
.env.local
.env*.local
```

#### **Step 5: Install NextAuth.js**
```bash
npm install next-auth@beta @auth/prisma-adapter
```

---

### **Day 2 (Tuesday) - Prisma Schema for Authentication**

#### **Update `prisma/schema.prisma`**

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  handle        String?   @unique // Codeforces handle
  rating        Int?
  maxRating     Int?
  rank          String?
  maxRank       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  bookmarks     Bookmark[]
  notes         Note[]
  goals         Goal[]
  preferences   Preference?
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Application Models
model Bookmark {
  id         String   @id @default(cuid())
  userId     String
  problemId  String   // Format: "contestId-index" (e.g., "1234-A")
  createdAt  DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, problemId])
  @@index([userId])
}

model Note {
  id         String   @id @default(cuid())
  userId     String
  problemId  String
  content    String   @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, problemId])
  @@index([userId])
}

model Goal {
  id           String   @id @default(cuid())
  userId       String
  type         String   // "rating", "problems", "contest", "tag"
  title        String
  description  String?  @db.Text
  targetValue  Int
  currentValue Int      @default(0)
  deadline     DateTime?
  completed    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model Preference {
  id                  String   @id @default(cuid())
  userId              String   @unique
  theme               String   @default("system")
  favoriteTags        String[]
  preferredDifficulty String   @default("1200-1800")
  emailNotifications  Boolean  @default(true)
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### **Run Migration**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### **Day 3 (Wednesday) - NextAuth Configuration**

#### **Create `src/lib/auth.config.ts`**

```typescript
import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  
  providers: [], // Will be added in auth.ts
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.handle = user.handle
        session.user.rating = user.rating
        session.user.maxRating = user.maxRating
        session.user.rank = user.rank
      }
      return session
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.handle = user.handle
      }
      return token
    },
  },
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig
```

#### **Create `src/lib/auth.ts`**

```typescript
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    {
      id: "codeforces",
      name: "Codeforces",
      type: "oauth",
      
      clientId: process.env.CODEFORCES_CLIENT_ID,
      clientSecret: process.env.CODEFORCES_CLIENT_SECRET,
      
      authorization: {
        url: "https://codeforces.com/oauth2/authorize",
        params: {
          scope: "read",
          response_type: "code",
        },
      },
      
      token: {
        url: "https://codeforces.com/oauth2/token",
      },
      
      userinfo: {
        url: "https://codeforces.com/api/user.info",
        async request({ tokens }) {
          // Codeforces requires handle in query params
          // We need to get this from the access token or make additional call
          const response = await fetch(
            `https://codeforces.com/api/user.info?access_token=${tokens.access_token}`
          )
          const data = await response.json()
          
          if (data.status === "OK" && data.result?.length > 0) {
            return data.result[0]
          }
          
          throw new Error("Failed to fetch user info")
        },
      },
      
      profile(profile) {
        return {
          id: profile.handle,
          name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.handle,
          email: profile.email || null,
          image: profile.titlePhoto || profile.avatar || null,
          handle: profile.handle,
          rating: profile.rating || 0,
          maxRating: profile.maxRating || 0,
          rank: profile.rank || "unrated",
          maxRank: profile.maxRank || "unrated",
        }
      },
    },
  ],
})
```

---

### **Day 4 (Thursday) - API Routes & Middleware**

#### **Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { GET, POST } from "@/lib/auth"

export { GET, POST }
```

#### **Create `src/middleware.ts`**

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes
  const protectedRoutes = [
    '/bookmarks',
    '/notes',
    '/goals',
    '/settings',
  ]

  const isProtected = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect to signin if accessing protected route while not logged in
  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

### **Day 5 (Friday) - Sign In Page**

#### **Create `src/app/auth/signin/page.tsx`**

```typescript
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2 } from "lucide-react"

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to CFlytics</CardTitle>
          <CardDescription>
            Sign in with your Codeforces account to unlock personalized features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("codeforces", {
                redirectTo: searchParams.callbackUrl || "/dashboard",
              })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <Code2 className="mr-2 h-5 w-5" />
              Continue with Codeforces
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### **Create `src/app/auth/error/page.tsx`**

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from the OAuth provider.",
    OAuthCreateAccount: "Could not create OAuth provider user in the database.",
    EmailCreateAccount: "Could not create email provider user in the database.",
    Callback: "Error in the OAuth callback handler route.",
    OAuthAccountNotLinked: "The email on the account is already linked, but not with this OAuth account.",
    EmailSignin: "Sending the e-mail with the verification token failed.",
    CredentialsSignin: "The authorize callback returned null in the Credentials provider.",
    SessionRequired: "The content of this page requires you to be signed in at all times.",
    Default: "An unknown error occurred.",
  }

  const errorMessage = error ? errorMessages[error] ?? errorMessages.Default : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## **WEEK 2: Session Management & User Context**

### **Day 1 (Monday) - Session Provider**

#### **Create `src/lib/providers/session-provider.tsx`**

```typescript
"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}
```

#### **Update `src/app/layout.tsx`**

```typescript
import { SessionProvider } from "@/lib/providers/session-provider"
import { QueryProvider } from "@/lib/providers/query-provider"
import { ThemeProvider } from "@/lib/providers/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

---

### **Day 2 (Tuesday) - Auth Hooks & Utilities**

#### **Create `src/lib/hooks/use-auth.ts`**

```typescript
"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    handle: session?.user?.handle,
    rating: session?.user?.rating,
    rank: session?.user?.rank,
  }
}
```

#### **Create `src/lib/auth/server.ts`**

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cache } from "react"

export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user
})

export const requireAuth = cache(async () => {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  return session.user
})
```

#### **Create TypeScript types in `src/types/next-auth.d.ts`**

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      handle: string | null
      rating: number | null
      maxRating: number | null
      rank: string | null
    } & DefaultSession["user"]
  }

  interface User {
    handle: string | null
    rating: number | null
    maxRating: number | null
    rank: string | null
    maxRank: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    handle: string | null
  }
}
```

---

### **Day 3 (Wednesday) - User Menu Component**

#### **Create `src/components/layout/user-menu.tsx`**

```typescript
"use client"

import { signOut } from "next-auth/react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  LogOut, 
  BookmarkIcon, 
  Target,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { getRatingColor } from "@/lib/utils/rating-colors"

export function UserMenu() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    )
  }

  const handle = user.handle || "User"
  const rating = user.rating || 0
  const rank = user.rank || "unrated"
  const ratingColor = getRatingColor(rating)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={handle} />
            <AvatarFallback>{handle[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{handle}</p>
            <Badge 
              variant="outline" 
              className="w-fit"
              style={{ 
                borderColor: ratingColor,
                color: ratingColor 
              }}
            >
              {rank} ({rating})
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/profile/${handle}`}>
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">
            <BookmarkIcon className="mr-2 h-4 w-4" />
            Bookmarks
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/notes">
            <FileText className="mr-2 h-4 w-4" />
            Notes
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/goals">
            <Target className="mr-2 h-4 w-4" />
            Goals
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

### **Day 4 (Thursday) - Protected Routes Component**

#### **Create `src/components/auth/protected-route.tsx`**

```typescript
"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
```

---

### **Day 5 (Friday) - Update Header & Test**

#### **Update Header to include UserMenu**

```typescript
import { UserMenu } from "./user-menu"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Other header content */}
        
        <div className="ml-auto flex items-center gap-4">
          {/* Search, theme toggle, etc. */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
```

#### **Test Authentication Flow**
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `/auth/signin`
- [ ] Click "Continue with Codeforces"
- [ ] Authorize on Codeforces
- [ ] Verify redirect back to app
- [ ] Check user data in dropdown menu
- [ ] Test sign out
- [ ] Test protected route access

---

## **WEEK 3-8: Continue Building Features**

Now follow the original 15-week plan for:

### **Week 3: Bookmarks**
- Create API routes for bookmarks
- Build bookmark hooks
- Add bookmark button to problems
- Create bookmarks management page

### **Week 4: Notes**
- Build notes system
- Add rich text editor
- Integrate with problems
- Create notes page

### **Week 5: Goals**
- Implement goals system
- Add progress tracking
- Create goals dashboard

### **Week 6: Preferences & Settings**
- Build settings page
- Add user preferences
- Implement data export

### **Week 7: Enhanced Features**
- Personalized dashboard
- Advanced analytics
- Improved recommendations

### **Week 8: Polish & Testing**
- Achievement system
- Bug fixes
- Performance optimization

---

## 🔒 **Security Checklist**

- [x] OAuth credentials in `.env.local` (not committed)
- [ ] HTTPS in production
- [ ] Secure cookie settings (NextAuth handles this)
- [ ] CSRF protection (NextAuth handles this)
- [ ] Rate limiting on API routes
- [ ] Input validation
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection

---

## 🚀 **Quick Start Commands**

```bash
# 1. Install dependencies
npm install next-auth@beta @auth/prisma-adapter

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database
npx prisma migrate dev --name init
npx prisma generate

# 4. Start development
npm run dev

# 5. Test OAuth
# Visit: http://localhost:3000/auth/signin
```

---

## 📝 **Production Deployment Checklist**

When deploying to Vercel/production:

1. **Add Production Redirect URI to Codeforces:**
   ```
   https://yourdomain.com/api/auth/callback/codeforces
   ```

2. **Set Environment Variables in Vercel:**
   - `CODEFORCES_CLIENT_ID`
   - `CODEFORCES_CLIENT_SECRET`
   - `NEXTAUTH_SECRET` (generate new one for production)
   - `NEXTAUTH_URL` (your production URL)
   - `DATABASE_URL`

3. **Update NEXTAUTH_URL:**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

---

## 🎉 **You're Ready to Build!**

Your Codeforces OAuth is properly configured. Now you can:

1. ✅ Users can sign in with Codeforces
2. ✅ Access user data (handle, rating, rank)
3. ✅ Protect routes requiring authentication
4. ✅ Build personalized features (bookmarks, notes, goals)

Start with Week 1, Day 1 and follow the tasks step-by-step! 🚀

---

**Need Help?**
- NextAuth Docs: https://authjs.dev
- Codeforces API: https://codeforces.com/apiHelp
- Discord/Forums: Ask in Next.js or Codeforces communities

Good luck with CFlytics! 💪