import React from 'react';
import {Button, Card, Descriptions} from 'antd';
import {ArrowRightOutlined, UnorderedListOutlined} from '@ant-design/icons';
import {Trip} from '../../models/Trip';
import {Schedule} from '../../models/Schedule';
import {DateTime} from 'luxon';
import {getFirstLetters} from '../../util';

type Props = {
  trip: Trip;
  schedule: Schedule;
  onBusDetailsButtonClick: (schedule: Schedule) => void;
  getBusByIdLoading: boolean;
  selectedSchedule: Schedule | undefined;
};

const ScheduleCard = ({
  trip,
  schedule,
  onBusDetailsButtonClick,
  getBusByIdLoading,
  selectedSchedule,
}: Props) => {
  return (
    <Card
      title={
        <>
          {trip.departureCity.name} &nbsp; <ArrowRightOutlined /> &nbsp; {trip.arrivalCity.name}
        </>
      }
      headStyle={{textAlign: 'center'}}
      bodyStyle={{textAlign: 'center'}}>
      <Descriptions bordered layout={'horizontal'} column={1} size={'small'}>
        <Descriptions.Item label="Departure Time">
          {DateTime.fromJSDate(schedule.departureTime).toFormat('hh:mm a')}
        </Descriptions.Item>
        <Descriptions.Item label="Arrival Time">
          {schedule.arrivalTime
            ? DateTime.fromJSDate(schedule.arrivalTime).toFormat('hh:mm a')
            : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Ticket Price">{displayPrice(trip)}</Descriptions.Item>
      </Descriptions>
      <br />
      {schedule.busId && (
        <Button
          type={'default'}
          onClick={() => onBusDetailsButtonClick(schedule)}
          icon={<UnorderedListOutlined />}
          loading={getBusByIdLoading && selectedSchedule?.id === schedule.id}>
          Bus Details
        </Button>
      )}
    </Card>
  );
};

const displayPrice = (trip: Trip) => {
  if (trip.prices.length > 1) {
    const priceText = trip.prices
      .map(p => `Rs. ${p.price.toLocaleString()}(${getFirstLetters(p.serviceType)})`)
      .join('\n');

    return <b>{priceText}</b>;
  }

  if (trip.prices.length === 1) {
    return <b>Rs. {trip.prices[0].price.toLocaleString()}</b>;
  }

  return <b>Rs.{trip.price.toLocaleString()}</b>;
};

export default ScheduleCard;
