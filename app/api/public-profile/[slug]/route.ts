import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 })
  }

  const { slug } = await context.params

  if (!slug) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 })
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?slug=eq.${encodeURIComponent(slug)}&select=full_name,professional_title,bio,location,banner_url,video_url,edit_tools,video_styles,contact_method,contact_value`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível carregar o perfil." }, { status: 500 })
  }

  const profiles = (await response.json()) as Array<Record<string, unknown>>
  const profile = profiles[0]

  if (!profile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 })
  }

  return NextResponse.json(profile)
}
