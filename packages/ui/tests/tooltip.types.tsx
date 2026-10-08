import { Tooltip, Button } from '@dreadnought/ui/react';
import type { TooltipProps } from '@dreadnought/ui/react';
import { TooltipAdapter } from '@dreadnought/react/unstyled';
import { useTooltip } from '@dreadnought/react/logic';
import { tooltipPresentation } from '@dreadnought/ui';

const props: TooltipProps = {
  content: 'Help',
  children: (trigger) => <Button {...trigger}>Action</Button>,
};
const html = (
  <Tooltip
    {...props}
    placement="rightBottom"
    arrow={{ pointAtCenter: true }}
    autoAdjustOverflow={false}
  />
);
const svg = (
  <TooltipAdapter content="Value">
    {(trigger) => (
      <svg>
        <circle {...trigger} tabIndex={0} cx={0} cy={0} r={2} />
      </svg>
    )}
  </TooltipAdapter>
);
void [html, svg, useTooltip, tooltipPresentation.root];
