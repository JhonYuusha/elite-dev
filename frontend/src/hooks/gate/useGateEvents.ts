import { useQuery } from "@tanstack/react-query";

import {
  gateService,
} from "../../services/gate.service";

export function useGateEvents(
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "gate",
      "events",
    ],

    enabled,

    queryFn: () =>
      gateService.getEvents(),
  });
}
