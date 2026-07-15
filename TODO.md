# AI-Actionable TODO List

## Frontend Tasks

### User Form
- [x] **Fix User Form Margins:** The form's internal spacing is incorrect. The goal is to have a uniform `20px` padding around the entire form content within the modal.
  - **File:** `src/app/page.tsx`
  - **Action:** Ensure the container holding `<UserForm />` has the correct padding class (e.g., `p-5` in Tailwind).
  - **File:** `src/styles/stepper.css`
  - **Action:** Verify that no unwanted margins are being applied to `.step-default` or its children that could interfere with the container's padding.

### Header Component
- [x] **Adjust Header Button Colors:** The buttons in the header do not match the application's color palette.
  - **File:** `src/components/pills-nav.tsx` (or its associated CSS)
  - **Action:** Update the background, text, and hover state colors of the navigation buttons ("Crear Usuario", "Estadísticas") to align with the project's design system.

- [x] **Adjust Header Greeting and Clock Style:** The greeting and clock in the header need to be larger and use the custom "Queering" font.
  - **File:** `src/components/header.tsx`
  - **Action:** Increase the font size of the "Hola, Mila" greeting. Apply the `font-queering` class.
  - **File:** `src/components/clock.tsx`
  - **Action:** Increase the font size of the clock display. Apply the `font-queering` class.

### User Table Actions
- [x] **Fix User View/Edit Buttons:** The buttons for viewing and editing a user in the user list are not triggering the correct dialogs.
  - **File:** `src/components/user-table.tsx` or `src/components/user-card.tsx` (wherever the buttons are defined).
  - **Action:** Debug the `onClick` handlers for the "View" and "Edit" buttons. Ensure that `setSelectedUser` and `setIsEditModalOpen` / `setIsDetailModalOpen` are being called with the correct user data and state updates. Verify that the modals are correctly bound to these state variables in `src/app/page.tsx`.
