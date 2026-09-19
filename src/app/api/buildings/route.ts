import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/buildings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'

    const { data, error, count } = await supabaseAdmin
      .from('buildings')
      .select('*', { count: 'exact' })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch buildings' },
      { status: 400 }
    )
  }
}

// POST /api/buildings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('buildings')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create building' },
      { status: 400 }
    )
  }
}
