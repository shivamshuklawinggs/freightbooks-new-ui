import { Middleware } from '@reduxjs/toolkit'

import { indexedDBStorage } from '../store'
import { setCompany } from '../Slice/UserSlice'
const PROTECTED_KEYS = new Set([
  'persist:user',
  'persist:sidebar',
])

export const companyResetMiddleware: Middleware =
  () => (next) => async (action) => {
    if (setCompany.match(action)) {
      const keys = await indexedDBStorage.db.keys()
    
      const keysToRemove = keys.filter(
        (key:string) => key.startsWith('persist:') && !PROTECTED_KEYS.has(key)
      )

      await Promise.all(
        keysToRemove.map((key:string) => indexedDBStorage.db.removeItem(key))
      )
    }

    return next(action)
  }
