import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import { api } from '../api/axios';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, missionsRes] = await Promise.all([
          api.get('/reports/fleet-health'),
          api.get('/missions?limit=5&orderBy=scheduledStartTime&direction=DESC')
        ]);
        setHealth(healthRes.data.data);
        setMissions(missionsRes.data.data.missions || missionsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const maintenanceAlerts = health?.overdueMaintenanceDrones || [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Fleet Dashboard</Title>
      
      {/* Fleet Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Drones" value={health?.totalDroneCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Available Drones" value={health?.statusBreakdown?.AVAILABLE || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="In Maintenance" value={health?.statusBreakdown?.MAINTENANCE || 0} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Missions Next 24h" value={health?.missionsNext24Hours} />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Maintenance Alerts */}
        <Col span={12}>
          <Card title="Maintenance Alerts (Due within 7 days)" style={{ marginBottom: 24 }}>
            <Table 
              dataSource={maintenanceAlerts} 
              rowKey="id" 
              pagination={false}
              columns={[
                { title: 'Drone', dataIndex: 'serialNumber', key: 'sn', render: (text: string, record: any) => <Link to={`/drones/${record.id}`}>{text}</Link> },
                { title: 'Status', dataIndex: 'status', key: 'status' },
                { 
                  title: 'Due Date', 
                  dataIndex: 'nextMaintenanceDueDate', 
                  key: 'due',
                  render: (date) => {
                    const days = differenceInDays(new Date(date), new Date());
                    if (days < 0) {
                      return <Tag color="red">Overdue by {Math.abs(days)} days</Tag>;
                    }
                    return <Tag color="warning">Due in {days} days</Tag>;
                  }
                }
              ]}
            />
          </Card>
        </Col>

        {/* Mission View */}
        <Col span={12}>
          <Card title="Recent Missions">
            <Table 
              dataSource={missions} 
              rowKey="id" 
              pagination={false}
              columns={[
                { title: 'Mission', dataIndex: 'name', key: 'name' },
                { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag>{s}</Tag> },
                { title: 'Scheduled Start', dataIndex: 'scheduledStartTime', key: 'start', render: (date) => format(new Date(date), 'MMM dd, yyyy HH:mm') },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
