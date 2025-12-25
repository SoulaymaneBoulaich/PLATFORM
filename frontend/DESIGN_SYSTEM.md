# Frontend Design System

This file documents the Tailwind CSS design tokens, color palettes, animations, and theme strategies used across the frontend.

## Color Palette

- primary: Teal family (main: #14b8a6)
- secondary: Amber family (main: #d97706)
- buyer: { light: '#3b82f6', DEFAULT: '#06b6d4', dark: '#0891b2' }
- seller: { light: '#10b981', DEFAULT: '#14b8a6', dark: '#0f766e' }
- agent: { light: '#ec4899', DEFAULT: '#8b5cf6', dark: '#7c3aed' }

These tokens are configured in `tailwind.config.js` and used via utility classes.

## Animations

- aurora: 60s linear infinite background animation
- blob: 7s infinite floating blob animation
- float: vertical floating animation
- tilt: subtle rotation animation

## Theming

- Dark mode implemented with the `class` strategy (toggle a `.dark` class on the `html` element).
- Role-based color schemes provided via custom `buyer`, `seller`, and `agent` tokens.

## Utilities

- Glass morphism: `backdrop-blur` and `bg-opacity` utilities
- Magnetic hover: custom hook `useMagnetic.js` (see `src/hooks`)

---

For implementation details, see `frontend/src/components` and `frontend/tailwind.config.js`.