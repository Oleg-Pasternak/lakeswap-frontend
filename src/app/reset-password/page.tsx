"use client";
import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/dispatch";
import {
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(forgotPassword(email));
      if (result.payload.message === "Reset code sent to your email") {
        setStep("code");
      } else {
        setError(
          "Failed to send verification code. Please check your email address.",
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError("Please enter the code.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const lowercaseCode = code.toLowerCase();
      const result = await dispatch(
        verifyResetCode({ email, code: lowercaseCode }),
      );
      if (result.payload.message === "Code verified") {
        setStep("password");
      } else if (result.payload.message === "Invalid or expired code") {
        setStep("email");
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setError("Invalid or expired code. Please start again.");
      } else {
        setError("Invalid verification code.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lowercaseCode = code.toLowerCase();
      const result = await dispatch(
        resetPassword({ email, code: lowercaseCode, newPassword }),
      );
      if (result.payload.message === "Password reset successfully") {
        setSuccess(true);
      } else if (result.payload.message === "Invalid or expired code") {
        setStep("email");
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setError("Invalid or expired code. Please start again.");
      } else {
        setError("Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <h1 className="text-2xl">Forgot Password</h1>
        </CardHeader>
        <CardBody className="gap-4">
          {success ? (
            <div className="text-center">
              <div className="flex items-center flex-col mt-10 mb-10">
                <Icon
                  className="text-6xl md:text-6xl mb-5 text-success"
                  color="success"
                  icon="qlementine-icons:success-32"
                />
                <p className="text-green-500 text-2xl">Password changed!</p>
                <p className="text-default-500 mb-3 mt-3 text-sm">
                  Your password has been successfully reset.
                </p>
              </div>
              <Button
                color="primary"
                className="w-full mt-5 mb-5"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </Button>
            </div>
          ) : step === "email" ? (
            <>
              <p className="text-default-500 mb-3 mt-3 text-base">
                Enter your email address to receive a verification code.
              </p>
              <Input
                type="email"
                label="Enter your e-mail address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="mt-3 mb-3"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                color="primary"
                className="w-full p-5"
                onClick={handleSendCode}
              >
                {loading ? <Spinner color="default" size="sm" /> : "Submit"}
              </Button>
            </>
          ) : step === "code" ? (
            <>
              <p className="text-default-500 mb-4">
                Check your email for the verification code and enter it below.
              </p>
              <Input
                type="text"
                label="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-5 mb-5"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                color="primary"
                className="w-full p-5"
                onClick={handleVerifyCode}
              >
                {loading ? (
                  <Spinner color="default" size="sm" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-default-500 mb-4">
                Enter your new password and confirm it.
              </p>
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-5"
              />
              <Input
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mb-5"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                color="primary"
                className="w-full p-5"
                onClick={handleResetPassword}
              >
                {loading ? (
                  <Spinner color="default" size="sm" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </>
          )}
          {!success && (
            <Link
              className="w-full mt-4 flex justify-center text-sm text-primary mt-14"
              href="/login"
            >
              Back to Login
            </Link>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
