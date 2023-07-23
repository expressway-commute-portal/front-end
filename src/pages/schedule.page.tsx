import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TimePicker,
  Tooltip,
} from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import dayjs from 'dayjs';
import {useEffect, useState} from 'react';
import {Schedule, ScheduleWithRelations} from '../models/Schedule';
import {useBusStore} from '../store/bus.store';
import {useCityStore} from '../store/city.store';
import {useScheduleStore} from '../store/schedule.store';
import {useRouteStore} from '../store/route.store';
import {getFormattedTimeFromDate} from '../util';
import TransitCities from '../components/TransitCities';

const SchedulePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getSchedulesLoading = useScheduleStore(state => state.getSchedulesLoading);
  const createScheduleLoading = useScheduleStore(state => state.createScheduleLoading);
  const updateScheduleLoading = useScheduleStore(state => state.updateScheduleLoading);

  const schedulesWithRelations = useScheduleStore(state => state.schedulesWithRelations);

  const getSchedulesWithRelations = useScheduleStore(state => state.getSchedulesWithRelations);
  const createSchedule = useScheduleStore(state => state.createSchedule);
  const updateSchedule = useScheduleStore(state => state.updateSchedule);
  const deleteSchedule = useScheduleStore(state => state.deleteSchedule);

  const routes = useRouteStore(state => state.routes);
  const getRoutes = useRouteStore(state => state.getRoutes);

  const buses = useBusStore(state => state.buses);
  const getBuses = useBusStore(state => state.getBuses);

  const cities = useCityStore(state => state.cities);
  const getCities = useCityStore(state => state.getCities);

  const [filteredSchedulesWithRelations, setFilteredSchedulesWithRelations] = useState<
    ScheduleWithRelations[]
  >([]);

  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const [busSearchValue, setBusSearchValue] = useState('');
  const [routeSearchValue, setRouteSearchValue] = useState('');
  const [enabledSearchValue, setEnabledSearchValue] = useState(true);

  useEffect(() => {
    loadSchedulesWithRelations();
    loadRoutes();
    loadBuses();
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      form.setFieldsValue({
        routeId: selectedSchedule.routeId,
        busId: selectedSchedule.busId,
        departureTime: dayjs(selectedSchedule.departureTime),
        arrivalTime: selectedSchedule.arrivalTime ? dayjs(selectedSchedule.arrivalTime) : null,
        transitTimes: selectedSchedule.transitTimes.map(t => ({
          ...t,
          time: dayjs(t.time),
        })),
      });
    }
  }, [selectedSchedule]);

  useEffect(() => {
    const filtered = schedulesWithRelations.filter(s => {
      return (
        (!busSearchValue || s.bus?.name.toLowerCase().includes(busSearchValue.toLowerCase())) &&
        (!routeSearchValue || s.routeId === routeSearchValue) &&
        s.enabled === enabledSearchValue
      );
    });
    setFilteredSchedulesWithRelations(filtered);
  }, [busSearchValue, routeSearchValue, enabledSearchValue, schedulesWithRelations]);

  const loadSchedulesWithRelations = () => {
    getSchedulesWithRelations().then().catch(handleErrors);
  };

  const loadRoutes = () => {
    getRoutes().then().catch(handleErrors);
  };

  const loadBuses = () => {
    getBuses().then().catch(handleErrors);
  };

  const loadCities = () => {
    getCities().then().catch(handleErrors);
  };

  const onDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      messageApi.success('Schedule deleted successfully');
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onFinish = async (values: any) => {
    const obj = {
      ...values,
      departureTime: values.departureTime.toDate(),
      arrivalTime: values.arrivalTime ? values.arrivalTime.toDate() : null,
      transitTimes: values.transitTimes.map((t: any) => ({
        ...t,
        time: t.time.toDate(),
      })),
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

  const onEnabledChange = async (id: string, checked: boolean) => {
    setSelectedScheduleId(id);
    try {
      await updateSchedule(id, {enabled: checked});
      messageApi.success('Success');
    } catch (e) {
      messageApi.error(e.message || e);
    } finally {
      setSelectedScheduleId('');
    }
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
              placeholder={'Search by Route'}
              style={{width: '70%'}}
              options={routes.map(route => ({
                label: `${route.departureCity.name} -> ${route.arrivalCity.name}`,
                value: route.id,
              }))}
              onChange={setRouteSearchValue}
            />
          </Col>
          <Col span={6}>
            <Input.Search
              allowClear
              placeholder={'Search by Bus Name'}
              style={{width: '70%'}}
              onSearch={setBusSearchValue}
              enterButton
            />
          </Col>
          <Col span={6}>
            Enabled &nbsp;
            <Switch defaultChecked={true} onClick={setEnabledSearchValue} />
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
            dataSource={filteredSchedulesWithRelations}
            bordered
            rowKey={'id'}
            title={() => <h1>Schedules</h1>}>
            <Table.Column<ScheduleWithRelations>
              title={'Route Details'}
              align={'center'}
              render={(_, record) =>
                (
                  <Space>
                    <div>{record.route?.departureCity.name}</div>
                    <ArrowRightOutlined />
                    <div>{record.route?.arrivalCity.name}</div>
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
              render={(_, record) =>
                record.arrivalTime ? getFormattedTimeFromDate(record.arrivalTime) : ''
              }
            />
            <Table.Column<ScheduleWithRelations>
              title={'Transits'}
              align={'center'}
              render={(_, record) => (
                <div>
                  {record.transitTimes.length} Citie(s) &nbsp;
                  {record.transitTimes.length > 0 && (
                    <Popover
                      placement="bottomRight"
                      content={
                        <TransitCities
                          transits={record.transitTimes.map(t => ({
                            city: cities.find(c => c.id === t.cityId)?.name || '',
                            time: getFormattedTimeFromDate(t.time),
                          }))}
                        />
                      }>
                      <Button size="small">View</Button>
                    </Popover>
                  )}
                </div>
              )}
            />
            <Table.Column<ScheduleWithRelations>
              title={'Enabled'}
              align={'center'}
              render={(_, record) => {
                return (
                  <Switch
                    checked={record.enabled}
                    onChange={checked => onEnabledChange(record.id, checked)}
                    loading={updateScheduleLoading && selectedScheduleId === record.id}
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
                      title={'Are you sure?'}
                      placement={'leftTop'}
                      onConfirm={() => onDelete(record.id)}>
                      <Button danger icon={<DeleteOutlined />} />
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
            <Form
              form={form}
              labelCol={{span: 7}}
              onFinish={onFinish}
              preserve={false}
              labelAlign="left">
              <Form.Item
                label={'Route'}
                name={'routeId'}
                rules={[{required: true, message: 'Route is required'}]}>
                <Select
                  showSearch
                  optionFilterProp={'label'}
                  options={routes.map(route => ({
                    label: `${route.departureCity.name} -> ${route.arrivalCity.name}`,
                    value: route.id,
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

              <Form.Item label={'Arrival Time'} name={'arrivalTime'}>
                <TimePicker format={'hh:mm a'} use12Hours />
              </Form.Item>

              <Form.List name="transitTimes">
                {(fields, {add, remove}, {errors}) => (
                  <>
                    {fields.map(field => {
                      return (
                        <Space key={field.key} align="baseline">
                          <Form.Item
                            label={'Transits'}
                            name={[field.name, 'cityId']}
                            rules={[{required: true, message: 'Missing City'}]}>
                            <Select
                              style={{width: 200}}
                              showSearch
                              optionFilterProp={'label'}
                              options={cities.map(city => ({label: city.name, value: city.id}))}
                              placeholder={'Select City'}
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'time']}
                            rules={[{required: true, message: 'Missing time'}]}>
                            <TimePicker
                              style={{width: 110}}
                              format={'hh:mm a'}
                              use12Hours
                              placeholder="Time"
                            />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(field.name)} />
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
        </Col>
      </Row>
    </>
  );
};

export default SchedulePage;
