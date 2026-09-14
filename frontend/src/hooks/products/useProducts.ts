import {
  useQuery,
} from "@tanstack/react-query";

import {
  productService,
} from "../../services/product.service";

export function useProducts() {
  return useQuery({
    queryKey: [
      "products",
      "concession",
    ],

    queryFn: () =>
      productService.listProducts(),

    staleTime:
      5 * 60 * 1000,
  });
}
