# Community Features Setup Guide

This guide walks you through implementing the community-driven provider contribution system that allows users to share ratings, reviews, availability updates, and insurance information.

## Overview

The community features enable users to:
- ⭐ **Rate providers** with overall, wait time, communication, and facility ratings
- 📝 **Write detailed reviews** with visit information and recommendations
- 📅 **Share availability updates** including patient acceptance status and wait times
- 🛡️ **Contribute insurance information** with coverage details and verification
- 👍 **Vote on helpful reviews** to surface the most valuable content
- 🔍 **Search providers** based on community data

## Files Created/Modified

### New Files
- `scripts/sql/community-features-schema.sql` - Database schema for community features
- `types/community.ts` - TypeScript types for community data
- `services/community.ts` - Service layer for community operations
- `components/CommunityInfo.tsx` - Main component for displaying community data
- `components/ContributionModal.tsx` - Modal for user contributions

### Modified Files
- `components/ProviderCard.tsx` - Enhanced with community ratings and badges
- `components/ProviderDetail.tsx` - Integrated community information section

## Setup Instructions

### 1. Database Setup

Execute the community features schema in your Supabase SQL Editor:

```sql
-- Run the contents of scripts/sql/community-features-schema.sql in Supabase SQL Editor
```

This creates the following tables:
- `provider_ratings` - User ratings for providers
- `provider_reviews` - User reviews and recommendations
- `provider_availability` - Community-sourced availability updates
- `provider_insurance` - Insurance acceptance information
- `review_votes` - Helpfulness votes on reviews
- `provider_summary` - Materialized view with aggregated data

### 2. Environment Variables

Ensure your Supabase environment variables are configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Component Integration

#### Basic Integration (Provider Cards)

```tsx
import { ProviderSummary } from '../types/community';
import communityService from '../services/community';

// In your provider listing component
const [communitySummaries, setCommunitySummaries] = useState<Record<string, ProviderSummary>>({});

// Load community data for providers
useEffect(() => {
  const loadCommunityData = async () => {
    // Load summary data for visible providers
    const summaries = await Promise.all(
      providers.map(provider => 
        communityService.community.getProviderSummary(provider.number)
      )
    );
    
    const summaryMap = providers.reduce((acc, provider, index) => {
      if (summaries[index]) {
        acc[provider.number] = summaries[index];
      }
      return acc;
    }, {} as Record<string, ProviderSummary>);
    
    setCommunitySummaries(summaryMap);
  };
  
  loadCommunityData();
}, [providers]);

// Pass community data to ProviderCard
<ProviderCard
  provider={provider}
  communitySummary={communitySummaries[provider.number]}
  // ... other props
/>
```

#### Full Integration (Provider Details)

The `ProviderDetail` component automatically includes:
- Community information tabs (Overview, Reviews, Availability, Insurance)
- Contribution modal for authenticated users
- Real-time data loading and updates

### 4. Authentication Requirements

Users must be authenticated to:
- Submit ratings and reviews
- Share availability updates
- Add insurance information
- Vote on review helpfulness

The system uses Supabase Auth with Row Level Security (RLS) policies to ensure:
- Users can only edit their own contributions
- All data is publicly readable
- Contribution attribution is properly maintained

## Usage Examples

### Display Community Rating in Search Results

```tsx
// Enhanced provider card with community data
{communitySummary?.avg_rating && (
  <div className="flex items-center">
    <Star className="text-yellow-400" size={16} />
    <span>{communitySummary.avg_rating.toFixed(1)}</span>
    <span className="text-gray-600">({communitySummary.total_ratings})</span>
  </div>
)}
```

### Filter Providers by Community Data

```tsx
import { CommunitySearchFilters } from '../types/community';

const filters: CommunitySearchFilters = {
  min_rating: 4.0,
  accepting_patients: true,
  has_reviews: true
};

const topRatedProviders = await communityService.community.searchProvidersWithCommunityData(filters);
```

### Load Full Community Data

```tsx
const communityData = await communityService.community.getFullCommunityData(
  providerNpi,
  currentUser?.id
);

// Returns:
// - Provider summary with aggregated ratings
// - Recent reviews with user information
// - Latest availability update
// - Insurance plans list
// - User's existing rating (if any)
```

## Data Structure

### Provider Summary
```typescript
interface ProviderSummary {
  provider_npi: string;
  avg_rating?: number;
  total_ratings: number;
  avg_wait_time_rating?: number;
  avg_communication_rating?: number;
  avg_facility_rating?: number;
  total_reviews: number;
  recommend_count: number;
  latest_accepting_patients?: boolean;
  latest_next_appointment?: string;
  latest_wait_time?: string;
  insurance_plans_count: number;
  last_community_update?: string;
}
```

### Review with Voting
```typescript
interface ProviderReview {
  id: string;
  review_text: string;
  visit_date?: string;
  appointment_type?: string;
  would_recommend?: boolean;
  helpful_count: number;
  created_at: string;
  // User can vote on helpfulness
  user_has_voted?: boolean;
  user_vote_helpful?: boolean;
}
```

## Security & Privacy

### Row Level Security (RLS)
- **Public Read**: All community data is readable by everyone
- **Authenticated Write**: Only logged-in users can contribute
- **Owner Edit**: Users can only modify their own contributions
- **Anonymous Reviews**: Users can choose to post reviews anonymously

### Data Validation
- Rating values constrained to 1-5 range
- Confidence levels tracked for all contributions
- Verification flags for office-confirmed information
- Unique constraints prevent duplicate ratings per user

### Content Moderation
The system includes:
- User-driven helpfulness voting on reviews
- Confidence level tracking for data reliability
- Verification flags for office-confirmed information
- Ability to mark contributions as verified

## Performance Considerations

### Materialized View
The `provider_summary` view aggregates community data for fast lookups:
- Pre-calculated averages and counts
- Automatically updated when underlying data changes
- Indexed for efficient querying

### Pagination
- Reviews load in pages (default 10 per page)
- "Show more" functionality for large review sets
- Lazy loading of community data in provider cards

### Caching Strategies
Consider implementing:
- Client-side caching of community summaries
- Background refresh of aggregated data
- Redis caching for frequently accessed providers

## Analytics & Insights

Track community engagement:
```sql
-- Most reviewed providers
SELECT provider_npi, COUNT(*) as review_count
FROM provider_reviews
GROUP BY provider_npi
ORDER BY review_count DESC;

-- Average ratings by specialty
SELECT t.desc as specialty, AVG(r.rating) as avg_rating
FROM provider_ratings r
JOIN providers p ON p.npi = r.provider_npi
JOIN taxonomies t ON t.provider_id = p.id
WHERE t.primary = true
GROUP BY t.desc;

-- Community contribution trends
SELECT DATE_TRUNC('month', created_at) as month,
       COUNT(*) as contributions
FROM (
  SELECT created_at FROM provider_ratings
  UNION ALL
  SELECT created_at FROM provider_reviews
  UNION ALL
  SELECT created_at FROM provider_availability
  UNION ALL
  SELECT created_at FROM provider_insurance
) contributions
GROUP BY month
ORDER BY month;
```

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Verify user is authenticated: `auth.uid()` returns a value
   - Check policy conditions match your use case
   - Test with Supabase SQL Editor using auth context

2. **Community Data Not Loading**
   - Check network requests in browser dev tools
   - Verify Supabase environment variables
   - Ensure tables exist and have proper indexes

3. **Contribution Submission Failing**
   - Check form validation and required fields
   - Verify user authentication status
   - Review Supabase logs for specific errors

### Performance Issues

1. **Slow Provider Listings**
   - Implement pagination for community data loading
   - Use `provider_summary` view instead of raw queries
   - Consider caching strategies for frequently accessed data

2. **Large Review Sets**
   - Implement proper pagination (default 10 per page)
   - Use "Load More" instead of infinite scroll
   - Consider review summary/preview modes

## Future Enhancements

Potential improvements:
- **Photo Uploads**: Allow users to add photos to reviews
- **Provider Response**: Enable providers to respond to reviews
- **Verification System**: Badge system for verified contributors
- **Advanced Filtering**: Filter by insurance, specialties, ratings
- **Notification System**: Alert users when their favorite providers get new reviews
- **Mobile App Integration**: Extend community features to mobile apps
- **API Rate Limiting**: Implement rate limiting for contributions
- **Content Moderation**: Add reporting and moderation tools

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review Supabase documentation for RLS and auth
3. Test individual service functions in isolation
4. Check browser console and network tabs for errors

The community features provide a powerful way to crowdsource provider information and help users make informed healthcare decisions based on real community experiences.