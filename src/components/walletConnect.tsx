import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Code, Spinner, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAccount, useSignMessage, useConnect } from "wagmi";
import { loginWithWallet, signupWithWallet } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/hooks/dispatch";
import { useRouter } from "next/navigation";

interface ConnectWalletProps {
  className: string;
  error: string | null;
  login?: boolean | null;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({
  error,
  className,
  login,
}) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connectors, connect } = useConnect();
  const [justConnected, setJustConnected] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isSignatureRequest, setIsSignatureRequest] = useState(false);
  const [isSignatureSuccess, setIsSignatureSuccess] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsMetaMaskInstalled(
      typeof window !== "undefined" &&
        window.ethereum &&
        window.ethereum.isMetaMask,
    );
  }, []);

  const handleWallet = useCallback(
    async (con: (typeof connectors)[number]) => {
      connect({ connector: con });
      setJustConnected(true);
    },
    [connect],
  );

  const handleWalletConnect = useCallback(async () => {
    if (!isConnected || !address || !justConnected) return;
    try {
      setIsSignatureRequest(true);
      const message = `Sign ${login ? "in" : "up"} with your wallet. Timestamp: ${new Date().toISOString()}`;
      const signature = await signMessageAsync({ message });
      const resultAction = await dispatch(
        login
          ? loginWithWallet({ message, address, signature })
          : signupWithWallet({ message, address, signature }),
      );
      setJustConnected(false);
      if (loginWithWallet.fulfilled.match(resultAction)) {
        setIsSignatureSuccess(true);
        setIsSignatureRequest(false);
        setTimeout(() => router.push("/"), 2000);
      } else {
        console.error("Login failed:", resultAction.payload);
      }
    } catch (err) {
      console.error(err);
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        color: "danger",
      });
      setIsSignatureRequest(false);
    }
  }, [isConnected, address, justConnected]);

  useEffect(() => {
    handleWalletConnect();
  }, [handleWalletConnect]);

  const renderWalletButtons = () => (
    <>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {connectors.map((connector, index) => (
        <Button
          key={index}
          onClick={() => handleWallet(connector)}
          className="flex items-center justify-between w-full min-h-16 p-2 md:p-6"
          size="lg"
          variant="bordered"
        >
          <div className="flex items-center">
            <Icon
              className={`text-${index === 1 ? 3 : 4}xl mr-3 min-w-9`}
              icon={
                index === 1
                  ? "logos:metamask-icon"
                  : index === 2
                    ? "token-branded:coinbase"
                    : "token-branded:wallet-connect"
              }
            />
            <span className="font-bold text-sm md:text-lg">
              {index === 1
                ? "MetaMask"
                : index === 2
                  ? "Coinbase"
                  : "WalletConnect"}
            </span>
          </div>
          {index === 1 && isMetaMaskInstalled && (
            <Code size="sm" color="success">
              Installed
            </Code>
          )}
          {index === 0 && (
            <Code size="sm" color="default">
              QR code
            </Code>
          )}
        </Button>
      ))}
    </>
  );

  return (
    <div
      className={`flex-col item-start justify-start space-y-4 w-auto mb-5 ${className}`}
    >
      {!isSignatureRequest && !isSignatureSuccess && renderWalletButtons()}
      {isSignatureRequest && (
        <div className="flex justify-center items-center h-full mt-20 mb-32">
          <Spinner
            size="lg"
            color="success"
            label="Verify your Signature"
            labelColor="success"
          />
        </div>
      )}
      {isSignatureSuccess && (
        <div className="flex flex-col justify-center items-center h-full mt-10 md:mt-20 mb-16 md:mb-32">
          <Icon
            className="text-6xl md:text-6xl mb-5 text-success"
            color="success"
            icon="qlementine-icons:success-32"
          />
          <div className="text-xl md:text-2xl font-bold text-success">
            Signature Verified
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
