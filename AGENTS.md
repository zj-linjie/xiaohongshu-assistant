# AGENTS.md

## Project Contract

This repository is a React + Vite high-fidelity desktop prototype for `薄荷工坊 / Mint Atelier`, a Pastel 3D Claymorphism 3-column Xiaohongshu content workbench.

Before changing visual design, layout, assets, or interaction behavior, read `DESIGN.md`. Treat `DESIGN.md` as the source of truth for the visual system, layout rules, asset style, and QA expectations.

## Implementation Map

- App entry: `src/App.jsx`
- Global styling and visual tokens: `src/styles.css`
- Static assets: `public/assets/`
- Design guidance: `DESIGN.md`
- Visual QA evidence: `design-qa.md`

The current UI is intentionally static/demo-oriented, with local React state for visible controls such as navigation, editor tabs, model selection, sliders, and prompt input.

## Development Commands

Use the local dev server yourself when validating the prototype:

```bash
npm run dev -- --port 5173
```

Build check:

```bash
npm run build
```

For visual verification, prefer the current in-app browser when available. If screenshots are needed, use Playwright with the running local server:

```bash
npx playwright@1.61.1 screenshot --viewport-size=1440,900 http://127.0.0.1:5173/ output/playwright/xhs-g4-1440.png
npx playwright@1.61.1 screenshot --viewport-size=1440,720 --full-page http://127.0.0.1:5173/ /tmp/xhs-g4-scroll-check.png
```

## Design Boundaries

Preserve the product shape:

- 3-column desktop workbench: left navigation, center creation workspace, right configuration rail.
- Pastel 3D Claymorphism style with macaron lavender, pink, cream, powder blue, lemon yellow, and mint.
- Large rounded clay panels, soft shadows, subtle inner highlights, raised pill buttons, and 3D soft icons.
- Clear productivity-tool hierarchy with enough whitespace and readable text.

Do not:

- Turn the app into a marketing landing page.
- Change the direction to dark tech, glassmorphism, stark black/white minimalism, or generic SaaS styling.
- Replace the soft 3D icon language with ordinary linear icons.
- Reintroduce layout clipping, hidden overflow, or fixed-height containers that cut off middle content.
- Add visible explanatory text about how to use the UI unless the product surface itself requires it.

## Layout And Scroll Rules

The prototype must support vertical scrolling in shorter browser viewports. Keep the outer shell and middle workspace compatible with the current anti-clipping fixes:

- `body` should allow scrolling.
- `.app-shell` should use `min-height`, not a brittle fixed-only height.
- `.app-shell` should not hide overflow.
- `.creative-grid`, `.editor`, and `.preview` need enough vertical room for their contents.

After layout changes, inspect both 1440x900 and a shorter viewport such as 1440x720. Confirm the middle editor, preview card, recent tasks, left settings entry, right local resources, and running history are not cut off or hidden.

## Documentation Maintenance

Update `DESIGN.md` when any of these change:

- Visual direction or palette.
- Layout structure or scroll behavior.
- Component anatomy or interaction expectations.
- Asset strategy or image style.
- Visual QA commands or acceptance criteria.

Update this `AGENTS.md` only when the implementation map, workflow commands, or durable collaboration rules change.
