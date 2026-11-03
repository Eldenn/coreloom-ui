// Sample content for the showcase stories: an osteopathy practice in Lyon. The pictures are drawn
// inline (the stories load nothing from the network).
import type { HoursException, WeeklyHours } from '@/components/contact-section'

const svg = (body: string, w = 800, h = 600) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(w)}" height="${String(h)}" viewBox="0 0 ${String(w)} ${String(h)}">${body}</svg>`,
  )}`

/** A bright treatment room: window, table, plant. */
export const roomPhoto = svg(
  `<rect width="800" height="600" fill="#d9d2c5"/><rect x="470" y="70" width="250" height="300" rx="6" fill="#eef3f6"/><rect x="470" y="70" width="250" height="300" rx="6" fill="none" stroke="#b9b0a2" stroke-width="10"/><path d="M595 70V370M470 220H720" stroke="#b9b0a2" stroke-width="6"/><rect y="440" width="800" height="160" fill="#b8ad9b"/><rect x="120" y="360" width="380" height="40" rx="14" fill="#4f6b7d"/><rect x="150" y="400" width="18" height="110" fill="#3a342b"/><rect x="450" y="400" width="18" height="110" fill="#3a342b"/><ellipse cx="160" cy="352" rx="46" ry="14" fill="#eef3f6"/><rect x="640" y="430" width="70" height="80" rx="8" fill="#8a7f70"/><path d="M675 430c-40-60-10-120 0-150 10 30 40 90 0 150z" fill="#5f7d5a"/><path d="M675 430c-70-30-80-90-75-110 25 20 60 50 75 110z" fill="#6f8f69"/>`,
)

/** The same room at dusk, for the cover hero. */
export const roomPhotoDusk = svg(
  `<rect width="1600" height="900" fill="#2a3540"/><rect x="980" y="110" width="420" height="460" rx="8" fill="#e9b97a" opacity=".9"/><path d="M1190 110V570M980 340H1400" stroke="#1c252d" stroke-width="12"/><rect y="660" width="1600" height="240" fill="#1d262e"/><rect x="260" y="540" width="640" height="60" rx="20" fill="#4f6b7d"/><rect x="300" y="600" width="26" height="160" fill="#11171c"/><rect x="830" y="600" width="26" height="160" fill="#11171c"/><circle cx="1190" cy="240" r="80" fill="#f5d7a6"/>`,
  1600,
  900,
)

/** A street map with a pin, for the contact section. */
export const mapPicture = svg(
  `<rect width="800" height="600" fill="#e7e3da"/><path d="M0 180H800M0 420H800M220 0V600M560 0V600" stroke="#fdfbf7" stroke-width="34"/><path d="M0 300L800 120" stroke="#fdfbf7" stroke-width="22"/><rect x="250" y="210" width="280" height="180" fill="#c9d8c2"/><path d="M640 0C600 200 700 400 640 600" stroke="#a9c3d6" stroke-width="40" fill="none"/><path d="M400 250c-34 0-60 26-60 58 0 44 60 102 60 102s60-58 60-102c0-32-26-58-60-58z" fill="#4f6b7d"/><circle cx="400" cy="308" r="20" fill="#fdfbf7"/>`,
)

/** A portrait: background, shoulders, head and hair in the given colours. */
export function portrait(bg: string, skin: string, hair: string, top: string) {
  return svg(
    `<rect width="400" height="500" fill="${bg}"/><path d="M60 500c10-110 70-160 140-160s130 50 140 160z" fill="${top}"/><rect x="176" y="280" width="48" height="70" rx="20" fill="${skin}"/><ellipse cx="200" cy="215" rx="78" ry="92" fill="${skin}"/><path d="M118 210c-6-80 40-122 86-122 50 0 88 40 80 122-14-40-40-64-82-66-42 2-70 26-84 66z" fill="${hair}"/>`,
    400,
    500,
  )
}

export const practitioners = [
  {
    name: 'Claire Morel',
    profession: 'Osteopath D.O.',
    photo: portrait('#c9d4dc', '#e8c4a8', '#5a3b2a', '#4f6b7d'),
    specialties: ['Infants', 'Pregnancy', 'Back pain'],
    bio: 'Trained at the Lyon school of osteopathy, Claire has run the practice since 2014. She sees babies from their first weeks.',
    languages: 'French, English',
  },
  {
    name: 'Karim Benali',
    profession: 'Osteopath D.O. — sports',
    photo: portrait('#d8cfc1', '#b98a68', '#1f1a17', '#2e3d47'),
    specialties: ['Sports', 'Joints', 'Recovery'],
    bio: 'Former physiotherapist for the Lyon rugby academy. Karim works with runners, climbers and anyone back from an injury.',
    languages: 'French, Arabic',
  },
  {
    name: 'Inès Garnier',
    profession: 'Osteopath D.O.',
    photo: portrait('#cfd8cf', '#f0d0b8', '#a8743f', '#6b5b4b'),
    specialties: ['Seniors', 'Headaches', 'Stress'],
    bio: 'Inès joined in 2022. Gentle, structural work for older patients and for tension that comes with desk jobs.',
    languages: 'French, Spanish',
  },
]

export const weeklyHours: WeeklyHours = {
  monday: [
    { open: '09:00', close: '12:30' },
    { open: '14:00', close: '19:00' },
  ],
  tuesday: [
    { open: '09:00', close: '12:30' },
    { open: '14:00', close: '19:00' },
  ],
  wednesday: [{ open: '09:00', close: '12:30' }],
  thursday: [
    { open: '09:00', close: '12:30' },
    { open: '14:00', close: '20:00' },
  ],
  friday: [
    { open: '09:00', close: '12:30' },
    { open: '14:00', close: '18:00' },
  ],
  saturday: [{ open: '09:00', close: '13:00' }],
}

export const hoursExceptions: HoursException[] = [
  { date: '2026-11-01', label: 'All Saints’ Day' },
  { date: '2026-11-11', label: 'Armistice Day' },
  { date: '2026-12-24', label: 'Christmas Eve', hours: [{ open: '09:00', close: '12:00' }] },
]

/** Wednesday 14 October 2026, 10:30 on the visitor's clock (the stories' frozen day). */
export const storyNow = new Date(2026, 9, 14, 10, 30)
