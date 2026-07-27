import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Table, Tabs, Button, Space, message } from 'antd';
import { api } from '../api/axios';
import { format } from 'date-fns';
import { ScheduleMissionModal } from '../components/ScheduleMissionModal';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';

const { Title } = Typography;

export const DroneDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [drone, setDrone] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMaintModalVisible, setIsMaintModalVisible] = useState(false);

  const fetchDetails = async () => {
    try {
      const [droneRes, maintRes, missionsRes] = await Promise.all([
        api.get(`/drones/${id}`),
        api.get(`/maintenance?droneId=${id}`),
        api.get(`/missions?droneId=${id}`)
      ]);
      setDrone(droneRes.data.data);
      setMaintenance(maintRes.data.data);
      setMissions(missionsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch drone details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const updateMissionStatus = async (missionId: string, status: string, loggedHours?: number) => {
    try {
      if (status === 'PRE_FLIGHT_CHECK') {
        await api.patch(`/missions/${missionId}/pre-flight`);
      } else if (status === 'IN_PROGRESS') {
        await api.patch(`/missions/${missionId}/start`);
      } else if (status === 'COMPLETE') {
        await api.patch(`/missions/${missionId}/complete`, { flightHoursAtCompletion: loggedHours || 1 });
      } else if (status === 'ABORTED') {
        await api.patch(`/missions/${missionId}/abort`, { abortReason: 'Aborted manually from UI' });
      }
      message.success(`Mission status updated`);
      fetchDetails();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update mission');
    }
  };

  if (loading || !drone) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Drone Details: {drone.serialNumber}</Title>
        <Space>
          <Button onClick={() => setIsMaintModalVisible(true)}>Log Maintenance</Button>
          <Button type="primary" onClick={() => setIsModalVisible(true)} disabled={drone.status !== 'AVAILABLE'}>
            Schedule Mission
          </Button>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered>
          <Descriptions.Item label="Model">{drone.model}</Descriptions.Item>
          <Descriptions.Item label="Status">{drone.status}</Descriptions.Item>
          <Descriptions.Item label="Total Flight Hours">{drone.totalFlightHours}</Descriptions.Item>
          <Descriptions.Item label="Last Maintenance">{drone.lastMaintenanceDate ? format(new Date(drone.lastMaintenanceDate), 'MMM dd, yyyy') : 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Next Maintenance Due">{drone.nextMaintenanceDueDate ? format(new Date(drone.nextMaintenanceDueDate), 'MMM dd, yyyy') : 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Mission History" key="1">
          <Table 
            dataSource={missions} 
            rowKey="id"
            columns={[
              { title: 'Mission', dataIndex: 'name' },
              { title: 'Status', dataIndex: 'status' },
              { title: 'Logged Hours', dataIndex: 'loggedFlightHours' },
              { title: 'Date', dataIndex: 'scheduledStartTime', render: (date) => format(new Date(date), 'MMM dd, yyyy') },
              { 
                title: 'Actions', 
                key: 'actions', 
                render: (_, record) => (
                  <Space size="small">
                    {record.status === 'PLANNED' && <Button size="small" onClick={() => updateMissionStatus(record.id, 'PRE_FLIGHT_CHECK')}>Pre-Flight</Button>}
                    {record.status === 'PRE_FLIGHT_CHECK' && <Button size="small" onClick={() => updateMissionStatus(record.id, 'IN_PROGRESS')}>Start</Button>}
                    {record.status === 'IN_PROGRESS' && (
                      <>
                        <Button size="small" type="primary" onClick={() => updateMissionStatus(record.id, 'COMPLETE', 2.5)}>Complete</Button>
                        <Button size="small" danger onClick={() => updateMissionStatus(record.id, 'ABORTED')}>Abort</Button>
                      </>
                    )}
                  </Space>
                )
              },
            ]}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Maintenance History" key="2">
          <Table 
            dataSource={maintenance} 
            rowKey="id"
            columns={[
              { title: 'Type', dataIndex: 'type' },
              { title: 'Technician', dataIndex: 'technicianName' },
              { title: 'Hours at Maintenance', dataIndex: 'flightHoursAtMaintenance' },
              { title: 'Date', dataIndex: 'performedAt', render: (date) => format(new Date(date), 'MMM dd, yyyy') },
            ]}
          />
        </Tabs.TabPane>
      </Tabs>
      
      <ScheduleMissionModal 
        visible={isModalVisible}
        droneId={id!}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchDetails}
      />
      <LogMaintenanceModal
        visible={isMaintModalVisible}
        droneId={id!}
        totalFlightHours={Number(drone.totalFlightHours)}
        onClose={() => setIsMaintModalVisible(false)}
        onSuccess={fetchDetails}
      />
    </div>
  );
};
