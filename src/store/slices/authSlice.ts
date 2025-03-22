import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { addToast } from "@heroui/react";

interface User {
  email?: string;
  avatar?: string;
  walletAddresses?: string[];
}

interface AuthState {
  auth: unknown;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  auth: undefined,
};

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    const token = Cookies.get("token");
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.user;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        Cookies.remove("token");
      }
      return rejectWithValue(
        axiosError.response?.data || "Failed to fetch user profile",
      );
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup`,
        credentials,
      );
      Cookies.set("token", response.data.token, { expires: 1 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || "Signup failed");
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`,
        credentials,
      );
      Cookies.set("token", response.data.token, { expires: 1 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || "Login failed");
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forgot-password`,
        { email },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        axiosError.response?.data || "Forgot password failed",
      );
    }
  },
);

export const verifyResetCode = createAsyncThunk(
  "forgotPassword/verifyResetCode",
  async (credentials: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-code`,
        {
          email: credentials.email,
          code: credentials.code,
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid verification code",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    credentials: { email: string; code: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reset-password`,
        credentials,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        axiosError.response?.data || "Reset password failed",
      );
    }
  },
);

export const authWithGoogle = createAsyncThunk(
  "auth/authWithGoogle",
  async (credentials: { token: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`,
        credentials,
      );
      Cookies.set("token", response.data.token, { expires: 1 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || "Google auth failed");
    }
  },
);

export const authWithWallet = createAsyncThunk(
  "auth/authWithWallet",
  async (
    credentials: { message: string; address: string; signature: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/wallet`,
        credentials,
      );
      Cookies.set("token", response.data.token, { expires: 1 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        try {
          const signupResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup/wallet`,
            credentials,
          );
          Cookies.set("token", signupResponse.data.token, { expires: 1 });
          return signupResponse.data;
        } catch (signupError) {
          const signupAxiosError = signupError as AxiosError;
          return rejectWithValue(
            signupAxiosError.response?.data || "Wallet auth failed",
          );
        }
      }
      return rejectWithValue(axiosError.response?.data || "Wallet auth failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      Cookies.remove("token");
    },
    clearError(state) {
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signup.fulfilled,
        (state, action: PayloadAction<{ email: string; token: string }>) => {
          state.user = { email: action.payload.email };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message || "Signup failed";
        const errorMessage =
          (action.payload as { message: string })?.message || "Signup failed";
        state.error = errorMessage;
        addToast({
          title: "Signup Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ email: string; token: string }>) => {
          state.user = { email: action.payload.email };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message || "Login failed";
        const errorMessage =
          (action.payload as { message: string })?.message || "Login failed";
        state.error = errorMessage;
        addToast({
          title: "Login Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Forgot password failed";
        const errorMessage =
          (action.payload as { message: string })?.message ||
          "Forgot password failed";
        state.error = errorMessage;
        addToast({
          title: "Forgot Password Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Reset code verification failed";
        const errorMessage =
          (action.payload as { message: string })?.message ||
          "Reset code verification failed";
        state.error = errorMessage;
        addToast({
          title: "Reset Code Verification Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Reset password failed";
        const errorMessage =
          (action.payload as { message: string })?.message ||
          "Reset password failed";
        state.error = errorMessage;
        addToast({
          title: "Reset Password Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(authWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        authWithGoogle.fulfilled,
        (state, action: PayloadAction<{ email: string; token: string }>) => {
          state.user = { email: action.payload.email };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(authWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Google auth failed";
        const errorMessage =
          (action.payload as { message: string })?.message ||
          "Google auth failed";
        state.error = errorMessage;
        addToast({
          title: "Google Auth Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(authWithWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        authWithWallet.fulfilled,
        (
          state,
          action: PayloadAction<{ walletAddresses: string[]; token: string }>,
        ) => {
          state.user = { walletAddresses: action.payload.walletAddresses };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(authWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Wallet auth failed";
        const errorMessage =
          (action.payload as { message: string })?.message ||
          "Wallet auth failed";
        state.error = errorMessage;
        addToast({
          title: "Wallet Auth Failed",
          description: errorMessage,
          color: "danger",
        });
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to fetch user profile";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
