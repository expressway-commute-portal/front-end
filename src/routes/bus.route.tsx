import React, {useEffect, useState} from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import {useBusStore} from '../store/bus.store';
import {Bus} from '../models/Bus';
import {Content} from 'antd/es/layout/layout';
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ButtonGroup from 'antd/es/button/button-group';

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

const BusRoute = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getBuses = useBusStore(state => state.getBuses);
  const createBus = useBusStore(state => state.createBus);
  const deleteBus = useBusStore(state => state.deleteBus);
  const updateBus = useBusStore(state => state.updateBus);

  const getBusesLoading = useBusStore(state => state.getBusesLoading);
  const createBusLoading = useBusStore(state => state.createBusLoading);
  const updateBusLoading = useBusStore(state => state.updateBusLoading);
  const deleteBusLoading = useBusStore(state => state.deleteBusLoading);

  const buses = useBusStore(state => state.buses);
  const [open, setOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    form.setFieldsValue(selectedBus);
  }, [selectedBus]);

  const loadData = () => {
    getBuses()
      .then()
      .catch(e => {
        messageApi.error(e.message || e);
      });
  };

  const onDelete = async (id: string) => {
    try {
      await deleteBus(id);
      messageApi.success('Bus deleted successfully');
      loadData();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onFinish = async (values: Partial<Bus>) => {
    try {
      if (selectedBus) {
        await updateBus(selectedBus.id, values);
        closeModal();
        messageApi.success('Bus updated successfully');
        loadData();
      } else {
        await createBus(values as any);
        closeModal();
        messageApi.success('Bus added successfully');
        loadData();
      }
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setSelectedBus(undefined);
    setOpen(false);
  };

  return (
    <>
      {contextHolder}
      <Row align={'middle'}>
        <Col span={24} style={{border: '', textAlign: 'right'}}>
          <Button type={'primary'} icon={<PlusCircleOutlined />} size={'large'} onClick={openModal}>
            Add
          </Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col flex={1}>
          <Table
            size={'small'}
            loading={getBusesLoading}
            dataSource={buses}
            bordered
            rowKey={'id'}
            title={() => <h1>Buses</h1>}>
            <Table.Column<Bus> title={'Name'} dataIndex={'name'} />
            <Table.Column<Bus> title={'Reg No'} dataIndex={'regNumber'} />
            <Table.Column<Bus>
              title={'Contact Numbers'}
              dataIndex={'contactNumbers'}
              render={(value: string[]) => value.join(', ')}
            />
            <Table.Column<Bus>
              title={'Action'}
              key={'action'}
              render={(_, record) => (
                <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                  <ButtonGroup>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedBus(record);
                        setTimeout(() => {
                          openModal();
                        }, 0);
                      }}
                    />
                    <Popconfirm
                      disabled
                      title={'Are you sure?'}
                      placement={'leftTop'}
                      onConfirm={() => onDelete(record.id)}>
                      <Button disabled danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </ButtonGroup>
                </Tooltip>
              )}
            />
          </Table>
          <Modal
            open={open}
            destroyOnClose
            maskClosable
            onCancel={closeModal}
            onOk={form.submit}
            confirmLoading={createBusLoading || updateBusLoading}>
            <h1>Form</h1>
            <Form form={form} labelCol={{span: 6}} onFinish={onFinish} preserve={false}>
              <Form.Item
                label={'Name'}
                name={'name'}
                rules={[{required: true, message: 'Name is required'}]}>
                <Input placeholder={'Name'} />
              </Form.Item>

              <Form.Item
                label={'Reg Number'}
                name={'regNumber'}
                rules={[{required: true, message: 'Reg Number is required'}]}>
                <Input placeholder={'Registration Number'} />
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
                                whitespace: true,
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
        </Col>
      </Row>
    </>
  );
};

export default BusRoute;
