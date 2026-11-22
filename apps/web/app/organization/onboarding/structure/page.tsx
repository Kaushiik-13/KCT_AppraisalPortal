'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { useOnboarding } from '@/components/org/onboarding-context';
import { Field } from '@/components/org/ui-parts';
import type { UnitKind } from '@/lib/org/types';

const KINDS: UnitKind[] = ['Department', 'School', 'Other'];

export default function StructurePage() {
  const { units, addUnit, removeUnit, unitsSkipped, setUnitsSkipped, people } = useOnboarding();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<UnitKind>('Department');
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const result = addUnit(name, kind);
    if (result) setError(result);
    else {
      setName('');
      setError(undefined);
    }
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <StepHeader
        title="Organization structure"
        description="Optional. Add departments, schools or other units to group people. You can skip this and add them later."
      />
      <NoticeBar />

      <Card>
        <CardHeader>
          <CardTitle>Add a unit</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
            onSubmit={(e) => { e.preventDefault(); submit(); }}
          >
            <Field
              id="unit-name"
              label="Unit name"
              placeholder="For example, Computer Science"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(undefined); }}
              error={error}
            />
            <Field id="unit-kind" label="Kind">
              <Select value={kind} onValueChange={(v) => setKind(v as UnitKind)}>
                <SelectTrigger id="unit-kind" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Button type="submit" className="sm:mt-[1.625rem]">
              <Plus aria-hidden data-icon="inline-start" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Units{units.length > 0 ? ` (${units.length})` : ''}</CardTitle>
          <CardDescription>
            {units.length === 0
              ? 'No units yet. That is fine: a smaller institution can skip this step.'
              : 'Employees can be placed in these units on the next step.'}
          </CardDescription>
        </CardHeader>
        {units.length > 0 ? (
          <CardContent>
            <ul className="divide-y rounded-md border">
              {units.map((u) => {
                const count = people.filter((p) => p.unitId === u.id).length;
                return (
                  <li key={u.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-muted-foreground text-xs">{u.kind}{count > 0 ? ` · ${count} employee${count === 1 ? '' : 's'}` : ''}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label={`Remove ${u.name}`} onClick={() => removeUnit(u.id)}>
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        ) : (
          <CardContent>
            <Button variant={unitsSkipped ? 'secondary' : 'outline'} onClick={() => setUnitsSkipped(!unitsSkipped)}>
              {unitsSkipped ? 'Skipped. Undo' : 'Skip this step for now'}
            </Button>
          </CardContent>
        )}
      </Card>

      <StepFooter current="structure" canContinue />
    </div>
  );
}
