import type { StudioConfiguration } from "./studio-configuration";

export type StudioEstimate =
  | { status: "manual_review"; values: null }
  | { status: "unavailable"; code: "service_unavailable"; values: null };

export interface EstimateService {
  estimate(configuration: StudioConfiguration): Promise<StudioEstimate>;
}

export const manualReviewEstimateService: EstimateService = {
  async estimate() {
    return { status: "manual_review", values: null };
  },
};
