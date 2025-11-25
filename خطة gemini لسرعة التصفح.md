Implementation Plan - Navigation Experience Improvements
Goal
Improve the user experience when navigating from the sidebar. The goal is to achieve:

Immediate visual feedback on the clicked button.
Immediate page transition with a "Loading..." state while data is fetched.
Eliminate the 4-second delay before any response.
User Review Required
None
Proposed Changes
1. Route Group & Layout Refactor (The "Shell" Strategy)
[NEW] src/app/(dashboard)/layout.tsx:
Create a persistent layout that wraps all authenticated pages.
This ensures the Sidebar never unmounts during navigation.
Move 
Sidebar
 component here.
[NEW] src/app/(dashboard)/loading.tsx:
Create a loading state that shows a spinner inside the content area immediately.
This replaces the "4-second freeze" with an instant "Loading..." indicator.
2. Sidebar Optimization (Immediate Feedback)
[MODIFY] 
src/components/shared/Sidebar.tsx
:
Implement useTransition: Use React's useTransition hook to track pending navigation.
Visual Feedback: Add a visual indicator (e.g., opacity change or mini-spinner) to the clicked link immediately when isPending is true.
Prefetching: Verify Link prefetching is active.
Note: useLinkStatus is not yet standard in Next.js 15.0.0, so we will use the robust useTransition approach.
3. Page Migration (The "Lift & Shift")
Move the following authenticated pages into src/app/(dashboard)/:
dashboard, students, users, programs, teacher-requests
academic-reports, attendance, unified-assessment
daily-grades, weekly-grades, monthly-grades
behavior-grades, behavior-points, final-exam
enrolled-students, enrollment, my-attendance
my-grades, daily-tasks, settings
Note: login and 
page.tsx
 (landing) remain outside.
[MODIFY] Moved Pages:
Remove <Sidebar /> from each page (it's now in the layout).
Remove outer layout wrappers (handled by parent layout).
4. Suspense Boundaries (Progressive Loading)
[OPTIONAL] For heavy pages (like students or dashboard), wrap the main content in a <Suspense> boundary with a custom skeleton if the global loading.tsx is too generic. We will start with the global loading.tsx first.
Verification Plan
Manual Verification
Click sidebar links (e.g., Students, Teachers).
Verify the button becomes active immediately.
Verify the "Loading..." text appears immediately.
Verify the data appears after the fetch completes.