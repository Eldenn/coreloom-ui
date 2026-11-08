# Booking

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Online appointment booking for a practice, a studio or a salon: pick a service, a day and a free time, check the recap, give a name and an email, and confirm. A confirmation follows, with the booking's reference and an **Add to calendar** file. The app owns the diary: the block asks it for the free times of a day and hands it the booking.

**The consumer provides** `services` (`id`, `name`, `duration` in minutes, and optionally `price` and `description`; with a single service the first step is skipped), `onLoadSlots({ serviceId, date })` (the day as "2026-10-15"; resolves with slots `{ start, available }`, `start` in ISO 8601 with its offset; reject to show an error with **Try again**) and `onBook({ serviceId, start, contact })` (`contact` has `name`, `email`, `phone`, `note`; resolve with `{ reference }` to show it, reject to show an error), and optionally `isDateUnavailable(date)` (closed days, holidays), `fromDate` (today by default) and `toDate` (60 days later), `timeZone` (the place's IANA zone: times are shown in it and it is named under them), `defaultServiceId`, `askPhone` (`true`: an optional phone field), `location` (written into the calendar file), `aside` (a PractitionerCard or OpeningHours, beside the steps from 1024 px and above them on phones) and `className`.

- The steps are listed at the top, the current one marked for screen readers (`aria-current="step"`). Each step's title takes focus when it opens, so a screen reader starts there; **Back** and the recap's **Change** buttons go back without losing what was chosen.
- Times come grouped as morning, afternoon and evening. Taken times show struck through and can't be picked; their name says "taken". While they load, placeholders hold their place.
- One polite live region says how many times are free on the chosen day, that there are none, or that they couldn't be loaded.
- Name and email are required and checked as you type once a field has been left; phone and note are optional. **Confirm** spins while `onBook` runs. A failure keeps everything filled in: the time may just have been taken.
- **Add to calendar** downloads an .ics file (`bookingIcs`) with the service, the time, the place and the reference. `groupSlots`, `dateKey` and `formatBookingDuration` are exported for screens of your own.
- Front-end only: payment, reminders and cancellation links are the app's.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/booking`.
