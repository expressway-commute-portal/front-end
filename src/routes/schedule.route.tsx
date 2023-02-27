import React, {useEffect, useState} from 'react';
import {
  Button,
  Col,
  Form,
  Layout,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  TimePicker,
  Tooltip,
} from 'antd';
import {Bus} from '../models/Bus';
import {Content} from 'antd/es/layout/layout';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined} from '@ant-design/icons';
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
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      form.setFieldsValue({
        tripId: selectedSchedule.tripId,
        busId: selectedSchedule.busId,
        departureTime: dayjs(selectedSchedule.departureTime.toDate()),
        arrivalTime: dayjs(selectedSchedule.arrivalTime.toDate()),
      });
    }
  }, [selectedSchedule]);

  const loadData = () => {
    getSchedulesWithRelations()
      .then()
      .catch(e => {
        return messageApi.error(e.message || e);
      });

    getTrips().then().catch();
    getBuses().then().catch();
  };

  const onDelete = async (id: string) => {};

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
      loadData();
      messageApi.success('Success');
      closeModal();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setSelectedSchedule(undefined);
    setOpen(false);
  };

  return (
    <Row justify={'center'} gutter={[0, 8]}>
      {contextHolder}
      <Col span={24} style={{border: '', textAlign: 'right'}}>
        <Button type={'primary'} icon={<PlusCircleOutlined />} size={'large'} onClick={openModal}>
          Add
        </Button>
      </Col>
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
            render={(_, record) =>
              `${record.trip?.departureCity.name} -> ${record.trip?.arrivalCity.name}`
            }
          />
          <Table.Column<ScheduleWithRelations>
            title={'Bus Details'}
            align={'center'}
            render={(_, record) => record.bus?.name}
          />
          <Table.Column<ScheduleWithRelations>
            title={'Departure Time'}
            align={'center'}
            render={(_, record) => getFormattedTimeFromDate(record.departureTime.toDate())}
          />
          <Table.Column<ScheduleWithRelations>
            title={'Arrival Time'}
            align={'center'}
            render={(_, record) => getFormattedTimeFromDate(record.arrivalTime.toDate())}
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
          confirmLoading={createScheduleLoading || updateScheduleLoading}>
          <h1>Form</h1>
          <Form form={form} labelCol={{span: 7}} onFinish={onFinish} preserve={false}>
            <Form.Item
              label={'Trip'}
              name={'tripId'}
              rules={[{required: true, message: 'Trip is required'}]}>
              <Select
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
              <TimePicker use12Hours />
            </Form.Item>

            <Form.Item
              label={'Arrival Time'}
              name={'arrivalTime'}
              rules={[{required: true, message: 'Arrival Time is required'}]}>
              <TimePicker use12Hours />
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default ScheduleRoute;
