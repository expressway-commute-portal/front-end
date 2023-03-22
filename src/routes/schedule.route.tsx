import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TimePicker,
  Tooltip,
} from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import ButtonGroup from 'antd/es/button/button-group';
import {useScheduleStore} from '../store/schedule.store';
import {Schedule, ScheduleWithRelations} from '../models/Schedule';
import {getFormattedTimeFromDate} from '../util';
import {useTripStore} from '../store/trip.store';
import {useBusStore} from '../store/bus.store';
import dayjs from 'dayjs';

const ScheduleRoute = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getSchedulesLoading = useScheduleStore(state => state.getSchedulesLoading);
  const createScheduleLoading = useScheduleStore(state => state.createScheduleLoading);
  const updateScheduleLoading = useScheduleStore(state => state.updateScheduleLoading);

  const schedulesWithRelations = useScheduleStore(state => state.schedulesWithRelations);

  const getSchedulesWithRelations = useScheduleStore(state => state.getSchedulesWithRelations);
  const createSchedule = useScheduleStore(state => state.createSchedule);
  const updateSchedule = useScheduleStore(state => state.updateSchedule);

  const trips = useTripStore(state => state.trips);
  const getTrips = useTripStore(state => state.getTrips);

  const buses = useBusStore(state => state.buses);
  const getBuses = useBusStore(state => state.getBuses);

  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();

  useEffect(() => {
    loadSchedulesWithRelations();
    loadTrips();
    loadBuses();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      form.setFieldsValue({
        tripId: selectedSchedule.tripId,
        busId: selectedSchedule.busId,
        departureTime: dayjs(selectedSchedule.departureTime),
        arrivalTime: dayjs(selectedSchedule.arrivalTime),
      });
    }
  }, [selectedSchedule]);

  const loadSchedulesWithRelations = () => {
    getSchedulesWithRelations().then().catch(handleErrors);
  };

  const loadTrips = () => {
    getTrips().then().catch(handleErrors);
  };

  const loadBuses = () => {
    getBuses().then().catch(handleErrors);
  };

  // const onDelete = async (id: string) => {};

  const onFinish = async (values: any) => {
    const obj = {
      ...values,
      departureTime: values.departureTime.toDate(),
      arrivalTime: values.arrivalTime.toDate(),
    };

    try {
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, obj);
      } else {
        await createSchedule(obj);
      }
      messageApi.success('Success');
      closeModal();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onEnabledChange = (id: string, checked: boolean) => {
    updateSchedule(id, {enabled: checked})
      .then(() => {
        // loadSchedulesWithRelations();
        return messageApi.success('Success');
      })
      .catch(e => {
        messageApi.error(e.message || e);
      });
  };

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setSelectedSchedule(undefined);
    setOpen(false);
  };

  const handleErrors = (e: any) => {
    return messageApi.error(e.message || e);
  };

  return (
    <>
      {contextHolder}
      <Card>
        <Row justify={'center'} gutter={[0, 8]}>
          <Col span={6}>
            <Select
              showSearch
              optionFilterProp={'label'}
              allowClear
              placeholder={'Search by Trip'}
              style={{width: '70%'}}
              options={trips.map(trip => ({
                label: `${trip.departureCity.name} -> ${trip.arrivalCity.name}`,
                value: trip.id,
              }))}
            />
          </Col>
          <Col span={6}>
            <Input allowClear placeholder={'Search by Bus Name'} style={{width: '70%'}} />
          </Col>
          <Col span={6}>
            Enabled &nbsp;
            <Switch defaultChecked={true} />
          </Col>
          <Col span={6} style={{border: '', textAlign: 'right'}}>
            <Button
              type={'primary'}
              icon={<PlusCircleOutlined />}
              size={'large'}
              onClick={openModal}>
              Add
            </Button>
          </Col>
        </Row>
      </Card>
      <Row justify={'center'} gutter={[0, 8]}>
        <Col flex={1}>
          <Table
            size={'small'}
            loading={getSchedulesLoading}
            dataSource={schedulesWithRelations}
            bordered
            rowKey={'id'}
            title={() => <h1>Schedules</h1>}>
            <Table.Column<ScheduleWithRelations>
              title={'Trip Details'}
              align={'center'}
              render={(_, record) => (
                <Space>
                  <div>{record.trip?.departureCity.name}</div>
                  <ArrowRightOutlined />
                  <div>{record.trip?.arrivalCity.name}</div>
                </Space>
              )}
            />
            <Table.Column<ScheduleWithRelations>
              title={'Bus Details'}
              align={'center'}
              render={(_, record) => record.bus?.name}
            />
            <Table.Column<ScheduleWithRelations>
              title={'Departure Time'}
              align={'center'}
              render={(_, record) => getFormattedTimeFromDate(record.departureTime)}
            />
            <Table.Column<ScheduleWithRelations>
              title={'Arrival Time'}
              align={'center'}
              render={(_, record) => getFormattedTimeFromDate(record.arrivalTime)}
            />
            <Table.Column<ScheduleWithRelations>
              title={'Enabled'}
              align={'center'}
              render={(_, record) => {
                return (
                  <Switch
                    checked={record.enabled}
                    onChange={checked => onEnabledChange(record.id, checked)}
                    loading={updateScheduleLoading && selectedSchedule?.id === record.id}
                  />
                );
              }}
            />

            <Table.Column<ScheduleWithRelations>
              title={'Action'}
              key={'action'}
              align={'center'}
              render={(_, record) => (
                <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                  <ButtonGroup>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedSchedule(record);
                        setTimeout(() => {
                          openModal();
                        }, 0);
                      }}
                    />
                    <Popconfirm
                      disabled
                      title={'Are you sure?'}
                      placement={'leftTop'}
                      // onConfirm={() => onDelete(record.id)}
                    >
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
            confirmLoading={createScheduleLoading || updateScheduleLoading}>
            <h1>Form</h1>
            <Form form={form} labelCol={{span: 7}} onFinish={onFinish} preserve={false}>
              <Form.Item
                label={'Trip'}
                name={'tripId'}
                rules={[{required: true, message: 'Trip is required'}]}>
                <Select
                  showSearch
                  optionFilterProp={'label'}
                  options={trips.map(trip => ({
                    label: `${trip.departureCity.name} -> ${trip.arrivalCity.name}`,
                    value: trip.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={'Bus'}
                name={'busId'}
                rules={[{required: true, message: 'Bus is required'}]}>
                <Select
                  showSearch
                  optionFilterProp={'label'}
                  options={buses.map(bus => ({
                    label: `${bus.name} | ${bus.regNumber}`,
                    value: bus.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={'Departure Time'}
                name={'departureTime'}
                rules={[{required: true, message: 'Departure Time is required'}]}>
                <TimePicker format={'hh:mm a'} use12Hours />
              </Form.Item>

              <Form.Item
                label={'Arrival Time'}
                name={'arrivalTime'}
                rules={[{required: true, message: 'Arrival Time is required'}]}>
                <TimePicker format={'hh:mm a'} use12Hours />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </>
  );
};

export default ScheduleRoute;
