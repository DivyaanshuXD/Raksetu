# Micro-interactions & Animations Guide

## Overview
Week 2 micro-interactions and animations for enhanced user experience in Raksetu Blood Hub app.

## Animation Components

### 1. Skeleton Loader
Placeholder loading state with shimmer animation.

#### Features
- ✅ 6 variants: text, circle, rectangle, avatar, card, button
- ✅ Pulse animation effect
- ✅ Customizable size, width, height
- ✅ Multiple count support
- ✅ Pre-built patterns (Card, List, Profile)

#### Usage
```jsx
import { Skeleton } from '@/components/common/ui';

// Basic text skeleton
<Skeleton variant="text" count={3} />

// Circle avatar skeleton
<Skeleton variant="circle" size={64} />

// Custom dimensions
<Skeleton variant="rectangle" width={200} height={100} />

// Pre-built card pattern
<Skeleton.Card />

// Pre-built list pattern
<Skeleton.List count={5} />

// Pre-built profile pattern
<Skeleton.Profile />
```

#### Variants
| Variant | Use Case | Example |
|---------|----------|---------|
| text | Text lines | Paragraph loading |
| circle | Avatar/icon | User profile pic |
| rectangle | Image/card | Blog post thumbnail |
| avatar | Profile picture | Same as circle |
| card | Full card | Product card |
| button | Button | CTA placeholder |

#### Examples
```jsx
// Loading emergency cards
{isLoading ? (
  <Skeleton.Card />
) : (
  <EmergencyCard data={data} />
)}

// Loading donation history
{isLoading ? (
  <Skeleton.List count={10} />
) : (
  donations.map(d => <DonationItem key={d.id} {...d} />)
)}

// Loading profile
{isLoading ? (
  <Skeleton.Profile />
) : (
  <UserProfile user={user} />
)}
```

---

### 2. Spinner
Loading spinner with multiple variants and sizes.

#### Features
- ✅ 7 color variants
- ✅ 5 sizes (xs to xl)
- ✅ Smooth rotation animation
- ✅ Accessible labels
- ✅ Overlay mode for full-screen loading
- ✅ Button integration

#### Usage
```jsx
import { Spinner } from '@/components/common/ui';

// Basic spinner
<Spinner size="md" variant="primary" />

// Full-screen overlay
<Spinner.Overlay message="Processing donation..." />

// Spinner in button
<Spinner.Button loading={isSubmitting}>
  Submit
</Spinner.Button>
```

#### Props
| Prop | Type | Default | Options |
|------|------|---------|---------|
| size | string | 'md' | xs, sm, md, lg, xl |
| variant | string | 'primary' | primary, secondary, success, warning, error, white, gray |
| label | string | 'Loading...' | Custom screen reader text |

#### Sizes
- **xs**: 16px - Inline text
- **sm**: 20px - Small buttons
- **md**: 24px - Default buttons
- **lg**: 32px - Large cards
- **xl**: 40px - Full page

#### Examples
```jsx
// In button
<Button disabled={isLoading}>
  {isLoading && <Spinner size="sm" variant="white" />}
  Donate Blood
</Button>

// Full page loading
{isInitializing && (
  <Spinner.Overlay message="Loading your dashboard..." />
)}

// Inline loading
<div>
  Fetching results <Spinner size="xs" variant="gray" />
</div>
```

---

### 3. Confetti
Success celebration animation with confetti particles.

#### Features
- ✅ Particle-based animation
- ✅ Customizable colors and count
- ✅ Auto-cleanup after duration
- ✅ Performance optimized (Canvas API)
- ✅ Trigger mode for easy integration

#### Usage
```jsx
import { Confetti } from '@/components/common/ui';

// Manual control
const [showConfetti, setShowConfetti] = useState(false);

<Confetti
  active={showConfetti}
  duration={3000}
  particleCount={50}
  onComplete={() => setShowConfetti(false)}
/>

// Trigger mode (easier)
<Confetti.Trigger trigger={donationSuccess}>
  <SuccessMessage />
</Confetti.Trigger>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| active | boolean | false | Show confetti |
| duration | number | 3000 | Animation duration (ms) |
| particleCount | number | 50 | Number of particles |
| colors | array | Blood theme colors | Particle colors |
| onComplete | function | - | Callback when done |

#### Examples
```jsx
// Donation success
const handleDonationSuccess = () => {
  setShowConfetti(true);
  // Show success message
};

<Confetti
  active={showConfetti}
  duration={4000}
  particleCount={100}
  colors={['#ef4444', '#dc2626', '#b91c1c']}
  onComplete={() => setShowConfetti(false)}
/>

// Emergency request submitted
<Confetti.Trigger trigger={requestSubmitted}>
  <Alert variant="success" title="Request Submitted!" />
</Confetti.Trigger>
```

---

### 4. PageTransition
Smooth page and component entrance animations.

#### Features
- ✅ 7 transition variants
- ✅ Configurable duration and delay
- ✅ Stagger children animation
- ✅ Performance optimized (CSS transforms)

#### Usage
```jsx
import { PageTransition } from '@/components/common/ui';

// Basic page transition
<PageTransition variant="fade">
  <HomePage />
</PageTransition>

// Delayed animation
<PageTransition variant="slideUp" delay={200}>
  <Card>Content</Card>
</PageTransition>

// Stagger multiple items
<PageTransition.Stagger staggerDelay={100}>
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</PageTransition.Stagger>
```

#### Variants
| Variant | Effect | Best For |
|---------|--------|----------|
| fade | Opacity fade | Simple transitions |
| slideUp | Slide from bottom | Page content |
| slideDown | Slide from top | Modals, dropdowns |
| slideLeft | Slide from right | Next page |
| slideRight | Slide from left | Previous page |
| scale | Scale up | Cards, items |
| zoom | Zoom in | Hero sections |

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'fade' | Transition type |
| duration | number | 300 | Duration in ms |
| delay | number | 0 | Delay before start |

#### Examples
```jsx
// Page entrance
<PageTransition variant="slideUp" duration={400}>
  <div className="page-content">
    <h1>Welcome</h1>
    <p>Find blood donors near you</p>
  </div>
</PageTransition>

// Stagger list items
<PageTransition.Stagger staggerDelay={50}>
  {emergencies.map((emergency, index) => (
    <EmergencyCard key={emergency.id} data={emergency} />
  ))}
</PageTransition.Stagger>

// Modal entrance
<SwipeableModal isOpen={isOpen}>
  <PageTransition variant="scale" delay={100}>
    <ModalContent />
  </PageTransition>
</SwipeableModal>
```

---

### 5. Toast Notifications
Animated notification toasts with auto-dismiss.

#### Features
- ✅ 4 variants: info, success, warning, error
- ✅ 6 position options
- ✅ Auto-dismiss with configurable duration
- ✅ Manual dismiss with close button
- ✅ Icon support
- ✅ Action buttons
- ✅ Slide-in animations

#### Usage
```jsx
import { Toast } from '@/components/common/ui';

<Toast
  variant="success"
  message="Donation successful!"
  description="Your donation has been recorded."
  position="top-right"
  duration={3000}
  onClose={() => setShowToast(false)}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'info' | Toast type |
| message | string | required | Main message |
| description | string | - | Secondary text |
| position | string | 'top-right' | Screen position |
| duration | number | 3000 | Auto-dismiss time (0 = no auto-dismiss) |
| closable | boolean | true | Show close button |
| action | node | - | Action button JSX |
| icon | component | - | Custom icon |

#### Positions
- **top-left**: Top left corner
- **top-center**: Top center
- **top-right**: Top right corner
- **bottom-left**: Bottom left corner
- **bottom-center**: Bottom center
- **bottom-right**: Bottom right corner

#### Examples
```jsx
// Success notification
<Toast
  variant="success"
  message="Donation recorded!"
  description="Thank you for saving lives."
  position="top-right"
  duration={4000}
/>

// Error with action
<Toast
  variant="error"
  message="Failed to submit request"
  description="Please try again."
  position="top-center"
  action={
    <button onClick={retry} className="text-sm font-semibold underline">
      Retry
    </button>
  }
  duration={0} // Manual dismiss only
/>

// Custom icon
<Toast
  variant="info"
  message="New donor nearby"
  icon={MapPin}
  position="bottom-right"
/>
```

---

## Integration Guide

### 1. Loading States
Replace static loading text with skeleton loaders.

```jsx
// Before
{isLoading && <p>Loading...</p>}
{!isLoading && <UserProfile />}

// After
{isLoading ? <Skeleton.Profile /> : <UserProfile />}
```

### 2. Form Submission
Add spinner to submit buttons.

```jsx
// Before
<button onClick={handleSubmit}>Submit</button>

// After
<Spinner.Button loading={isSubmitting} onClick={handleSubmit}>
  Submit
</Spinner.Button>
```

### 3. Success Celebrations
Trigger confetti on important actions.

```jsx
const handleDonationComplete = () => {
  // Save donation
  await saveDonation();
  
  // Show confetti
  setShowConfetti(true);
  
  // Show toast
  setToastMessage("Donation successful!");
};

<Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
<Toast variant="success" message={toastMessage} />
```

### 4. Page Transitions
Wrap page components with transitions.

```jsx
// Before
function HomePage() {
  return <div>Home content</div>;
}

// After
function HomePage() {
  return (
    <PageTransition variant="slideUp">
      <div>Home content</div>
    </PageTransition>
  );
}
```

### 5. List Animations
Stagger list item entrances.

```jsx
<PageTransition.Stagger staggerDelay={50}>
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</PageTransition.Stagger>
```

---

## Best Practices

### Performance
- ✅ Use CSS transforms (GPU accelerated)
- ✅ Limit particle count in confetti (50-100)
- ✅ Clean up animations on unmount
- ✅ Use `requestAnimationFrame` for smooth animations
- ✅ Debounce frequent animations

### Accessibility
- ✅ Provide `aria-label` for spinners
- ✅ Use `role="status"` for loading states
- ✅ Respect `prefers-reduced-motion`
- ✅ Don't rely solely on animations to convey information

### UX Guidelines
- ✅ Use skeleton loaders for >500ms delays
- ✅ Show spinners for <500ms quick actions
- ✅ Auto-dismiss toasts after 3-5 seconds
- ✅ Use confetti sparingly (important actions only)
- ✅ Keep animations under 400ms for snappy feel

### Motion Sensitivity
```jsx
// Respect user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<PageTransition
  variant={prefersReducedMotion ? 'fade' : 'slideUp'}
  duration={prefersReducedMotion ? 150 : 300}
>
  <Content />
</PageTransition>
```

---

## Common Patterns

### 1. Loading Data with Skeleton
```jsx
function DataList() {
  const { data, isLoading } = useData();
  
  if (isLoading) {
    return <Skeleton.List count={5} />;
  }
  
  return (
    <PageTransition.Stagger staggerDelay={50}>
      {data.map(item => <Item key={item.id} {...item} />)}
    </PageTransition.Stagger>
  );
}
```

### 2. Form with Loading State
```jsx
function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitDonation();
    setIsSubmitting(false);
    setShowSuccess(true);
    setShowConfetti(true);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input label="Blood Type" />
        <Spinner.Button loading={isSubmitting}>
          Submit Donation
        </Spinner.Button>
      </form>
      
      {showSuccess && (
        <Toast
          variant="success"
          message="Donation submitted!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );
}
```

### 3. Optimistic UI Updates
```jsx
function EmergencyList() {
  const [requests, setRequests] = useState([]);
  const [optimisticRequest, setOptimisticRequest] = useState(null);
  
  const handleNewRequest = async (data) => {
    // Show optimistically
    const tempId = Date.now();
    setOptimisticRequest({ ...data, id: tempId });
    
    try {
      const newRequest = await createRequest(data);
      setRequests([newRequest, ...requests]);
      setOptimisticRequest(null);
    } catch (error) {
      setOptimisticRequest(null);
      // Show error toast
    }
  };
  
  return (
    <div>
      {optimisticRequest && (
        <Card className="opacity-50">
          <Spinner size="sm" />
          Creating request...
        </Card>
      )}
      {requests.map(req => <RequestCard key={req.id} {...req} />)}
    </div>
  );
}
```

---

## Animation Timing

### Duration Guidelines
- **Micro-interactions**: 150-200ms (button hover, focus)
- **Component transitions**: 250-350ms (modal open, page change)
- **Large movements**: 400-500ms (drawer slide, full page)
- **Celebratory**: 2000-4000ms (confetti, success animations)

### Easing Functions
- **Ease-out**: Default for entrances (starts fast, ends slow)
- **Ease-in**: Exits (starts slow, ends fast)
- **Ease-in-out**: Smooth both ways (position changes)
- **Spring**: Bouncy feel (playful interactions)

---

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| CSS Transforms | ✅ | ✅ | ✅ | ✅ |
| Canvas API | ✅ | ✅ | ✅ | ✅ |
| RequestAnimationFrame | ✅ | ✅ | ✅ | ✅ |
| Prefers-reduced-motion | ✅ | ✅ | ✅ | ✅ |

---

## Troubleshooting

### Skeleton not showing
- Check if `isLoading` state is true
- Verify component is imported correctly
- Check parent container has width

### Spinner not spinning
- Check `animate-spin` class applied
- Verify Tailwind CSS configured
- Check for CSS conflicts

### Confetti not appearing
- Verify canvas element rendered
- Check z-index (should be 50+)
- Ensure `active` prop is true

### Toast not sliding in
- Check position prop is valid
- Verify z-index high enough
- Check for overflow: hidden on parents

### PageTransition not animating
- Verify Tailwind transition classes
- Check duration prop value
- Ensure component re-mounts properly

---

## Future Enhancements

### Planned Features
- [ ] Progress bar component
- [ ] Pulse animation helper
- [ ] Shake animation for errors
- [ ] Bounce animation for notifications
- [ ] Drawer component with slide animation
- [ ] Accordion with smooth expand/collapse
- [ ] Image lazy load with fade-in
- [ ] Infinite scroll with skeleton

---

**Last Updated:** Week 2 - Micro-interactions & Animations  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
