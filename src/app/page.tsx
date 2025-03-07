"use client";

import React, { useEffect, useState } from "react";
import { title, subtitle } from "@/components/primitives";
import { useAccount, useEnsName, useBalance } from "wagmi";

export default function Home() {
  const { address, addresses, isConnecting, isDisconnected, connector } =
    useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName, status } = useEnsName({ address });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mt50">
        <span className={title()}>Wallet Information&nbsp;</span>
        <br />
        {address && isMounted && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {addresses?.map((address, index) => (
                <div key={index} className={subtitle()}>
                  Address {index + 1}: {address}
                  {ensName && ` (${ensName})`}
                  {isConnecting && " (Connecting)"}
                  {isDisconnected && " (Disconnected)"}
                  {connector && ` (Connected with ${connector.name})`}
                  {status && ` (Status: ${status})`}
                  {balance &&
                    ` (Balance: ${balance?.formatted} ${balance?.symbol})`}
                </div>
              ))}
            </div>
          </div>
        )}
        {isDisconnected && (
          <div className={subtitle()}>Wallet Disconnected</div>
        )}
      </div>
    </section>
  );
}
