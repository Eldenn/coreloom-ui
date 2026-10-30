# FileUpload

A drop zone (click, keyboard or drag) and the list of chosen files. It collects `File`s and checks them; uploading is yours.

**The consumer provides** `value` + `onValueChange` (`File[]`; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `accept` (`"image/*,.pdf"`), `maxSize` (bytes), `maxFiles`, `multiple` (on), `progress` (`(file) => 0–100 | undefined`, a bar while it's below 100) and `onReject` (the refused files with a reason and a message).

- The zone is a dashed `border-input` well; it turns `accent` on hover, drag and keyboard focus (the real file input is inside, visually hidden, so Tab, Enter and screen readers work). Refused files show one message each under it (`role="alert"`): wrong type, too large, too many.
- Each file is a row on `card`: a thumbnail for images (an object URL, revoked when the row goes), the name, the size in the locale's units ("2.3 MB", "2,3 Mo") and a remove button named after the file.
- Upload on change or on submit, and pass `progress`. Keep the description specific: "PNG, JPG or PDF, up to 5 MB each."
