// The project's notes, in the rich text editor. The project page loads this file with React.lazy,
// so Tiptap (about 130 kB gzipped) downloads only when a project page opens, never with the rest of the app.
import { useQueryClient } from "@tanstack/react-query"

import { useAppForm } from "@/components/ui/form"
import { RichTextField } from "@/components/ui/rich-text-field"
import { toast } from "@/components/ui/sonner"
import { updateProject, type Project } from "@/lib/api"
import { useT } from "@/lib/locale"
import { projectQuery } from "@/lib/queries"

export default function ProjectNotes({ project }: { project: Project }) {
  const t = useT()
  const queryClient = useQueryClient()
  const form = useAppForm({
    defaultValues: { notes: project.description },
    onSubmit: async ({ value }) => {
      const updated = await updateProject(project.id, { description: value.notes })
      queryClient.setQueryData(projectQuery(project.id).queryKey, updated)
      form.reset({ notes: updated.description })
      toast.success(t.project.notesSaved)
    },
  })
  return (
    <form
      noValidate
      className="flex flex-col items-start gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="notes">
        {() => <RichTextField label={t.project.notes} hideLabel placeholder={t.project.notesPlaceholder} minHeight={140} className="w-full" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton size="sm" pendingLabel={t.project.savingNotes}>
          {t.project.saveNotes}
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
