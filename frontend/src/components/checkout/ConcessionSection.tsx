import type {
  ConcessionProduct,
} from "../../services/product.service";

import {
  formatMoney,
} from "../../utils/money";

const CATEGORY_LABELS = {
  POPCORN: "PIPOCA",
  DRINK: "BEBIDA",
  COMBO: "COMBO",
} as const;

type ConcessionSectionProps = {
  products:
    ConcessionProduct[];

  quantities:
    Record<string, number>;

  totalItems: number;
  subtotalCents: number;

  maxPerProduct: number;
  maxTotalItems: number;

  isReservationPending:
    boolean;

  isLoading:
    boolean;

  isSaving:
    boolean;

  paymentPending:
    boolean;

  hasUnsavedChanges:
    boolean;

  errorMessage:
    string;

  onChangeQuantity: (
    productId: string,
    direction: 1 | -1,
  ) => void;

  onSave: () => void;
};

export function ConcessionSection({
  products,
  quantities,
  totalItems,
  subtotalCents,
  maxPerProduct,
  maxTotalItems,
  isReservationPending,
  isLoading,
  isSaving,
  paymentPending,
  hasUnsavedChanges,
  errorMessage,
  onChangeQuantity,
  onSave,
}: ConcessionSectionProps) {
  return (
    <section className="checkout-v2-concession">
      <div className="checkout-v2-concession-heading">
        <div>
          <span>
            03 / BOMBONIERE
          </span>

          <h2>
            ALGO PARA
            <br />
            A SESSÃO?
          </h2>
        </div>

        <p>
          OPCIONAL · MÁX.{" "}
          {maxTotalItems} ITENS
        </p>
      </div>

      {isLoading ? (
        <div className="checkout-v2-concession-message">
          CARREGANDO CARDÁPIO...
        </div>
      ) : (
        <div className="checkout-v2-products">
          {products.map(
            (product) => {
              const quantity =
                quantities[
                  product.id
                ] ?? 0;

              const interactionLocked =
                !isReservationPending ||
                isSaving ||
                paymentPending;

              const canIncrease =
                !interactionLocked &&
                quantity <
                  maxPerProduct &&
                totalItems <
                  maxTotalItems;

              const canDecrease =
                !interactionLocked &&
                quantity > 0;

              return (
                <article
                  key={
                    product.id
                  }
                  className={[
                    "checkout-v2-product",
                    quantity > 0
                      ? "is-selected"
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(" ")}
                >
                  <div className="checkout-v2-product-top">
                    <span>
                      {
                        CATEGORY_LABELS[
                          product.category
                        ]
                      }
                    </span>

                    {quantity >
                      0 && (
                      <strong>
                        ADICIONADO
                      </strong>
                    )}
                  </div>

                  <div className="checkout-v2-product-copy">
                    <h3>
                      {
                        product.name
                      }
                    </h3>

                    {product.description && (
                      <p>
                        {
                          product.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="checkout-v2-product-bottom">
                    <strong>
                      {formatMoney(
                        product.priceCents,
                      )}
                    </strong>

                    <div className="checkout-v2-product-control">
                      <button
                        type="button"
                        aria-label={`Remover uma unidade de ${product.name}`}
                        disabled={
                          !canDecrease
                        }
                        onClick={() =>
                          onChangeQuantity(
                            product.id,
                            -1,
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {String(
                          quantity,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <button
                        type="button"
                        aria-label={`Adicionar uma unidade de ${product.name}`}
                        disabled={
                          !canIncrease
                        }
                        onClick={() =>
                          onChangeQuantity(
                            product.id,
                            1,
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      <div className="checkout-v2-concession-footer">
        <div>
          <span>
            ITENS
          </span>

          <strong>
            {String(
              totalItems,
            ).padStart(
              2,
              "0",
            )}{" "}
            / {maxTotalItems}
          </strong>
        </div>

        <div>
          <span>
            BOMBONIERE
          </span>

          <strong>
            {formatMoney(
              subtotalCents,
            )}
          </strong>
        </div>

        {isReservationPending && (
          <button
            type="button"
            className="checkout-v2-save-concession"
            disabled={
              !hasUnsavedChanges ||
              isSaving ||
              paymentPending
            }
            onClick={onSave}
          >
            <span>
              {isSaving
                ? "SALVANDO..."
                : hasUnsavedChanges
                  ? "ATUALIZAR PEDIDO"
                  : "PEDIDO ATUALIZADO"}
            </span>

            <span>
              {hasUnsavedChanges
                ? "↗"
                : "✓"}
            </span>
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="checkout-v2-concession-error">
          {errorMessage}
        </p>
      )}

      {hasUnsavedChanges &&
        isReservationPending && (
          <p className="checkout-v2-unsaved">
            ALTERAÇÕES NÃO SALVAS ·
            ATUALIZE O PEDIDO ANTES
            DO PAGAMENTO
          </p>
        )}
    </section>
  );
}
