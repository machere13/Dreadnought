import { Histogram } from '@dreadnought/ui/react';

const responseTimes = [42, 65, 81, 110, 125, 131, 145, 162, 180, 195, 210, 245, 280, 320, 410, 580];

export function HistogramBasicDemo() {
  return (
    <Histogram
      label="Время ответа сервера"
      data={responseTimes}
      bins={6}
      domain={[0, 600]}
      categoryLabel="Время, мс"
      valueLabel="Запросы"
    />
  );
}
