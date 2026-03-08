import { auth } from "@/lib/auth"
import AdminClient from "./AdminClient"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <AdminClient session={session} />
}
