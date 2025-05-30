# Ticket Search Feature Implementation

This document describes the implementation of the specific ticket search feature in the order form component.

## Overview

The ticket search feature allows users to search for specific tickets by ticket number within a selected raffle. It follows the same pattern as the raffle search functionality but is specifically designed for ticket searching.

## Architecture

### Models
- **`Ticket`** (`src/app/core/models/ticket.model.ts`) - Interface matching the backend TicketDTO
- **`TicketStatus`** - Enum with values: AVAILABLE, RESERVED, SOLD
- **`TicketSearchFilters`** - Interface for search parameters

### Services
- **`TicketQueryService`** (`src/app/features/orders/services/ticket-query.service.ts`) - HTTP service for ticket API calls
- **`TicketSearchService`** (`src/app/features/orders/services/ticket-search.service.ts`) - Search management with debouncing and suggestions

### Components
- **`TicketSearchComponent`** (`src/app/features/orders/components/create-order/ticket-search/`) - Reusable search component with suggestions dropdown
- **`TicketsPreviewComponent`** (`src/app/features/orders/components/create-order/tickets-preview/`) - Reusable component for displaying selected tickets preview
- **`SpecificTicketSelectionComponent`** - Updated to integrate ticket search and preview functionality

## Features

### Search Functionality
- **Debounced search**: 300ms delay to avoid excessive API calls
- **Minimum search length**: 1 character (appropriate for ticket numbers)
- **Real-time suggestions**: Dropdown with matching tickets
- **Keyboard navigation**: Arrow keys and Enter support
- **Click outside to close**: Suggestions dropdown closes when clicking outside

### Ticket Preview
- **Specific Mode**: Shows selected ticket with details and status
- **Random Mode**: Shows list of selected random tickets (up to 5 displayed, with summary for more)
- **Status Indicators**: Color-coded status badges for each ticket
- **Clean UI**: Consistent styling with the rest of the application

### Validation
- **Raffle selection required**: Users must select a raffle before searching tickets
- **Clear error messages**: Informative messages for validation errors
- **Visual feedback**: Different ticket statuses are color-coded

### User Experience
- **Manual input toggle**: Users can switch between search and manual input modes
- **Selected ticket display**: Shows selected ticket with status information via preview component
- **Loading states**: Visual indicators during search operations
- **Error handling**: Graceful error handling with user feedback

## API Integration

The feature connects to the backend endpoint:
```
GET /v1/associations/{associationId}/raffles/{raffleId}/tickets
```

### Query Parameters
- `ticketNumber`: Partial or full ticket number for search
- `page`, `size`, `sort`: Pagination and sorting parameters
- `status`, `customerId`: Additional filters (available but not used in this implementation)

### Response
Returns a paginated response with ticket data matching the `TicketDTO` structure from the backend.

## Usage Flow

1. **Raffle Selection**: User must first select a raffle in the raffle selection component
2. **Ticket Search**: Once raffle is selected, user can search for tickets by number
3. **Suggestion Selection**: User can select from dropdown suggestions or type manually
4. **Preview Display**: Selected tickets are shown in the tickets preview component
5. **Form Submission**: Selected ticket number is set in the form for order creation

## Implementation Notes

### Dependencies
- Follows the same pattern as `RaffleSearchService` and `RafflesSearchComponent`
- Uses Angular signals for reactive state management
- Integrates with existing form validation system
- Uses TailwindCSS for styling consistency

### Component Architecture
- **Separation of Concerns**: Preview logic is extracted into `TicketsPreviewComponent`
- **Reusable Components**: Both search and preview components can be reused
- **Clean Interfaces**: Components communicate via well-defined inputs and outputs

### Error Handling
- Network errors are caught and displayed appropriately
- Loading states are properly managed
- Validation prevents search without raffle selection

### Performance Considerations
- Debounced search reduces API calls
- Results are limited to 10 suggestions
- Subscriptions are properly cleaned up to prevent memory leaks
- Preview component efficiently handles both single and multiple ticket displays

## Testing Considerations

To test this feature:
1. Ensure a raffle is selected before attempting ticket search
2. Verify search works with partial ticket numbers
3. Test keyboard navigation in suggestions dropdown
4. Confirm error handling when no raffle is selected
5. Validate form submission with selected tickets
6. Test ticket preview display for both specific and random modes
7. Verify status indicators are correctly color-coded 