import { useMutation } from "@tanstack/react-query";

import {
  gateService,
  type ValidateGateInput,
} from "../../services/gate.service";

export function useGateValidation() {
  return useMutation({
    mutationFn: (
      input: ValidateGateInput,
    ) =>
      gateService.validate(input),
  });
}
