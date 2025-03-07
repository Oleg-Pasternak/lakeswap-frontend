import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Code, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAccount, useSignMessage, useConnect } from "wagmi";
import { loginWithWallet, signupWithWallet } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/hooks/dispatch";
import { useRouter } from "next/navigation";

interface ConnectWalletProps {
  className: string;
  error: string | null;
  login?: boolean | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({
  error,
  className,
  login,
  setError,
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

  const handleWallet = async (con: (typeof connectors)[number]) => {
    connect({ connector: con });
    setJustConnected(true);
  };

  useEffect(() => {
    if (isConnected && address && justConnected) {
      const handleWalletConnect = async () => {
        try {
          setIsSignatureRequest(true);
          const message = `Sign ${login ? "in" : "up"} with your wallet. Timestamp: ${new Date().toISOString()}`;
          const signature = await signMessageAsync({ message });
          let resultAction;
          if (login) {
            resultAction = await dispatch(
              loginWithWallet({ message, address, signature }),
            );
          } else {
            resultAction = await dispatch(
              signupWithWallet({ message, address, signature }),
            );
          }
          setJustConnected(false);
          if (loginWithWallet.fulfilled.match(resultAction)) {
            setIsSignatureSuccess(true);
            setIsSignatureRequest(false);
            setTimeout(() => {
              router.push("/");
            }, 2000);
          } else {
            console.error("Login failed:", resultAction.payload);
          }
        } catch (err) {
          setError(
            `${login ? "Login" : "Sign-up"} failed or user denied access`,
          );
          console.error(err);
        }
      };
      handleWalletConnect();
    }
  }, [isConnected, address, justConnected]);

  return (
    <div
      className={`flex-col item-start justify-start space-y-4 w-auto mb-5  ${className}`}
    >
      {!isSignatureRequest && !isSignatureSuccess && (
        <>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            onClick={() => handleWallet(connectors[1])}
            className="flex items-center justify-between w-full min-h-16"
            size="lg"
            variant="bordered"
          >
            <div className="flex items-center">
              <Icon
                className="text-3xl mr-3 min-w-9"
                icon="logos:metamask-icon"
              />
              <span className="font-bold">MetaMask</span>
            </div>
            {isMetaMaskInstalled && (
              <Code size="sm" color="success">
                Installed
              </Code>
            )}
          </Button>
          <Button
            onClick={() => handleWallet(connectors[2])}
            className="flex items-center justify-between w-full min-h-16"
            size="lg"
            variant="bordered"
          >
            <div className="flex items-center">
              <Icon
                className="text-4xl mr-3 min-w-9"
                icon="token-branded:coinbase"
              />
              <span className="font-bold">Coinbase</span>
            </div>
          </Button>

          <Button
            onClick={() => handleWallet(connectors[0])}
            className="flex items-center justify-between w-full min-h-16"
            size="lg"
            variant="bordered"
          >
            <div className="flex items-center">
              <Icon
                className="text-4xl mr-3 min-w-9"
                icon="token-branded:wallet-connect"
              />
              <span className="font-bold">WalletConnect</span>
            </div>
            <Code size="sm" color="default">
              QR code
            </Code>
          </Button>
        </>
      )}
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
        <div className="flex flex-col justify-center items-center h-full mt-20 mb-32">
          <Icon
            className="text-6xl mb-5 text-success"
            color="success"
            icon="qlementine-icons:success-32"
          />
          <div className="text-2xl font-bold text-success">
            Signature Verified
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
