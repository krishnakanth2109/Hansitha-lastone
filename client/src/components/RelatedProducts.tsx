import React from "react";
import { useProductContext } from "@/context/ProductContext";
import ProductCard from "./ProductCard";

interface Props {
  currentProduct: any;
}

const RelatedProducts: React.FC<Props> = ({ currentProduct }) => {
  const { getRelatedProducts } = useProductContext();
  const related = getRelatedProducts(currentProduct.category, currentProduct._id);

  if (!related.length) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {related.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
