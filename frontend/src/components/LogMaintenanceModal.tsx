import React from 'react';
import { Modal, Form, InputNumber, Select, DatePicker, Input, message } from 'antd';
import { api } from '../api/axios';

interface Props {
  visible: boolean;
  droneId: string;
  totalFlightHours: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const LogMaintenanceModal: React.FC<Props> = ({ visible, droneId, totalFlightHours, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        droneId,
        performedAt: values.performedAt.toISOString(),
      };

      await api.post('/maintenance', payload);
      message.success('Maintenance logged successfully!');
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
    <Modal title="Log Maintenance" open={visible} onOk={handleOk} onCancel={onClose}>
      <Form form={form} layout="vertical" initialValues={{ flightHoursAtMaintenance: totalFlightHours }}>
        <Form.Item name="type" label="Maintenance Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="ROUTINE_CHECK">Routine Check</Select.Option>
            <Select.Option value="BATTERY_REPLACEMENT">Battery Replacement</Select.Option>
            <Select.Option value="MOTOR_REPAIR">Motor Repair</Select.Option>
            <Select.Option value="FIRMWARE_UPDATE">Firmware Update</Select.Option>
            <Select.Option value="FULL_OVERHAUL">Full Overhaul</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="technicianName" label="Technician Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="performedAt" label="Date Performed" rules={[{ required: true }]}>
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="flightHoursAtMaintenance" label="Flight Hours At Maintenance" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
