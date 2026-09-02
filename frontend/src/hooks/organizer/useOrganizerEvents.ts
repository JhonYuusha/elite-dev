import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  eventService,
  type CreateEventInput,
  type UpdateEventInput,
} from "../../services/event.service";

import type { OrganizerEvent } from "../../types/event";

const ORGANIZER_EVENTS_QUERY_KEY = ["organizer-events"] as const;

export function useOrganizerEvents(enabled = true) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ORGANIZER_EVENTS_QUERY_KEY,
    queryFn: eventService.getOrganizerEvents,
    enabled,
  });

  const createEventMutation = useMutation({
    mutationFn: (input: CreateEventInput) =>
      eventService.createEvent(input),

    onSuccess: (createdEvent) => {
      queryClient.setQueryData<OrganizerEvent[]>(
        ORGANIZER_EVENTS_QUERY_KEY,
        (current = []) => [createdEvent, ...current],
      );
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string;
      input: UpdateEventInput;
    }) => eventService.updateEvent(eventId, input),

    onSuccess: (updatedEvent) => {
      queryClient.setQueryData<OrganizerEvent[]>(
        ORGANIZER_EVENTS_QUERY_KEY,
        (current = []) =>
          current.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event,
          ),
      );
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    loadError:
      eventsQuery.error instanceof Error
        ? eventsQuery.error.message
        : "",

    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,

    updateEvent: (
      eventId: string,
      input: UpdateEventInput,
    ) =>
      updateEventMutation.mutateAsync({
        eventId,
        input,
      }),

    isUpdating: updateEventMutation.isPending,
    refetch: eventsQuery.refetch,
  };
}