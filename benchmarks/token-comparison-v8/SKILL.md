---
name: dreadnought
description: Use public Dreadnought components with their installed-version MCP contracts.
---

The bootstrap reply includes compatible public API from MCP. Use these imports and contracts; request MCP get only for missing details. Do not read source files, old screens or the entire catalog.

@dreadnought/ui/react includes CSS and its default theme. Use ready component props and CSS Modules for surrounding application layout. Keep component typography, padding, borders, backgrounds and states; no !important, internal selectors or unrequested token changes. Scope native control CSS to your own classes (global button/input resets also override library styles). HTML is appropriate for primitives absent from this library. Standard HTML/ARIA props can be used on the corresponding elements. Build and fix errors.

