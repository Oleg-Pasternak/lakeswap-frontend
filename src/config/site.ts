export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "LakeSwap",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Sign In",
      href: "/login",
      isButton: true,
      isGrey: true,
    },
    {
      label: "Get an account",
      href: "/register",
      isButton: true,
    },
  ],
  navMenuItems: [
    {
      label: "Sign In",
      href: "/login",
    },
    {
      label: "Get an account",
      href: "/register",
    },
  ],
  authMenuItems: [
    {
      label: "Profile",
      href: "/profile",
      classnames: "",
    },
    {
      label: "My settings",
      href: "/settings",
      classnames: "",
    },
    {
      label: "Log Out",
      href: "/logout",
      classnames: "text-danger",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
