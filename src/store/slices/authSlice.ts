import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

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

export const signupWithWallet = createAsyncThunk(
  "auth/signupWithWallet",
  async (
    credentials: { message: string; address: string; signature: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup/wallet`,
        credentials,
      );
      Cookies.set("token", response.data.token, { expires: 1 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        axiosError.response?.data || "Wallet signup failed",
      );
    }
  },
);

export const loginWithWallet = createAsyncThunk(
  "auth/loginWithWallet",
  async (
    credentials: { address: string; signature: string; message: string },
    { rejectWithValue },
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
      return rejectWithValue(
        axiosError.response?.data || "Wallet login failed",
      );
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
      })
      .addCase(signupWithWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signupWithWallet.fulfilled,
        (
          state,
          action: PayloadAction<{ walletAddresses: string[]; token: string }>,
        ) => {
          state.user = { walletAddresses: action.payload.walletAddresses };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(signupWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Wallet signup failed";
      })
      .addCase(loginWithWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginWithWallet.fulfilled,
        (
          state,
          action: PayloadAction<{ walletAddresses: string[]; token: string }>,
        ) => {
          state.user = { walletAddresses: action.payload.walletAddresses };
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Wallet login failed";
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
