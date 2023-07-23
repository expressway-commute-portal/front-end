import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Form, FormInstance, InputNumber, Modal, Select, Space, TimePicker} from 'antd';
import {Route} from '../../models/Route';
import dayjs from 'dayjs';

export type RotationScheduleAddFormData = {
  routeId: string;
  contactNumbers: string[];
  timeTable: {
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    interval: number;
    duration: number;
    durationUnit: 'minutes' | 'hours';
  }[];
};

interface Props {
  open: boolean;
  closeModal: () => void;
  createRotationScheduleLoading: boolean;
  updateRotationScheduleLoading: boolean;
  routes: Route[];
  form: FormInstance;
  onFormFinish: (values: RotationScheduleAddFormData) => void;
}

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 20},
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: {span: 24, offset: 0},
    sm: {span: 20, offset: 6},
  },
};

const intervalValues = [
  {
    label: '10 min',
    value: 10,
  },
  {
    label: '15 min',
    value: 15,
  },
  {
    label: '20 min',
    value: 20,
  },
  {
    label: '30 min',
    value: 30,
  },
  {
    label: '45 min',
    value: 45,
  },
  {
    label: '1 hour',
    value: 60,
  },
];

const AddForm = ({
  open: addModalOpen,
  closeModal: closeAddModal,
  createRotationScheduleLoading,
  updateRotationScheduleLoading,
  routes,
  form,
  onFormFinish: onAddFormFinish,
}: Props) => {
  return (
    <Modal
      open={addModalOpen}
      width={700}
      destroyOnClose
      maskClosable
      onCancel={closeAddModal}
      onOk={form.submit}
      confirmLoading={createRotationScheduleLoading || updateRotationScheduleLoading}>
      <h1>Form</h1>
      <Form form={form} onFinish={onAddFormFinish} preserve={false} labelAlign="right">
        <Form.Item
          label={'Route'}
          name={'routeId'}
          labelCol={{span: 6}}
          rules={[{required: true, message: 'Route is required'}]}>
          <Select
            showSearch
            style={{width: 300}}
            optionFilterProp={'label'}
            options={routes.map(route => ({
              label: `${route.departureCity.name} -> ${route.arrivalCity.name}`,
              value: route.id,
            }))}
          />
        </Form.Item>

        <Form.List name="contactNumbers">
          {(fields, {add, remove}, {errors}) => (
            <>
              {fields.map((field, index) => {
                return (
                  <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Contact Number' : ''}
                    required={false}
                    key={field.key}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please input contact number or delete this field.',
                        },
                      ]}
                      noStyle>
                      <InputNumber placeholder="Contact Number" style={{width: '90%'}} />
                    </Form.Item>
                    &nbsp;&nbsp;
                    <MinusCircleOutlined
                      key={`${field.name}${field.key}`}
                      onClick={() => remove(field.name)}
                    />
                  </Form.Item>
                );
              })}
              <Form.Item wrapperCol={{offset: 6}}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{width: '60%'}}
                  icon={<PlusOutlined />}>
                  Add Contact Number
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.List name="timeTable">
          {(fields, {add, remove}, {errors}) => (
            <>
              {fields.map(field => {
                return (
                  <Space key={field.key} align="start" size={6}>
                    <Form.Item
                      name={[field.name, 'startTime']}
                      rules={[{required: true, message: 'Missing time'}]}>
                      <TimePicker
                        style={{width: 120}}
                        format={'hh:mm a'}
                        use12Hours
                        placeholder="First Bus"
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'endTime']}
                      rules={[{required: true, message: 'Missing time'}]}>
                      <TimePicker
                        style={{width: 120}}
                        format={'hh:mm a'}
                        use12Hours
                        placeholder="Last Bus"
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'interval']}
                      rules={[{required: true, message: 'Missing interval'}]}>
                      <Select
                        optionFilterProp={'label'}
                        allowClear
                        placeholder={'Interval'}
                        style={{width: 120}}
                        options={intervalValues.map(interval => ({
                          label: interval.label,
                          value: interval.value,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'duration']}
                      rules={[{required: true, message: 'Missing duration'}]}>
                      <InputNumber
                        min={1}
                        style={{width: 200}}
                        placeholder="Duration"
                        addonAfter={
                          <Form.Item name={[field.name, 'durationUnit']} noStyle>
                            <Select style={{width: 70}}>
                              <Select.Option value="minutes">min</Select.Option>
                              <Select.Option value="hours">hrs</Select.Option>
                            </Select>
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({durationUnit: 'minutes'})}
                  block
                  icon={<PlusOutlined />}>
                  Add Time Table
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AddForm;
