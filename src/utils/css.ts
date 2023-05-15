export function setCssVar(name: string, value: string | null, dom = document.documentElement) {
  dom.style.setProperty(name, value)
}

export function isBrowserDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
