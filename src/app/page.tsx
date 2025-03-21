"use client";

import React, { useEffect, useState } from "react";
import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/hooks/useAuth";
import { addToast, Button } from "@heroui/react";

export default function Home() {
  const { user, loading, error } = useAuth();

  console.log(user);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mt50">
        <span className={title()}>Wallet Information&nbsp;</span>
      </div>
    </section>
  );
}
