# Design System Document: Technical Precision & Industrial Sophistication

## 1. Overview & Creative North Star: "The Industrial Architect"
The design system for this B2B gastronomy platform moves away from generic e-commerce layouts toward a "Digital Blueprint" aesthetic. Our Creative North Star is **The Industrial Architect**. 

This system treats the screen not as a flat canvas, but as a high-precision assembly line. We break the "template" look by utilizing **intentional asymmetry**—aligning technical specs to a rigid left-heavy axis while allowing product hero shots to "float" across layers. We replace standard borders with **Tonal Structuralism**, using color-blocked surfaces to create hierarchy. The result is a high-tech, authoritative environment that feels as engineered as the professional kitchen equipment it showcases.

## 2. Colors: Tonal Layering & The "No-Line" Rule
The palette is rooted in the "Deep Corporate Blue" (`#1a365d`) and "Industrial Silver." However, we do not use these merely as accents; they define our physical space.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. Traditional lines create visual clutter that contradicts a "clean" high-tech feel. 
- **Boundaries** must be defined by shifts in background tokens (e.g., a `surface-container-low` section sitting on a `surface` background).
- **Depth** is achieved through the proximity of tonal values, not black outlines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, precision-cut plates. 
- **Base Layer:** `surface` (#f9f9ff) for global backgrounds.
- **Content Blocks:** Use `surface-container-low` for large content areas.
- **Interactive Cards:** Use `surface-container-lowest` (#ffffff) to create a "lifted" effect.
- **Technical Sidebars:** Use `inverse-surface` (#273141) to house high-density data, creating a high-contrast "Command Center" feel.

### Signature Textures & Glass
- **The "Safety Orange" Flare:** Reserve `tertiary_fixed_dim` (#ffb783) and the orange tones for critical CTAs only. Apply a subtle linear gradient from `on_tertiary_container` to `tertiary` to give buttons a machined, metallic sheen.
- **Glassmorphism:** For floating navigation or technical overlays, use `surface_variant` with an 80% opacity and a `20px` backdrop blur. This allows the industrial silver tones to bleed through, maintaining a sense of transparency and high-tech lightness.

## 3. Typography: The Technical Serif-less Scale
We utilize **Inter** to lean into its mathematical precision. The hierarchy is designed to feel like a technical manual—highly structured and unapologetically legible.

- **Display Scales (lg, md, sm):** Used for hero equipment names. Letter spacing is set to `-0.02em` to feel tight and engineered.
- **Headline & Title:** These are the "Section Headers" of the blueprint. Use `primary` (#002045) for maximum authority.
- **Body & Labels:** This is the data layer. For technical specs (e.g., "Voltage," "BTU Output"), use `label-md` in `on_surface_variant` (#43474e) to distinguish metadata from core content.

## 4. Elevation & Depth: Tonal Layering
We do not use "Drop Shadows" in the traditional sense. We use **Ambient Occlusion**.

- **The Layering Principle:** Instead of shadows, stack `surface-container` tiers. A `surface-container-highest` element placed on a `surface-dim` background creates a natural, perceived elevation.
- **Ambient Shadows:** Where floating elements (like Modals) are required, use a `12%` opacity shadow using the `primary` color (#002045) rather than black. Blur values should be expansive (30px - 60px) to mimic soft, studio lighting on stainless steel.
- **The "Ghost Border" Fallback:** If a technical constraint requires a border, use `outline_variant` at **15% opacity**. It should be felt, not seen.

## 5. Components: Precision Machining

### Buttons (The "Control Switch")
- **Primary:** Background uses the Safety Orange palette. No border. `0.25rem` (sm) corner radius for a "precision-cut" feel.
- **Secondary:** Use `secondary_container` with `on_secondary_container` text. This provides a "silver/chrome" aesthetic.
- **States:** On hover, apply a `surface_bright` inner glow to mimic a button being backlit.

### Input Fields (The "Data Entry")
- **Architecture:** No bottom line or full box. Use a subtle `surface-container-high` background with a `0.25rem` radius. 
- **Focus State:** Instead of a thick border, use a 2px "Safety Orange" (`tertiary`) indicator only on the left edge of the input.

### Cards & Lists (The "Equipment Ledger")
- **Strict Rule:** Forbid divider lines. 
- **Separation:** Use `1.5rem` to `2rem` of vertical whitespace to separate equipment listings.
- **Interaction:** On hover, a card should shift from `surface-container-low` to `surface-container-lowest` and expand by 2px in padding—mimicking a physical part being "selected" from a tray.

### Additional Component: The "Spec-Sheet" Drawer
For a B2B engineering platform, use a slide-out "Spec-Sheet" using `inverse-surface`. This high-contrast dark drawer allows engineers to compare technical blueprints without leaving the product catalog, utilizing `on_primary_fixed` for high-density data points.

## 6. Do’s and Don’ts

### Do:
- **Do** use asymmetrical layouts where technical data is left-aligned and imagery "breaks" the grid to the right.
- **Do** use `primary_container` (#1a365d) for heavy-duty footers and headers to ground the experience.
- **Do** utilize the `DEFAULT` (0.25rem) roundedness for most elements to maintain a "technical/mechanical" edge.

### Don’t:
- **Don’t** use 100% black. Use `on_background` (#121c2c) for text to maintain a premium, deep-blue depth.
- **Don’t** use "Soft" or "Playful" rounded corners (xl or full) except for status indicators (chips).
- **Don’t** use standard shadows. If it looks like a default Material Design shadow, it is wrong. It must look like ambient light in a warehouse.