import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Form, FormInstance, InputNumber, Modal, Select} from 'antd';
import {Trip} from '../../models/Trip';

export type RotationScheduleEditFormData = {
  tripId: string;
  contactNumbers: string[];
};

interface Props {
  open: boolean;
  close: () => void;
  createRotationScheduleLoading: boolean;
  updateRotationScheduleLoading: boolean;
  trips: Trip[];
  form: FormInstance;
  onEditFormFinish: (values: RotationScheduleEditFormData) => void;
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

const EditForm = ({
  open: addModalOpen,
  close: closeAddModal,
  createRotationScheduleLoading,
  updateRotationScheduleLoading,
  trips,
  form,
  onEditFormFinish,
}: Props) => {
  return (
    <Modal
      open={addModalOpen}
      width={600}
      destroyOnClose
      maskClosable
      onCancel={closeAddModal}
      onOk={form.submit}
      confirmLoading={createRotationScheduleLoading || updateRotationScheduleLoading}>
      <h1>Form</h1>
      <Form form={form} onFinish={onEditFormFinish} preserve={false} labelAlign="right">
        <Form.Item
          label={'Trip'}
          name={'tripId'}
          labelCol={{span: 6}}
          rules={[{required: true, message: 'Trip is required'}]}>
          <Select
            showSearch
            style={{width: 300}}
            optionFilterProp={'label'}
            options={trips.map(trip => ({
              label: `${trip.departureCity.name} -> ${trip.arrivalCity.name}`,
              value: trip.id,
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
                          // whitespace: true,
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
      </Form>
    </Modal>
  );
};

export default EditForm;
