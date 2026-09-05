export default function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span
      className="category-badge"
      style={{ '--category-color': category.color }}
    >
      <span className="category-badge__dot" />
      {category.name}
    </span>
  );
}
