import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentAPI from '../../services/paymentAPI';

// Async thunks
export const createPaymentOrder = createAsyncThunk(
  'payments/createPaymentOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPayment(verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchPaymentHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

export const createTeacherSubscription = createAsyncThunk(
  'payments/createTeacherSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createTeacherSubscription(subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

const initialState = {
  currentOrder: null,
  payments: [],
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment order
      .addCase(createPaymentOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = null;
        state.payments.unshift(action.payload.payment);
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch payment history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create teacher subscription
      .addCase(createTeacherSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeacherSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(createTeacherSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
