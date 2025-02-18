"use client";

import React, { useState } from "react";
import { Select, Switch, SelectItem } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-20">
      <h1 className={title()}>Settings</h1>
      <div className="setting">
        <span>Theme:</span>
        <Select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
        >
          <SelectItem key="dark">Dark</SelectItem>
          <SelectItem key="dark">Light</SelectItem>
        </Select>
      </div>
      <div className="setting">
        <span>Enable Notifications:</span>
        <Switch
          checked={notificationsEnabled}
          onChange={(e) => handleNotificationsChange(e.target.checked)}
        />
      </div>
    </section>
  );
};

export default SettingsPage;
