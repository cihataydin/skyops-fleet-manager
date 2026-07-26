export interface MissionAbortedEvent {
  missionId: string;
  droneId: string;
  abortReason?: string;
}
