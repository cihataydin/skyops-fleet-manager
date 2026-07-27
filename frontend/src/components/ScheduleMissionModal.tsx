import React from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { api } from '../api/axios';

const { RangePicker } = DatePicker;

interface Props {
  visible: boolean;
  droneId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleMissionModal: React.FC<Props> = ({ visible, droneId, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        droneId,
        scheduledStartTime: values.dates[0].toISOString(),
        scheduledEndTime: values.dates[1].toISOString(),
      };
      delete payload.dates;

      await api.post('/missions', payload);
      message.success('Mission scheduled successfully!');
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
    <Modal title="Schedule Mission" open={visible} onOk={handleOk} onCancel={onClose}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Mission Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="WIND_TURBINE_INSPECTION">Wind Turbine</Select.Option>
            <Select.Option value="SOLAR_PANEL_SURVEY">Solar Panel</Select.Option>
            <Select.Option value="POWER_LINE_PATROL">Power Line</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="pilotName" label="Pilot Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="siteLocation" label="Site Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="dates" label="Schedule (Start - End)" rules={[{ required: true }]}>
          <RangePicker showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
};
