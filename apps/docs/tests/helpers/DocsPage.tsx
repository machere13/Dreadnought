import { ButtonPage } from '../../src/content/components/Controls/ButtonDoc.tsx';
import { ToolbarPage } from '../../src/content/components/Controls/ToolbarDoc.tsx';
import { BadgePage } from '../../src/content/components/DataDisplay/BadgeDoc.tsx';
import { CodeBlockPage } from '../../src/content/components/DataDisplay/CodeBlockDoc.tsx';
import { IconPage } from '../../src/content/components/DataDisplay/IconDoc.tsx';
import { MarkPage } from '../../src/content/components/DataDisplay/MarkDoc.tsx';
import { TablePage } from '../../src/content/components/DataDisplay/Table/TableDoc.tsx';
import { MarkdownPreviewPage } from '../../src/content/components/DataDisplay/MarkdownPreviewDoc.tsx';
import { AlertPage } from '../../src/content/components/Feedback/AlertDoc.tsx';
import { ToastPage } from '../../src/content/components/Feedback/ToastDoc.tsx';
import { LoaderPage } from '../../src/content/components/Feedback/LoaderDoc.tsx';
import { ProgressPage } from '../../src/content/components/Feedback/ProgressDoc.tsx';
import { InputPage } from '../../src/content/components/Fields/InputDoc.tsx';
import { TextAreaPage } from '../../src/content/components/Fields/TextAreaDoc.tsx';
import { MarkdownEditorPage } from '../../src/content/components/Fields/MarkdownEditorDoc.tsx';
import { CheckboxPage } from '../../src/content/components/Fields/CheckboxDoc.tsx';
import { SwitchPage } from '../../src/content/components/Fields/SwitchDoc.tsx';
import { RadioPage } from '../../src/content/components/Fields/RadioDoc.tsx';
import { SelectPage } from '../../src/content/components/Fields/SelectDoc.tsx';
import { SliderPage } from '../../src/content/components/Fields/SliderDoc.tsx';
import { LayoutPage } from '../../src/content/components/Layout/LayoutDoc.tsx';
import { AccordionPage } from '../../src/content/components/Navigation/AccordionDoc.tsx';
import { BreadcrumbPage } from '../../src/content/components/Navigation/BreadcrumbDoc.tsx';
import { TabsPage } from '../../src/content/components/Navigation/TabsDoc.tsx';
import { MenuPage } from '../../src/content/components/Navigation/MenuDoc.tsx';
import { DropdownPage } from '../../src/content/components/Navigation/DropdownDoc.tsx';
import { PaginationPage } from '../../src/content/components/Navigation/PaginationDoc.tsx';
import { TreePage } from '../../src/content/components/Navigation/TreeDoc.tsx';
import { CardPage } from '../../src/content/components/Surfaces/CardDoc.tsx';
import { RadarChartPage } from '../../src/content/components/Visualization/RadarChartDoc.tsx';
import { LineChartPage } from '../../src/content/components/Visualization/LineChartDoc.tsx';
import { BarChartPage } from '../../src/content/components/Visualization/BarChartDoc.tsx';
import { TooltipPage } from '../../src/content/components/Overlays/TooltipDoc.tsx';
import { PopoverPage } from '../../src/content/components/Overlays/PopoverDoc.tsx';
import { ModalPage } from '../../src/content/components/Overlays/ModalDoc.tsx';
import { DrawerPage } from '../../src/content/components/Overlays/DrawerDoc.tsx';
import { FloatingPanelPage } from '../../src/content/components/Overlays/FloatingPanelDoc.tsx';
import { OverviewPage } from '../../src/content/guides/Overview.tsx';
import { GettingStartedPage } from '../../src/content/guides/GettingStarted.tsx';
import { ThemingPage } from '../../src/content/guides/ThemingGuide.tsx';
import { CustomComponentsPage } from '../../src/content/guides/CustomComponentsGuide.tsx';
import type { DocsSection } from '../../src/app/navigation.ts';

const pages = {
  'button': ButtonPage,
  'toolbar': ToolbarPage,
  'badge': BadgePage,
  'codeblock': CodeBlockPage,
  'icon': IconPage,
  'mark': MarkPage,
  'table': TablePage,
  'markdownpreview': MarkdownPreviewPage,
  'alert': AlertPage,
  'toast': ToastPage,
  'loader': LoaderPage,
  'progress': ProgressPage,
  'input': InputPage,
  'textarea': TextAreaPage,
  'markdowneditor': MarkdownEditorPage,
  'checkbox': CheckboxPage,
  'switch': SwitchPage,
  'radio': RadioPage,
  'select': SelectPage,
  'slider': SliderPage,
  'layout': LayoutPage,
  'accordion': AccordionPage,
  'breadcrumb': BreadcrumbPage,
  'tabs': TabsPage,
  'menu': MenuPage,
  'dropdown': DropdownPage,
  'pagination': PaginationPage,
  'tree': TreePage,
  'card': CardPage,
  'radarchart': RadarChartPage,
  'linechart': LineChartPage,
  'barchart': BarChartPage,
  'tooltip': TooltipPage,
  'popover': PopoverPage,
  'modal': ModalPage,
  'drawer': DrawerPage,
  'floatingpanel': FloatingPanelPage,
  'overview': OverviewPage,
  'getting-started': GettingStartedPage,
  'theming': ThemingPage,
  'custom-components': CustomComponentsPage,
};

export function DocsPage({ section }: { section: DocsSection }) {
  const Page = pages[section];
  return <Page />;
}
