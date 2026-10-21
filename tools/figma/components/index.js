import { componentContext, ensureSet, reviewBoard } from './context.js';
import { checkableSpecs, renderCheckable } from './checkable.js';
import { markSpec, renderMark, badgeSpec, badgeIcon, renderBadge } from './badge.js';
import { iconSpecs, legacySpecs } from './foundations.js';
import { fieldSpecs } from './fields.js';
import { pickerSpecs } from './pickers.js';
import { overlaySpecs } from './overlays.js';
import { layoutSpecs } from './layout.js';
import { dataSpecs } from './data.js';
import { chartSpecs } from './charts.js';
import {
  menuSpecs,
  renderMenuItem,
  renderMenu,
  renderDropdown,
  renderTabsOverflow,
} from './menus.js';
import {
  navigationSpecs,
  renderAccordionItem,
  renderAccordion,
  renderBreadcrumbItem,
  renderBreadcrumb,
  renderTab,
  renderTabs,
} from './navigation.js';
import {
  feedbackSpecs,
  alertFilledColors,
  renderNotice,
  renderLoader,
  renderLoaderOverlay,
} from './feedback.js';
import {
  selectSpecs,
  optionSpec,
  popupSpec,
  renderSelect,
  renderOption,
  renderPopup,
} from './select.js';

export const componentSpecs = [
  ...iconSpecs,
  ...legacySpecs,
  markSpec,
  ...checkableSpecs,
  optionSpec,
  ...selectSpecs,
  popupSpec,
  badgeSpec,
  ...feedbackSpecs,
  ...navigationSpecs,
  ...menuSpecs,
  ...fieldSpecs,
  ...pickerSpecs,
  ...overlaySpecs,
  ...layoutSpecs,
  ...dataSpecs,
  ...chartSpecs,
];
export const componentReviewNames = componentSpecs.map(
  (spec) => spec.name.replace('Dreadnought/', 'Dreadnought / ') + ' / Review',
);

export async function addComponents(figma, page, variables, icons, progress = () => {}) {
  const ctx = await componentContext(figma, page, variables, icons);
  ctx.catalog = new Map(
    page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).map((set) => [set.name, set]),
  );
  const results = [];
  async function add(spec, render) {
    progress('Компонент ' + spec.name);
    const result = await ensureSet(ctx, spec, render);
    results.push({ spec, ...result });
    ctx.catalog.set(spec.name, result.set);
    return result.set;
  }
  for (const spec of [...iconSpecs, ...legacySpecs])
    await add(spec, (node, props) => spec.render(ctx, node, props));
  const mark = await add(markSpec, (node, properties) => renderMark(ctx, node, properties));
  for (const spec of checkableSpecs)
    await add(spec, (node, properties) =>
      renderCheckable(ctx, node, properties, spec.name.split('/').pop()),
    );
  const option = await add(optionSpec, (node, properties) => renderOption(ctx, node, properties));
  for (const spec of selectSpecs)
    await add(spec, (node, properties) =>
      renderSelect(ctx, node, properties, spec.name.split('/').pop()),
    );
  await add(popupSpec, (node, properties) => renderPopup(ctx, node, properties, option));
  const icon = await badgeIcon(ctx);
  await add(
    {
      ...badgeSpec,
      properties: [
        ...badgeSpec.properties,
        {
          name: 'Mark',
          type: 'INSTANCE_SWAP',
          value: mark.children[0].id,
          slot: 'mark',
          field: 'mainComponent',
        },
        {
          name: 'Icon',
          type: 'INSTANCE_SWAP',
          value: icon.id,
          slot: 'icon',
          field: 'mainComponent',
        },
      ],
    },
    (node, properties) => renderBadge(ctx, node, properties, mark, icon),
  );
  const filled = await alertFilledColors(ctx);
  await add(feedbackSpecs[0], (node, properties) =>
    renderNotice(ctx, node, properties, 'alert', filled),
  );
  await add(feedbackSpecs[1], (node, properties) => renderNotice(ctx, node, properties, 'toast'));
  const loader = await add(feedbackSpecs[2], (node, properties) =>
    renderLoader(ctx, node, properties),
  );
  await add(feedbackSpecs[3], (node, properties) =>
    renderLoaderOverlay(ctx, node, properties, loader),
  );
  const accordionItem = await add(navigationSpecs[0], (node, props) =>
    renderAccordionItem(ctx, node, props),
  );
  await add(navigationSpecs[1], (node, props) => renderAccordion(ctx, node, props, accordionItem));
  const breadcrumbItem = await add(navigationSpecs[2], (node, props) =>
    renderBreadcrumbItem(ctx, node, props),
  );
  await add(navigationSpecs[3], (node, props) =>
    renderBreadcrumb(ctx, node, props, breadcrumbItem),
  );
  const tab = await add(navigationSpecs[4], (node, props) => renderTab(ctx, node, props));
  const more = await add(navigationSpecs[5], (node, props) => renderTab(ctx, node, props, true));
  await add(navigationSpecs[6], (node, props) => renderTabs(ctx, node, props, tab));
  const menuItem = await add(menuSpecs[0], (node, props) => renderMenuItem(ctx, node, props));
  const menu = await add(menuSpecs[1], (node, props) => renderMenu(ctx, node, props, menuItem));
  const dropdown = await add(menuSpecs[2], (node, props) => renderDropdown(ctx, node, props, menu));
  await add(menuSpecs[3], (node, props) =>
    renderTabsOverflow(ctx, node, props, tab, more, dropdown),
  );
  for (const spec of [
    ...fieldSpecs,
    ...pickerSpecs,
    ...overlaySpecs,
    ...layoutSpecs,
    ...dataSpecs,
    ...chartSpecs,
  ])
    await add(spec, (node, props) => spec.render(ctx, node, props));
  const reviewX = Math.max(0, ...page.children.map((n) => n.x + n.width)) + 160;
  let reviewY = 40;
  const frames = [];
  for (const { spec, set } of results) {
    const frame = await reviewBoard(ctx, spec, set, reviewX, reviewY);
    frames.push({ id: frame.id, name: frame.name });
    if (frame.x === reviewX) reviewY += frame.height + 100;
  }
  return {
    componentSets: results.map(({ set, created }) => ({
      id: set.id,
      name: set.name,
      variants: set.children.length,
      created,
    })),
    createdNodeIds: [
      ...new Set(ctx.createdNodes.filter((node) => !node.removed).map((node) => node.id)),
    ],
    updatedNodeIds: [...ctx.updated],
    derivedVariableIds: [...ctx.derived.values()].map((variable) => variable.id),
    effectStyleIds: ctx.popupEffect ? [ctx.popupEffect.id] : [],
    frames,
    visualVerification: 'pending — rerun the local plugin and inspect exported PNG',
  };
}
