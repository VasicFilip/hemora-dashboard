# Glassmorphism Quick Reference

## Component Usage

### Glass Card (Primary Container)
```tsx
<Card variant="glass">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**With accent border:**
```tsx
<Card variant="glass" className="border-l-4 border-l-blue-500">
  {/* Content */}
</Card>
```

### Glass Button
```tsx
<Button variant="glass">Secondary Action</Button>
```

### Glass Input
```tsx
<Input variant="glass" placeholder="Search..." />
```

---

## Responsive Utilities

### Container Width (Constrained Layout)
```tsx
<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content stays centered and readable */}
</div>
```

### Responsive Padding
```tsx
{/* Small: p-4, Medium: p-6, Large: p-8 */}
<div className="p-4 sm:p-6 lg:p-8">
  Content
</div>
```

### Responsive Grid
```tsx
{/* 1 col on mobile, 2 on tablet, 3+ on desktop */}
<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card variant="glass" key={item.id} />)}
</div>
```

---

## Glass Styling Directly (CSS Classes)

### Light Glass Card
```
bg-white/65 dark:bg-black/70 backdrop-blur-[16px] border border-black/8 dark:border-white/8 rounded-xl shadow-lg
```

### Light Glass Input
```
bg-white/40 dark:bg-white/5 backdrop-blur-[8px] border border-black/10 dark:border-white/10
```

### Sticky Glass Header
```
bg-white/75 dark:bg-black/80 backdrop-blur-[16px] border-b border-black/8 dark:border-white/8
```

---

## Hover & Interaction States

### Card Hover
```tsx
<Card variant="glass" className="transition-all hover:shadow-xl hover:opacity-95">
  Content
</Card>
```

### Button Hover (built-in)
- Opacity increases
- Shadow depth increases
- Blur stays constant

### Input Focus (built-in)
- Border color: accent (indigo)
- Ring shadow: `ring-ring/50`

---

## Color Borders

Add accent to glass cards with left borders:

```tsx
// Blue
<Card variant="glass" className="border-l-4 border-l-blue-500">

// Emerald
<Card variant="glass" className="border-l-4 border-l-emerald-500">

// Amber
<Card variant="glass" className="border-l-4 border-l-amber-500">

// Rose
<Card variant="glass" className="border-l-4 border-l-rose-500">
```

---

## CSS Variables (Custom Blur/Opacity)

In `src/app/globals.css`:
```css
--blur-light: 8px;        /* Light inputs, subtle backgrounds */
--blur-medium: 16px;      /* Standard cards, nav */
--blur-heavy: 24px;       /* Modals, overlays */
--glass-base: 0.65;       /* 65% opacity base cards */
--glass-elevated: 0.75;   /* 75% opacity nested elements */
--glass-light: 0.45;      /* 45% opacity subtle backgrounds */
```

---

## Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Example:
```tsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text size
</div>
```

---

## Dark Mode

All glass variants automatically adapt. Enable with:
```tsx
// In src/components/theme-provider.tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

Toggle via button:
```tsx
import { ThemeToggle } from "@/components/theme-toggle"

<ThemeToggle />
```

---

## Performance Tips

✅ **Do:**
- Use glass variants for key components (nav, cards, modals)
- Keep blur constant in animations (animate opacity, not blur)
- Test on low-end devices (iPhone SE, older Android)

❌ **Don't:**
- Over-blur everything (use sparingly)
- Animate blur values (GPU intensive)
- Stack too many glass layers
- Forget about mobile performance

---

## Common Patterns

### Dashboard Stats Grid
```tsx
<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(stat => (
    <Card variant="glass" key={stat.id} className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold uppercase">{stat.title}</CardTitle>
        <stat.Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Sticky Header
```tsx
<header className="sticky top-0 z-30 w-full bg-white/75 dark:bg-black/80 backdrop-blur-[16px] border-b border-black/8 dark:border-white/8 shadow-sm">
  {/* Navigation */}
</header>
```

### Modal
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <Card variant="glass" className="bg-white/95 dark:bg-black/95 max-w-md">
    {/* Modal content */}
  </Card>
</div>
```

---

## Accessibility Checklist

- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Focus rings visible (Tailwind default: `focus-visible:ring-ring`)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Touch targets ≥ 44px (buttons, inputs)
- [ ] Reduced motion respected (prefers-reduced-motion)
- [ ] Color not sole indicator (use icons, text)

---

## Deployment Checklist

- [ ] Run `npm run lint` (check for TypeScript errors)
- [ ] Test all breakpoints (mobile, tablet, desktop, 4K)
- [ ] Test light & dark modes
- [ ] Verify sticky nav performance (DevTools)
- [ ] Check WCAG contrast with WAVE extension
- [ ] Test on actual devices (not just DevTools)
- [ ] Verify table horizontal scroll on small screens
- [ ] Screenshot comparison (before/after)

---

**For full design specs, see:** [.github/GLASSMORPHISM_DESIGN_SYSTEM.md](.github/GLASSMORPHISM_DESIGN_SYSTEM.md)

**For implementation details, see:** [.github/IMPLEMENTATION_SUMMARY.md](.github/IMPLEMENTATION_SUMMARY.md)
