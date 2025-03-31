declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 添加以下声明来处理 .scss 文件
declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}