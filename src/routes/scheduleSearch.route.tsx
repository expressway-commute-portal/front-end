import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Col, Form, List, Row, Select} from 'antd';
import _debounce from 'lodash/debounce';
import {useCityStore} from '../store/city.store';
import {useTripStore} from '../store/trip.store';
import {useScheduleStore} from '../store/schedule.store';
import {DateTime} from 'luxon';

import '../App.css';

function ScheduleSearchRoute() {
  const departureCities = useCityStore(state => state.departureCities);
  const arrivalCities = useCityStore(state => state.arrivalCities);

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');

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

  return (
    <>
      <Row justify={'center'} style={{border: ''}}>
        <Col style={{border: ''}}>
          <Card
            title={'Expressway Bus Schedule'}
            headStyle={{textAlign: 'center'}}
            bodyStyle={{justifyContent: 'center'}}>
            <Form
              labelAlign={'right'}
              labelCol={{span: 11}}
              style={{border: ''}}
              onFinish={onFinish}>
              <Form.Item
                style={{border: ''}}
                label={'Departure City'}
                name={'departureCity'}
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
                  htmlType="submit">
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
                    title={`${departureCity} --> ${arrivalCity}`}
                    headStyle={{textAlign: 'center'}}
                    bodyStyle={{textAlign: 'center'}}>
                    <p>
                      Departure Time:{' '}
                      {DateTime.fromJSDate(item.departureTime.toDate()).toFormat('hh:mm a')}
                    </p>
                    <p>
                      Arrival Time:{' '}
                      {DateTime.fromJSDate(item.arrivalTime.toDate()).toFormat('hh:mm a')}
                    </p>
                  </Card>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

export default ScheduleSearchRoute;
