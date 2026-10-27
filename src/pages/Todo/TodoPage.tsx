import { useState } from 'react';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { todoGroups } from './todos';
import { useTodoState } from './useTodoState';

const total = todoGroups.reduce((sum, { items }) => sum + items.length, 0);

export const TodoPage = () => {
  const { done, toggle } = useTodoState();
  const [hideDone, setHideDone] = useState(false);

  const doneCount = todoGroups.reduce(
    (sum, { items }) => sum + items.filter(({ id }) => done.has(id)).length,
    0,
  );

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
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideDone((hidden) => !hidden)}
          >
            {hideDone ? 'Show done' : 'Hide done'}
          </Button>
        </div>
      </header>

      {todoGroups.map(({ title, items }) => {
        const visible = hideDone
          ? items.filter(({ id }) => !done.has(id))
          : items;

        if (visible.length === 0) return null;

        return (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {title}
            </h2>
            <ul className="flex flex-col gap-2">
              {visible.map(({ id, text }) => (
                <li key={id}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={done.has(id)}
                      onChange={() => toggle(id)}
                      className="mt-1 size-4 shrink-0 accent-brand"
                    />
                    <span
                      className={cn(
                        'text-pretty',
                        done.has(id) && 'text-muted-foreground line-through',
                      )}
                    >
                      {text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Container>
  );
};
