import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { fetchUserProfile } from "@/store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return { user, loading, error };
};
