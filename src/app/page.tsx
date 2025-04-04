"use client";

import React, { useEffect, useState } from "react";
import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";

export default function Home() {
  const { user, loading, error } = useAuth();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setHasToken(!!token);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mt50">
        {hasToken ? (
          <>
            <span className={title()}>Wallet Information&nbsp;</span>
            {user && <p>Welcome, {user.email}</p>}
          </>
        ) : (
          <span className={title()}>Please login to view wallet</span>
        )}
      </div>
    </section>
  );
}
