# Ugly Manling Product Architecture

## 1. Purpose
This document defines how we will build Ugly Manling as a platform.

The backbone of the platform is not "pages" or "features" in isolation. It is the set of core offerings that create value for balding men:
1. Guidance and planning.
2. Expert access.
3. Treatment and service access.
4. Barber and style support.
5. Commerce.
6. Research and education.

Community is not a separate vertical product track at the center of the build. It is a horizontal layer that cuts across the entire platform and increases trust, retention, confidence, and proof.

## 2. Product Architecture Principle
We will build Ugly Manling offering-first.

That means:
1. Every product decision should strengthen one or more core offerings.
2. The information architecture, data model, and UX should reflect the real user journey through those offerings.
3. Shared layers such as community, analytics, identity, and brand voice should support all offerings horizontally.

This prevents the product from becoming a random collection of content, commerce, and tools.

## 3. Core Offerings Backbone
### 3.1 Guidance and Planning
This is the decision engine of the platform.

It helps users:
1. Identify where they are in the hair-loss journey.
2. Clarify goals, budget, urgency, and confidence level.
3. Receive a practical action plan.
4. Understand what to do next.

This should be treated as the front door and coordinating layer for the rest of the platform.

### 3.2 Expert Access
This is the escalation layer when a user needs human guidance beyond self-serve education.

It includes:
1. Telehealth consultations.
2. Practical expert guidance.
3. Service-provider access when higher-trust support is required.

### 3.3 Treatment and Service Access
This is the action layer for treatment-related next steps.

It includes:
1. Medication and treatment pathways.
2. Referral and discount flows.
3. Transplant exploration and referrals where appropriate.

### 3.4 Barber and Style Support
This is the confidence layer for appearance-related outcomes.

It includes:
1. Style recommendations.
2. Grooming guidance.
3. Barber discovery and recommendations.

For many users, this may be the fastest path to a meaningful win.

### 3.5 Commerce
This is the owned product layer.

It includes:
1. Branded goods.
2. Hair-loss-related tools and accessories.
3. Curated kits and bundles.

Commerce should be tightly integrated with guidance, not isolated from it.

### 3.6 Research and Education
This is the trust and interpretation layer.

It includes:
1. Educational content.
2. Research translation.
3. Evidence summaries.
4. Clear explanations of what matters and what is hype.

Research and education should power recommendations across every other offering.

## 4. Horizontal Layers
### 4.1 Community
Community should sit across the entire product, not beside it.

Its role is to strengthen:
1. Validation.
2. Trust.
3. Social proof.
4. Retention.
5. Emotional support.

Community can appear inside multiple offerings:
1. Success stories inside guidance flows.
2. User testimonials near treatment decisions.
3. Shared before-and-after journeys in style and grooming content.
4. Product reviews and usage stories in commerce.
5. Discussion and Q&A attached to research and educational content.

### 4.2 Identity and Profile
The user profile should travel across all offerings and create continuity.

Core profile dimensions:
1. Hair-loss stage.
2. Goals.
3. Budget.
4. Urgency.
5. Confidence baseline.
6. Preferences and selected path.

### 4.3 Analytics and Attribution
Every offering needs shared measurement.

We should track:
1. Acquisition source.
2. Assessment completion.
3. Recommended path selection.
4. Offer clicks.
5. Booking conversions.
6. Referral conversions.
7. Product conversions.
8. Repeat engagement.

### 4.4 Brand Voice and Content System
The brand is a system layer, not just marketing decoration.

Every interface, recommendation, piece of copy, and educational artifact should feel:
1. Bold.
2. Direct.
3. Useful.
4. Funny where appropriate.
5. Evidence-backed where claims require it.

## 5. Platform Shape
The product should be approached as one coordinated platform with a central guidance layer and multiple downstream action paths.

Recommended platform shape:
1. Assessment and onboarding.
2. Personalized plan generation.
3. Offering modules that branch from the plan:
   - expert access,
   - treatment and services,
   - barber and style,
   - commerce,
   - research and education.
4. Community touchpoints across every module.
5. Progress tracking and re-engagement over time.

## 6. Build Strategy
We should sequence the platform according to user decision flow, not according to organizational convenience.

### Phase 1
Build the core decision engine:
1. Assessment.
2. User profile.
3. Personalized plan output.
4. Foundational content and recommendation framework.

### Phase 2
Build the first high-value action paths:
1. Treatment and service access.
2. Barber and style support.
3. Expert access.

### Phase 3
Add owned monetization and trust-deepening systems:
1. Commerce.
2. Research hub.
3. Community touchpoints embedded across flows.

### Phase 4
Add richer retention and optimization systems:
1. Progress tracking.
2. Deeper personalization.
3. Lifecycle messaging.
4. Expanded community mechanics.
5. Revenue optimization and experimentation.

## 7. Information Architecture
The product structure should reflect the offering backbone.

Primary domains:
1. Assessment.
2. Plan.
3. Treatments.
4. Experts.
5. Style.
6. Shop.
7. Research.

Community should be embedded into these domains instead of treated as a detached destination at first.

## 8. Domain Model Direction
The data model should start from the offering backbone and shared horizontal layers.

Core entities:
1. `User`
2. `UserProfile`
3. `HairLossAssessment`
4. `JourneyPlan`
5. `JourneyRecommendation`
6. `TreatmentOffer`
7. `ReferralPartner`
8. `Consultation`
9. `StyleRecommendation`
10. `BarberPartner`
11. `Product`
12. `Order`
13. `ResearchContent`
14. `CommunityArtifact`
15. `Event`

`CommunityArtifact` can represent stories, testimonials, reviews, comments, wins, and discussions that attach to multiple offerings.

## 9. MVP Implication
The MVP should not try to launch every offering at full depth.

Instead, it should prove this architecture:
1. A user can be assessed.
2. A user can receive a clear plan.
3. That plan can route the user into a meaningful next step.
4. The next step can convert into trust, action, or revenue.

That is the smallest real version of the platform.

## 10. Non-Goals
1. Do not build community as a standalone social network first.
2. Do not build isolated feature silos that do not connect back to the core guidance layer.
3. Do not let commerce become detached from user needs.
4. Do not publish educational content without a clear relationship to recommendations or decisions.
5. Do not overbuild infrastructure before the first end-to-end loop works.

## 11. Build Standard
Before adding any feature, ask:
1. Which core offering does this strengthen?
2. Does it connect back to the guidance layer?
3. How does community support this flow horizontally?
4. What trust signal does it add?
5. What user action or business result should it drive?
