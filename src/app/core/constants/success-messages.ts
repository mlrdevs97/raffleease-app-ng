/**
 * Success messages used across the application
 */
export const SuccessMessages = {
  /**
   * Authentication success messages
   */
  auth: {
    emailVerified: 'Your email has been verified successfully. You can now log in.',
    passwordReset: 'Your password has been reset successfully. You can now log in with your new password.',
    passwordResetRequested: 'Password reset link has been sent to your email. Please check your inbox.',
    accountCreated: 'Your account has been created successfully. Please check your email to verify your account.'
  },
  
  /**
   * User profile success messages
   */
  profile: {
    updated: 'Your profile has been updated successfully.',
    emailUpdateRequested: 'Please check your email and click the verification link to complete the email update',
    emailUpdated: 'Your email address has been updated successfully',
    phoneUpdated: 'Phone number updated successfully',
    passwordChanged: 'Your password has been changed successfully.'
  },

  /**
   * User management success messages
   */
  userManagement: {
    roleUpdated: 'User role updated successfully!',
    statusUpdated: 'User status updated successfully!',
    userCreated: 'User account created successfully!',
    userDeleted: 'User account deleted successfully!'
  },
  
  /**
   * Transaction success messages
   */
  transaction: {
    completed: 'Your transaction has been completed successfully.',
    orderPlaced: 'Your order has been placed successfully.'
  },

  /**
   * Raffle success messages
   */
  raffle: {
    created: 'Your raffle has been created successfully.',
    updated: 'Your raffle has been updated successfully.',
    deleted: 'Your raffle has been deleted successfully.',
    activated: 'Your raffle has been activated successfully.',
    paused: 'Your raffle has been paused successfully.',
    reactivated: 'Your raffle has been reactivated successfully.'
  },

  /**
   * Ticket success messages
   */
  tickets: {
    added: 'Ticket added to your selection successfully.',
    addedMultiple: (count: number) => `Successfully added ${count} random ticket${count !== 1 ? 's' : ''} to your order`,
    removed: 'Ticket removed from your selection.'
  },

  /**
   * Order success messages
   */
  order: {
    created: 'Your order has been created successfully.',
    completed: 'Your order has been completed successfully.',
    cancelled: 'Your order has been cancelled successfully.',
    setUnpaid: 'Order has been set to unpaid successfully.',
    refunded: 'Order has been refunded successfully.'
  }
}; 