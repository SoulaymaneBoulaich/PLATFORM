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

## Role-Based Gradient System

### Buyer Journey (Cool Blues → Electric Cyan)
- From: `#06b6d4` (cyan-500)
- Via: `#3b82f6` (blue-500)
- To: `#2563eb` (blue-600)
- Usage: `bg-gradient-to-r from-buyer-gradient-from via-buyer-gradient-via to-buyer-gradient-to`

### Seller Journey (Warm Teal → Emerald)
- From: `#14b8a6` (teal-500)
- Via: `#10b981` (emerald-500)
- To: `#059669` (emerald-600)
- Usage: `bg-gradient-to-r from-seller-gradient-from via-seller-gradient-via to-seller-gradient-to`

### Agent Journey (Vibrant Purple → Pink)
- From: `#8b5cf6` (violet-500)
- Via: `#a855f7` (purple-500)
- To: `#ec4899` (pink-500)
- Usage: `bg-gradient-to-r from-agent-gradient-from via-agent-gradient-via to-agent-gradient-to`

### Primary Universal Gradient
- From: `#14b8a6` → Via: `#06b6d4` → To: `#3b82f6`
- Usage: `bg-gradient-to-r from-primary-gradient-from via-primary-gradient-via to-primary-gradient-to`

---

## Glassmorphism Layers

### Light Glass
- Class: `glass-light`
- Properties: `bg-white/10 backdrop-blur-2xl border border-white/20`
- Use case: Subtle overlays, floating search bars

### Medium Glass
- Class: `glass-medium`
- Properties: `bg-white/15 backdrop-blur-3xl border border-white/30`
- Use case: Modal backgrounds, sidebar panels

### Heavy Glass
- Class: `glass-heavy`
- Properties: `bg-white/20 backdrop-blur-4xl border border-white/40`
- Use case: Hero sections, primary CTAs

### Dark Mode Variants
All glass utilities automatically adjust in dark mode with slate backgrounds and reduced border opacity.

---

## Advanced Animation Keyframes

### Parallax Scrolling
- `animate-parallax-slow`: 20s linear infinite (background layers)
- `animate-parallax-fast`: 15s linear infinite (foreground elements)

### Morphing Shapes
- `animate-morph`: 8s ease-in-out infinite (organic blob transitions)

### 3D Card Tilt
- `animate-tilt-3d`: 0.3s ease-out forwards (mouse-reactive rotation)
- Requires CSS variables: `--tilt-x` and `--tilt-y`

### Particle Effects
- `animate-particle-float`: 6s ease-in-out infinite (floating particles)

### Loading States
- `animate-shimmer`: 2s linear infinite (skeleton screens)

### Neon Glows
- `animate-glow-pulse`: 2s ease-in-out infinite (pulsing neon effects)

---

## Neon Glow Utilities (Dark Mode)

### Role-Based Glows
- `glow-buyer`: Cyan neon glow (3-layer shadow)
- `glow-seller`: Teal neon glow (3-layer shadow)
- `glow-agent`: Purple neon glow (3-layer shadow)

### Accent Glows
- `glow-cyan`: Electric cyan glow
- `glow-purple`: Vibrant purple glow
- `glow-pink`: Hot pink glow

### Usage Example
```html
<button class="btn-primary glow-buyer dark:animate-glow-pulse">
  Book Tour
</button>
```

---

## Premium Shadow System

### Lift Shadows (Multi-layered depth)
- `shadow-lift`: Subtle elevation (10px offset)
- `shadow-lift-lg`: Medium elevation (20px offset)
- `shadow-lift-xl`: High elevation (30px offset)

### Neumorphic Shadows
- `shadow-neumorphic`: Light mode soft shadows
- `shadow-neumorphic-dark`: Dark mode soft shadows

### Inner Glow
- `shadow-inner-glow`: Subtle inner highlight for glass elements

---

## 3D Transform Utilities

### Perspective
- `perspective-500`: 500px perspective
- `perspective-1000`: 1000px perspective (recommended for cards)
- `perspective-1500`: 1500px perspective
- `perspective-2000`: 2000px perspective (hero sections)

### Transform Style
- `transform-style-3d`: Preserve 3D transformations for child elements
- `backface-hidden`: Hide element backface during 3D rotations

### Usage Example
```html
<div class="perspective-1000">
  <div class="transform-style-3d hover:rotate-y-12 transition-transform">
    <!-- 3D card content -->
  </div>
</div>
```

---

## Integration with Existing Hooks

### useMagnetic.js
Leverage for magnetic hover effects on property cards and CTAs. Combine with `glow-*` utilities for enhanced interactivity.

### useFloat.js
Use for hero section particles and floating badges. Combine with `animate-particle-float` for organic motion.

### GSAP ScrollTrigger
Integrate new keyframes with `createScrollTrigger` utility from `lib/gsap.js` for scroll-triggered reveals.

### Framer Motion
Use for page transitions and complex component animations. Combine with Tailwind gradient utilities for smooth color transitions.

---

## Performance Considerations

### Backdrop Blur Optimization
- Use `backdrop-blur-2xl` (32px) for most cases
- Reserve `backdrop-blur-3xl` (64px) and `backdrop-blur-4xl` (96px) for hero sections only
- Avoid stacking multiple blur layers

### Animation Best Practices
- All animations respect `prefers-reduced-motion` (handled in `lib/gsap.js`)
- Use `will-change: transform` for frequently animated elements
- Limit `animate-glow-pulse` to 3-5 elements per viewport

### Shadow Performance
- Multi-layered shadows (`shadow-lift-*`) are GPU-accelerated
- Avoid combining more than 2 shadow utilities on a single element

---

## Design Tokens JSON

For programmatic access to design tokens:

```json
{
  "colors": {
    "buyer": {
      "gradient": {
        "from": "#06b6d4",
        "via": "#3b82f6",
        "to": "#2563eb"
      },
      "neon": "#06b6d4"
    },
    "seller": {
      "gradient": {
        "from": "#14b8a6",
        "via": "#10b981",
        "to": "#059669"
      },
      "neon": "#14b8a6"
    },
    "agent": {
      "gradient": {
        "from": "#8b5cf6",
        "via": "#a855f7",
        "to": "#ec4899"
      },
      "neon": "#8b5cf6"
    }
  },
  "glassmorphism": {
    "light": {
      "background": "rgba(255, 255, 255, 0.1)",
      "blur": "32px",
      "border": "rgba(255, 255, 255, 0.2)"
    },
    "medium": {
      "background": "rgba(255, 255, 255, 0.15)",
      "blur": "64px",
      "border": "rgba(255, 255, 255, 0.3)"
    },
    "heavy": {
      "background": "rgba(255, 255, 255, 0.2)",
      "blur": "96px",
      "border": "rgba(255, 255, 255, 0.4)"
    }
  },
  "animations": {
    "durations": {
      "fast": "0.15s",
      "normal": "0.25s",
      "slow": "0.4s"
    },
    "easings": {
      "smooth": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    }
  }
}
```

---

## Developer Preview Page
A `/styleguide` route has been added (`frontend/src/pages/StyleGuide.jsx`) to preview new tokens and utilities during development. Use it to test role-based glows, glass layers, shadows and 3D transforms without modifying production pages.