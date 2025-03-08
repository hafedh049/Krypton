export type Category = string

export interface Task {
  id: string
  text: string
  completed: boolean
  category: Category
  createdAt: Date
  scheduledTime?: {
    date: Date
    startTime: string
    endTime: string
  }
}

