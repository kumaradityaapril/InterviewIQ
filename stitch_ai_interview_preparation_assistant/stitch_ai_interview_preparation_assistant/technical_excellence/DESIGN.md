---
name: Technical Excellence
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#18181B'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
  surface-elevated: '#27272A'
  border-subtle: '#2D2D30'
  status-success: '#10B981'
  status-warning: '#F59E0B'
  status-error: '#EF4444'
  text-muted: '#A1A1AA'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-technical:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
---

## Brand & Style

This design system is engineered for "Technical Excellence," prioritizing precision, speed, and analytical depth. It targets a professional audience of recruiters and high-tier candidates who value reliability over aesthetic trends. The personality is authoritative and encouraging, functioning more like a sophisticated diagnostic tool than a social platform.

The visual style is **Minimalist with a Technical edge**. It utilizes a dark-mode-first approach to reduce eye strain during deep work and to provide a high-contrast canvas for data visualization. Layouts are strictly structured, avoiding decorative flourishes in favor of clear information hierarchy and functional depth. The aesthetic is "pro-grade"—meaning every pixel, border, and transition exists to serve a functional purpose.

## Colors

The palette is anchored in a deep charcoal foundation to establish a grounded, professional atmosphere. 

- **Primary & Secondary:** `Electric Blue` is the primary driver for critical CTAs and active states. `Cyan` is used as a secondary accent specifically for data-driven highlights, such as the Match Score radial.
- **Surface Strategy:** We use a monochromatic stack of grays to define hierarchy. Backgrounds are the darkest (`#0B0B0C`), while interactive containers use progressively lighter shades to signify "elevation" without relying on traditional shadows.
- **Functional Accents:** Status colors (Success, Warning, Error) are desaturated slightly to fit the dark aesthetic while remaining clearly identifiable for "severity-coded" feedback in skill gap analysis.

## Typography

We use **Geist** for its exceptional legibility and systematic, technical feel. It provides the "high-performance" look necessary for a SaaS platform. 

For technical metadata, code snippets, or "severity-coded" tags, we introduce **JetBrains Mono**. This monospaced font reinforces the "Technical Excellence" narrative, making data points feel like precise output from an engine.

- **Scale:** Use `display-hero` exclusively for the Match Score percentage.
- **Hierarchy:** Maintain a clear distinction between body copy (Resume/JD text) and labels (metadata). 
- **Readability:** Line heights are slightly generous for body text (1.5x) to ensure that dense job descriptions remain scannable.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, the dashboard uses a fixed-width sidebar for navigation, with a fluid multi-column content area that organizes JDs and Resumes side-by-side.

- **Rhythm:** An 8px base unit governs all dimensions. 
- **The Dashboard Grid:** A 12-column system is used within the fluid content area. JDs and Resumes typically span 4-5 columns each, with a 2-column "Gap Analysis" gutter between them.
- **Breakpoints:**
  - **Desktop (1440px+):** Three-pane view (JD | Analysis | Resume).
  - **Tablet (768px - 1024px):** Two-pane view; Analysis moves to a full-width section below inputs.
  - **Mobile (<768px):** Single-column stacked view with a persistent bottom-bar for the Match Score.

## Elevation & Depth

This system rejects heavy drop shadows in favor of **Tonal Layering** and **Subtle Outlines**. Depth is communicated through:

- **1px Borders:** Use `#2D2D30` (border-subtle) to define all container boundaries. 
- **Tonal Stepping:** Surfaces "rise" by getting lighter. The main background is the darkest, cards are one step lighter, and active/hover states are another step lighter.
- **Glassmorphism (Functional Only):** Apply a subtle backdrop blur (12px) with a semi-transparent dark fill (80% opacity) for floating headers or modals. This keeps the user focused on the active layer without losing the context of the underlying data.
- **Accent Glow:** Interactive elements (like the Match Score radial) may use a very soft, low-opacity outer glow in the accent color (#3B82F6) to signify activity.

## Shapes

The shape language is "Soft-Mechanical." We use a low radius to maintain a professional, serious tone while avoiding the harshness of 0px corners.

- **Standard UI Elements:** Buttons, input fields, and small cards use a **4px** (`rounded`) radius.
- **Large Containers:** Dashboard panels and the Match Score container use an **8px** (`rounded-lg`) radius.
- **Technical Elements:** Progress bars and timeline nodes use a **0px** or **2px** radius to emphasize precision and structure.

## Components

- **Buttons:** Primary buttons use a solid `#3B82F6` fill with white text. Secondary buttons use a `1px` border of the primary color with a transparent background. No gradients.
- **Analysis Accordions:** Headers should use the `label-technical` font style. Use a chevron icon that rotates 90 degrees on expansion. Background color should shift slightly lighter when expanded.
- **Match Score Radial:** The "Hero" component. Use a thick circular stroke. The background stroke is `surface-elevated`, and the progress stroke is the `secondary-color` (Cyan). Animation should be a smooth `ease-out` over 1.2s.
- **Severity Tags:** Small, low-radius capsules with a background opacity of 10% of the status color and a 100% opacity text color (e.g., Error text on a dark red-tinted background).
- **Input Fields:** Use a dark fill (`#18181B`) with a `1px` border. The border turns `primary-color` on focus.
- **Roadmap Timeline:** A vertical `1px` dashed line with solid circle nodes. Completed steps glow with a subtle primary-color tint.