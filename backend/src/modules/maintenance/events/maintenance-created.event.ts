export interface MaintenanceCreatedEvent {
  droneId: string;
  performedAt: Date;
  flightHoursAtMaintenance: number;
}
