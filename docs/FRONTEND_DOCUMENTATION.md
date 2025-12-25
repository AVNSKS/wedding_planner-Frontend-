# WedVow Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Context & State Management](#context--state-management)
5. [Routing](#routing)
6. [Services (API Layer)](#services-api-layer)
7. [Pages](#pages)
8. [Components](#components)
9. [Hooks](#hooks)
10. [Styling](#styling)
11. [Features](#features)

---

## Overview

**WedVow Frontend** is a modern React-based wedding planning application built with Vite, providing separate interfaces for couples, vendors, and guests.

**Development Server**: `http://localhost:5173`

**Key Features**:
- Multi-wedding management
- Real-time RSVP system
- Budget tracking
- Vendor marketplace
- Task and event management
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion

---

## Project Structure

```
wedding-planner/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable components
│   │   ├── common/          # Header, Navbar, Sidebar
│   │   ├── ui/              # Modal, Button, Card, Input
│   │   └── icons/           # Custom icons
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── WeddingContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   └── useLocalStorage.js
│   ├── pages/               # Route pages
│   │   ├── auth/           # Login, Register
│   │   ├── couple/         # Couple dashboard pages
│   │   ├── vendor/         # Vendor dashboard pages
│   │   ├── guest/          # Guest RSVP pages
│   │   └── public/         # Public pages
│   ├── services/           # API service layer
│   │   ├── api.js         # Axios instance
│   │   ├── auth.js
│   │   ├── weddings.js
│   │   └── ...
│   ├── styles/            # Global styles
│   ├── utils/            # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css      # Global CSS
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Technology Stack

### Core
- **React 19.2.0** - UI library
- **Vite 5.x** - Build tool and dev server
- **React Router DOM 7.x** - Client-side routing

### State Management
- **React Context API** - Global state management
- **LocalStorage** - Persistent state storage

### HTTP Client
- **Axios 1.x** - API requests with interceptors

### UI & Styling
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Framer Motion 12.x** - Animation library
- **Lucide React** - Icon library
- **React Icons** - Additional icons

### Utilities
- **date-fns** - Date manipulation
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes

---

## Context & State Management

### 1. AuthContext (`src/context/AuthContext.jsx`)

Manages user authentication state across the application.

**State**:
```javascript
{
  user: Object | null,          // User profile data
  token: String | null,         // JWT token
  role: String | null,          // 'couple' or 'vendor'
  loading: Boolean,             // Auth initialization loading
  isAuthenticated: Boolean      // Auth status
}
```

**Methods**:
```javascript
login(credentials)              // Login user
register(userData)              // Register new user
logout()                        // Logout user
```

**Usage**:
```javascript
import { useAuth } from './context/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use auth state and methods
};
```

**Features**:
- Auto-initialize from localStorage on mount
- JWT token stored in localStorage
- Automatic token attachment to API requests
- Custom event dispatch on auth changes

---

### 2. WeddingContext (`src/context/WeddingContext.jsx`)

Manages multiple weddings for a user.

**State**:
```javascript
{
  weddings: Array,              // All weddings for user
  selectedWedding: Object | null, // Currently active wedding
  loading: Boolean              // Loading state
}
```

**Methods**:
```javascript
selectWedding(wedding)          // Switch active wedding
addWedding(newWedding)         // Add newly created wedding
updateWedding(updatedWedding)  // Update existing wedding
removeWedding(weddingId)       // Remove wedding
reloadWeddings()               // Refresh wedding list
```

**Usage**:
```javascript
import { useWedding } from './context/WeddingContext';

const MyComponent = () => {
  const { wedding, weddings, selectWedding } = useWedding();
  
  // wedding = selectedWedding (backward compatible)
};
```

**Features**:
- Multi-wedding support
- Selected wedding persisted in localStorage
- Listens for auth changes to reload weddings
- Automatic selection of first wedding on load

---

## Routing

### Route Structure

**Public Routes** (No authentication required):
```
/                   - Home page
/login              - Login page
/register           - Register page
/rsvp/:token        - Guest RSVP form
/wedding/:token     - Public wedding view
```

**Couple Routes** (Requires 'couple' role):
```
/couple/dashboard   - Couple dashboard
/couple/wedding     - Wedding details form
/couple/guests      - Guest list management
/couple/vendors     - Vendor browsing
/couple/bookings    - Booking management
/couple/budgets     - Budget tracker
/couple/tasks       - Task list
/couple/events      - Event schedule
/couple/reminders   - Reminders
```

**Vendor Routes** (Requires 'vendor' role):
```
/vendor/dashboard   - Vendor dashboard
/vendor/profile     - Vendor profile management
/vendor/bookings    - Booking requests
```

### Protected Route Component

```javascript
<ProtectedRoute allowedRoles={["couple"]}>
  <CoupleDashboard />
</ProtectedRoute>
```

**Features**:
- Checks authentication status
- Validates user role
- Shows loading spinner during auth check
- Redirects to login if unauthorized

---

## Services (API Layer)

All services are located in `src/services/` and handle API communication.

### Base Configuration (`api.js`)

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Service Files

#### 1. **auth.js** - Authentication
```javascript
login(credentials)              // POST /auth/login
register(userData)              // POST /auth/register
getProfile()                    // GET /auth/profile
logout()                        // Clear localStorage
```

#### 2. **weddings.js** - Wedding Management
```javascript
getMyWeddings()                 // GET /weddings/all
getMyWedding()                  // GET /weddings/my-wedding
createWedding(data)             // POST /weddings
updateWedding(id, data)         // PUT /weddings/:id
deleteWedding(id)               // DELETE /weddings/:id
getWeddingById(id)              // GET /weddings/:id
```

#### 3. **guests.js** - Guest Management
```javascript
getGuests(weddingId)            // GET /guests?weddingId=xxx
createGuest(data, weddingId)    // POST /guests
updateGuest(id, data)           // PUT /guests/:id
deleteGuest(id)                 // DELETE /guests/:id
sendInvitations()               // POST /guests/send-invitations
getGuestByToken(token)          // GET /guests/rsvp/:token
submitRSVP(token, data)         // POST /guests/rsvp/:token
```

#### 4. **vendors.js** - Vendor Services
```javascript
getVendors(filters)             // GET /vendors?category=xxx
getMyProfile()                  // GET /vendors/my/profile
createVendor(data)              // POST /vendors
updateVendor(id, data)          // PUT /vendors/:id
deleteVendor(id)                // DELETE /vendors/:id
getVendorById(id)               // GET /vendors/:id
addReview(id, reviewData)       // POST /vendors/:id/review
```

#### 5. **bookings.js** - Booking Management
```javascript
getMyBookings()                 // GET /bookings/my-bookings
getVendorBookings()             // GET /bookings/vendor-bookings
createBooking(data)             // POST /bookings
updateBooking(id, data)         // PUT /bookings/:id
updateStatus(id, status)        // PUT /bookings/:id/status
deleteBooking(id)               // DELETE /bookings/:id
syncBudget()                    // POST /bookings/sync-budget
```

#### 6. **budgets.js** - Budget Tracking
```javascript
getBudgets(weddingId)           // GET /budgets?weddingId=xxx
createBudget(data, weddingId)   // POST /budgets
updateBudget(id, data)          // PUT /budgets/:id
deleteBudget(id)                // DELETE /budgets/:id
getAlerts()                     // GET /budgets/alerts
```

#### 7. **tasks.js** - Task Management
```javascript
getTasks(weddingId)             // GET /tasks?weddingId=xxx
createTask(data, weddingId)     // POST /tasks
updateTask(id, data)            // PUT /tasks/:id
deleteTask(id)                  // DELETE /tasks/:id
```

#### 8. **events.js** - Event Management
```javascript
getEvents(weddingId)            // GET /events?weddingId=xxx
createEvent(data, weddingId)    // POST /events
updateEvent(id, data)           // PUT /events/:id
deleteEvent(id)                 // DELETE /events/:id
```

#### 9. **reminders.js** - Reminders
```javascript
getReminders()                  // GET /reminders
getRsvpReminders()              // GET /reminders/rsvp
sendDayBeforeReminders()        // POST /reminders/day-before
```

---

## Pages

### Authentication Pages

#### Login (`pages/auth/Login.jsx`)
- Email/password form
- Role-based redirect after login
- Rose/Light theme styling
- Form validation

#### Register (`pages/auth/Register.jsx`)
- User registration form
- Role selection (couple/vendor)
- Password validation
- Auto-login after registration

---

### Couple Pages

#### Dashboard (`pages/couple/Dashboard.jsx`)
- Overview cards (guests, budget, tasks)
- Recent activity
- Quick stats
- Wedding summary
- Integrated with WeddingContext

#### Wedding (`pages/couple/Wedding.jsx`)
- Create/edit wedding details
- Form fields: bride/groom names, date, venue, budget, theme
- Query parameter support: `?create=true`
- Auto-generate wedding hashtag
- **Fixed input focus bug** - form state properly managed

#### Guests (`pages/couple/Guests.jsx`)
- Guest list table with filtering
- Add/edit/delete guests
- RSVP status tracking
- Send email invitations
- Copy RSVP link functionality
- Stats: total, confirmed, pending, declined
- Category filter (family, friends, etc.)
- **Modal theme: Rose/Light**

#### Vendors (`pages/couple/Vendors.jsx`)
- Browse vendor directory
- Filter by category and location
- Search functionality
- View vendor profiles
- Send booking requests
- Vendor reviews/ratings

#### Bookings (`pages/couple/Bookings.jsx`)
- View all vendor bookings
- Track booking status
- Payment tracking (advance/balance)
- Booking details modal
- Status filters

#### Budgets (`pages/couple/Budgets.jsx`)
- Budget item management
- Category-wise tracking
- Estimated vs Actual cost comparison
- Sync with confirmed bookings
- Budget alerts for overspending
- Progress visualization
- **Modal theme: Rose/Pink gradient**

#### Tasks (`pages/couple/Tasks.jsx`)
- Task list with priority levels
- Due date tracking
- Completion status
- Filter by completion status
- Task categories

#### Events (`pages/couple/Events.jsx`)
- Event schedule management
- Multiple events per wedding
- Date/time/venue details
- Event descriptions
- Timeline view

#### Reminders (`pages/couple/Reminders.jsx`)
- RSVP reminders
- Pending guest notifications
- Day-before reminders
- Custom reminder creation

---

### Vendor Pages

#### Dashboard (`pages/vendor/Dashboard.jsx`)
- Booking statistics
- Revenue tracking
- Recent inquiries
- Spotlight card animation
- **Framer Motion animations**

#### Profile (`pages/vendor/Profile.jsx`)
- Business profile management
- Services listing
- Price range setup
- Location details
- Bento card layout
- **Fixed input focus bug** - FancyInput moved outside component
- **Edit/Save buttons: black text on colored bg**

#### Bookings (`pages/vendor/Bookings.jsx`)
- View booking requests
- Accept/reject bookings
- Update booking status
- Client information
- Revenue tracking

---

### Guest Pages

#### RSVP (`pages/guest/RSVP.jsx`)
- Public RSVP form (token-based)
- Guest information display
- RSVP status selection (confirmed/declined/maybe)
- Attendee count
- Dietary restrictions
- Special requests
- **Enhanced button visual feedback**:
  - 3px borders when selected
  - Shadow glow effect
  - 105% scale animation
  - Checkmark indicator

#### WeddingInfo (`pages/guest/WeddingInfo.jsx`)
- Public wedding details view
- Event schedule
- Venue information
- Wedding hashtag

---

### Public Pages

#### Home (`pages/public/Home.jsx`)
- Landing page
- Feature showcase
- Call-to-action buttons
- Marketing content

#### PublicWedding (`pages/public/PublicWedding.jsx`)
- Public wedding website
- Share with guests
- Event details
- Couple information

---

## Components

### Common Components

#### Header (`components/common/Header.jsx`)
- Navigation bar
- User profile dropdown
- **Wedding selector dropdown**
  - Switch between weddings
  - "Create New Wedding" button
  - Integrated with WeddingContext
- Logout functionality
- Responsive menu

#### Sidebar (`components/common/Sidebar.jsx`)
- Side navigation (if used)
- Role-based menu items

#### LoadingSpinner (`components/common/LoadingSpinner.jsx`)
- Reusable loading indicator
- Rose-themed spinner

---

### UI Components

#### Modal (`components/ui/Modal.jsx`)
- Generic modal component
- **Theme: Rose/Light with gradient background**
- Backdrop blur effect
- Fade-in/slide-up animations
- Close button
- Click outside to close

#### AlertModal (`components/ui/AlertModal.jsx`)
- Alert/confirmation dialogs
- **Type-specific themes**:
  - Success: Rose/pink bg with green icon & button
  - Error: Rose/pink bg with rose icon & button
  - Warning: Amber gradient
  - Info: Blue gradient
- **Button text: Black for better visibility**
- Confirm/Close actions
- Icon integration

#### Button (`components/ui/Button.jsx`)
- Styled button component
- Variants: primary, secondary, danger
- Loading state
- Disabled state

#### Card (`components/ui/Card.jsx`)
- Container component
- Shadow and border styling
- Hover effects

#### Input (`components/ui/Input.jsx`)
- Form input component
- Label and error message
- Validation states
- Focus styling

#### Badge (`components/ui/Badge.jsx`)
- Status indicator
- Color variants
- Size options

---

## Hooks

### Custom Hooks

#### useAuth (`hooks/useAuth.js`)
- Wrapper around AuthContext
- Returns auth state and methods
- Type-safe context consumption

#### useApi (`hooks/useApi.js`)
- API request wrapper
- Loading and error state management
- Automatic error handling

#### useLocalStorage (`hooks/useLocalStorage.js`)
- Persistent state in localStorage
- Automatic serialization
- SSR-safe

---

## Styling

### Theme System

**Primary Colors**:
- Rose: `#f43f5e` (rose-500)
- Pink: `#ec4899` (pink-500)
- Slate: Various shades for text

**Background**:
- Main: `bg-rose-50` (light pink/rose)
- Cards: `bg-white`
- Gradients: `from-rose-50 to-pink-50`

### Design Tokens

**Spacing**: Tailwind default spacing scale
**Typography**: 
- Headings: `font-serif font-bold`
- Body: `font-sans`
**Borders**: `border-rose-100` to `border-rose-300`
**Shadows**: `shadow-sm`, `shadow-lg`, `shadow-xl`

### Responsive Breakpoints
```css
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
2xl: 1536px  /* Extra large */
```

---

## Features

### 1. Multi-Wedding Support
- Users can create multiple weddings
- Dropdown selector in header
- Selected wedding persisted in localStorage
- All pages integrated with WeddingContext
- Wedding ID passed to all API calls

### 2. Authentication System
- JWT-based authentication
- Role-based access control (couple/vendor)
- Protected routes
- Auto-logout on token expiry
- Persistent login with localStorage

### 3. RSVP System
- Unique token per guest
- Public RSVP form (no login required)
- Email confirmations
- Enhanced button feedback
- Attendee count tracking
- Dietary restrictions

### 4. Budget Management
- Category-wise budget tracking
- Estimated vs Actual comparison
- Sync with confirmed bookings
- Budget alerts
- Visual progress indicators
- Rose-themed modals

### 5. Vendor Marketplace
- Public vendor directory
- Search and filter functionality
- Category browsing
- Vendor profiles with reviews
- Rating system
- Booking requests

### 6. Task Management
- Priority-based task list
- Due date tracking
- Completion status
- Task filtering
- Progress tracking

### 7. Event Management
- Multiple events per wedding
- Timeline visualization
- Event details (date, time, venue)
- Public event viewing

### 8. Email Integration
- RSVP invitations with unique links
- Confirmation emails
- Location included in emails
- Different handling for declined guests

### 9. Animations
- Framer Motion for smooth transitions
- Page transitions
- Modal animations (fade-in, slide-up)
- Button hover effects
- Loading states

### 10. Responsive Design
- Mobile-first approach
- Tablet and desktop layouts
- Responsive navigation
- Touch-friendly UI

---

## Recent Bug Fixes

### Critical Fixes

1. **Input Focus Bug** (Wedding.jsx, Vendor Profile.jsx)
   - **Issue**: Input fields lost focus after typing each character
   - **Cause**: useEffect re-rendering form on every keystroke
   - **Solution**: 
     - Moved `initialFormState` outside component
     - Changed useEffect dependency to `selectedWedding?._id`
     - Added condition to only update when wedding ID changes
     - Moved helper components outside main component

2. **White Screen on Direct Access**
   - **Issue**: App showed white screen when opening without login
   - **Cause**: WeddingContext trying to load weddings without auth token
   - **Solution**: Added auth token check before loading weddings

3. **Data Not Loading After Login**
   - **Issue**: Wedding data didn't load immediately after login
   - **Cause**: WeddingContext not listening to auth changes
   - **Solution**: 
     - Added custom 'authChange' event dispatch
     - WeddingContext listens for auth changes
     - Auto-reload weddings on login/logout

4. **Wedding Data Not Updating on Switch**
   - **Issue**: Switching weddings didn't update page data
   - **Cause**: Pages not re-fetching on wedding change
   - **Solution**: Added checks for `wedding._id` changes in useEffect

---

## Environment Setup

### Development

1. Install dependencies:
```bash
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

### Environment Variables

Create `.env` file (if needed):
```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Code Organization Best Practices

### Component Structure
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// 2. Helper components (outside main component)
const HelperComponent = ({ prop }) => <div>{prop}</div>;

// 3. Main component
const MyComponent = () => {
  // 4. Hooks
  const { user } = useAuth();
  const [state, setState] = useState(initialState);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 6. Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 7. Render
  return <div>Component content</div>;
};

// 8. Export
export default MyComponent;
```

### State Management Principles
- Use Context for global state (auth, wedding)
- Use local state for component-specific data
- Lift state up when shared between siblings
- Keep form state local unless needed globally

### API Call Patterns
```javascript
useEffect(() => {
  const fetchData = async () => {
    if (!wedding) return; // Guard clause
    
    try {
      setLoading(true);
      const data = await service.getData(wedding._id);
      setData(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [wedding?._id]); // Dependency on ID, not object
```

---

## Performance Optimizations

1. **Lazy Loading**
   - Code splitting with React.lazy()
   - Route-based code splitting

2. **Memoization**
   - useMemo for expensive calculations
   - useCallback for function references
   - React.memo for component optimization

3. **Image Optimization**
   - Lazy load images
   - Use appropriate image formats
   - Compress images

4. **Bundle Size**
   - Tree shaking enabled
   - Remove unused dependencies
   - Analyze bundle with Vite plugin

---

## Future Enhancements

- [ ] Photo gallery upload
- [ ] Drag-and-drop guest list import
- [ ] Calendar integration
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Vendor availability calendar
- [ ] Payment gateway integration
- [ ] Real-time chat with vendors
- [ ] Social media integration
- [ ] Guest list analytics

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
**Framework**: React 19.2.0
**Build Tool**: Vite 5.x
