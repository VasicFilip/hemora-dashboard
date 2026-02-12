# Glassmorphism Design System – hemora.ch Dashboard

## Overview

A premium, iOS 26-inspired glassmorphism design system for the hemora.ch clinical dashboard. Emphasizes frosted glass effects, subtle depth, soft blur, and calm minimalism while maintaining clinical credibility and WCAG accessibility.

**Design Principles:**
- Premium & minimal (Apple-like, not crypto)
- Calm, focused interface
- Layered depth without visual clutter
- Responsive across all screen sizes (mobile-first, horizontal table scroll)
- Constrained width (max-w-5xl/6xl) for focused content
- Dark & light mode support

---

## 1. Glassmorphism Design System

### 1.1 Layer Strategy

**Three-layer system:**

1. **Base Layer** – Solid background, no transparency
   - Dark mode: `#000000` or very dark neutral (`rgb(12, 12, 12)`)
   - Light mode: `#ffffff` or off-white (`rgb(250, 250, 250)`)

2. **Glass Layer** – Translucent surface with blur
   - Sits on top of base, contains content
   - Uses `backdrop-filter: blur()` for frosted glass effect
   - Primary opacity: 60–75% (varies by elevation)

3. **Elevated Layer** – Additional surface for nested elements
   - Cards inside glass containers
   - Slight offset opacity increase for hierarchy

**CSS Variable approach (update `src/app/globals.css`):**
```css
/* Glass layer opacities */
--glass-base: 0.65;         /* 65% opacity for primary cards */
--glass-elevated: 0.75;     /* 75% opacity for nested elements */
--glass-light: 0.45;        /* 45% opacity for subtle backgrounds */

/* Blur values (in px) */
--blur-light: blur(8px);
--blur-medium: blur(16px);
--blur-heavy: blur(24px);
```

### 1.2 Blur Levels & Transparency

| Level | Backdrop Filter | Opacity | Use Case |
|-------|-----------------|---------|----------|
| **Light** | `blur(8px)` | 55% | Subtle backgrounds, input fields |
| **Medium** | `blur(16px)` | 65% | Primary cards, nav bars |
| **Heavy** | `blur(24px)` | 70% | Modals, overlays, hero sections |

**Transparency Rules:**
- Never below 50% opacity (readability)
- Never above 80% opacity (loses glass effect, looks solid)
- Adjust opacity *inverse* to blur: heavier blur = lower opacity

### 1.3 Borders & Strokes

**Glass borders create definition without solidity:**

- **Primary borders:** `border: 1px solid rgba(255, 255, 255, 0.1)` (light mode) or `rgba(255, 255, 255, 0.08)` (dark mode)
- **Accent borders:** `border: 1px solid rgba(var(--primary-rgb), 0.3)` (subtle color hint)
- **Strong borders (nav, critical sections):** `border: 1px solid rgba(255, 255, 255, 0.15)`

**Stroke widths:** Always `1px` (thin, refined) or `2px` (interactive elements only)

### 1.4 Glow & Light Refraction

**Subtle glow for premium feel (no neon):**

```css
/* Soft inner glow on glass cards */
inset 0 1px 0 rgba(255, 255, 255, 0.1),
inset 0 -1px 0 rgba(0, 0, 0, 0.05);

/* Outer glow for elevated cards (optional) */
0 0 20px rgba(var(--primary-rgb), 0.1);
```

**Light refraction (subtle highlight):**
- Top edge: thin white line (`inset 0 1px 0 rgba(255, 255, 255, 0.15)`)
- Creates depth, mimics glass reflection

### 1.5 Elevation & Depth Hierarchy

**Four elevation levels (Tailwind `shadow-*` + custom glass):**

| Level | Blur | Shadow | Z-index | Example |
|-------|------|--------|---------|---------|
| **L0** | `blur(8px)` | `shadow-sm` | 10 | Input fields, badges |
| **L1** | `blur(16px)` | `shadow-md` | 20 | Primary cards, chart containers |
| **L2** | `blur(20px)` | `shadow-lg` | 30 | Sticky nav, elevated panels |
| **L3** | `blur(24px)` | `shadow-xl` | 40 | Modals, overlays, popovers |

---

## 2. Color Palette – iOS 26 Inspired

### 2.1 Light Mode

**Backgrounds:**
- Base: `#fafaf9` (warm off-white)
- Card/Glass: `rgba(255, 255, 255, 0.65)` (semi-transparent white)
- Secondary: `rgba(245, 245, 244, 0.5)` (warm gray glass)

**Text:**
- Primary: `#1f2937` (dark gray)
- Secondary: `#6b7280` (medium gray)
- Tertiary: `#9ca3af` (light gray, disabled)

**Accents:**
- Primary (action): `#4f46e5` (indigo, Apple-style)
- Success: `#059669` (emerald)
- Warning: `#d97706` (amber)
- Danger: `#dc2626` (red)

**Glass Borders:**
- `rgba(0, 0, 0, 0.08)` (dark overlay on white glass)

### 2.2 Dark Mode

**Backgrounds:**
- Base: `#0c0c0c` (true black)
- Card/Glass: `rgba(20, 20, 20, 0.7)` (semi-transparent dark)
- Secondary: `rgba(30, 30, 30, 0.6)` (slightly lighter glass)

**Text:**
- Primary: `#f5f5f4` (warm white)
- Secondary: `#d1d5db` (light gray)
- Tertiary: `#6b7280` (medium gray, disabled)

**Accents:**
- Primary (action): `#818cf8` (lighter indigo for contrast)
- Success: `#10b981` (bright emerald)
- Warning: `#fbbf24` (bright amber)
- Danger: `#f87171` (bright red)

**Glass Borders:**
- `rgba(255, 255, 255, 0.08)` (white overlay on dark glass)

### 2.3 WCAG Accessibility

**Contrast Rules:**
- Text on glass: minimum 4.5:1 ratio for body text, 3:1 for large text
- Test dark text on light glass and light text on dark glass
- Use [`contrast-ratio.com`](https://contrast-ratio.com) to verify

**Specific combos (verified):**
- Dark gray (`#1f2937`) on light glass (`rgba(255, 255, 255, 0.65)`): **13:1** ✓
- Light text (`#f5f5f4`) on dark glass (`rgba(20, 20, 20, 0.7)`): **12:1** ✓
- Medium gray text on glass (secondary): always use dark mode's lighter text or light mode's darker text

---

## 3. Component Design Recipes

### 3.1 Glass Card (Primary Container)

**Light Mode:**
```css
background: rgba(255, 255, 255, 0.65);
backdrop-filter: blur(16px);
border: 1px solid rgba(0, 0, 0, 0.08);
border-radius: 12px;
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
```

**Dark Mode:**
```css
background: rgba(20, 20, 20, 0.7);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

**Tailwind Class Set:**
```
bg-white/65 dark:bg-black/70 backdrop-blur-[16px] border border-black/8 dark:border-white/8 rounded-[12px] shadow-lg
```

**Responsive Variants:**
- Padding: `p-4 sm:p-6 lg:p-8` (shrink on mobile)
- Gap (internal grid): `gap-4 sm:gap-6`

---

### 3.2 Navigation Bar (Sticky Top, Glass)

**Light Mode:**
```css
background: rgba(250, 250, 250, 0.75);
backdrop-filter: blur(16px);
border-bottom: 1px solid rgba(0, 0, 0, 0.08);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
```

**Dark Mode:**
```css
background: rgba(12, 12, 12, 0.8);
backdrop-filter: blur(16px);
border-bottom: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
```

**Tailwind:**
```
sticky top-0 z-30 w-full bg-background/75 dark:bg-black/80 backdrop-blur-[16px] border-b border-black/8 dark:border-white/8 shadow-sm
```

**Mobile Variant (MobileNav):**
- Slightly higher blur: `blur(20px)` (blocks content behind)
- Opacity: 80% (must be readable with nav open)
- Height: `h-16` (fixed, matches current design)

---

### 3.3 Sidebar (Desktop, Glass)

**Current pattern in `src/components/sidebar.tsx` already good:**
- `bg-background/95 backdrop-blur supports-[backdrop-filter]:...`
- Enhance with:

```css
background: rgba(255, 255, 255, 0.9) /* light */ / rgba(12, 12, 12, 0.95) /* dark */;
backdrop-filter: blur(12px);
border-right: 1px solid rgba(0, 0, 0, 0.08) / rgba(255, 255, 255, 0.08);
```

**Width:** Keep `w-64` (256px, unchanged)

---

### 3.4 Card Inside Glass Container

**Nested glass card (slightly elevated opacity):**

**Light Mode:**
```css
background: rgba(245, 245, 244, 0.6);
border: 1px solid rgba(0, 0, 0, 0.05);
border-radius: 10px;
```

**Dark Mode:**
```css
background: rgba(30, 30, 30, 0.6);
border: 1px solid rgba(255, 255, 255, 0.05);
border-radius: 10px;
```

**Tailwind:**
```
bg-stone-50/60 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[10px] p-4 sm:p-5
```

---

### 3.5 Modal / Overlay

**Backdrop (full-screen):**
```css
background: rgba(0, 0, 0, 0.5); /* both modes */
backdrop-filter: blur(4px);
```

**Modal Container:**
```css
/* Light */
background: rgba(255, 255, 255, 0.95);
border: 1px solid rgba(0, 0, 0, 0.1);
backdrop-filter: blur(24px);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

/* Dark */
background: rgba(20, 20, 20, 0.95);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(24px);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
```

**Tailwind:**
```
fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm
/* Modal content */
bg-white/95 dark:bg-black/95 backdrop-blur-[24px] border border-black/10 dark:border-white/10 rounded-[16px] shadow-2xl
```

---

### 3.6 Table with Horizontal Scroll

**Glass wrapper container:**
```
div: bg-white/65 dark:bg-black/70 backdrop-blur-[16px] border border-black/8 dark:border-white/8 rounded-[12px] shadow-lg overflow-hidden
  table: whitespace-nowrap
    thead: bg-stone-50/40 dark:bg-white/5 border-b border-black/5 dark:border-white/5
    tbody: tr:hover: bg-primary/5 dark:bg-primary/10
```

**Responsive:**
- `overflow-x-auto` on `sm` and below (horizontal scroll)
- Full width on `lg+` (within constrained container)
- Min-width cells to prevent crushing: `min-w-[100px]` per column

---

### 3.7 Buttons

**Primary Button (Action):**

**Light Mode:**
```css
background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
color: white;
border: none;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
```

**Dark Mode:**
```css
background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
color: #000;
border: none;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
```

**Secondary Button (Glass):**
```css
background: rgba(255, 255, 255, 0.5) /* light */ / rgba(255, 255, 255, 0.1) /* dark */;
backdrop-filter: blur(8px);
border: 1px solid rgba(0, 0, 0, 0.1) / rgba(255, 255, 255, 0.1);
border-radius: 8px;
```

**Hover State:**
- Increase opacity: `+0.1`
- Subtle scale: `scale(1.02)`
- Increase shadow depth

**Active/Press:**
- Scale: `scale(0.98)`
- Reduce shadow
- No transition jank (use `will-change: transform`)

---

### 3.8 Input Fields

**Glass Input:**

**Light Mode:**
```css
background: rgba(255, 255, 255, 0.4);
backdrop-filter: blur(8px);
border: 1px solid rgba(0, 0, 0, 0.1);
border-radius: 8px;
color: #1f2937;
caret-color: #4f46e5;
```

**Dark Mode:**
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 8px;
color: #f5f5f4;
caret-color: #818cf8;
```

**Focus State:**
- Border color: accent color (indigo)
- Shadow: `0 0 12px rgba(var(--primary-rgb), 0.2)`
- No outline (we have focus ring)

**Placeholder:**
- Light: `#9ca3af` (light gray)
- Dark: `#6b7280` (medium gray)

---

### 3.9 Toggles & Checkboxes

**Glass background for toggle track:**
```css
background: rgba(0, 0, 0, 0.1) /* off */ / rgba(79, 70, 229, 0.3) /* on */;
border-radius: 12px;
```

**Knob/thumb:**
```css
background: white (light) / #f5f5f4 (dark);
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
border-radius: 50%;
```

---

### 3.10 Charts Inside Glass Cards

**Chart container within card:**
- Padding: `p-4 sm:p-6`
- Background: transparent (inherit glass)
- Axis labels: secondary text color
- Grid lines: `rgba(0, 0, 0, 0.05)` (light) / `rgba(255, 255, 255, 0.05)` (dark)
- Tooltip: glass style (same as card, slightly elevated)

---

## 4. Motion & Interaction Principles

### 4.1 Transitions & Easing

**Standard durations:**
- Micro-interactions (buttons, toggles): `150ms`
- Component state changes (modals, slides): `300ms`
- Page transitions: `500ms`

**Easing function:**
```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
/* Apple's standard easing, feels smooth and premium */
```

**Tailwind utility:**
```
transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
```

### 4.2 Hover States

**Cards:**
- Opacity: `+0.05` (becomes slightly more solid, more legible)
- Shadow: increase depth `shadow-md` → `shadow-lg`
- Scale: `scale(1.01)` (subtle, not distracting)
- Backdrop blur: unchanged (no extra processing)

**Buttons:**
- Primary: slight brightness increase or shadow boost
- Secondary: opacity `+0.08`, border color brightens
- No background color shift (preserve glass)

**Interactive elements (links, nav items):**
- Text color: accent color (indigo)
- Underline: subtle, `2px` solid
- Backdrop: transparent highlight `rgba(var(--primary-rgb), 0.05)`

### 4.3 Tap / Click Feedback

**Mobile (touch):**
- On press: `scale(0.98)` instantly (no delay)
- Shadow: reduce to `shadow-sm`
- On release: spring back with slight bounce

**Desktop (click):**
- Same as mobile, but can use pointer events for refinement

**Active state (held):**
- Reduce shadow depth further
- Text color: secondary (fade slightly)

### 4.4 Blur Transitions

**When glass layer transitions (e.g., modal open):**
- Fade in backdrop blur: `blur(0px)` → `blur(4px)` over `300ms`
- Card opacity: `0` → `1` (simultaneous)
- Prevents visual jank from blur cost

**On scroll (if header blur changes):**
- Adjust `backdrop-filter` gradually, avoid rapid on/off

---

## 5. Implementation Guidance

### 5.1 CSS Variables in `src/app/globals.css`

Add these to your existing color variables:

```css
:root {
  /* Existing color vars... */

  /* Glassmorphism blur levels */
  --blur-light: 8px;
  --blur-medium: 16px;
  --blur-heavy: 24px;

  /* Glass opacities */
  --glass-base: 0.65;
  --glass-elevated: 0.75;
  --glass-light: 0.45;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode blur same as light, opacities may adjust */
    --glass-base: 0.7;
    --glass-elevated: 0.75;
    --glass-light: 0.5;
  }
}
```

### 5.2 Tailwind Customization (no `tailwind.config.js` yet)

If you add a `tailwind.config.js`, extend with:

```js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        'xs': '4px',
        'light': '8px',
        'medium': '16px',
        'heavy': '24px',
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, var(--glass-base, 0.65))',
        'glass-dark': 'rgba(20, 20, 20, var(--glass-base, 0.65))',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};
```

### 5.3 Component Pattern (Shadcn UI + Tailwind)

Example: Update `src/components/ui/card.tsx` to support glass variant:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'glass' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      variant === 'glass'
        ? 'bg-white/65 dark:bg-black/70 backdrop-blur-[16px] border border-black/8 dark:border-white/8 rounded-[12px] shadow-lg'
        : 'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
```

**Usage:**
```tsx
<Card variant="glass" className="p-6">
  <h2>Glass Card</h2>
</Card>
```

### 5.4 Performance Optimization

**Blur cost:** `backdrop-filter: blur()` is GPU-intensive.

**Strategies to minimize cost:**
1. Avoid blur on every element—use sparingly for key layers (nav, cards, modals).
2. Use `will-change: backdrop-filter` on elements that will blur on hover (cards).
3. Reduce blur radius on mobile (`blur(8px)` instead of `blur(16px)` for nested cards).
4. Test on low-end devices (iPhone SE, older Android). Use DevTools performance profiler.

**Fallback for unsupported browsers:**
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgba(255, 255, 255, 0.95); /* Opaque fallback */
  }
}
```

### 5.5 Dark Mode Toggle

Existing setup uses `next-themes` (class-based). Ensure `src/app/layout.tsx` has:

```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

Glass colors automatically adapt via CSS variable/Tailwind dark mode prefix (`dark:`).

---

## 6. Responsive Considerations

### 6.1 Breakpoints (Tailwind defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

### 6.2 Mobile Optimizations

**On `sm` and below:**
- Reduce blur slightly: `blur(8px)` for light cards (vs. `blur(16px)` on desktop)
- Increase opacity: `0.75` instead of `0.65` (more opaque for readability)
- Reduce padding on cards: `p-4` (vs. `p-6` on desktop)
- Simplify shadows: `shadow-sm` (vs. `shadow-lg`)

**Table scroll on small screens:**
- Container: `overflow-x-auto`
- Table: `whitespace-nowrap` on cells
- Already implemented in shared `Table` component

**Max-width content:**
- Keep `max-w-5xl` or `max-w-6xl` on main containers (not full-bleed)
- Center with `mx-auto`
- Gutters: `px-4 sm:px-6 lg:px-8`

### 6.3 Sidebar & Mobile Nav

**Desktop (`lg+`):**
- Sidebar: fixed `w-64`, glass background, full height

**Mobile/Tablet (`sm` - `lg`):**
- Mobile nav: sticky top bar, hamburger menu
- Drawer: `w-72` (same nav items, stacked vertically)
- Both use glass styling

---

## 7. Do's & Don'ts

### ✅ Do's

- **Do** use consistent blur levels (light/medium/heavy, not arbitrary)
- **Do** maintain 50%+ opacity (never translucent to the point of illegibility)
- **Do** pair high blur with lower opacity (inverse relationship)
- **Do** test text contrast in both light/dark modes (aim for 4.5:1 or higher)
- **Do** use glass for navigation, primary containers, and modals
- **Do** keep drop shadows subtle and soft (not harsh)
- **Do** animate transitions smoothly (`300ms` easing, no jerky state changes)
- **Do** reduce blur on mobile (performance + readability)
- **Do** provide focus states for keyboard navigation (focus ring via Tailwind)
- **Do** test with DevTools to measure blur cost (aim for 60fps)

### ❌ Don'ts

- **Don't** over-blur (looks cheap; max `blur(24px)` for modals only)
- **Don't** use glass on every element (dilutes premium feel, harms performance)
- **Don't** forget fallbacks for browsers without `backdrop-filter` support
- **Don't** stack too many glass layers (content becomes muddy, hard to read)
- **Don't** use harsh drop shadows (stick to soft, diffuse shadows)
- **Don't** ignore mobile performance (blur can tank frame rate on weak devices)
- **Don't** use low-contrast text on glass (never below 3:1 ratio, aim for 4.5:1)
- **Don't** animate blur itself (animate opacity instead, blur stays constant)
- **Don't** use bright neon accents (stick to soft, Apple-style colors)
- **Don't** forget about disabled states (reduce opacity, gray out text, still readable)

---

## 8. Responsive Layout Reference

### Content Container (most pages)

```tsx
<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Content cards */}
</div>
```

### Card Grid

```tsx
<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Cards with glass variant */}
</div>
```

### Sticky Header

```tsx
<header className="sticky top-0 z-30 w-full bg-background/75 dark:bg-black/80 backdrop-blur-[16px] border-b border-black/8 dark:border-white/8 shadow-sm">
  {/* Nav content */}
</header>
```

### Table Container

```tsx
<div className="bg-white/65 dark:bg-black/70 backdrop-blur-[16px] border border-black/8 dark:border-white/8 rounded-[12px] shadow-lg overflow-x-auto">
  <table className="w-full">
    {/* Table content with horizontal scroll on small screens */}
  </table>
</div>
```

---

## 9. Testing Checklist

Before deploying:

- [ ] Test light & dark modes on desktop, tablet, mobile
- [ ] Verify text contrast with [WAVE](https://wave.webaim.org/) or [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [ ] Check blur performance (DevTools → Performance tab, aim for 60fps)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify touch interactions on actual mobile device (not just DevTools)
- [ ] Test in Safari, Chrome, Firefox (backdrop-filter support varies)
- [ ] Check horizontal table scroll on `sm` breakpoint
- [ ] Verify max-width containers stay centered on 4K displays
- [ ] Ensure modals and overlays are readable (blur shouldn't obscure critical info behind)
- [ ] Test reduced motion preference (`prefers-reduced-motion: reduce`)

---

## 10. Future Enhancements

- **Animated backgrounds:** Subtle gradient shifts or parallax (Apple-style)
- **Micro-interactions:** Haptic feedback on iOS (via Web API)
- **Advanced glass:** Morphism gradients or color shifts on scroll
- **3D depth:** CSS `perspective` for layered card stacks
- **Accessibility modes:** High contrast glass option for vision-impaired users

---

## Summary

This design system provides a premium, iOS 26-inspired glassmorphism aesthetic tailored to the hemora.ch dashboard. It emphasizes constrained width, responsive behavior (mobile-first, horizontal table scroll), dark/light mode parity, and accessibility. Implement via CSS variables, Tailwind utilities, and Shadcn UI component variants. Test thoroughly on all screen sizes and devices before shipping.
