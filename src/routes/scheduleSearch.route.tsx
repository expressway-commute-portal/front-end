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
import {City} from '../models/City';
import {Schedule} from '../models/Schedule';
import {useBusStore} from '../store/bus.store';
import {useCityStore} from '../store/city.store';
import {useScheduleStore} from '../store/schedule.store';
import {useTripStore} from '../store/trip.store';
import {getFirstLetters} from '../util';

function ScheduleSearchRoute() {
  const [open, setOpen] = useState(false);

  const [selectedDepartureCity, setSelectedDepartureCity] = useState<
    Pick<City, 'id' | 'name'> | undefined
  >();
  const [selectedArrivalCity, setSelectedArrivalCity] = useState<
    Pick<City, 'id' | 'name'> | undefined
  >();

  const departureCities = useCityStore(state => state.departureCities);
  const arrivalCities = useCityStore(state => state.arrivalCities);

  const getDepartureCitiesByName = useCityStore(state => state.getDepartureCitiesByName);
  const getDepartureCitiesByNameLoading = useCityStore(
    state => state.getDepartureCitiesByNameLoading,
  );

  const getArrivalCitiesByName = useCityStore(state => state.getArrivalCitiesByName);
  const getArrivalCitiesByNameLoading = useCityStore(state => state.getArrivalCitiesByNameLoading);
  const getPredefinedCities = useCityStore(state => state.getPredefinedCities);

  const clearDepartureCities = useCityStore(state => state.clearDepartureCities);
  const clearArrivalCities = useCityStore(state => state.clearArrivalCities);

  const trip = useTripStore(state => state.trip);
  const getTripsLoading = useTripStore(state => state.getTripsLoading);
  const getTripByCityIds = useTripStore(state => state.getTripByCityIds);

  const schedules = useScheduleStore(state => state.schedules);
  const getSchedulesLoading = useScheduleStore(state => state.getSchedulesLoading);
  const getSchedules = useScheduleStore(state => state.getSchedules);
  const clearSchedules = useScheduleStore(state => state.clearSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();

  const selectedBus = useBusStore(state => state.selectedBus);
  const getBusById = useBusStore(state => state.getBusById);
  const getBusByIdLoading = useBusStore(state => state.getBusByIdLoading);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getPredefinedCities().then().catch();
  }, []);

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
      setOpen(true);
    }
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  const clearSearchedSchedules = () => {
    if (schedules.length) {
      clearSchedules();
    }
  };

  const renderSchedules = () => {
    if (!trip || !selectedDepartureCity || !selectedArrivalCity) {
      return null;
    }

    let price = `${trip.price.toLocaleString()}`;
    if (trip.prices.length > 1) {
      price = trip.prices
        .map(p => `${p.price.toLocaleString()}(${getFirstLetters(p.serviceType)})`)
        .join(' | ');
    }
    if (trip.prices.length === 1) {
      price = `${trip.prices[0].price.toLocaleString()}`;
    }

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
        renderItem={schedule => {
          const departureCity = trip.departureCity.name;
          const departureTime: Date | undefined = schedule.departureTime;
          /* if (selectedDepartureCity.id !== trip.departureCity.id) {
            departureCity = selectedDepartureCity.name;
            const transitTime = schedule.transitTimes.find(
              t => t.cityId === selectedDepartureCity.id,
            )?.time;
            departureTime = transitTime;
          } */

          const arrivalCity = trip.arrivalCity.name;
          const arrivalTime: Date | undefined = schedule.arrivalTime;
          /* if (selectedArrivalCity.id !== trip.arrivalCity.id) {
            arrivalCity = selectedArrivalCity.name;
            const transitTime = schedule.transitTimes.find(
              t => t.cityId === selectedArrivalCity.id,
            )?.time;
            arrivalTime = transitTime;
          } */

          return (
            <List.Item>
              <ScheduleCard
                departureCity={departureCity}
                arrivalCity={arrivalCity}
                departureTime={departureTime}
                arrivalTime={arrivalTime}
                routeNo={trip.routeNumber}
                price={price}
                busId={schedule.busId}
                buttonLoading={getBusByIdLoading && selectedSchedule?.id === schedule.id}
                onBusDetailsButtonClick={() => onBusDetailsButtonClick(schedule)}
              />
            </List.Item>
          );
        }}
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
                  onSearch={debouncedDepartureSearch}
                  onSelect={({key, label}: {key: string; label: string}) => {
                    setSelectedDepartureCity({id: key, name: label});
                    clearSearchedSchedules();
                  }}>
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
                  onSearch={debouncedArrivalSearch}
                  onSelect={({key, label}: {key: string; label: string}) => {
                    setSelectedArrivalCity({id: key, name: label});
                    clearSearchedSchedules();
                  }}>
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

      {/* Schedule List */}
      <Row justify={'center'}>
        <Col>{renderSchedules()}</Col>
      </Row>

      {/* Bus Details Modal */}
      {selectedBus && (
        <Modal open={open} onCancel={onCloseModal} destroyOnClose maskClosable footer={null}>
          <Descriptions
            title={<div style={{textAlign: 'center'}}>Bus Details</div>}
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
