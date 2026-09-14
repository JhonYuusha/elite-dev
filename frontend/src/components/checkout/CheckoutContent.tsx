import {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  useNavigate,
} from "react-router-dom";

import {
  usePayment,
} from "../../hooks/payments/usePayment";

import {
  useProducts,
} from "../../hooks/products/useProducts";

import {
  useUpdateReservationItems,
} from "../../hooks/reservations/useUpdateReservationItems";

import {
  editorialEase,
} from "../../lib/motion";

import {
  queryClient,
} from "../../lib/query-client";

import type {
  ConcessionProduct,
} from "../../services/product.service";

import type {
  Reservation,
} from "../../services/reservation.service";

import {
  formatLongDate,
} from "../../utils/date";

import {
  ConcessionSection,
} from "./ConcessionSection";

import {
  CheckoutSummary,
} from "./CheckoutSummary";

const MAX_PRODUCT_QUANTITY = 4;
const MAX_TOTAL_ITEMS = 8;

const EMPTY_PRODUCTS:
  ConcessionProduct[] = [];

type CheckoutContentProps = {
  reservation:
    Reservation;
};

function createInitialQuantities(
  reservation:
    Reservation,
) {
  return reservation.items.reduce<
    Record<string, number>
  >(
    (
      result,
      item,
    ) => {
      result[
        item.productId
      ] =
        item.quantity;

      return result;
    },
    {},
  );
}

function createItemsSignature(
  items: {
    productId: string;
    quantity: number;
  }[],
) {
  return items
    .map(
      (item) =>
        `${item.productId}:${item.quantity}`,
    )
    .sort()
    .join("|");
}

export function CheckoutContent({
  reservation,
}: CheckoutContentProps) {
  const navigate =
    useNavigate();

  const productsQuery =
    useProducts();

  const payment =
    usePayment();

  const concessionUpdate =
    useUpdateReservationItems();

  const products =
    productsQuery.data ??
    EMPTY_PRODUCTS;

  const [
    quantities,
    setQuantities,
  ] = useState<
    Record<string, number>
  >(() =>
    createInitialQuantities(
      reservation,
    ),
  );

  const isPending =
    reservation.status ===
    "PENDING";

  const totalSelectedItems =
    useMemo(
      () =>
        Object.values(
          quantities,
        ).reduce(
          (
            total,
            quantity,
          ) =>
            total +
            quantity,
          0,
        ),
      [quantities],
    );

  const localProductsSubtotal =
    useMemo(
      () =>
        products.reduce(
          (
            total,
            product,
          ) =>
            total +
            product.priceCents *
              (quantities[
                product.id
              ] ?? 0),
          0,
        ),
      [
        products,
        quantities,
      ],
    );

  const savedItemsSignature =
    useMemo(
      () =>
        createItemsSignature(
          reservation.items,
        ),
      [reservation.items],
    );

  const localItems =
    useMemo(
      () =>
        Object.entries(
          quantities,
        )
          .filter(
            (
              [, quantity],
            ) =>
              quantity > 0,
          )
          .map(
            ([
              productId,
              quantity,
            ]) => ({
              productId,
              quantity,
            }),
          ),
      [quantities],
    );

  const localItemsSignature =
    useMemo(
      () =>
        createItemsSignature(
          localItems,
        ),
      [localItems],
    );

  const hasUnsavedChanges =
    savedItemsSignature !==
    localItemsSignature;

  const displayedProductsSubtotal =
    hasUnsavedChanges
      ? localProductsSubtotal
      : reservation
          .productsSubtotalCents;

  const displayedTotalCents =
    hasUnsavedChanges
      ? reservation
          .ticketsSubtotalCents +
        localProductsSubtotal
      : reservation.totalCents;

  const seatLabels =
    reservation.seats
      .map(
        (seat) =>
          seat.label,
      )
      .join(" · ");

  function changeProductQuantity(
    productId: string,
    direction: 1 | -1,
  ) {
    if (
      !isPending ||
      concessionUpdate.isPending ||
      payment.isPending
    ) {
      return;
    }

    setQuantities(
      (current) => {
        const currentQuantity =
          current[
            productId
          ] ?? 0;

        const nextQuantity =
          currentQuantity +
          direction;

        if (
          nextQuantity < 0 ||
          nextQuantity >
            MAX_PRODUCT_QUANTITY
        ) {
          return current;
        }

        const currentTotal =
          Object.values(
            current,
          ).reduce(
            (
              total,
              quantity,
            ) =>
              total +
              quantity,
            0,
          );

        if (
          direction === 1 &&
          currentTotal >=
            MAX_TOTAL_ITEMS
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        if (
          nextQuantity === 0
        ) {
          delete next[
            productId
          ];
        } else {
          next[
            productId
          ] =
            nextQuantity;
        }

        return next;
      },
    );
  }

  async function saveConcessions() {
    if (
      !isPending ||
      !hasUnsavedChanges
    ) {
      return;
    }

    try {
      await concessionUpdate.mutateAsync(
        {
          reservationId:
            reservation.id,

          items:
            localItems,
        },
      );
    } catch {
      // O erro é exibido pela mutation.
    }
  }

  async function processPayment(
    result:
      | "APPROVED"
      | "DECLINED",
  ) {
    if (
      result === "APPROVED" &&
      hasUnsavedChanges
    ) {
      return;
    }

    try {
      await payment.mutateAsync({
        reservationId:
          reservation.id,
        result,
      });

      if (
        result ===
        "APPROVED"
      ) {
        await queryClient.invalidateQueries(
          {
            queryKey: [
              "tickets",
            ],
          },
        );

        navigate(
          "/tickets",
          {
            state: {
              paymentApproved:
                true,
            },
          },
        );

        return;
      }

      queryClient.setQueryData(
        [
          "reservations",
          "details",
          reservation.id,
        ],
        {
          ...reservation,
          status:
            "PAYMENT_FAILED",
        },
      );
    } catch {
      // O erro é exibido pela mutation.
    }
  }

  const paymentError =
    payment.error instanceof
    Error
      ? payment.error.message
      : "";

  const concessionError =
    concessionUpdate.error instanceof
    Error
      ? concessionUpdate.error
          .message
      : productsQuery.error instanceof
          Error
        ? productsQuery.error
            .message
        : "";

  return (
    <motion.section
      className="checkout-v2-layout"
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,

        transition: {
          duration: 0.65,
          ease:
            editorialEase,
        },
      }}
    >
      <div className="checkout-v2-main">
        <div className="checkout-v2-intro">
          <p>
            RESERVA CONFIRMADA /
            02
          </p>

          <h1>
            ÚLTIMO
            <br />
            PASSO.
          </h1>

          <span>
            Seus lugares estão
            reservados. Complete o
            pedido com a
            bomboniere se quiser e
            finalize o pagamento.
          </span>
        </div>

        <div className="checkout-v2-session">
          <div className="checkout-v2-session-label">
            <span>
              SESSÃO / CONFIRMADA
            </span>

            <strong>
              #
              {reservation.id
                .slice(0, 8)
                .toUpperCase()}
            </strong>
          </div>

          <div className="checkout-v2-session-content">
            {reservation.event
              .imageUrl ? (
              <div className="checkout-v2-poster">
                <img
                  src={
                    reservation
                      .event
                      .imageUrl
                  }
                  alt={`Pôster de ${reservation.event.title}`}
                />
              </div>
            ) : (
              <div className="checkout-v2-poster checkout-v2-poster-empty">
                SEM PÔSTER
              </div>
            )}

            <div className="checkout-v2-event-copy">
              <span>
                {formatLongDate(
                  reservation
                    .event
                    .startsAt,
                )}
              </span>

              <h2>
                {
                  reservation
                    .event
                    .title
                }
              </h2>

              <div>
                <strong>
                  {
                    reservation
                      .event
                      .venueName
                  }
                </strong>

                {reservation
                  .event
                  .venueAddress && (
                  <p>
                    {
                      reservation
                        .event
                        .venueAddress
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-v2-session-seats">
            <span>
              LUGARES
            </span>

            <strong>
              {seatLabels}
            </strong>
          </div>
        </div>

        <ConcessionSection
          products={
            products
          }
          quantities={
            quantities
          }
          totalItems={
            totalSelectedItems
          }
          subtotalCents={
            localProductsSubtotal
          }
          maxPerProduct={
            MAX_PRODUCT_QUANTITY
          }
          maxTotalItems={
            MAX_TOTAL_ITEMS
          }
          isReservationPending={
            isPending
          }
          isLoading={
            productsQuery.isPending
          }
          isSaving={
            concessionUpdate.isPending
          }
          paymentPending={
            payment.isPending
          }
          hasUnsavedChanges={
            hasUnsavedChanges
          }
          errorMessage={
            concessionError
          }
          onChangeQuantity={
            changeProductQuantity
          }
          onSave={
            saveConcessions
          }
        />
      </div>

      <CheckoutSummary
        reservation={
          reservation
        }
        seatLabels={
          seatLabels
        }
        productsSubtotalCents={
          displayedProductsSubtotal
        }
        totalCents={
          displayedTotalCents
        }
        hasUnsavedChanges={
          hasUnsavedChanges
        }
        paymentPending={
          payment.isPending
        }
        concessionPending={
          concessionUpdate.isPending
        }
        paymentError={
          paymentError
        }
        onPayment={
          processPayment
        }
      />
    </motion.section>
  );
}
