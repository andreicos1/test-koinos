import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/items/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Item not found");
        return res.json();
      })
      .then((data) => setItem(data))
      .catch((err) => {
        console.error("Failed to fetch item:", err);
        setError("Item not found");
      });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!item) return <p>Loading...</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p>
        <strong>Category:</strong> {item.category}
      </p>
      <p>
        <strong>Price:</strong> ${item.price}
      </p>
    </div>
  );
}

export default ItemDetail;
