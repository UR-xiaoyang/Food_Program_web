// 全局类型声明

export interface Plan {
  id: number
  date: string
  title: string
  content: string
  status: '已完成' | '进行中' | '未完成'
  items: Array<{ id: number; content: string; completed: boolean }>
}

export type PlanStatus = Plan['status'];