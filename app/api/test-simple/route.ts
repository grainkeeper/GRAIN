import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Simple API is working' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ 
    message: 'Simple POST is working',
    received: body 
  })
}
