import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Layout, message, Modal, Popconfirm, Row, Select, Table} from 'antd';
import {Content} from 'antd/es/layout/layout';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined} from '@ant-design/icons';
import ButtonGroup from 'antd/es/button/button-group';
import {useTripStore} from '../store/trip.store';
import {Trip} from '../models/Trip';
import {useCityStore} from '../store/city.store';

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

  const transform = (formValues: {departureCity: string; arrivalCity: string}) => {
    const departureCity = cities.find(c => c.id === formValues.departureCity);
    const arrivalCity = cities.find(c => c.id === formValues.arrivalCity);
    if (!departureCity || !arrivalCity) {
      return;
    }

    const object = {
      departureCity: {id: departureCity.id, name: departureCity.name},
      arrivalCity: {id: arrivalCity.id, name: arrivalCity.name},
    };
    return object;
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
      <Layout style={{paddingLeft: 100, paddingRight: 100, paddingTop: 30}}>
        <Content>
          {contextHolder}
          <Row align={'middle'}>
            <Col span={24} style={{border: '', textAlign: 'right'}}>
              <Button
                type={'primary'}
                icon={<PlusCircleOutlined />}
                size={'large'}
                onClick={openModal}>
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
                  dataIndex={['departureCity', 'name']}
                />
                <Table.Column<Trip> title={'Arrival City'} dataIndex={['arrivalCity', 'name']} />
                <Table.Column<Trip>
                  title={'Action'}
                  key={'action'}
                  render={(_, record) => (
                    <ButtonGroup>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelectedTrip(record);
                          openModal();
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
                  )}
                />
              </Table>
              <Modal
                open={open}
                destroyOnClose
                maskClosable
                onCancel={closeModal}
                onOk={form.submit}
                confirmLoading={createTripLoading || updateTripLoading}>
                <h1>Form</h1>
                <Form form={form} labelCol={{span: 6}} onFinish={onFinish} preserve={false}>
                  <Form.Item
                    name={'departureCity'}
                    label={'Departure City'}
                    rules={[{required: true, message: 'Departure City is required'}]}>
                    <Select options={cities.map(city => ({label: city.name, value: city.id}))} />
                  </Form.Item>

                  <Form.Item
                    name={'arrivalCity'}
                    label={'Arrival City'}
                    rules={[{required: true, message: 'Arrival City is required'}]}>
                    <Select options={cities.map(city => ({label: city.name, value: city.id}))} />
                  </Form.Item>
                </Form>
              </Modal>
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
};

export default TripRoute;
