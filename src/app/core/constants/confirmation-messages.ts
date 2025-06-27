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
    },
    confirmDeletion: {
      title: 'Delete Raffle',
      message: 'Are you sure you want to delete this raffle? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive' as const
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
    },
    confirmRefund: {
      title: 'Refund Order',
      message: 'Are you sure you want to refund this order?',
      confirmText: 'Refund Order',
      cancelText: 'Cancel',
      variant: 'destructive' as const
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
  },

  /**
   * Profile confirmation messages
   */
  profile: {
    confirmProfileUpdate: {
      title: 'Update Profile',
      message: 'Are you sure you want to update your profile information?',
      confirmText: 'Update Profile',
      cancelText: 'Cancel',
      variant: 'default' as const
    },
    confirmEmailUpdate: {
      title: 'Update Email Address',
      message: 'Are you sure you want to update your email address? You will receive a verification email at the new address.',
      confirmText: 'Update Email',
      cancelText: 'Cancel',
      variant: 'warning' as const
    },
    confirmPhoneUpdate: {
      title: 'Update Phone Number',
      message: 'Are you sure you want to update your phone number?',
      confirmText: 'Update Phone',
      cancelText: 'Cancel',
      variant: 'default' as const
    },
    confirmPasswordUpdate: {
      title: 'Update Password',
      message: 'Are you sure you want to update your password? You will need to use the new password for future logins.',
      confirmText: 'Update Password',
      cancelText: 'Cancel',
      variant: 'warning' as const
    }
  }
} as const; 