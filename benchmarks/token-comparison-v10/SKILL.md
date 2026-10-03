---
name: dreadnought
description: Build with installed Dreadnought components using a small MCP usage context.
---

The initial MCP reply gives verified examples and primitive prop choices. Implement directly from those examples. Do not request full API merely to reconfirm props already shown. Use MCP get only for a specific missing property that your implementation actually requires. Standard HTML/ARIA props work on the corresponding elements; Card accepts children and div attributes.

@dreadnought/ui/react includes CSS and its default theme. Use application CSS Modules for surrounding layout. On classes passed to ready components, only adjust external layout such as width or grid placement: do not set padding, background, border, radius, typography or interaction-state styling. No internal selectors, !important, unrequested component tokens or global button/input rules. Use native HTML for missing primitives. Do not read library source or previous screens. Build and fix errors.
