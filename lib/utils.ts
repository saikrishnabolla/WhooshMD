// Safe window access for SSR
export const isClient = typeof window !== 'undefined'

export const getWindowLocation = () => {
  if (isClient) {
    return window.location
  }
  return {
    href: '',
    origin: '',
    pathname: '/'
  }
}

export const navigateToUrl = (url: string) => {
  if (isClient) {
    window.location.href = url
  }
}

export const openInNewTab = (url: string) => {
  if (isClient) {
    window.open(url, '_blank')
  }
}