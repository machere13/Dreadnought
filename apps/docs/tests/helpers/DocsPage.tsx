import { ButtonPage } from '../../src/content/components/Controls/Button/ButtonDoc.tsx';
import { ToolbarPage } from '../../src/content/components/Controls/Toolbar/ToolbarDoc.tsx';
import { BadgePage } from '../../src/content/components/DataDisplay/Badge/BadgeDoc.tsx';
import { CodeBlockPage } from '../../src/content/components/DataDisplay/CodeBlock/CodeBlockDoc.tsx';
import { IconPage } from '../../src/content/components/DataDisplay/Icon/IconDoc.tsx';
import { MarkPage } from '../../src/content/components/DataDisplay/Mark/MarkDoc.tsx';
import { TablePage } from '../../src/content/components/DataDisplay/Table/TableDoc.tsx';
import { MarkdownPreviewPage } from '../../src/content/components/DataDisplay/MarkdownPreview/MarkdownPreviewDoc.tsx';
import { AlertPage } from '../../src/content/components/Feedback/Alert/AlertDoc.tsx';
import { ToastPage } from '../../src/content/components/Feedback/Toast/ToastDoc.tsx';
import { LoaderPage } from '../../src/content/components/Feedback/Loader/LoaderDoc.tsx';
import { ProgressPage } from '../../src/content/components/Feedback/Progress/ProgressDoc.tsx';
import { InputPage } from '../../src/content/components/Fields/Input/InputDoc.tsx';
import { TextAreaPage } from '../../src/content/components/Fields/TextArea/TextAreaDoc.tsx';
import { MarkdownEditorPage } from '../../src/content/components/Fields/MarkdownEditor/MarkdownEditorDoc.tsx';
import { CheckboxPage } from '../../src/content/components/Fields/Checkbox/CheckboxDoc.tsx';
import { SwitchPage } from '../../src/content/components/Fields/Switch/SwitchDoc.tsx';
import { RadioPage } from '../../src/content/components/Fields/Radio/RadioDoc.tsx';
import { SelectPage } from '../../src/content/components/Fields/Select/SelectDoc.tsx';
import { SliderPage } from '../../src/content/components/Fields/Slider/SliderDoc.tsx';
import { LayoutPage } from '../../src/content/components/Layout/Layout/LayoutDoc.tsx';
import { AccordionPage } from '../../src/content/components/Navigation/Accordion/AccordionDoc.tsx';
import { BreadcrumbPage } from '../../src/content/components/Navigation/Breadcrumb/BreadcrumbDoc.tsx';
import { TabsPage } from '../../src/content/components/Navigation/Tabs/TabsDoc.tsx';
import { MenuPage } from '../../src/content/components/Navigation/Menu/MenuDoc.tsx';
import { DropdownPage } from '../../src/content/components/Navigation/Dropdown/DropdownDoc.tsx';
import { PaginationPage } from '../../src/content/components/Navigation/Pagination/PaginationDoc.tsx';
import { TreePage } from '../../src/content/components/Navigation/Tree/TreeDoc.tsx';
import { CardPage } from '../../src/content/components/Surfaces/Card/CardDoc.tsx';
import { RadarChartPage } from '../../src/content/components/Visualization/RadarChart/RadarChartDoc.tsx';
import { LineChartPage } from '../../src/content/components/Visualization/LineChart/LineChartDoc.tsx';
import { BarChartPage } from '../../src/content/components/Visualization/BarChart/BarChartDoc.tsx';
import { TooltipPage } from '../../src/content/components/Overlays/Tooltip/TooltipDoc.tsx';
import { PopoverPage } from '../../src/content/components/Overlays/Popover/PopoverDoc.tsx';
import { ModalPage } from '../../src/content/components/Overlays/Modal/ModalDoc.tsx';
import { DrawerPage } from '../../src/content/components/Overlays/Drawer/DrawerDoc.tsx';
import { FloatingPanelPage } from '../../src/content/components/Overlays/FloatingPanel/FloatingPanelDoc.tsx';
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
