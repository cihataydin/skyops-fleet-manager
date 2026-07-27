import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { api } from '../api/axios';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDroneModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/drones', values);
      message.success('Drone created successfully!');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message.toString());
      } else {
        console.error('Validation failed:', error);
      }
    }
  };

  return (
    <Modal title="Register New Drone" open={visible} onOk={handleOk} onCancel={onClose}>
      <Form form={form} layout="vertical">
        <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true, pattern: /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/, message: 'Format must be SKY-XXXX-XXXX' }]}>
          <Input placeholder="SKY-1234-ABCD" />
        </Form.Item>
        <Form.Item name="model" label="Model" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="PHANTOM_4">PHANTOM_4</Select.Option>
            <Select.Option value="MATRICE_300">MATRICE_300</Select.Option>
            <Select.Option value="MAVIC_3_ENTERPRISE">MAVIC_3_ENTERPRISE</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
