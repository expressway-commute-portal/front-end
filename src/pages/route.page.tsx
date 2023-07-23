import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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
import ButtonGroup from 'antd/es/button/button-group';
import {useEffect, useState} from 'react';
import {Prices, Route} from '../models/Route';
import {useCityStore} from '../store/city.store';
import {useRouteStore} from '../store/route.store';
import {getFirstLetters} from '../util';

const RoutePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getRoutes = useRouteStore(state => state.getRoutes);
  const createRoute = useRouteStore(state => state.createRoute);
  const deleteRoute = useRouteStore(state => state.deleteRoute);
  const updateRoute = useRouteStore(state => state.updateRoute);

  const cities = useCityStore(state => state.cities);
  const getCities = useCityStore(state => state.getCities);

  const getRoutesLoading = useRouteStore(state => state.getRoutesLoading);
  const createRouteLoading = useRouteStore(state => state.createRouteLoading);
  const updateRouteLoading = useRouteStore(state => state.updateRouteLoading);

  const routes = useRouteStore(state => state.routes);
  const [open, setOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      form.setFieldsValue({
        departureCity: selectedRoute.departureCity.id,
        arrivalCity: selectedRoute.arrivalCity.id,
        routeNumber: selectedRoute.routeNumber,
        transitCityIds: selectedRoute.transitCityIds,
        prices: selectedRoute.prices,
      });
    }
  }, [selectedRoute]);

  const loadData = () => {
    getRoutes()
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
      await deleteRoute(id);
      messageApi.success('Route deleted successfully');
      loadData();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const transform = (formValues: {
    departureCity: string;
    arrivalCity: string;
    routeNumber: string;
    transitCityIds: string[];
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
      transitCityIds: formValues.transitCityIds,
      prices: formValues.prices,
    };
  };

  const onFinish = async (values: any) => {
    const object = transform(values);
    if (!object) {
      return;
    }

    try {
      if (selectedRoute) {
        await updateRoute(selectedRoute.id, object);
        closeModal();
        messageApi.success('Route updated successfully');
        loadData();
      } else {
        await createRoute(object as any);
        closeModal();
        messageApi.success('Route added successfully');
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
    setSelectedRoute(undefined);
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
            loading={getRoutesLoading}
            dataSource={routes}
            bordered
            rowKey={'id'}
            title={() => <h1>Routes</h1>}>
            <Table.Column<Route>
              title={'Departure City'}
              align={'center'}
              dataIndex={['departureCity', 'name']}
            />
            <Table.Column<Route>
              title={'Arrival City'}
              align={'center'}
              dataIndex={['arrivalCity', 'name']}
            />
            <Table.Column<Route> title={'Route Number'} align={'center'} dataIndex={'routeNumber'} />
            <Table.Column<Route>
              title={'Transit Cities'}
              render={(_, record) => {
                return (record.transitCityIds || [])
                  .map(id => {
                    const city = cities.find(c => c.id === id);
                    return city ? city.name : '';
                  })
                  .join(' -> ');
              }}
            />
            <Table.Column<Route>
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
            <Table.Column<Route>
              title={'Action'}
              key={'action'}
              align={'center'}
              render={(_, record) => (
                <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                  <ButtonGroup>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedRoute(record);
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
            confirmLoading={createRouteLoading || updateRouteLoading}>
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

              <Form.Item label={'Transit Cities'} name={'transitCityIds'}>
                <Select
                  mode="multiple"
                  showSearch
                  optionFilterProp={'label'}
                  options={cities.map(city => ({label: city.name, value: city.id}))}
                />
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

export default RoutePage;
