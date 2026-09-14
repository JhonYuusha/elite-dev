import axios from "axios";

import { api } from "./api";

export type ProductCategory =
  | "POPCORN"
  | "DRINK"
  | "COMBO";

export type ConcessionProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: ProductCategory;
  priceCents: number;
};

async function listProducts(): Promise<
  ConcessionProduct[]
> {
  try {
    const { data } =
      await api.get<
        ConcessionProduct[]
      >("/products");

    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error)
    ) {
      throw new Error(
        error.response?.data
          ?.message ??
          "Não foi possível carregar a bomboniere.",
        {
          cause: error,
        },
      );
    }

    throw new Error(
      "Não foi possível carregar a bomboniere.",
      {
        cause: error,
      },
    );
  }
}

export const productService = {
  listProducts,
};
