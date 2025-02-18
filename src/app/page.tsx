"use client";

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@heroui/avatar";

export default function Home() {
  const { user, loading, error } = useAuth();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mt50">
        <span className={title()}>Hello world!&nbsp;</span>
        <br />
      </div>
    </section>
  );
}
