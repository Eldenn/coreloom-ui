// TanStack Form + TanStack Query together: the schema validates as you type, the mutation runs on
// submit, and an error from the API lands on its field (or at the top of the form).
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'
import { ApiError, createProject, type Project, type Region } from '@/lib/api'
import { useT } from '@/lib/locale'
import type { Messages } from '@/messages'

const schemaFor = (t: Messages) =>
  z.object({
    name: z
      .string()
      .min(1, t.newProject.nameRequired)
      .regex(/^[a-z0-9-]*$/, t.newProject.nameFormat),
    region: z.enum(['cdg1', 'fra1', 'iad1']),
    framework: z.string().min(1, t.newProject.frameworkRequired),
  })

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (project: Project) => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const created = React.useRef<Project | null>(null)
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const form = useAppForm({
    defaultValues: { name: '', region: 'cdg1' as Region, framework: '' },
    validators: {
      onChange: schemaFor(t),
      // The "server" check: its errors go to the field they concern, or to the whole form.
      onSubmitAsync: async ({ value }) => {
        try {
          created.current = await mutation.mutateAsync(value)
          return undefined
        } catch (error) {
          if (error instanceof ApiError && error.field)
            return { form: undefined, fields: { [error.field]: error.message } }
          return { form: t.newProject.failed, fields: {} }
        }
      },
    },
    onSubmit: () => {
      const project = created.current
      if (!project) return
      toast.success(t.newProject.created(project.name))
      onOpenChange(false)
      onCreated?.(project)
    },
  })

  // Start from a blank form each time the dialog opens.
  React.useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t.newProject.title}</DialogTitle>
            <DialogDescription>{t.newProject.description}</DialogDescription>
          </DialogHeader>
          <form.AppForm>
            <form.FormErrors />
          </form.AppForm>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label={t.newProject.name}
                description={t.newProject.nameHint}
                placeholder="acme-web"
                autoComplete="off"
              />
            )}
          </form.AppField>
          <form.AppField name="region">
            {(field) => (
              <field.SelectField
                label={t.newProject.region}
                options={(['cdg1', 'fra1', 'iad1'] as const).map((value) => ({
                  value,
                  label: t.regions[value],
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="framework">
            {(field) => (
              <field.SelectField
                label={t.newProject.framework}
                placeholder={t.newProject.frameworkPlaceholder}
                options={['React + Vite', 'AdonisJS', 'Next.js', 'Astro'].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            )}
          </form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton pendingLabel={t.newProject.creating}>
                {t.newProject.create}
              </form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
