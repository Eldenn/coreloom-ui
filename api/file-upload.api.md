# @coreloom/file-upload

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/file-upload.tsx

```ts
type FileRejection = {}
FileRejection.file: File
FileRejection.reason: 'type' | 'size' | 'count'
FileRejection.message: string
function FileUpload
FileUpload.value?: File[] | undefined
FileUpload.defaultValue?: File[] | undefined
FileUpload.onValueChange?: ((files: File[]) => void) | undefined
FileUpload.onReject?: ((rejections: FileRejection[]) => void) | undefined
FileUpload.accept?: string | undefined
FileUpload.multiple?: boolean | undefined
FileUpload.maxSize?: number | undefined
FileUpload.maxFiles?: number | undefined
FileUpload.progress?: ((file: File) => number | undefined) | undefined
FileUpload.disabled?: boolean | undefined
FileUpload.className?: string | undefined
FileUpload.id?: string | undefined
FileUpload.onBlur?: (() => void) | undefined
FileUpload.aria-invalid?: boolean | 'true' | 'false' | undefined
FileUpload.aria-describedby?: string | undefined
function formatBytes(bytes: number, locale: string) => string
```
