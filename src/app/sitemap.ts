import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://encera.com.tr'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/house`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/authentication`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/create-listing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // TODO: Property sayfaları için dynamic sitemap eklenecek
  // API'den property listesini çekip her property için URL oluşturulacak
  // Örnek:
  // const properties = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/public`)
  // const propertyPages = properties.map(property => ({
  //   url: `${baseUrl}/property/${property.id}`,
  //   lastModified: new Date(property.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }))

  return staticPages
}