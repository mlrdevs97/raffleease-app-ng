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
    accountCreated: 'Your account has been created successfully. Please check your email to verify your account.'
  },
  
  /**
   * User profile success messages
   */
  profile: {
    updated: 'Your profile has been updated successfully.',
    passwordChanged: 'Your password has been changed successfully.'
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
    activated: 'Your raffle has been activated successfully and is now available for ticket sales.',
    paused: 'Your raffle has been paused successfully. Ticket sales are now suspended.',
    reactivated: 'Your raffle has been reactivated successfully. Ticket sales have resumed.'
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