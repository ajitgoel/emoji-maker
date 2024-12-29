import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect to sign-in if accessing protected route without auth
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', '/');
    return NextResponse.redirect(signInUrl);
  }

  // Handle API routes
  if (!userId && req.url.includes('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', userId)
        .single();
      
      if (!profile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            credits: 3,
            tier: 'free'
          })
          .single();

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};