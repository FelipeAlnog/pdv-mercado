'use client';

import type { Variants, Transition } from 'framer-motion';

// ─── Core easing ─────────────────────────────────────────────────────────────
// Expo ease-out: arranque rápido, frenagem suave — mais natural que cubic-bezier padrão
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

// ─── Transitions ──────────────────────────────────────────────────────────────
export const SPRING: Transition      = { type: 'spring', stiffness: 260, damping: 26 };
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 200, damping: 28 };
export const EASE_OUT: Transition    = { duration: 0.28, ease: EXPO_OUT };
export const EASE_FAST: Transition   = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

// ─── Page transition ─────────────────────────────────────────────────────────
export const PAGE_VARIANTS: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { ...EASE_OUT, duration: 0.32 } },
  exit:    { opacity: 0, y: -8, transition: EASE_FAST },
};

// ─── Stagger container ────────────────────────────────────────────────────────
export const STAGGER_CONTAINER: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

// ─── Stagger item ─────────────────────────────────────────────────────────────
export const STAGGER_ITEM: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 240, damping: 22 },
  },
};

// ─── Fade up ─────────────────────────────────────────────────────────────────
export const FADE_UP: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT },
};

// ─── Slide in from left ───────────────────────────────────────────────────────
export const SLIDE_LEFT: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0,  transition: EASE_OUT },
};

// ─── Scale in ────────────────────────────────────────────────────────────────
export const SCALE_IN: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

// ─── List item add/remove ────────────────────────────────────────────────────
export const LIST_ITEM: Variants = {
  hidden:  { opacity: 0, x: -12, scale: 0.98 },
  visible: { opacity: 1, x: 0,   scale: 1,   transition: SPRING },
  exit:    { opacity: 0, x:  16, scale: 0.96, transition: EASE_FAST },
};

// ─── Auth card entrance ───────────────────────────────────────────────────────
export const AUTH_CARD: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 26, delay: 0.04 },
  },
};

// ─── Auth fields stagger ─────────────────────────────────────────────────────
export const AUTH_FIELDS: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

export const AUTH_FIELD: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { ...EASE_OUT, duration: 0.24 } },
};
