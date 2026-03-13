/// <reference types="vite/client" />

declare module "*.mdx?raw" {
  const source: string;
  export default source;
}
