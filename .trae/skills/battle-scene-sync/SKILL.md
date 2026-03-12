---
name: "battle-scene-sync"
description: "Syncs BattleScene.tsx UI changes to battle-preview.html. Invoke when BattleScene.tsx is modified or user asks to sync battle preview."
---

# Battle Scene Sync

This skill ensures the battle UI preview HTML file stays synchronized with the React component.

## Trigger Conditions

**Invoke this skill IMMEDIATELY when:**
- `components/scenes/BattleScene.tsx` is modified (UI/layout changes)
- User mentions syncing battle preview
- User asks to update `battle-preview.html`
- Changes to battle UI components, styles, or layout

## Files Involved

| File | Purpose |
|------|---------|
| `components/scenes/BattleScene.tsx` | React battle scene component (source of truth) |
| `battle-preview.html` | Static HTML preview for UI design reference |

## Sync Checklist

When syncing changes, ensure the following are updated in `battle-preview.html`:

### 1. UI Structure
- [ ] Enemy area layout (position, sizing)
- [ ] Player cards layout
- [ ] Command menu buttons
- [ ] Turn order panel
- [ ] Battle log panel
- [ ] Result screens (victory/defeat/escaped)

### 2. Styling
- [ ] Color values (hex codes)
- [ ] Spacing and sizing
- [ ] Animations and transitions
- [ ] Responsive breakpoints
- [ ] Font sizes

### 3. Components
- [ ] HP/MP bars styling
- [ ] Skill selection panel
- [ ] BOSS tags
- [ ] Active turn indicators
- [ ] Level up animation

### 4. Icons
- [ ] Font Awesome icon classes match

## Key Mappings

### Color Palette
| Tailwind Class | CSS Value |
|----------------|-----------|
| `bg-[#382b26]` | Dark brown background |
| `bg-[#2c241b]` | Darker brown background |
| `bg-[#e8dfd1]` | Light cream background |
| `border-[#9b7a4c]` | Gold/brown border |
| `text-[#f0e6d2]` | Light cream text |
| `text-[#9b7a4c]` | Gold text |

### Command Buttons
| Command | Icon Class |
|---------|------------|
| Attack | `fa-sword` |
| Skill | `fa-wand-magic-sparkles` |
| Item | `fa-bag-shopping` |
| Guard | `fa-shield-halved` |
| Escape | `fa-person-running` |

### Result Screens
| Type | Title Color | Icon |
|------|-------------|------|
| Victory | `#059669` (emerald) | `fa-trophy` |
| Escaped | `#0891b2` (cyan) | `fa-person-running` |
| Defeat | `#dc2626` (red) | `fa-skull` |

## Example Usage

After modifying `BattleScene.tsx`:

1. Read the modified component
2. Identify UI changes (layout, styles, components)
3. Update `battle-preview.html` with equivalent changes
4. Verify all sync checklist items are addressed

## Notes

- The preview file uses vanilla CSS instead of Tailwind
- Convert Tailwind utility classes to equivalent CSS
- Maintain the demo buttons at the bottom for testing different states
- Keep JavaScript functions for interactive preview (skill list toggle, screen switching)
