import { ClearOutlined, PhoneTwoTone, SearchOutlined } from "@ant-design/icons";
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
  message
} from "antd";
import { logEvent } from "firebase/analytics";
import _debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";
import "../App.css";
import ScheduleCard from "../components/ScheduleCard";
import { analytics } from "../config/firebase";
import { City } from "../models/City";
import { Schedule } from "../models/Schedule";
import { useBusStore } from "../store/bus.store";
import { useCityStore } from "../store/city.store";
import { useScheduleStore } from "../store/schedule.store";
import { useRouteStore } from "../store/route.store";
import { formatMobileNo, getFirstLetters } from "../util";

function ScheduleSearchPage() {
  const [open, setOpen] = useState(false);

  const [selectedDepartureCity, setSelectedDepartureCity] = useState<
    Pick<City, "id" | "name"> | undefined
  >();
  const [selectedArrivalCity, setSelectedArrivalCity] = useState<
    Pick<City, "id" | "name"> | undefined
  >();

  const departureCities = useCityStore(state => state.departureCities);
  const arrivalCities = useCityStore(state => state.arrivalCities);

  const getDepartureCitiesByName = useCityStore(state => state.getDepartureCitiesByName);
  const getDepartureCitiesByNameLoading = useCityStore(
    state => state.getDepartureCitiesByNameLoading
  );

  const getArrivalCitiesByName = useCityStore(state => state.getArrivalCitiesByName);
  const getArrivalCitiesByNameLoading = useCityStore(state => state.getArrivalCitiesByNameLoading);
  const getPredefinedCities = useCityStore(state => state.getPredefinedCities);

  const clearDepartureCities = useCityStore(state => state.clearDepartureCities);
  const clearArrivalCities = useCityStore(state => state.clearArrivalCities);

  const searchRoutes = useRouteStore(state => state.searchRoutes);
  const getRoutesLoading = useRouteStore(state => state.getRoutesLoading);
  const getRoutesByCityIds = useRouteStore(state => state.getRoutesByCityIds);

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
      arrivalCity: { key: arrivalCityId },
      departureCity: { key: departureCityId }
    } = values;

    await getRoutesByCityIds(departureCityId, arrivalCityId);
    const count = await getSchedules();

    if (count === 0) {
      messageApi.warning("No schedules");
      logEvent(analytics, "empty_search_result", {
        departureCity: selectedDepartureCity?.name,
        arrivalCity: selectedArrivalCity?.name,
        bothCities: `${selectedDepartureCity?.name} -> ${selectedArrivalCity?.name}`
      });
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

  const clearAll = () => {
    clearDepartureCities();
    clearArrivalCities();
    clearSchedules();
  };

  const renderSchedules = () => {
    if (!searchRoutes.length || !selectedDepartureCity || !selectedArrivalCity) {
      return null;
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
      xxl: columns
    };

    return (
      <List
        grid={gridConfig}
        dataSource={schedules}
        renderItem={schedule => {
          const route = searchRoutes.find(t => t.id === schedule.routeId);
          if (!route) {
            return <></>;
          }

          let price = "";
          if (route.prices.length > 1) {
            price = route.prices
              .map(p => `${p.price.toLocaleString()}/=(${getFirstLetters(p.serviceType)})`)
              .join(" | ");
          } else if (route.prices.length === 1) {
            price = `${route.prices[0].price.toLocaleString()}/=`;
          } else {
            price = `${route.price.toLocaleString()}/=`;
          }

          const routeDepartureCity = route.departureCity.name;
          const routeDepartureTime: Date | undefined = schedule.departureTime;
          let departureCity = route.departureCity.name;
          let departureTime: Date | undefined = schedule.departureTime;

          if (selectedDepartureCity.id !== route.departureCity.id) {
            departureCity = selectedDepartureCity.name;
            const transitTime = schedule.transitTimes.find(
              t => t.cityId === selectedDepartureCity.id
            )?.time;
            departureTime = transitTime;
          }

          const routeArrivalCity = route.arrivalCity.name;
          const routeArrivalTime: Date | undefined = schedule.arrivalTime;
          let arrivalCity = route.arrivalCity.name;
          let arrivalTime = schedule.arrivalTime;

          if (selectedArrivalCity.id !== route.arrivalCity.id) {
            arrivalCity = selectedArrivalCity.name;
            const transitTime = schedule.transitTimes.find(
              t => t.cityId === selectedArrivalCity.id
            )?.time;
            arrivalTime = transitTime;
          }

          return (
            <List.Item>
              <ScheduleCard
                routeDepartureCity={routeDepartureCity}
                routeDepartureTime={routeDepartureTime}
                routeArrivalCity={routeArrivalCity}
                routeArrivalTime={routeArrivalTime}
                departureCity={departureCity}
                arrivalCity={arrivalCity}
                departureTime={departureTime}
                arrivalTime={arrivalTime}
                routeNo={route.routeNumber}
                price={price}
                prices={route.prices}
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
      <Row justify={"center"} style={{ marginTop: 20 }}>
        <Col>
          <Card title={"Expressway Bus Schedule"} headStyle={{ textAlign: "center" }}>
            <Form labelAlign={"right"} labelCol={{ span: 10 }} onFinish={onFinish}>
              <Form.Item
                // label={'From'}
                name={"departureCity"}
                style={{ width: 300 }}
                rules={[{ required: true, message: "Departure city is required" }]}>
                <Select
                  loading={getDepartureCitiesByNameLoading}
                  showSearch
                  labelInValue
                  size="large"
                  placeholder={"From"}
                  onSearch={debouncedDepartureSearch}
                  onSelect={({ key, label }: { key: string; label: string }) => {
                    setSelectedDepartureCity({ id: key, name: label });
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
                // label={'To'}
                name={"arrivalCity"}
                style={{ width: 300 }}
                rules={[{ required: true, message: "Arrival city is required" }]}>
                <Select
                  loading={getArrivalCitiesByNameLoading}
                  showSearch
                  labelInValue
                  size="large"
                  placeholder={"To"}
                  onSearch={debouncedArrivalSearch}
                  onSelect={({ key, label }: { key: string; label: string }) => {
                    setSelectedArrivalCity({ id: key, name: label });
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
                  size={"large"}
                  loading={getRoutesLoading || getSchedulesLoading}
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}>
                  Search
                </Button>
                <br />
              </Form.Item>
              <Form.Item>
                <Button
                  block
                  size={"large"}
                  type="default"
                  htmlType="reset"
                  icon={<ClearOutlined />}
                  onClick={clearAll}>
                  Clear
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <br />
      <br />

      {/* Schedule List */}
      <Row justify={"center"}>
        <Col>{renderSchedules()}</Col>
      </Row>

      {/* Bus Details Modal */}
      {selectedBus && (
        <Modal open={open} onCancel={onCloseModal} destroyOnClose maskClosable footer={null}>
          <Descriptions
            title={<div style={{ textAlign: "center" }}>Bus Details</div>}
            bordered
            layout={"horizontal"}
            column={1}
            size={"small"}>
            <Descriptions.Item label="Name">{selectedBus.name}</Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {selectedBus.regNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number(s)">
              {selectedBus.contactNumbers.map((no, i) => {
                console.log(no);
                return (
                  <div key={i}>
                    <Space>
                      <PhoneTwoTone />
                      <a href={`tel:${no}`}>{formatMobileNo(no)}</a>
                    </Space>
                  </div>
                );
              })}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </>
  );
}

export default ScheduleSearchPage;
