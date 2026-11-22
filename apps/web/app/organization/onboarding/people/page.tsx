'use client';

import { useState } from 'react';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { useOnboarding } from '@/components/org/onboarding-context';
import { RosterImport } from '@/components/org/roster-import';
import { Field, InviteBadge } from '@/components/org/ui-parts';

const NO_UNIT = '__none';

export default function PeoplePage() {
  const { people, units, addPerson, removePerson, displayStatus, sim } = useOnboarding();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState(NO_UNIT);
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const result = addPerson({ name, email, unitId: unit === NO_UNIT ? null : unit });
    if (result) setError(result);
    else {
      setName('');
      setEmail('');
      setError(undefined);
    }
  };

  return (
    <div className="grid gap-6">
      <StepHeader
        title="Employees"
        description="Add the people who will take part in appraisals. Nobody is invited yet: invitations are sent only when you confirm setup on the last step."
      />
      <NoticeBar />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Add an employee</CardTitle>
            <CardDescription>One at a time, or import many from a roster.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
              <Field id="emp-name" label="Full name" required value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} />
              <Field
                id="emp-email"
                label="Work email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(undefined); }}
                error={error}
              />
              {units.length > 0 ? (
                <Field id="emp-unit" label="Unit">
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="emp-unit" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_UNIT}>No unit</SelectItem>
                      {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
              <Button type="submit"><UserPlus aria-hidden data-icon="inline-start" /> Add employee</Button>
            </form>
            <div className="mt-4 border-t pt-4">
              <RosterImport />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employees in setup{people.length > 0 ? ` (${people.length})` : ''}</CardTitle>
            <CardDescription>You will choose roles and supervisors on the next step.</CardDescription>
          </CardHeader>
          <CardContent>
            {sim.loadingRoster ? (
              <div className="grid gap-2" role="status" aria-label="Loading employees">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : people.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm">
                <Users className="size-8" aria-hidden />
                <p className="text-foreground font-medium">No employees yet</p>
                <p>Add someone using the form, or import a roster.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {people.map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{units.find((u) => u.id === p.unitId)?.name ?? <span className="text-muted-foreground">None</span>}</TableCell>
                        <TableCell><InviteBadge status={displayStatus(p, i)} /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${p.name}`} onClick={() => removePerson(p.id)}>
                            <Trash2 aria-hidden />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StepFooter current="people" canContinue={people.length > 0} blockedReason="Add at least one employee to continue." />
    </div>
  );
}
