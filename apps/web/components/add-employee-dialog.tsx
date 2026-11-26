'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSetup } from '@/lib/setup-store';

const NONE = '__none__';

/** `open` is null when closed, otherwise the preselected department id ('' for none). */
export function AddEmployeeDialog({ open, onClose }: { open: string | null; onClose: () => void }) {
  const { departments, addEmployee } = useSetup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState(NONE);

  useEffect(() => {
    if (open !== null) setDept(open || NONE);
  }, [open]);

  const reset = () => {
    setName('');
    setEmail('');
    setTitle('');
  };

  const submit = (another: boolean) => {
    addEmployee({ name, email, title, departmentId: dept === NONE ? '' : dept });
    reset();
    if (!another) onClose();
  };

  return (
    <Dialog open={open !== null} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an employee</DialogTitle>
          <DialogDescription>They are saved as a draft and invited at the final review.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="a-name">Full name</Label>
            <Input id="a-name" autoFocus placeholder="Priya Raman" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="a-email">Work email</Label>
            <Input id="a-email" type="email" placeholder="priya@acme.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="a-title">Job title</Label>
              <Input id="a-title" placeholder="Software Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="a-dept">Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger id="a-dept" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No department</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-1">
            <Button type="button" variant="ghost" onClick={() => submit(true)}>Add and add another</Button>
            <Button type="submit">Add employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
