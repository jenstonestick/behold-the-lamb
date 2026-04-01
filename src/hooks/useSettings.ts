import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM" 24-hour format
  startDate: string;         // "YYYY-MM-DD"
}

const DEFAULTS: UserSettings = {
  theme: 'light',
  notificationsEnabled: true,
  notificationTime: '20:00',
  startDate: '2026-01-18',
};

const SETTINGS_KEY = 'btl-settings';

function load(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(s: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* */ }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(load);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Schedule / cancel notifications whenever settings change
  useEffect(() => {
    if (settings.notificationsEnabled) {
      scheduleNotification(settings.notificationTime);
    } else {
      cancelNotification();
    }
  }, [settings.notificationsEnabled, settings.notificationTime]);

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  return { settings, update };
}

/* ── Notification scheduling ── */

let notifTimer: ReturnType<typeof setTimeout> | null = null;

async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function msUntilNext(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function fireNotification() {
  if (Notification.permission === 'granted') {
    try {
      // Try service worker notification first (works when app is closed)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('Behold the Lamb', {
            body: 'Time for today\'s scripture study 📖',
            icon: '/behold-the-lamb/icon-192.png',
            badge: '/behold-the-lamb/icon-192.png',
            tag: 'btl-daily-reminder',
          });
        });
      } else {
        new Notification('Behold the Lamb', {
          body: 'Time for today\'s scripture study 📖',
          icon: '/behold-the-lamb/icon-192.png',
          tag: 'btl-daily-reminder',
        });
      }
    } catch {
      // Fallback
      new Notification('Behold the Lamb', {
        body: 'Time for today\'s scripture study 📖',
      });
    }
  }
}

async function scheduleNotification(timeStr: string) {
  cancelNotification();
  const granted = await requestPermission();
  if (!granted) return;

  const schedule = () => {
    const ms = msUntilNext(timeStr);
    notifTimer = setTimeout(() => {
      fireNotification();
      // Reschedule for tomorrow
      schedule();
    }, ms);
  };
  schedule();
}

function cancelNotification() {
  if (notifTimer) {
    clearTimeout(notifTimer);
    notifTimer = null;
  }
}
