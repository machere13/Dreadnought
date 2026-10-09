import { buttonPresentation } from '@dreadnought/ui';
import type { ComponentProps } from 'react';
import { Accordion } from '@dreadnought/ui/react';
import { Button } from '@dreadnought/ui/react';
import { MarkdownEditor, type MarkdownEditorProps } from '@dreadnought/ui/react';
import { markdownEditorPresentation } from '@dreadnought/ui';
const markdownEditorProps: MarkdownEditorProps = {
  value: '',
  toolbar: false,
  labels: { bold: 'Bold' },
};
import { MarkdownPreview, type MarkdownPreviewProps } from '@dreadnought/ui/react';
import { markdownPreviewPresentation } from '@dreadnought/ui';
const previewProps: MarkdownPreviewProps = { value: '# Hello' };
const liveProps: MarkdownEditorProps = {
  preview: 'live',
  historyLimit: 20,
  onPreviewChange: (mode) => void mode,
};
const uploadProps: MarkdownEditorProps = {
  uploadImage: async (file, { signal }) => {
    signal.throwIfAborted();
    return `/images/${encodeURIComponent(file.name)}`;
  },
  labels: { cancelUpload: 'Cancel upload', uploadError: 'Upload failed' },
};
void uploadProps;
void [MarkdownPreview, markdownPreviewPresentation.root, previewProps, liveProps];
void [MarkdownEditor, markdownEditorPresentation.field, markdownEditorProps];
import { tabsPresentation } from '@dreadnought/ui';
import { Tabs } from '@dreadnought/ui/react';
import { TabsAdapter } from '@dreadnought/react/unstyled';
import { useTabs } from '@dreadnought/react/logic';
import { radarChartPresentation, getRadarSeriesClass } from '@dreadnought/ui';
import { RadarChart } from '@dreadnought/ui/react';
import type { RadarChartProps } from '@dreadnought/ui/react';
import { barChartPresentation, getBarSeriesClass } from '@dreadnought/ui';
import { BarChart, type BarChartProps } from '@dreadnought/ui/react';
const barProps: BarChartProps = { label: 'Bar', categories: [], series: [], domain: [0, 100] };
const barSeriesClass: string = getBarSeriesClass('__proto__');
void [barChartPresentation.root, barSeriesClass, BarChart, barProps];

const rootClass: string = buttonPresentation.root;
const component: typeof Button = Button;

void rootClass;
void component;
void tabsPresentation;
void Tabs;
const lazyTabsPanel: ComponentProps<typeof Tabs.Panel> = { value: 'a', mountPolicy: 'lazy' };
const resetAccordionPanel: ComponentProps<typeof Accordion.Panel> = { children: 'Content', mountPolicy: 'unmount' };
// @ts-expect-error Ready panels only accept the supported mount policies.
const invalidTabsPanel: ComponentProps<typeof Tabs.Panel> = { value: 'a', mountPolicy: 'destroy' };
void [lazyTabsPanel, resetAccordionPanel, invalidTabsPanel];
void TabsAdapter;
void useTabs;
const radarSeriesClass: string = getRadarSeriesClass('__proto__');
const radarProps: RadarChartProps = { label: 'Radar', metrics: [], series: [] };
void [radarChartPresentation.root, radarSeriesClass, RadarChart, radarProps];
