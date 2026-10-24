import type { TreemapItem, TreemapLayout } from '@dreadnought/core';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { TableAdapter as Table } from '../../DataDisplay/Table/TableAdapter.tsx';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { TreemapLabels, TreemapSlotProps } from './treemap.types.ts';

export const treemapLabels: Required<TreemapLabels> = {
  breadcrumb: 'Путь в Treemap',
  value: 'Значение',
  share: 'Доля в группе',
  totalShare: 'Доля от всего',
  name: 'Название',
  empty: 'Нет положительных значений',
};
export interface TreemapStatisticsProps {
  layout: TreemapLayout;
  labels: Required<TreemapLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  slotProps: TreemapSlotProps;
}
const keys = ['value', 'share', 'totalShare'] as const;
function values(item: TreemapItem, props: TreemapStatisticsProps) {
  return keys.map((key) => {
    const value = item[key];
    return value === null
      ? '—'
      : key === 'value'
        ? props.formatValue(value)
        : props.formatPercent(value);
  });
}
export function TreemapTooltip({ item, ...props }: TreemapStatisticsProps & { item: TreemapItem }) {
  return (
    <div data-ui="treemap-tooltip-content">
      <span>
        <MarkAdapter {...native(props.slotProps.tooltipMark)} shape="circle" />
        {item.label}
      </span>
      <p>{[...props.layout.path.map((node) => node.label), item.label].join(' / ')}</p>
      <table {...native(props.slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
        <tbody>
          {values(item, props).map((value, index) => (
            <tr key={keys[index]}>
              <th scope="row">{props.labels[keys[index]]}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function TreemapDataTable({
  label,
  rows,
  navigate,
  ...props
}: TreemapStatisticsProps & {
  label: string;
  rows: readonly TreemapItem[];
  navigate: (id: string) => void;
}) {
  const button = native(props.slotProps.navigationButton);
  return (
    <>
      <div
        {...native(props.slotProps.tableContainer)}
        onFocusCapture={(event) => {
          props.slotProps.tableContainer?.onFocusCapture?.(event);
          if (!event.defaultPrevented)
            (event.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
        }}
      >
        <Table
          {...native(props.slotProps.table, ['role', 'hidden', 'aria-hidden'])}
          data-ui="treemap-table"
        >
          <caption>
            {label}: {props.layout.root.label}
          </caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col">{props.labels.name}</Table.HeaderCell>
              {keys.map((key) => (
                <Table.HeaderCell key={key} scope="col">
                  {props.labels[key]}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((item) => (
              <Table.Row key={item.id}>
                <Table.HeaderCell scope="row">
                  {item.group ? (
                    <ButtonAdapter
                      {...button}
                      type="button"
                      onClick={(event) => {
                        button.onClick?.(event);
                        if (!event.defaultPrevented) navigate(item.id);
                      }}
                    >
                      {item.label}
                    </ButtonAdapter>
                  ) : (
                    item.label
                  )}
                </Table.HeaderCell>
                {values(item, props).map((value, index) => (
                  <Table.Cell key={keys[index]}>{value}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  );
}
