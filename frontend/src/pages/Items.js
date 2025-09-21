import React, { useEffect, useState } from "react";
import { List } from "react-window";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

function Items() {
  const {
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
  } = useData();

  const [search, setSearch] = useState(query);

  useEffect(() => {
    let active = true;
    fetchItems().then((data) => {
      if (!active) return;
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
    });
    return () => {
      active = false;
    };
  }, [fetchItems, setItems, setTotal]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const RowComponent = ({ index, items, style }) => {
    const item = items[index];
    if (!item) return null;
    return (
      <div style={style}>
        <Link to={`/items/${item.id}`}>{item.name}</Link> - ${item.price}
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
        />
        <button type="submit">Search</button>
      </form>

      {items.length === 0 ? (
        <p>No items found...</p>
      ) : (
        <List
          rowComponent={RowComponent}
          rowCount={items.length}
          rowHeight={40}
          rowProps={{ items }}
          style={{ height: 400, width: "100%" }}
        />
      )}

      {total > limit && (
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>

          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(parseInt(e.target.value, 10));
            }}
            style={{ marginLeft: "1rem" }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default Items;
