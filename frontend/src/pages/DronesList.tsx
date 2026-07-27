import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { CreateDroneModal } from '../components/CreateDroneModal';

const { Title } = Typography;

export const DronesList: React.FC = () => {
  const [drones, setDrones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchDrones = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await api.get(`/drones?page=${page}&limit=${limit}`);
      setDrones(res.data.data);
      setPagination({
        current: Number(res.data.meta?.page || 1),
        pageSize: Number(res.data.meta?.limit || 10),
        total: Number(res.data.meta?.total || 0),
      });
    } catch (error) {
      console.error('Failed to fetch drones', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchDrones(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text: string, record: any) => <Link to={`/drones/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'AVAILABLE') color = 'green';
        if (status === 'IN_MISSION') color = 'volcano';
        if (status === 'MAINTENANCE') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Total Flight Hours',
      dataIndex: 'totalFlightHours',
      key: 'totalFlightHours',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Link to={`/drones/${record.id}`}>
            <Button type="primary" size="small">Details</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Drone Fleet Registry</Title>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Register Drone</Button>
      </div>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={drones}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      <CreateDroneModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => fetchDrones(pagination.current, pagination.pageSize)}
      />
    </div>
  );
};
