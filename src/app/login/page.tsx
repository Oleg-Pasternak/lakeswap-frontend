"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Alert, Checkbox } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { login, loginWithWallet, clearError } from "@/store/slices/authSlice";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Web3 from "web3";
import ConnectWallet from "@/components/walletConnect";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isWalletVisible, setIsWalletVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.error);
  const loading = useAppSelector((state) => state.auth.loading);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 4;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setLoginError("Password must be at least 4 characters long.");
      return;
    }
    try {
      setLoginError("");
      await dispatch(login({ email, password }));
    } catch (err) {
      setLoginError("An unexpected error occurred.");
    }
  };

  const handleWalletDisplay = () => {
    setIsWalletVisible(!isWalletVisible);
    setLoginError("");
  };

  const handleWalletLogin = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const walletAddress = accounts[0];
        const message = `Sign this message to log in: ${walletAddress}`;
        const signature = await web3.eth.personal.sign(
          message,
          walletAddress,
          "",
        );
        await dispatch(loginWithWallet({ message, walletAddress, signature }));
      } catch (err) {
        setLoginError("Login failed or user denied access");
        console.error(err);
      }
    } else {
      setLoginError("MetaMask is not installed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md p-4 transition-all duration-300">
        <CardHeader className="flex justify-start">
          {isWalletVisible && (
            <Icon
              onClick={() => {
                handleWalletDisplay();
              }}
              icon="weui:back-filled"
              className="text-2xl mr-4 cursor-pointer"
            />
          )}
          <h1 className="text-2xl">
            {isWalletVisible ? "Connect Wallet" : "Sign In"}
          </h1>
        </CardHeader>
        <CardBody className="gap-4">
          <div
            className={`relative flex w-full flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased gap-4 transition-all duration-300 ${
              isWalletVisible
                ? "opacity-0 -translate-x-full h-0"
                : "opacity-100 translate-x-0"
            }`}
          >
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type={isVisible ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="ph:eye-closed-light"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="ion:eye-outline"
                    />
                  )}
                </button>
              }
            />
            <div className="flex w-full items-center justify-between px-1 py-2">
              <Checkbox name="remember" size="sm">
                Remember me
              </Checkbox>
              <Link className="text-default-500 text-sm" href="#">
                Forgot password?
              </Link>
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <Button
              color="primary"
              className="w-full p-5"
              onClick={handleLogin}
            >
              {loading ? <Spinner color="default" size="sm" /> : "Sign In"}
            </Button>
            <div className="flex items-center gap-4 py-2">
              <Divider className="flex-1" />
              <p className="shrink-0 text-tiny text-default-500">OR</p>
              <Divider className="flex-1" />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                startContent={
                  <Icon icon="famicons:wallet-outline" width={24} />
                }
                variant="bordered"
                className="w-full p-5"
                onClick={handleWalletDisplay}
              >
                Connect Wallet
              </Button>
              <Button
                startContent={
                  <Icon icon="flat-color-icons:google" width={24} />
                }
                variant="bordered"
                className="w-full p-5"
              >
                Continue with Google
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-3 mb-3">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <ConnectWallet
            handleWallet={handleWalletLogin}
            className={
              isWalletVisible
                ? " transition-transform duration-300 opacity-1 transition-all"
                : "transition-all duration-300 hidden"
            }
            error={loginError}
          />
        </CardBody>
      </Card>
      <div
        className={
          error
            ? "fixed bottom-6 right-6 w-80 opacity-100 transition-opacity duration-300"
            : "fixed bottom-6 right-6 w-80 opacity-0 transition-opacity duration-300"
        }
      >
        <Alert color="danger" title={error} />
      </div>
    </div>
  );
}
