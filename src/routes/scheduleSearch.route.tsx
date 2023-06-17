import React from 'react';
import {PhoneTwoTone, SearchOutlined} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  List,
  Modal,
  Row,
  Select,
  Space,
  message,
} from 'antd';
import _debounce from 'lodash/debounce';
import {useEffect, useMemo, useState} from 'react';
import '../App.css';
import ScheduleCard from '../components/ScheduleCard';
import {Schedule} from '../models/Schedule';
import {Trip} from '../models/Trip';
import {useBusStore} from '../store/bus.store';
import {useCityStore} from '../store/city.store';
import {useScheduleStore} from '../store/schedule.store';
import {useTripStore} from '../store/trip.store';

function ScheduleSearchRoute() {
  const [open, setOpen] = useState(false);

  const departureCities = useCityStore(state => state.departureCities);
  const arrivalCities = useCityStore(state => state.arrivalCities);

  const getDepartureCitiesByName = useCityStore(state => state.getDepartureCitiesByName);
  const getDepartureCitiesByNameLoading = useCityStore(
    state => state.getDepartureCitiesByNameLoading,
  );

  const getArrivalCitiesByName = useCityStore(state => state.getArrivalCitiesByName);
  const getArrivalCitiesByNameLoading = useCityStore(state => state.getArrivalCitiesByNameLoading);

  const clearDepartureCities = useCityStore(state => state.clearDepartureCities);
  const clearArrivalCities = useCityStore(state => state.clearArrivalCities);

  const trip = useTripStore(state => state.trip);
  const getTripsLoading = useTripStore(state => state.getTripsLoading);
  const getTripByCityIds = useTripStore(state => state.getTripByCityIds);

  const schedules = useScheduleStore(state => state.schedules);
  const getSchedulesLoading = useScheduleStore(state => state.getSchedulesLoading);
  const getSchedules = useScheduleStore(state => state.getSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();

  const selectedBus = useBusStore(state => state.selectedBus);
  const getBusById = useBusStore(state => state.getBusById);
  const getBusByIdLoading = useBusStore(state => state.getBusByIdLoading);

  const [messageApi, contextHolder] = message.useMessage();

  const onDepartureSearch = async (value: string) => {
    if (value) {
      await getDepartureCitiesByName(value);
    } else {
      clearDepartureCities();
    }
  };

  const onArrivalSearch = async (value: string) => {
    if (value) {
      await getArrivalCitiesByName(value);
    } else {
      clearArrivalCities();
    }
  };

  const debouncedDepartureSearch = useMemo(() => {
    return _debounce(onDepartureSearch, 500);
  }, []);

  const debouncedArrivalSearch = useMemo(() => {
    return _debounce(onArrivalSearch, 500);
  }, []);

  useEffect(() => {
    debouncedDepartureSearch.cancel();
    debouncedArrivalSearch.cancel();
  });

  const onFinish = async (values: any) => {
    const {
      arrivalCity: {key: arrivalCityId},
      departureCity: {key: departureCityId},
    } = values;

    await getTripByCityIds(departureCityId, arrivalCityId);
    const count = await getSchedules();

    if (count === 0) {
      messageApi.warning('No schedules');
    }
  };

  const onBusDetailsButtonClick = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    if (schedule.busId) {
      await getBusById(schedule.busId);
    }
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  const renderSchedules = (schedules: Schedule[], trip: Trip) => {
    let columns = 3;
    schedules.length === 1 && (columns = 1);
    schedules.length === 2 && (columns = 2);
    const gridConfig = {
      gutter: 16,
      xs: 1,
      sm: 2,
      md: 2,
      lg: columns,
      xl: columns,
      xxl: columns,
    };

    return (
      <List
        grid={gridConfig}
        dataSource={schedules}
        renderItem={item => (
          <List.Item>
            <ScheduleCard
              schedule={item}
              trip={trip}
              onBusDetailsButtonClick={onBusDetailsButtonClick}
              getBusByIdLoading={getBusByIdLoading}
              selectedSchedule={selectedSchedule}
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <>
      {contextHolder}
      <Row justify={'center'}>
        <Col style={{border: ''}}>
          <Card title={'Expressway Bus Schedule'} headStyle={{textAlign: 'center'}}>
            <Form
              labelAlign={'right'}
              labelCol={{span: 10}}
              style={{border: ''}}
              onFinish={onFinish}>
              <Form.Item
                label={'Departure City'}
                name={'departureCity'}
                style={{width: 300}}
                rules={[{required: true, message: 'Departure city is required'}]}>
                <Select
                  loading={getDepartureCitiesByNameLoading}
                  showSearch
                  labelInValue
                  placeholder={'Please enter the city name'}
                  onSearch={debouncedDepartureSearch}>
                  {departureCities.map(city => (
                    <Select.Option key={city.id} value={city.name}>
                      {city.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={'Arrival City'}
                name={'arrivalCity'}
                style={{width: 300}}
                rules={[{required: true, message: 'Arrival city is required'}]}>
                <Select
                  loading={getArrivalCitiesByNameLoading}
                  showSearch
                  labelInValue
                  placeholder={'Please enter the city name'}
                  onSearch={debouncedArrivalSearch}>
                  {arrivalCities.map(city => (
                    <Select.Option key={city.id} value={city.name}>
                      {city.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  block
                  size={'large'}
                  loading={getTripsLoading || getSchedulesLoading}
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}>
                  Search
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <br />
      <br />
      {trip && (
        <Row justify={'center'}>
          <Col>{renderSchedules(schedules, trip)}</Col>
        </Row>
      )}

      {/* Bus Details Modal */}
      {selectedBus && (
        <Modal open={open} onCancel={onCloseModal} destroyOnClose maskClosable footer={null}>
          <Descriptions
            title={'Bus Details'}
            bordered
            layout={'horizontal'}
            column={1}
            size={'small'}>
            <Descriptions.Item label="Name">{selectedBus.name}</Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {selectedBus.regNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number(s)">
              {selectedBus.contactNumbers.map((no, i) => (
                <div key={i}>
                  <Space>
                    <PhoneTwoTone />
                    <a href={`tel:${no}`}>{no}</a>
                  </Space>
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </>
  );
}

export default ScheduleSearchRoute;
