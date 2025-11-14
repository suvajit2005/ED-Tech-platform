import api from './api';

const paymentAPI = {
  // Create payment order for course purchase
  createOrder: (orderData) => api.post('/payments/create-order', orderData),
  
  // Verify payment
  verifyPayment: (verificationData) => api.post('/payments/verify', verificationData),
  
  // Create teacher subscription payment
  createTeacherSubscription: (subscriptionData) => 
    api.post('/payments/teacher-subscription', subscriptionData),
  
  // Get payment history
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  
  // Get revenue analytics (Admin only)
  getRevenueAnalytics: (params) => api.get('/payments/revenue', { params }),
  
  // Process refund (Admin only)
  processRefund: (refundData) => api.post('/payments/refund', refundData),
};

export default paymentAPI;
