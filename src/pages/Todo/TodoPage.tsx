import { useState } from 'react';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { priorityRank } from './priorities';
import { TodoRow } from './TodoRow';
import { nextUpOrder, todoGroups } from './todos';
import { useTodoState } from './useTodoState';

type View = 'sections' | 'next';

const allItems = todoGroups.flatMap(({ title, items }) =>
  items.map((item) => ({ ...item, section: title })),
);

const total = allItems.length;

const nextUp = nextUpOrder.flatMap((id) => {
  const item = allItems.find((candidate) => candidate.id === id);

  return item ? [item] : [];
});

export const TodoPage = () => {
  const { done, toggle } = useTodoState();
  const [view, setView] = useState<View>('sections');

  const doneCount = allItems.filter(({ id }) => done.has(id)).length;
  const pending = nextUp.filter(({ id }) => !done.has(id));
  const finished = nextUp.filter(({ id }) => done.has(id));

  return (
    <Container
      as="section"
      size="narrow"
      className="flex flex-col gap-10 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex flex-col gap-3">
        <PageTitle>Todo</PageTitle>
        <p className="text-lg text-pretty text-muted-foreground">
          {doneCount} of {total} done. Checked items are saved in this browser.
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-label="View"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as View);
          }}
        >
          <ToggleGroupItem value="sections">By section</ToggleGroupItem>
          <ToggleGroupItem value="next">What&apos;s next</ToggleGroupItem>
        </ToggleGroup>
      </header>

      {view === 'next' ? (
        <ol className="flex flex-col gap-3">
          {[...pending, ...finished].map(
            ({ id, text, priority, owner, section }, index) => (
              <TodoRow
                key={id}
                text={text}
                priority={priority}
                owner={owner}
                done={done.has(id)}
                onToggle={() => toggle(id)}
                leading={`${index + 1}`}
                section={section}
              />
            ),
          )}
        </ol>
      ) : (
        todoGroups.map(({ title, items }) => (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {title}
            </h2>
            <ul className="flex flex-col gap-2">
              {items
                .toSorted(
                  (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
                )
                .map(({ id, text, priority, owner }) => (
                  <TodoRow
                    key={id}
                    text={text}
                    priority={priority}
                    owner={owner}
                    done={done.has(id)}
                    onToggle={() => toggle(id)}
                  />
                ))}
            </ul>
          </section>
        ))
      )}
    </Container>
  );
};
