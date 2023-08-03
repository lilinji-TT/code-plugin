export enum ImprovementScope {
  SNIPPET = 'SNIPPET',
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
  PROJECT = 'PROJECT',
}

type Code = {
  content: string
  language: string
}

type ProjectObject = {
  path: string
  is_directory: boolean
  size: number
  code: Code
}

export type RequestData = {
  scope: ImprovementScope
  project_objects: ProjectObject[]
  rules: string[]
}