// Shared DTOs for About Me domain

export interface Info {
  id: number
  text: string
  visibility: boolean
  contact?: string
  cv?: string
  photo?: string
}

export type PublicInfo = Omit<Info, 'photo' | 'contact' | 'cv'>

export interface Technology {
  id: number
  name: string
  description: string
  icon?: string
}

export interface Experience {
  id: number
  description: string
  myResp: string
  company: string
}

export interface Document {
  id: number
  name: string
  year: number
  document: string
  issuer: string
  language: string
  comment?: string
}

export interface Project {
  id: number
  technologies: string
  description: string
  link?: string
}

// Aggregates
export type FullAboutMeData = {
  info: Info[]
  technologies: Technology[]
  experiences: Experience[]
  documents: Document[]
  projects: Project[]
}

export type PublicAboutMeData = {
  info: PublicInfo[]
  technologies: Technology[]
}