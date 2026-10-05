import { buttonPresentation } from '@dreadnought/ui';
import { Button } from '@dreadnought/ui/react';
import { tabsPresentation } from '@dreadnought/ui';
import { Tabs } from '@dreadnought/ui/react';
import { TabsAdapter } from '@dreadnought/react/unstyled';
import { useTabs } from '@dreadnought/react/logic';
import { radarChartPresentation, getRadarSeriesClass } from '@dreadnought/ui';
import { RadarChart } from '@dreadnought/ui/react';
import type { RadarChartProps } from '@dreadnought/ui/react';

const rootClass: string = buttonPresentation.root;
const component: typeof Button = Button;

void rootClass;
void component;
void tabsPresentation;
void Tabs;
void TabsAdapter;
void useTabs;
const radarSeriesClass: string = getRadarSeriesClass('__proto__');
const radarProps: RadarChartProps = { label: 'Radar', metrics: [], series: [] };
void [radarChartPresentation.root, radarSeriesClass, RadarChart, radarProps];
