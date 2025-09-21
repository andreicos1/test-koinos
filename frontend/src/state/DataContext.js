import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      q: query,
    });
    const res = await fetch(`http://localhost:3001/api/items?${params}`);
    return res.json();
  }, [page, limit, query]);

  return (
    <DataContext.Provider
      value={{
        items,
        total,
        page,
        limit,
        query,
        setItems,
        setTotal,
        setPage,
        setLimit,
        setQuery,
        fetchItems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
