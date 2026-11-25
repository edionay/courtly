import { httpClient } from "../../shared/http/client";
import type { CourtCardData } from "./CourtCard";

export type CourtCollectionResponse = {
  items: CourtCardData[];
};

export const courtApi = {
  async listCourts(): Promise<CourtCardData[]> {
    const response = await httpClient.get<CourtCollectionResponse>("/api/courts");
    return response.items;
  },
};
