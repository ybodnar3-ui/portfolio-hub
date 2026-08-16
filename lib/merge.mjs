/** Поля, які скрипт має право перезаписувати. Решта — недоторканна. */
const AUTO_FIELDS = ['lastTouched']

/** Ключ звірки — repo, а не slug: слаг може бути знеособлений під публічну вітрину. */
function keyOf(project) {
  return project.repo || project.slug
}

export function mergeProjects(existing, discovered) {
  const byKey = new Map(existing.map((p) => [keyOf(p), p]))

  for (const found of discovered) {
    const key = keyOf(found)
    if (!key) continue
    const current = byKey.get(key)

    if (current) {
      const updated = { ...current }
      for (const field of AUTO_FIELDS) {
        if (found[field]) updated[field] = found[field]
      }
      byKey.set(key, updated)
      continue
    }

    byKey.set(key, {
      slug: found.slug ?? key,
      repo: key,
      title: found.title ?? key,
      tagline: '',
      story: '',
      kind: found.kind ?? 'web',
      // Нове з диска — це поки не робота для вітрини. Підвищує людина.
      origin: 'practice',
      stack: found.stack ?? [],
      liveUrl: found.liveUrl ?? null,
      localPath: found.localPath ?? '',
      tags: [],
      status: 'idea',
      featureSlugs: [],
      // Сканер не вгадує домен — тільки підказує, де його взяти.
      nextStep: found.vercelProject
        ? `Взяти справжній URL: vercel inspect у ${found.vercelProject} → Aliases`
        : '',
      blocker: '',
      lastTouched: found.lastTouched ?? '',
      health: 'unknown',
    })
  }

  return [...byKey.values()]
}
