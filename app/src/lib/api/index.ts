// API fetch functions for the About Me page

// Types
import type { Info, Technology, Experience, Document, Project } from '@/dto/aboutme'
export type { Info, Technology, Experience, Document, Project, FullAboutMeData, PublicInfo, PublicAboutMeData } from '@/dto/aboutme'

// Fetch functions
export const fetchInfo = async (): Promise<Info[]> => {
  try {
    const response = await fetch('/api/info/private')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching info:', error)
    return []
  }
}

export const fetchTechnologies = async (): Promise<Technology[]> => {
  try {
    const response = await fetch('/api/technology')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching technologies:', error)
    return []
  }
}

export const fetchExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await fetch('/api/experience')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return []
  }
}

export const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const response = await fetch('/api/document')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/project')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

// Combined fetch function for all data needed on About Me page
export const fetchAllAboutMeData = async () => {
  try {
    const [info, technologies, experiences, documents, projects] = await Promise.all([
      fetchInfo(),
      fetchTechnologies(),
      fetchExperiences(),
      fetchDocuments(),
      fetchProjects()
    ])

    return {
      info,
      technologies,
      experiences,
      documents,
      projects
    }
  } catch (error) {
    console.error('Error fetching all about me data:', error)
    return {
      info: [],
      technologies: [],
      experiences: [],
      documents: [],
      projects: []
    }
  }
}