import {ArrowRightOutlined, BranchesOutlined, UnorderedListOutlined} from '@ant-design/icons';
import {Button, Card, Col, Popover, Row, Typography} from 'antd';
import {DateTime} from 'luxon';
import {ReactNode} from 'react';
import {ReactComponent as BusIcon} from '../../assets/icons/bus.svg';
import {Prices} from '../../models/Route';

type Props = {
  routeDepartureCity: string;
  routeArrivalCity: string;
  routeDepartureTime: Date;
  routeArrivalTime?: Date;

  departureCity: string;
  arrivalCity: string;
  departureTime?: Date;
  arrivalTime?: Date;

  routeNo?: string;
  price: string;
  prices?: Prices[];
  busId?: string;
  buttonLoading: boolean;
  popoverContent?: React.ReactNode;

  onBusDetailsButtonClick: () => void;
};

const ScheduleCard = ({
  routeDepartureCity,
  routeArrivalCity,
  routeDepartureTime,
  routeArrivalTime,
  departureCity,
  arrivalCity,
  departureTime,
  arrivalTime,
  routeNo,
  price,
  prices = [],
  busId,
  buttonLoading,
  onBusDetailsButtonClick,
  popoverContent,
}: Props) => {
  let PriceComponent;
  if (prices.length > 1) {
    PriceComponent = prices.map((p, index) => (
      <div key={index}>
        <Typography.Text strong type={'danger'}>
          {p.price}/=
        </Typography.Text>
        &nbsp;
        <Typography.Text strong type={'secondary'}>
          ({p.serviceType})
        </Typography.Text>
      </div>
    ));
  } else if (prices.length === 1) {
    PriceComponent = (
      <Typography.Text strong type={'danger'}>
        {prices[0].price}/= ({prices[0].serviceType})
      </Typography.Text>
    );
  } else {
    PriceComponent = (
      <Typography.Text strong type={'danger'}>
        {price}/=
      </Typography.Text>
    );
  }

  return (
    <Card
      title={
        <div>
          <div>
            {routeDepartureCity} &nbsp; <ArrowRightOutlined /> &nbsp; {routeArrivalCity}
          </div>
          {/* <div>{routeNo}</div> */}
          {popoverContent && (
            <Popover content={popoverContent} placement="bottomRight">
              <Button type="default" shape="round" icon={<BranchesOutlined />} />
            </Popover>
          )}
        </div>
      }
      headStyle={{textAlign: 'center'}}
      bodyStyle={{textAlign: 'center'}}>
      <Row justify={'space-between'} wrap={false}>
        <Col span={6}>
          {departureCity}
          <br />
          <b>{departureTime ? DateTime.fromJSDate(departureTime).toFormat('hh:mm a') : ''}</b>
        </Col>
        <Col span={10} style={{border: '', textAlign: 'center'}}>
          <Row justify={'center'} align={'middle'} wrap={false}>
            <Col flex={2}>....</Col>
            <Col flex={3}>
              <BusIcon fill={'#1e88e5'} width={50} height={50} />
            </Col>
            <Col flex={2}>....</Col>
          </Row>
        </Col>
        <Col span={6}>
          {arrivalCity}
          <br />
          <b>{arrivalTime ? DateTime.fromJSDate(arrivalTime).toFormat('hh:mm a') : ''}</b>
        </Col>
      </Row>
      <br />
      <div>{PriceComponent}</div>
      <br />
      {busId && (
        <Button
          type={'default'}
          onClick={onBusDetailsButtonClick}
          icon={<UnorderedListOutlined />}
          loading={buttonLoading}>
          Bus Details
        </Button>
      )}
    </Card>
  );
};

export default ScheduleCard;
