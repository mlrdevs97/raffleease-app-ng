/**
 * Confirmation dialog messages used across the application
 */
export const ConfirmationMessages = {
  /**
   * Raffle confirmation messages
   */
  raffle: {
    confirmActivation: {
      title: 'Activate Raffle',
      message: 'Are you sure you want to activate this raffle? Once activated, customers will be able to purchase tickets and the raffle cannot be edited.',
      confirmText: 'Activate Raffle',
      cancelText: 'Cancel'
    },
    confirmPause: {
      title: 'Pause Raffle',
      message: 'Are you sure you want to pause this raffle? Customers will not be able to purchase tickets while the raffle is paused.',
      confirmText: 'Pause Raffle',
      cancelText: 'Cancel'
    },
    confirmReactivation: {
      title: 'Reactivate Raffle',
      message: 'Are you sure you want to reactivate this raffle? Customers will be able to purchase tickets again.',
      confirmText: 'Reactivate Raffle',
      cancelText: 'Cancel'
    }
  },

  /**
   * Order confirmation messages
   */
  order: {
    confirmCompletion: {
      title: 'Complete Order',
      message: 'Are you sure you want to complete this order?',
      confirmText: 'Complete Order',
      cancelText: 'Cancel'
    },
    confirmCancellation: {
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Order'
    },
    confirmSetUnpaid: {
      title: 'Set Order to Unpaid',
      message: 'Are you sure you want to set this order to unpaid?',
      confirmText: 'Set to Unpaid',
      cancelText: 'Cancel',
      variant: 'warning' as const
    }
  },

  /**
   * Comment confirmation messages
   */
  comment: {
    confirmEdit: {
      title: 'Edit Comment',
      message: 'Are you sure you want to update this comment?',
      confirmText: 'Update',
      cancelText: 'Cancel',
      variant: 'default' as const
    },
    confirmDelete: {
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive' as const
    }
  }
} as const; 