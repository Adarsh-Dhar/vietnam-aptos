import { NextRequest, NextResponse } from 'next/server'
import { getAllProjects, getProject } from '@/lib/contract'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    
    if (projectId) {
      // Get specific project
      const project = await getProject(parseInt(projectId))
      return NextResponse.json({ project })
    } else {
      // Get all projects
      const projects = await getAllProjects()
      return NextResponse.json({ projects })
    }
  } catch (error) {
    console.error('Get contract projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects from contract' },
      { status: 500 }
    )
  }
} 