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
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasRequiredChars =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/.test(password);
    return {
      isValid: hasMinLength && hasRequiredChars,
      checks: {
        length: hasMinLength,
        complexity: hasRequiredChars,
      },
    };
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
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
      setError("Verification code is required");
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
    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError("Password does not meet requirements.");
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

  const toggleVisibility = () => setIsVisible(!isVisible);

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
                label="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="mt-3 mb-3"
                isInvalid={!!error && !email}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                color="primary"
                className="w-full p-5"
                onClick={handleSendCode}
              >
                {loading ? <Spinner color="default" size="sm" /> : "Continue"}
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
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                className="mt-5 mb-5"
                isInvalid={!!error && !code}
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
                type={isVisible ? "text" : "password"}
                label="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                className="mt-5"
                isInvalid={
                  !!error &&
                  (!newPassword || !validatePassword(newPassword).isValid)
                }
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
              <div
                className={`text-sm space-y-1 transition-all duration-300 overflow-hidden ${
                  newPassword ? "max-h-40" : "max-h-0"
                }`}
              >
                <div className="flex items-center">
                  <Icon
                    icon={
                      newPassword.length >= 8
                        ? "mdi:check-circle"
                        : "mdi:circle-outline"
                    }
                    className={`mr-2 ${
                      newPassword.length >= 8
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center">
                  <Icon
                    icon={
                      /^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword)
                        ? "mdi:check-circle"
                        : "mdi:circle-outline"
                    }
                    className={`mr-2 ${
                      /^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword)
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span>Contains a number and special character</span>
                </div>
              </div>
              <Input
                type={isVisible ? "text" : "password"}
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className="mb-5"
                isInvalid={
                  !!error &&
                  (!confirmPassword || newPassword !== confirmPassword)
                }
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                color="primary"
                className="w-full p-5"
                onClick={handleResetPassword}
                disabled={!validatePassword(newPassword).isValid}
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
