# Sprint 1 Route Map (Validated)

## Primary Routes
1. `/` Home page with dual CTA (Explorer and Guide)
2. `/auth/login` Login shell
3. `/auth/signup` Signup shell with role selection
4. `/onboarding/explorer` Explorer onboarding profile form
5. `/onboarding/guide` Guide onboarding profile form
6. `/chat` Chat workspace shell + activation checkpoint

## Flow Mapping
1. Explorer happy path:
   `/` -> `/auth/signup` -> `/onboarding/explorer` -> `/chat`
2. Guide happy path:
   `/` -> `/auth/signup?role=guide` -> `/onboarding/guide` -> `/chat`
3. Returning user path:
   `/auth/login` -> `/chat`

## Vision Alignment Check
1. Conversation is the product: `/chat` is the primary post-onboarding destination
2. Access to people and expertise: role selection and profile setup begin matching context
3. Authenticity and trust: user role and profile context established before active conversation
