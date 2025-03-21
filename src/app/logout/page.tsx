"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import { useDisconnect } from "wagmi";

const LogoutPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    dispatch(logout());
    disconnect();
    router.push("/");
  }, [dispatch, disconnect, router]);

  return null;
};

export default LogoutPage;
