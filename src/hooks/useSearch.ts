import Hangul from "hangul-js";
import { useMemo } from "react";

function useSearch<T>(
  items: T[],
  searchQuery: string,
  getSearchProp: (item: T) => string
) {
  return useMemo(() => {
    const searcher = new Hangul.Searcher(searchQuery);
    return items.filter((item) => searcher.search(getSearchProp(item)) >= 0);
  }, [items, searchQuery, getSearchProp]);
}

export default useSearch;
