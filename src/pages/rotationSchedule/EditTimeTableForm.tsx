import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Form, FormInstance, Modal, Space, TimePicker} from 'antd';
import dayjs from 'dayjs';

export type EditTimeTableFormData = {
  timeTable: {
    departureTime: dayjs.Dayjs;
    arrivalTime: dayjs.Dayjs;
  }[];
};

interface Props {
  open: boolean;
  close: () => void;
  createRotationScheduleLoading: boolean;
  updateRotationScheduleLoading: boolean;
  form: FormInstance;
  onFormFinish: (values: EditTimeTableFormData) => void;
}

const EditTimeTableForm = ({
  open,
  close,
  createRotationScheduleLoading,
  updateRotationScheduleLoading,
  form,
  onFormFinish,
}: Props) => {
  return (
    <Modal
      open={open}
      width={500}
      destroyOnClose
      maskClosable
      onCancel={close}
      onOk={form.submit}
      confirmLoading={createRotationScheduleLoading || updateRotationScheduleLoading}
      style={{textAlign: 'center'}}>
      <Form form={form} onFinish={onFormFinish} preserve={false}>
        <Form.List name="timeTable">
          {(fields, {add, remove}, {errors}) => (
            <>
              {fields.map(({key, name, ...rest}) => {
                return (
                  <Space key={key} align="baseline">
                    <Form.Item
                      {...rest}
                      name={[name, 'departureTime']}
                      rules={[{required: true, message: 'Missing City'}]}>
                      <TimePicker
                        style={{width: 150}}
                        format={'hh:mm a'}
                        use12Hours
                        placeholder="Departure Time"
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'arrivalTime']}
                      rules={[{required: true, message: 'Missing time'}]}>
                      <TimePicker
                        style={{width: 150}}
                        format={'hh:mm a'}
                        use12Hours
                        placeholder="Arrival Time"
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                );
              })}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Transit Times
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

export default EditTimeTableForm;
