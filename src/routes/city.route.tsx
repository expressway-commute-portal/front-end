import React, {useEffect, useState} from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import {Bus} from '../models/Bus';
import {Content} from 'antd/es/layout/layout';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined} from '@ant-design/icons';
import ButtonGroup from 'antd/es/button/button-group';
import {City} from '../models/City';
import {useCityStore} from '../store/city.store';

const CityRoute = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getCities = useCityStore(state => state.getCities);
  const createCity = useCityStore(state => state.createCity);
  const deleteCity = useCityStore(state => state.deleteCity);
  const updateCity = useCityStore(state => state.updateCity);

  const getCitiesLoading = useCityStore(state => state.getCitiesLoading);
  const createCityLoading = useCityStore(state => state.createCityLoading);
  const updateCityLoading = useCityStore(state => state.updateCityLoading);

  const cities = useCityStore(state => state.cities);

  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    form.setFieldsValue(selectedCity);
  }, [selectedCity]);

  const loadData = () => {
    getCities()
      .then()
      .catch(e => {
        messageApi.error(e.message || e);
      });
  };

  const onDelete = async (id: string) => {
    try {
      await deleteCity(id);
      messageApi.success('City deleted successfully');
      loadData();
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onFinish = async (values: Partial<Bus>) => {
    try {
      if (selectedCity) {
        await updateCity(selectedCity.id, values);
        closeModal();
        messageApi.success('City updated successfully');
        loadData();
      } else {
        await createCity(values as any);
        closeModal();
        messageApi.success('City added successfully');
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
    setSelectedCity(undefined);
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
          loading={getCitiesLoading}
          dataSource={cities}
          bordered
          rowKey={'id'}
          title={() => <h1>Cities</h1>}>
          <Table.Column<City> title={'Name'} dataIndex={'name'} />
          <Table.Column<City>
            title={'Action'}
            key={'action'}
            render={(_, record) => (
              <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                <ButtonGroup>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedCity(record);
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
          confirmLoading={createCityLoading || updateCityLoading}>
          <h1>Form</h1>
          <Form form={form} labelCol={{span: 6}} onFinish={onFinish} preserve={false}>
            <Form.Item
              label={'Name'}
              name={'name'}
              rules={[{required: true, message: 'Name is required'}]}>
              <Input placeholder={'Name'} />
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default CityRoute;
