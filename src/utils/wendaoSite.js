const DEFAULT_WENDAO_SITE_BASE_URL = 'https://wendao.example.com'

export function getWendaoSiteBaseUrl() {
  return (import.meta.env.VITE_WENDAO_SITE_BASE_URL || DEFAULT_WENDAO_SITE_BASE_URL).replace(/\/+$/, '')
}

export function buildWendaoSiteUrl(path) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getWendaoSiteBaseUrl()}${normalizedPath}`
}

export function getArticleSiteUrl(row) {
  const path = row?.siteUrl || row?.canonicalUrl || (row?.slug ? `/blog/${row.slug}` : '')
  return buildWendaoSiteUrl(path)
}

export function getPublishArticleSiteUrl(row) {
  const path = row?.siteUrl || row?.canonicalUrl || (row?.articleSlug ? `/blog/${row.articleSlug}` : '')
  return buildWendaoSiteUrl(path)
}
