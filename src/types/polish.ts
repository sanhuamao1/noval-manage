export interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  useCount: number
  pace?: string
  mood?: string[]
  narrative?: string
  senses?: string[]
  character?: string[]
  environment?: string[]
  rhetoric?: string
  timeVariation?: boolean
  contrastInsertion?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PolishSample {
  id: string
  name: string
  prompt: string
  useCount: number
  sceneType?: string
  text?: string
  isNegative?: boolean
  createdAt?: string
  updatedAt?: string
}
