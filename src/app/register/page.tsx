"use client";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Alert } from "@heroui/alert";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { signup, signupWithWallet, clearError } from "@/store/slices/authSlice";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Web3 from "web3";

const useSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const errorState = useAppSelector((state) => state.auth.error);
  const loading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (errorState) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [errorState]);

  const handleSignUp = async () => {
    try {
      // Validate that email and password are provided
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      await dispatch(signup({ email, password }));
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    }
  };

  const handleWalletSignUp = async () => {
    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install it to continue.",
        );
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const walletAddress = accounts[0];

      if (!walletAddress) {
        throw new Error("No wallet address found. Please connect your wallet.");
      }
      const message = `Sign this message to sign up: ${Date.now()}`;
      const signedMessage = await web3.eth.personal.sign(
        message,
        walletAddress,
        "",
      );
      await dispatch(
        signupWithWallet({ message, walletAddress, signature: signedMessage }),
      );

      // Clear any previous errors
      setError("");
    } catch (err: any) {
      // Handle errors and display a user-friendly message
      setError(err.message || "An error occurred during wallet sign-up.");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSignUp,
    handleWalletSignUp,
    error,
    errorState,
    loading,
  };
};

export default function SignUpPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSignUp,
    handleWalletSignUp,
    error,
    errorState,
    loading,
  } = useSignUp();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="flex justify-start">
          <h1 className="text-2xl">Sign Up</h1>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            isRequired
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type={isVisible ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            isRequired
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            color="primary"
            className="w-full mt-4 p-6"
            onClick={handleSignUp}
          >
            {loading ? <Spinner color="default" size="sm" /> : "Sign Up"}
          </Button>
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">OR</p>
            <Divider className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              startContent={<Icon icon="famicons:wallet-outline" width={24} />}
              variant="bordered"
              className="w-full p-5"
              onClick={handleWalletSignUp}
            >
              Sign Up with Wallet
            </Button>
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
              className="w-full p-5"
            >
              Continue with Google
            </Button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 mb-3">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
      <div
        className={
          errorState
            ? "fixed bottom-6 right-6 w-80 opacity-100 transition-opacity duration-300"
            : "fixed bottom-6 right-6 w-80 opacity-0 transition-opacity duration-300"
        }
      >
        <Alert color="danger" title={errorState} />
      </div>
    </div>
  );
}
