import { useUser } from '@clerk/nextjs';

export interface SubscriptionStatus {
  isPro: boolean;
  isLoaded: boolean;
  user: any;
}

export function useSubscription(): SubscriptionStatus {
  const { user, isLoaded } = useUser();
  
  // 🚨 TEMPORARY: Override for testing Pro features
  // Set this to true to test Pro features while debugging
  const FORCE_PRO_FOR_TESTING = false;
  
  // Alternative: Use environment variable for testing
  const ENABLE_PRO_FOR_DEV = process.env.NODE_ENV === 'development' && 
                             process.env.NEXT_PUBLIC_ENABLE_PRO_FEATURES === 'true';
  
  // Debug: Log the user object to see what's available
  if (process.env.NODE_ENV === 'development' && user) {
    const userAny = user as any; // Type assertion to access all properties
    const subscriptionFields = {
      plan: user.publicMetadata?.plan,
      subscription: user.publicMetadata?.subscription,
      tier: user.publicMetadata?.tier,
      role: user.publicMetadata?.role,
      stripeCustomerId: user.publicMetadata?.stripeCustomerId,
      subscriptionId: user.publicMetadata?.subscriptionId,
      subscriptionStatus: user.publicMetadata?.subscriptionStatus,
      subscriptionActive: user.publicMetadata?.subscriptionActive,
      // Clerk native billing fields
      billing_plan: user.publicMetadata?.billing_plan,
      billing_tier: user.publicMetadata?.billing_tier,
      clerk_billing_plan: user.publicMetadata?.clerk_billing_plan,
    };
    
    console.log('🔍 User object for subscription check:', {
      userId: user.id,
      publicMetadata: user.publicMetadata,
      privateMetadata: userAny.privateMetadata,
      unsafeMetadata: userAny.unsafeMetadata,
      organizationMemberships: userAny.organizationMemberships,
      // Check if user has a has() method
      hasMethod: typeof userAny.has === 'function',
      // Check for common subscription fields - expanded view
      subscriptionFields
    });
    
    console.log('📊 Detailed subscription fields:', subscriptionFields);
  }
  
  // Try multiple approaches to check for Pro subscription
  let isPro = false;
  
  if (user) {
    const userAny = user as any; // Type assertion for accessing extended properties
    
    // Approach 1: Check publicMetadata for common subscription fields
    isPro = user.publicMetadata?.plan === 'pro' || 
            user.publicMetadata?.subscription === 'pro' ||
            user.publicMetadata?.tier === 'pro' ||
            user.publicMetadata?.role === 'pro';
    
    // Approach 1.5: Check for Clerk's native billing fields
    if (!isPro) {
      isPro = user.publicMetadata?.billing_plan === 'pro' ||
              user.publicMetadata?.billing_tier === 'pro' ||
              user.publicMetadata?.clerk_billing_plan === 'pro';
    }
    
    // Approach 1.6: Check organization memberships for Pro access
    if (!isPro && userAny.organizationMemberships?.length > 0) {
      const orgMemberships = userAny.organizationMemberships;
      isPro = orgMemberships.some((membership: any) => {
        return membership.organization?.publicMetadata?.plan === 'pro' ||
               membership.organization?.publicMetadata?.subscription === 'pro' ||
               membership.role === 'admin'; // Admins might have Pro access
      });
    }
    
    // Approach 2: Check if user has a has() method (for permissions)
    if (!isPro && typeof userAny.has === 'function') {
      try {
        isPro = userAny.has({ permission: "pro" }) || userAny.has({ role: "pro" });
      } catch (e) {
        console.log('has() method failed:', e);
      }
    }
    
    // Approach 3: Check privateMetadata
    if (!isPro && userAny.privateMetadata) {
      isPro = userAny.privateMetadata?.plan === 'pro' || 
              userAny.privateMetadata?.subscription === 'pro' ||
              userAny.privateMetadata?.tier === 'pro';
    }
    
    // Approach 4: Check unsafeMetadata
    if (!isPro && userAny.unsafeMetadata) {
      isPro = userAny.unsafeMetadata?.plan === 'pro' || 
              userAny.unsafeMetadata?.subscription === 'pro' ||
              userAny.unsafeMetadata?.tier === 'pro';
    }
    
    // Approach 5: Check for Stripe subscription status
    if (!isPro && user.publicMetadata?.stripeCustomerId) {
      isPro = user.publicMetadata?.subscriptionStatus === 'active' ||
              user.publicMetadata?.subscriptionActive === true;
    }
  }
  
  // Apply temporary override for testing
  if (FORCE_PRO_FOR_TESTING || ENABLE_PRO_FOR_DEV) {
    isPro = true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Final isPro result:', isPro);
    if (FORCE_PRO_FOR_TESTING) {
      console.log('⚠️  FORCE_PRO_FOR_TESTING is enabled!');
    }
    if (ENABLE_PRO_FOR_DEV) {
      console.log('⚠️  NEXT_PUBLIC_ENABLE_PRO_FEATURES=true detected!');
    }
  }
  
  return {
    isPro,
    isLoaded,
    user
  };
} 