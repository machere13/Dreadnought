import { createRef } from 'react';
import { Card } from '@dreadnought/ui/react';
import { CardAdapter } from '@dreadnought/react/unstyled';

<Card
  ref={createRef<HTMLDivElement>()}
  title={<h3>Проект</h3>}
  extra={<button>Открыть</button>}
  size="compact"
  variant="borderless"
  slotClassNames={{ header: 'header', title: 'title', extra: 'extra', body: 'body' }}
/>;
<CardAdapter title={0} extra={<button>Действие</button>} />;
<Card
  cover={<img alt="Обложка" />}
  footer="Подвал"
  actions={[<button key="open">Открыть</button>] as const}
  slotClassNames={{ cover: 'cover', footer: 'footer', actions: 'actions', action: 'action' }}
/>;
<CardAdapter cover="Обложка" footer={0} actions={[]} />;
// @ts-expect-error Actions are an array of renderable nodes.
<Card actions="Открыть" />;
// @ts-expect-error unknown size
<Card size="small" />;
// @ts-expect-error unknown variant
<Card variant="filled" />;
