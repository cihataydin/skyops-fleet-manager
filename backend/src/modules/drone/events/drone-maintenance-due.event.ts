export interface DroneMaintenanceDueEvent {
  droneId: string;
  totalFlightHours: number;
  reason: 'CALENDAR_90_DAYS';
  nextMaintenanceDueDate?: Date;
}
