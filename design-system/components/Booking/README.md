# Booking

Online appointment booking: a service, a day and a free time, then a recap with the visitor's details and Confirm; a confirmation with its reference and Add to calendar follows. The app owns the diary.

**`Booking` takes** `services`, `onLoadSlots({ serviceId, date }) => Promise<slots>`, `onBook(request) => Promise<{ reference }>`, and optionally `isDateUnavailable`, `fromDate`, `toDate`, `timeZone`, `defaultServiceId`, `askPhone`, `location`, `aside` (a PractitionerCard or OpeningHours) and `className`.

- Each step's title takes focus when it opens; Back and Change keep what was chosen.
- Times are grouped by part of the day; taken ones are struck through and named "taken".
- A polite live region says how many times are free.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/booking`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
