import HomePageContentEn from '@/components/homepage-en-new'
import HomePageContentFr from '@/components/homepage-fr-new'

interface HomePageProps {
  params: { locale: string }
}

export default function Page({ params }: HomePageProps) {
  const { locale } = params
  
  // Return locale-specific homepage content
  if (locale === 'fr') {
    return <HomePageContentFr />
  }
  
  return <HomePageContentEn />
}
