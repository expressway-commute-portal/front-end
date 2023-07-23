import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  message,
} from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import {useEffect, useState} from 'react';
import {
  RotationSchedule,
  RotationScheduleWithRelations,
  TimeTable,
} from '../../models/RotationSchedule';
import {useCityStore} from '../../store/city.store';
import {useRotationScheduleStore} from '../../store/rotationSchedule.store';
import {useTripStore} from '../../store/trip.store';
import {timeOnlyCompare} from '../../util';
import AddForm, {RotationScheduleAddFormData} from './AddForm';
import EditForm, {RotationScheduleEditFormData} from './EditForm';
import dayjs from 'dayjs';
import EditTimeTableForm, {EditTimeTableFormData} from './EditTimeTableForm';

const RotationScheduleRoute = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTimeTableForm] = Form.useForm();

  const getRotationSchedulesLoading = useRotationScheduleStore(
    state => state.getRotationSchedulesLoading,
  );
  const createRotationScheduleLoading = useRotationScheduleStore(
    state => state.createRotationScheduleLoading,
  );
  const updateRotationScheduleLoading = useRotationScheduleStore(
    state => state.updateRotationScheduleLoading,
  );

  const rotationSchedulesWithRelations = useRotationScheduleStore(
    state => state.rotationSchedulesWithRelations,
  );

  const getRotationSchedulesWithRelations = useRotationScheduleStore(
    state => state.getRotationSchedulesWithRelations,
  );
  const createRotationSchedule = useRotationScheduleStore(state => state.createRotationSchedule);
  const updateRotationSchedule = useRotationScheduleStore(state => state.updateRotationSchedule);
  const deleteRotationSchedule = useRotationScheduleStore(state => state.deleteRotationSchedule);

  const trips = useTripStore(state => state.trips);
  const getTrips = useTripStore(state => state.getTrips);

  const cities = useCityStore(state => state.cities);
  const getCities = useCityStore(state => state.getCities);

  const [filteredRotationSchedulesWithRelations, setFilteredRotationSchedulesWithRelations] =
    useState<RotationScheduleWithRelations[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTimeTableModalOpen, setEditTimeTableModalOpen] = useState(false);

  const [selectedRotationSchedule, setSelectedRotationSchedule] = useState<
    RotationSchedule | undefined
  >();
  const [selectedRotationScheduleId, setSelectedRotationScheduleId] = useState('');

  const [tripSearchValue, setTripSearchValue] = useState('');
  const [enabledSearchValue, setEnabledSearchValue] = useState(true);

  const handleErrors = (e: any) => {
    return messageApi.error(e.message || e);
  };

  useEffect(() => {
    loadRotationSchedulesWithRelations();
    loadTrips();
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedRotationSchedule) {
      editForm.setFieldsValue({
        tripId: selectedRotationSchedule.tripId,
        contactNumbers: selectedRotationSchedule.contactNumbers,
      });

      editTimeTableForm.setFieldsValue({
        timeTable: selectedRotationSchedule.timeTable.map(tt => ({
          departureTime: dayjs(tt.departureTime),
          arrivalTime: dayjs(tt.arrivalTime),
        })),
      });
    }
  }, [selectedRotationSchedule]);

  useEffect(() => {
    const filtered = rotationSchedulesWithRelations.filter(s => {
      return (!tripSearchValue || s.tripId === tripSearchValue) && s.enabled === enabledSearchValue;
    });
    setFilteredRotationSchedulesWithRelations(filtered);
  }, [tripSearchValue, enabledSearchValue, rotationSchedulesWithRelations]);

  const loadRotationSchedulesWithRelations = () => {
    getRotationSchedulesWithRelations().then().catch(handleErrors);
  };

  const loadTrips = () => {
    getTrips().then().catch(handleErrors);
  };

  const loadCities = () => {
    getCities().then().catch(handleErrors);
  };

  const onDelete = async (id: string) => {
    try {
      await deleteRotationSchedule(id);
      messageApi.success('Schedule deleted successfully');
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onAddFormFinish = async (values: RotationScheduleAddFormData) => {
    const timeTable: TimeTable[] = [];
    values.timeTable.forEach(tt => {
      let startTime = tt.startTime;
      while (timeOnlyCompare(startTime, tt.endTime) <= 0) {
        timeTable.push({
          departureTime: startTime.toDate(),
          arrivalTime: startTime.add(tt.duration, tt.durationUnit).toDate(),
        });

        startTime = startTime.add(tt.interval, 'minute');
      }
    });

    const obj = {
      tripId: values.tripId,
      contactNumbers: values.contactNumbers || [],
      timeTable,
    };

    try {
      await createRotationSchedule(obj);
      closeAddModal();
      messageApi.success('Schedule added successfully');
    } catch (e) {
      messageApi.error(e.message || e);
    }
  };

  const onEditFormFinish = async (values: RotationScheduleEditFormData) => {
    if (selectedRotationSchedule) {
      try {
        await updateRotationSchedule(selectedRotationSchedule.id, values);
        closeEditModal();
        messageApi.success('Schedule added successfully');
      } catch (e) {
        messageApi.error(e.message || e);
      }
    }
  };

  const openEditTimeTableFormFinish = async (values: EditTimeTableFormData) => {
    const obj = {
      timeTable: values.timeTable.map(tt => ({
        departureTime: tt.departureTime.toDate(),
        arrivalTime: tt.arrivalTime.toDate(),
      })),
    };
    if (selectedRotationSchedule) {
      try {
        await updateRotationSchedule(selectedRotationSchedule.id, obj);
        closeEditTimeTableModal();
        messageApi.success('Schedule added successfully');
      } catch (e) {
        messageApi.error(e.message || e);
      }
    }
  };

  const onEnabledChange = async (id: string, checked: boolean) => {
    setSelectedRotationScheduleId(id);
    try {
      await updateRotationSchedule(id, {enabled: checked});
      messageApi.success('Success');
    } catch (e) {
      messageApi.error(e.message || e);
    } finally {
      setSelectedRotationScheduleId('');
    }
  };

  const openAddModal = () => {
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setSelectedRotationSchedule(undefined);
    setAddModalOpen(false);
  };

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedRotationSchedule(undefined);
    setEditModalOpen(false);
  };

  const openEditTimeTableModal = () => {
    setEditTimeTableModalOpen(true);
  };

  const closeEditTimeTableModal = () => {
    setSelectedRotationSchedule(undefined);
    setEditTimeTableModalOpen(false);
  };

  return (
    <>
      {contextHolder}
      <Card>
        <Row justify={'space-between'} gutter={[0, 8]}>
          <Col span={6}>
            <Select
              showSearch
              optionFilterProp={'label'}
              allowClear
              placeholder={'Search by Trip'}
              style={{width: '70%'}}
              options={trips.map(trip => ({
                label: `${trip.departureCity.name} -> ${trip.arrivalCity.name}`,
                value: trip.id,
              }))}
              onChange={setTripSearchValue}
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
              onClick={openAddModal}>
              Add
            </Button>
          </Col>
        </Row>
      </Card>
      <Row justify={'center'} gutter={[0, 8]}>
        <Col flex={1}>
          <Table
            size={'small'}
            loading={getRotationSchedulesLoading}
            dataSource={filteredRotationSchedulesWithRelations}
            bordered
            rowKey={'id'}
            title={() => <h1>Rotation Schedules</h1>}>
            <Table.Column<RotationScheduleWithRelations>
              title={'Trip Details'}
              align={'center'}
              render={(_, record) => (
                <Space>
                  <div>{record.trip?.departureCity.name}</div>
                  <ArrowRightOutlined />
                  <div>{record.trip?.arrivalCity.name}</div>
                </Space>
              )}
            />
            <Table.Column<RotationScheduleWithRelations>
              title={'Time Table'}
              align={'center'}
              render={(_, record) => {
                return (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedRotationSchedule(record);
                      setTimeout(() => {
                        openEditTimeTableModal();
                      }, 0);
                    }}
                  />
                );
              }}
            />
            <Table.Column<RotationScheduleWithRelations>
              title={'Contact Numbers'}
              dataIndex={'contactNumbers'}
              align={'center'}
              render={(value: string[]) => (value || []).join(', ')}
            />
            <Table.Column<RotationScheduleWithRelations>
              title={'Enabled'}
              align={'center'}
              render={(_, record) => {
                return (
                  <Switch
                    checked={record.enabled}
                    onChange={checked => onEnabledChange(record.id, checked)}
                    loading={
                      updateRotationScheduleLoading && selectedRotationScheduleId === record.id
                    }
                  />
                );
              }}
            />

            <Table.Column<RotationScheduleWithRelations>
              title={'Action'}
              key={'action'}
              align={'center'}
              render={(_, record) => (
                <Tooltip title={`${record.id}`} mouseEnterDelay={2}>
                  <ButtonGroup>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedRotationSchedule(record);
                        setTimeout(() => {
                          openEditModal();
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
          <AddForm
            form={addForm}
            open={addModalOpen}
            closeModal={closeAddModal}
            onFormFinish={onAddFormFinish}
            trips={trips}
            createRotationScheduleLoading={createRotationScheduleLoading}
            updateRotationScheduleLoading={updateRotationScheduleLoading}
          />
          {selectedRotationSchedule && (
            <EditForm
              form={editForm}
              open={editModalOpen}
              close={closeEditModal}
              trips={trips}
              onEditFormFinish={onEditFormFinish}
              createRotationScheduleLoading={createRotationScheduleLoading}
              updateRotationScheduleLoading={updateRotationScheduleLoading}
            />
          )}
          {selectedRotationSchedule && (
            <EditTimeTableForm
              form={editTimeTableForm}
              open={editTimeTableModalOpen}
              close={closeEditTimeTableModal}
              onFormFinish={openEditTimeTableFormFinish}
              createRotationScheduleLoading={createRotationScheduleLoading}
              updateRotationScheduleLoading={updateRotationScheduleLoading}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default RotationScheduleRoute;
