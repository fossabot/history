'use client'

import createCache, { type Options } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssVarsProvider } from '@mui/joy/styles'
import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'
import theme from './theme'

type ComponentProps = { options: Options, children: React.ReactNode }

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export default function ThemeRegistry({ options, children }: ComponentProps) {
  const themeState = () => {
    const cache = createCache(options)
    cache.compat = true
    const prevInsert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache, flush }
  }

  const [{ cache, flush }] = useState(themeState)

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }

    const styles = names.map((name) => cache.inserted[name]).join('')
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <CssVarsProvider theme={theme}>
        {children}
      </CssVarsProvider>
    </CacheProvider>
  )
}
