# @coreloom/data-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/data-list.tsx

```ts
type DataList<T extends object = any> = {}
DataList.state: DataListState
DataList.setSearch: (value: string) => void
DataList.setFacet: (key: string, values: string[]) => void
DataList.setPage: (p: number) => void
DataList.clear: () => void
DataList.facets: Facet<T>[]
DataList.counts: Record<string, Record<string, number>>
DataList.filtered: T[]
DataList.pageRows: T[]
DataList.page: number
DataList.pageCount: number
DataList.total: number
DataList.isFiltered: boolean
function DataListEmpty
DataListEmpty.list: {}
DataListEmpty.list.state: DataListState
DataListEmpty.list.setSearch: (value: string) => void
DataListEmpty.list.setFacet: (key: string, values: string[]) => void
DataListEmpty.list.setPage: (p: number) => void
DataListEmpty.list.clear: () => void
DataListEmpty.list.facets: Facet<any>[]
DataListEmpty.list.counts: Record<string, Record<string, number>>
DataListEmpty.list.filtered: any[]
DataListEmpty.list.pageRows: any[]
DataListEmpty.list.page: number
DataListEmpty.list.pageCount: number
DataListEmpty.list.total: number
DataListEmpty.list.isFiltered: boolean
DataListEmpty.className?: string | undefined
function DataListPagination
DataListPagination.list: {}
DataListPagination.list.state: DataListState
DataListPagination.list.setSearch: (value: string) => void
DataListPagination.list.setFacet: (key: string, values: string[]) => void
DataListPagination.list.setPage: (p: number) => void
DataListPagination.list.clear: () => void
DataListPagination.list.facets: Facet<any>[]
DataListPagination.list.counts: Record<string, Record<string, number>>
DataListPagination.list.filtered: any[]
DataListPagination.list.pageRows: any[]
DataListPagination.list.page: number
DataListPagination.list.pageCount: number
DataListPagination.list.total: number
DataListPagination.list.isFiltered: boolean
DataListPagination.className?: string | undefined
function DataListToolbar
DataListToolbar.list: {}
DataListToolbar.list.state: DataListState
DataListToolbar.list.setSearch: (value: string) => void
DataListToolbar.list.setFacet: (key: string, values: string[]) => void
DataListToolbar.list.setPage: (p: number) => void
DataListToolbar.list.clear: () => void
DataListToolbar.list.facets: Facet<any>[]
DataListToolbar.list.counts: Record<string, Record<string, number>>
DataListToolbar.list.filtered: any[]
DataListToolbar.list.pageRows: any[]
DataListToolbar.list.page: number
DataListToolbar.list.pageCount: number
DataListToolbar.list.total: number
DataListToolbar.list.isFiltered: boolean
DataListToolbar.searchLabel?: string | undefined
DataListToolbar.actions?: React.ReactNode
DataListToolbar.className?: string | undefined
type Facet<T> = {}
Facet.key: string
Facet.label: string
Facet.options: FacetOption[]
Facet.get?: ((row: T) => string) | undefined
function FacetedFilter
FacetedFilter.title: string
FacetedFilter.options: FacetOption[]
FacetedFilter.value: string[]
FacetedFilter.onValueChange: (values: string[]) => void
FacetedFilter.counts?: Record<string, number> | undefined
type FacetOption = {}
FacetOption.value: string
FacetOption.label: string
FacetOption.icon?: React.ReactNode
function useDataList<T extends object>({ rows, searchKeys, facets, pageSize, searchParams, onSearchParamsChange, }: { rows: T[]; searchKeys: (keyof T & string)[]; facets?: Facet<T>[]; pageSize?: number; searchParams?: URLSearchParams; onSearchParamsChange?: (params: URLSearchParams) => void; }) => { state: DataListState; setSearch: (value: string) => void; setFacet: (key: string, values: string[]) => void; setPage: (p: number) => void; clear: () => void; facets: Facet<T>[]; counts: Record<string, Record<string, number>>; filtered: T[]; pageRows: T[]; page: number; pageCount: number; total: number; isFiltered: boolean; }
```
