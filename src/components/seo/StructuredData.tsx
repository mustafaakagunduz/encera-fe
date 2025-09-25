import React from 'react'

interface PropertyStructuredDataProps {
  property: {
    id: string
    title: string
    description: string
    price: number
    currency: string
    propertyType: string
    listingType: string
    address: string
    city: string
    district: string
    images: string[]
    bedrooms?: number
    bathrooms?: number
    area?: number
    createdAt: string
    updatedAt: string
  }
}

export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://encera.com.tr/property/${property.id}`,
    "image": property.images.map(img => `https://encera.com.tr${img}`),
    "datePosted": property.createdAt,
    "dateModified": property.updatedAt,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": property.currency || "TRY",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": property.price,
        "priceCurrency": property.currency || "TRY"
      },
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.district,
      "addressRegion": property.city,
      "addressCountry": "TR"
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitCode": "MTK"
    },
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "provider": {
      "@type": "Organization",
      "name": "ENCERA",
      "url": "https://encera.com.tr",
      "logo": "https://encera.com.tr/images/logo.png"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface OrganizationStructuredDataProps {
  organization: {
    name: string
    url: string
    logo: string
    description: string
    address?: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    contactPoint?: {
      telephone: string
      contactType: string
      email: string
    }
  }
}

export function OrganizationStructuredData({ organization }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization.name,
    "url": organization.url,
    "logo": organization.logo,
    "description": organization.description,
    ...(organization.address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": organization.address.street,
        "addressLocality": organization.address.city,
        "postalCode": organization.address.postalCode,
        "addressCountry": organization.address.country
      }
    }),
    ...(organization.contactPoint && {
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": organization.contactPoint.telephone,
        "contactType": organization.contactPoint.contactType,
        "email": organization.contactPoint.email
      }
    }),
    "sameAs": [
      "https://www.facebook.com/encera",
      "https://www.twitter.com/encera_emlak",
      "https://www.instagram.com/encera_emlak"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ENCERA",
    "alternateName": "ENCERA Emlak",
    "url": "https://encera.com.tr",
    "description": "Emlak sektöründe dijital dönüşüm için PAPP. En güncel emlak ilanları, satılık ve kiralık daire, ev, işyeri ilanları.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://encera.com.tr/house?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PAPP Group",
      "url": "https://encera.com.tr"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}