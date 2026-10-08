export interface TooltipCoreOptions {
  tooltipId: string;
  open?: boolean;
  disabled?: boolean;
  describedBy?: string;
}
export interface TooltipCore {
  open: boolean;
  triggerProps: { 'aria-describedby': string | undefined };
  contentProps: { id: string; role: 'tooltip'; hidden: boolean };
}
