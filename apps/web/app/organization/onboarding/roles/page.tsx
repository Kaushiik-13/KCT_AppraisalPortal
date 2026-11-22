'use client';

import { CircleAlert, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { useOnboarding } from '@/components/org/onboarding-context';
import { effectiveSupervisorId } from '@/lib/org/validation';

const NONE = '__none';

export default function RolesPage() {
  const { people, units, updatePerson, issues, sim } = useOnboarding();
  const supervisors = people.filter((p) => p.isSupervisor);
  const facultyCount = people.filter((p) => p.isFaculty).length;

  return (
    <div className="grid gap-6">
      <StepHeader
        title="Roles and supervisors"
        description="Choose who is faculty and who is a supervisor, then pick the supervisor who reviews each faculty member. One person can be both, but nobody reviews their own work."
      />
      <NoticeBar />

      {issues.length > 0 ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertTitle>{issues.length} thing{issues.length === 1 ? '' : 's'} to fix before you continue</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {issues.map((i) => <li key={i.id}>{i.message}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      ) : people.length > 0 ? (
        <Alert>
          <CheckCircle2 aria-hidden />
          <AlertTitle>Every faculty member has a supervisor</AlertTitle>
          <AlertDescription>{facultyCount} faculty and {supervisors.length} supervisor{supervisors.length === 1 ? '' : 's'} assigned.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Responsibilities and review scope</CardTitle>
          <CardDescription>
            Invitation, membership, role and supervisor assignment are separate things. This step covers role and supervisor assignment only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <p className="text-muted-foreground text-sm">No employees yet. Go back and add people first.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead className="w-24">Faculty</TableHead>
                    <TableHead className="w-28">Supervisor</TableHead>
                    <TableHead className="min-w-64">Reviewed by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.map((p) => {
                    const supervisorId = effectiveSupervisorId(p, sim);
                    const problem = issues.find((i) => i.personId === p.id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {units.find((u) => u.id === p.unitId)?.name ?? 'No unit'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            aria-label={`${p.name} is faculty`}
                            checked={p.isFaculty}
                            onCheckedChange={(v) => updatePerson(p.id, { isFaculty: v === true })}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            aria-label={`${p.name} is a supervisor`}
                            checked={p.isSupervisor}
                            onCheckedChange={(v) => updatePerson(p.id, { isSupervisor: v === true })}
                          />
                        </TableCell>
                        <TableCell>
                          {p.isFaculty ? (
                            <div className="grid gap-1">
                              <Select
                                value={supervisorId ?? NONE}
                                onValueChange={(v) => updatePerson(p.id, { supervisorId: v === NONE ? null : v })}
                              >
                                <SelectTrigger
                                  className="w-full"
                                  aria-label={`Supervisor for ${p.name}`}
                                  aria-invalid={problem ? true : undefined}
                                >
                                  <SelectValue placeholder="Choose a supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NONE}>Not assigned</SelectItem>
                                  {supervisors.map((s) => (
                                    <SelectItem key={s.id} value={s.id} disabled={s.id === p.id}>
                                      {s.name}{s.id === p.id ? ' (cannot review own work)' : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {problem ? <p role="alert" className="text-destructive text-xs">{problem.message}</p> : null}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not faculty</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <StepFooter
        current="roles"
        canContinue={people.length > 0 && issues.length === 0}
        blockedReason="Fix the items above to continue."
      />
    </div>
  );
}
