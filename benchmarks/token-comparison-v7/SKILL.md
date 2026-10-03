---
name: dreadnought
description: Build React interfaces with the installed Dreadnought components and matching MCP catalog.
---

Read public component contracts in one batched MCP context call for the components you need. The reply checks installed versions; require compatible status. Query get only for missing details or a truncated reply. Do not read library source, old implementations or the entire catalog.

Use public imports from the response. @dreadnought/ui/react includes the default theme and CSS. Ready components already supply their visual styles: use their props, and CSS Modules for application layout. Do not restyle internal selectors, assign component tokens without an explicit design request, or use !important. Normal HTML is fine for missing primitives. Standard HTML and ARIA props are accepted where the contract allows them. Prefer the shortest public API that fits the task. Verify the build and fix errors.

