import { redirect } from 'next/navigation'

/** The calendar is the home page now; the old address still works. */
export default function Page() { redirect('/') }
