import { redirect } from 'next/navigation'
import ChatPanel from '@/components/ChatPanel'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  return <ChatPanel />
}
