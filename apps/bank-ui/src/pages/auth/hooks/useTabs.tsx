import { useCallback, useState } from 'react'

export const useTabs = (defaultTab = 'signin') => {
  const [tab, setTab] = useState<'signin' | 'signup' | string>(defaultTab)
  const changeTab = (newTab: string) => {
    setTab(newTab)
  }
  return {
    tab,
    changeTab
  }
}
