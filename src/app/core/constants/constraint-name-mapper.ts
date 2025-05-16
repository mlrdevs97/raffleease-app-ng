/**
 * Maps constraint field paths to user-friendly error messages
 */
export const ConstraintFieldMessages: Record<string, string> = {
  'userData.email': 'This email is already registered',
  'userData.userName': 'This username is already taken',
  'userData.phoneNumber': 'This phone number is already registered',
  'associationData.associationName': 'This association name is already taken',
  'associationData.email': 'This email is already registered for another association',
  'associationData.phoneNumber': 'This phone number is already registered for another association'
}; 