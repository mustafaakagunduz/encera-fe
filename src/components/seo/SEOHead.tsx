import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  locale?: string
  siteName?: string
}

export function generateSEOMetadata({
  title = 'ENCERA - Emlak İlanları',
  description = 'Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları.',
  keywords = 'emlak, gayrimenkul, satılık, kiralık, daire, ev, villa, işyeri, arsa, encera, papp',
  image = '/images/og-default.jpg',
  url = 'https://encera.com.tr',
  type = 'website',
  locale = 'tr_TR',
  siteName = 'ENCERA'
}: SEOProps): Metadata {

  const fullTitle = title.includes('ENCERA') ? title : `${title} | ENCERA`
  const imageUrl = image.startsWith('http') ? image : `https://encera.com.tr${image}`

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: 'PAPP Group' }],
    creator: 'PAPP Group',
    publisher: 'ENCERA',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale,
      url,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@encera_emlak',
    },
    alternates: {
      canonical: url,
      languages: {
        'tr': url,
        'en': `${url}/en`,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }
}