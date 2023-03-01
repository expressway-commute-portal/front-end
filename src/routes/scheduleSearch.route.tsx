import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Layout,
  List,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import _debounce from 'lodash/debounce';
import {useCityStore} from '../store/city.store';
import {useTripStore} from '../store/trip.store';
import {useScheduleStore} from '../store/schedule.store';
import {DateTime} from 'luxon';
import {useBusStore} from '../store/bus.store';
import {
  ArrowRightOutlined,
  FacebookFilled,
  GithubFilled,
  PhoneTwoTone,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import '../App.css';
import {Content, Footer} from 'antd/es/layout/layout';

function ScheduleSearchRoute() {
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');

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

  const selectedBus = useBusStore(state => state.selectedBus);
  const getBusById = useBusStore(state => state.getBusById);

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
    await getSchedules();
  };

  const onBusDetailsButtonClick = async (id: string) => {
    await getBusById(id);
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  return (
    <Layout style={{border: ''}}>
      <Content style={{paddingTop: '20px'}}>
        <Row justify={'center'} style={{border: ''}}>
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
                    onChange={value => setDepartureCity(value.label)}>
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
                    onChange={value => setArrivalCity(value.label)}>
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
            <Col>
              <List
                grid={{
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={schedules}
                renderItem={item => (
                  <List.Item>
                    <Card
                      title={
                        <>
                          {departureCity} &nbsp; <ArrowRightOutlined /> &nbsp; {arrivalCity}
                        </>
                      }
                      headStyle={{textAlign: 'center'}}
                      bodyStyle={{textAlign: 'center'}}>
                      <Descriptions bordered layout={'horizontal'} column={1} size={'small'}>
                        <Descriptions.Item label="Departure Time">
                          {DateTime.fromJSDate(item.departureTime.toDate()).toFormat('hh:mm a')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Arrival Time">
                          {DateTime.fromJSDate(item.arrivalTime.toDate()).toFormat('hh:mm a')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ticket Price">
                          <b>Rs.{trip.price}</b>
                        </Descriptions.Item>
                      </Descriptions>
                      <br />
                      {item.busId && (
                        <Button
                          type={'default'}
                          onClick={() => onBusDetailsButtonClick(item.busId || '')}
                          icon={<UnorderedListOutlined />}>
                          Bus Details
                        </Button>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        )}
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
      </Content>
      <Footer style={{textAlign: 'center'}}>
        <Space direction={'horizontal'}>
          <Button
            type="primary"
            shape="circle"
            icon={<FacebookFilled />}
            size={'large'}
            href={'https://www.facebook.com/groups/Highway.Bus.Sri.Lanka'}
            target={'_blank'}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<GithubFilled />}
            size={'large'}
            href={'https://github.com/kosalamoon/expressway-commute-portal'}
            target={'_blank'}
          />
        </Space>
        <br />
        <br />
        <Typography.Text type={'secondary'} italic>
          Copyright © 2023 by Expressway Commute Portal. All Rights Received{' '}
        </Typography.Text>
      </Footer>
    </Layout>
  );
}

export default ScheduleSearchRoute;
