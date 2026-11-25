import { httpClient } from "../../shared/http/client";
import type { CourtCardData } from "./CourtCard";

export type CourtCollectionResponse = {
  items: CourtCardData[];
};

export type CreateCourtRequest = {
  name: string;
  sportType: string;
  hourlyPriceCents: number;
  opensAt: string;
  closesAt: string;
};

export const courtApi = {
  async listCourts(): Promise<CourtCardData[]> {
    const response = await httpClient.get<CourtCollectionResponse>("/api/courts");
    return response.items;
  },

  async createCourt(payload: CreateCourtRequest): Promise<CourtCardData> {
    return httpClient.post<CourtCardData>("/api/courts", payload);
  },
};
