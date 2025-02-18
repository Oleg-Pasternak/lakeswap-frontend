import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

interface ConnectWalletProps {
  handleWallet: (wallet: string) => void;
  className: string;
  error: string | null;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({
  handleWallet,
  error,
  className,
}) => {
  const [installedWallets, setInstalledWallets] = useState<string[]>([]);

  useEffect(() => {
    const detectWallets = () => {
      const wallets = [];
      if (typeof window.ethereum !== "undefined") {
        if (window.ethereum.isMetaMask) wallets.push("MetaMask");
        if (window.ethereum.isTrust) wallets.push("Trust Wallet");
        if (window.ethereum.isCoinbaseWallet) wallets.push("Coinbase Wallet");
      }
      setInstalledWallets(wallets);
    };

    detectWallets();
  }, []);

  return (
    <div
      className={`flex-col item-start justify-start space-y-4 w-auto mb-5  ${className}`}
    >
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        onClick={() => handleWallet("MetaMask")}
        className="flex items-center justify-between w-full"
        color={installedWallets.includes("MetaMask") ? "success" : "default"}
        size="lg"
        variant={installedWallets.includes("MetaMask") ? "shadow" : "bordered"}
      >
        <span>MetaMask</span>
        <Icon className="text-2xl" icon="logos:metamask-icon" />
      </Button>
      <Button
        onClick={() => handleWallet("Trust Wallet")}
        className="flex items-center justify-between w-full"
        color={
          installedWallets.includes("Trust Wallet") ? "success" : "default"
        }
        size="lg"
        variant={
          installedWallets.includes("Trust Wallet") ? "shadow" : "bordered"
        }
      >
        <span>Trust Wallet</span>
        <Icon className="text-3xl" icon="token-branded:trust" />
      </Button>
      <Button
        onClick={() => handleWallet("Coinbase Wallet")}
        className="flex items-center justify-between w-full"
        color={
          installedWallets.includes("Coinbase Wallet") ? "success" : "default"
        }
        size="lg"
        variant={
          installedWallets.includes("Coinbase Wallet") ? "shadow" : "bordered"
        }
      >
        <span>Coinbase</span>
        <Icon className="text-3xl" icon="token-branded:coinbase" />
      </Button>
    </div>
  );
};

export default ConnectWallet;
