import { getFeatures } from '@/lib/data'
import { FeatureSearch } from '@/components/feature-search'

export const metadata = { title: 'Lab — бібліотека фіч' }

export default function LabPage() {
  const features = getFeatures()

  return (
    <main className="pb-32 pt-20" style={{ paddingInline: 'var(--gutter)' }}>
      <header className="reveal border-b border-line pb-12">
        <p className="eyebrow">Приватне</p>
        <h1 className="mt-5 text-[clamp(2.5rem,8vw,6rem)]">Lab</h1>
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted">
          Фічі, витягнуті з проєктів у самодостатні файли. Кожна працює, якщо відкрити її
          напряму в браузері — тому її можна взяти й покласти в новий проєкт як є.
        </p>
      </header>

      <div className="reveal pt-12">
        <FeatureSearch features={features} />
      </div>
    </main>
  )
}
