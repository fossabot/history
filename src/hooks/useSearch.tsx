'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import AutoComplete from '../components/ComboBox'
import { IndexedKeywords } from '../types/common'
import styles from './search.module.css'

interface ServerSideItem {
  corpus: string;
}

function useSearch<ItemType extends ServerSideItem>(
  { items, setMemoryIndex, indexedKeywords }:
  { items: ItemType[]; setMemoryIndex?: Function; indexedKeywords: IndexedKeywords[] },
): { filtered: ItemType[]; keyword: string; setKeyword: Function; searchBox: JSX.Element; } {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [keyword, setKeyword] = useState(searchParams?.get('keyword') || '')
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(null)

  const getShareUrlStem = () => {
    if (pathname?.includes('keyword=')) {
      return decodeURI(pathname)
      // const urlParts = new URL(window.location)
      // urlParts.searchParams.set('keyword', keyword)
      // return urlParts.toString()
    }
    return `${pathname ?? ''}?keyword=${keyword}`
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setKeyword(selectedOption?.value ?? '')
    setMemoryIndex?.(0)
  }

  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)
  const getSearchBox = (filtered: ItemType[]) => (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <h3 className={styles.searchCount}>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</h3>
        <AutoComplete
          className={styles.autocomplete}
          options={indexedKeywords}
          onChange={setSelectedOption}
          value={selectedOption}
        />
        <input type="submit" value="Filter" title="`&&` is AND; `||` is OR; for example `breakfast||lunch`" />
        <nav className={styles.shareLink}>{getShareUrlStem()}</nav>
      </div>
    </form>
  )

  const defaultReturn = {
    filtered: items,
    keyword: '',
    setKeyword,
    searchBox: getSearchBox(items),
  }

  useEffect(() => {
    if (searchParams?.get('keyword')) {
      const keywordQuery = searchParams.get('keyword') ?? ''
      setKeyword(keywordQuery)
      const newValue: IndexedKeywords = {
        label: keywordQuery,
        value: keywordQuery,
      }
      setSelectedOption(newValue)
    }
  }, [])

  const AND_OPERATOR = '&&'
  const OR_OPERATOR = '||'
  const normalizeCorpus = (corpus: string) => {
    const corpusWithoutAccentLow = corpus.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return (k: string) => {
      const keywordWithoutAccentLow = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      return corpusWithoutAccentLow.indexOf(keywordWithoutAccentLow) !== -1
    }
  }
  const filtered = items.filter((item) => {
    if (!keyword) return true
    const findMatch = normalizeCorpus(item.corpus)
    if (keyword.includes(AND_OPERATOR)) {
      return keyword.split(AND_OPERATOR).every(findMatch)
    }
    return keyword.split(OR_OPERATOR).some(findMatch)
  })

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox: getSearchBox(filtered),
  }
}

export default useSearch
