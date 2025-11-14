import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import testAPI from '../../services/testAPI';

// Async thunks
export const fetchTests = createAsyncThunk(
  'tests/fetchTests',
  async (params, { rejectWithValue }) => {
    try {
      const response = await testAPI.getTests(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests');
    }
  }
);

export const fetchTestById = createAsyncThunk(
  'tests/fetchTestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await testAPI.getTestById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test');
    }
  }
);

export const createTest = createAsyncThunk(
  'tests/createTest',
  async (testData, { rejectWithValue }) => {
    try {
      const response = await testAPI.createTest(testData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create test');
    }
  }
);

export const startTestAttempt = createAsyncThunk(
  'tests/startTestAttempt',
  async (testId, { rejectWithValue }) => {
    try {
      const response = await testAPI.startTestAttempt(testId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start test');
    }
  }
);

export const submitTestAnswer = createAsyncThunk(
  'tests/submitTestAnswer',
  async ({ testId, answerData }, { rejectWithValue }) => {
    try {
      const response = await testAPI.submitTestAnswer(testId, answerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const finishTest = createAsyncThunk(
  'tests/finishTest',
  async ({ testId, attemptId }, { rejectWithValue }) => {
    try {
      const response = await testAPI.finishTest(testId, attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finish test');
    }
  }
);

const initialState = {
  tests: [],
  currentTest: null,
  currentAttempt: null,
  testAttempts: [],
  isLoading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTest: (state) => {
      state.currentTest = null;
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tests
      .addCase(fetchTests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tests = action.payload.tests;
        state.error = null;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch test by ID
      .addCase(fetchTestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTest = action.payload.test;
        state.error = null;
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create test
      .addCase(createTest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tests.unshift(action.payload.test);
        state.error = null;
      })
      .addCase(createTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Start test attempt
      .addCase(startTestAttempt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTestAttempt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAttempt = action.payload.attempt;
        state.error = null;
      })
      .addCase(startTestAttempt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit test answer
      .addCase(submitTestAnswer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitTestAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentAttempt) {
          state.currentAttempt = action.payload.attempt;
        }
        state.error = null;
      })
      .addCase(submitTestAnswer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Finish test
      .addCase(finishTest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finishTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAttempt = action.payload.attempt;
        state.error = null;
      })
      .addCase(finishTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTest, clearCurrentAttempt } = testSlice.actions;
export default testSlice.reducer;
