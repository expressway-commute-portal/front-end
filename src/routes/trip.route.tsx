import React, {useEffect, useState} from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ButtonGroup from 'antd/es/button/button-group';
import {useTripStore} from '../store/trip.store';
import {Prices, Trip} from '../models/Trip';
import {useCityStore} from '../store/city.store';
import {getFirstLetters} from '../util';

const TripRoute = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getTrips = useTripStore(state => state.getTrips);
  const createTrip = useTripStore(state => state.createTrip);
  const deleteTrip = useTripStore(state => state.deleteTrip);
  const updateTrip = useTripStore(state => state.updateTrip);

  const cities = useCityStore(state => state.cities);
  const getCities = useCityStore(state => state.getCities);

  const getTripsLoading = useTripStore(state => state.getTripsLoading);
  const createTripLoading = useTripStore(state => state.createTripLoading);
  const updateTripLoading = useTripStore(state => state.updateTripLoading);

  const trips = useTripStore(state => state.trips);
  const [open, setOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTrip) {
      form.setFieldsValue({
        departureCity: selectedTrip.departureCity.id,
        arrivalCity: selectedTrip.arrivalCity.id,
        routeNumber: selectedTrip.routeNumber,
        prices: selectedTrip.prices,
      });
    }
  }, [selectedTrip]);

  const loadData = () => {
    getTrips()
      .then()
      .catch(e => {
        return messageApi.error(e.message || e);
      });

    if (!cities.length) {
      getCities()
        .then()
        .catch(e => {
          return messageApi.error(e.message || e);
        });
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteTrip(id);
      messageApi.success('Trip deleted successfully');
      loadData();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const transform = (formValues: {
    departureCity: string;
    arrivalCity: string;
    routeNumber: string;
    prices: Prices[];
  }) => {
    const departureCity = cities.find(c => c.id === formValues.departureCity);
    const arrivalCity = cities.find(c => c.id === formValues.arrivalCity);
    if (!departureCity || !arrivalCity) {
      return;
    }

    return {
      departureCity: {id: departureCity.id, name: departureCity.name},
      arrivalCity: {id: arrivalCity.id, name: arrivalCity.name},
      routeNumber: formValues.routeNumber,
      prices: formValues.prices,
    };
  };

  const onFinish = async (values: any) => {
    const object = transform(values);
    if (!object) {
      return;
    }

    try {
      if (selectedTrip) {
        await updateTrip(selectedTrip.id, object);
        closeModal();
        messageApi.success('Trip updated successfully');
        loadData();
      } else {
        await createTrip(object as any);
        closeModal();
        messageApi.success('Trip added successfully');
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
    setSelectedTrip(undefined);
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
            loading={getTripsLoading}
            dataSource={trips}
            bordered
            rowKey={'id'}
            title={() => <h1>Trips</h1>}>
            <Table.Column<Trip>
              title={'Departure City'}
              align={'center'}
              dataIndex={['departureCity', 'name']}
            />
            <Table.Column<Trip>
              title={'Arrival City'}
              align={'center'}
              dataIndex={['arrivalCity', 'name']}
            />
            <Table.Column<Trip> title={'Route Number'} align={'center'} dataIndex={'routeNumber'} />
            <Table.Column<Trip>
              title={'Ticket Price'}
              align={'right'}
              render={(_, record) => {
                if (record.prices?.length) {
                  return record.prices
                    .map(p => `${p.price.toLocaleString()}(${getFirstLetters(p.serviceType)})`)
                    .join(' ');
                } else {
                  return record.price.toLocaleString();
                }
              }}
            />
            <Table.Column<Trip>
              title={'Action'}
              key={'action'}
              align={'center'}
              render={(_, record) => (
                <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                  <ButtonGroup>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedTrip(record);
                        openModal();
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
            width={700}
            onCancel={closeModal}
            onOk={form.submit}
            confirmLoading={createTripLoading || updateTripLoading}>
            <h1>Form</h1>
            <Form form={form} onFinish={onFinish} preserve={false}>
              <Form.Item
                name={'departureCity'}
                label={'Departure City'}
                rules={[{required: true, message: 'Departure City is required'}]}>
                <Select
                  showSearch
                  optionFilterProp={'label'}
                  options={cities.map(city => ({label: city.name, value: city.id}))}
                />
              </Form.Item>

              <Form.Item
                name={'arrivalCity'}
                label={'Arrival City'}
                rules={[{required: true, message: 'Arrival City is required'}]}>
                <Select
                  showSearch
                  optionFilterProp={'label'}
                  options={cities.map(city => ({label: city.name, value: city.id}))}
                />
              </Form.Item>

              <Form.Item
                label={'Route Number'}
                name={'routeNumber'}
                rules={[{required: true, message: 'Route Number is required'}]}>
                <Input placeholder={'Route Number'} style={{width: '30%'}} />
              </Form.Item>

              <Form.List
                name="prices"
                rules={[
                  {
                    message: 'Prices are required',
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error('Prices are required'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                {(fields, {add, remove}, {errors}) => (
                  <>
                    {fields.map(field => (
                      <Space key={field.key} align={'baseline'}>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, curValues) =>
                            JSON.stringify(prevValues.prices) !== JSON.stringify(curValues.prices)
                          }>
                          {() => (
                            <Form.Item
                              {...field}
                              label="Service Type"
                              name={[field.name, 'serviceType']}
                              rules={[{required: true, message: 'Missing Service Type'}]}>
                              <Select style={{width: 200}}>
                                <Select.Option value="Luxury">Luxury</Select.Option>
                                <Select.Option value="Super Luxury">Super Luxury</Select.Option>
                              </Select>
                            </Form.Item>
                          )}
                        </Form.Item>
                        <Form.Item
                          {...field}
                          label="Price"
                          name={[field.name, 'price']}
                          rules={[{required: true, message: 'Missing price'}]}>
                          <InputNumber placeholder="price" style={{width: '100%'}} />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(field.name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Ticket Prices
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

export default TripRoute;
