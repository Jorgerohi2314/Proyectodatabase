"use client"

import { UserSearch as UserSearchComponent } from "./user-search"

interface UserSearchClientProps {
  onSearch: (filters: any) => void
  onClear: () => void
}

export function UserSearchClient({ onSearch, onClear }: UserSearchClientProps) {
  return <UserSearchComponent onSearch={onSearch} onClear={onClear} />
}