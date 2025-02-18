"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import { Skeleton } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";
import { useAppSelector } from "@/hooks/dispatch";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/hooks/dispatch";
import { Icon } from "@iconify/react";
import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { button as buttonStyles } from "@heroui/theme";

export const Navbar = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const isAuth = user?.email || user?.walletAddresses?.[0];
  const walletAddress = user?.walletAddresses?.[0]
    ? `${user.walletAddresses[0].substring(0, 5)}.....${user.walletAddresses[0].substring(user.walletAddresses[0].length - 5)}`
    : undefined;
  const username = user?.email?.split("@")[0] || walletAddress;
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">LakeSwap</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <ThemeSwitch />
        {loading && <Skeleton className="flex rounded-full w-12 h-12" />}
        {isAuth && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.email || user?.walletAddresses?.[0]}
                size="sm"
                src={user?.avatar}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{username}</p>
              </DropdownItem>
              <DropdownItem key="settings">
                <NextLink
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/settings`}
                >
                  My Settings
                </NextLink>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onClick={() => {
                  handleLogout();
                }}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {!isAuth && !loading && (
            <>
              {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium",
                      item?.isButton &&
                        buttonStyles({
                          color: !item.isGrey ? "primary" : "default",
                          radius: "md",
                        }),
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
            </>
          )}
        </ul>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mt-2 flex flex-col gap-2">
          {isAuth && (
            <Avatar
              isBordered
              as="button"
              className="transition-transform mb-5 mt-5"
              color="primary"
              name={user?.email || user?.walletAddresses?.[0]}
              size="lg"
              src={user?.avatar}
            />
          )}
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NextLink
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
