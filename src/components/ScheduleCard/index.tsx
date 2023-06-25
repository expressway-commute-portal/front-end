import React from 'react';
import {ArrowRightOutlined, UnorderedListOutlined, BranchesOutlined} from '@ant-design/icons';
import {Button, Card, Descriptions, Popover} from 'antd';
import {DateTime} from 'luxon';

type Props = {
  departureCity: string;
  arrivalCity: string;
  departureTime?: Date;
  arrivalTime?: Date;
  routeNo?: string;
  price: string;
  busId?: string;
  buttonLoading: boolean;
  popoverContent?: React.ReactNode;

  onBusDetailsButtonClick: () => void;
};

const ScheduleCard = ({
  departureCity,
  arrivalCity,
  departureTime,
  arrivalTime,
  routeNo,
  price,
  busId,
  buttonLoading,
  onBusDetailsButtonClick,
  popoverContent,
}: Props) => {
  return (
    <Card
      title={
        <div>
          <div>
            {departureCity} &nbsp; <ArrowRightOutlined /> &nbsp; {arrivalCity}
          </div>
          <div>{routeNo}</div>
          {popoverContent && (
            <Popover content={popoverContent} placement="bottomRight">
              <Button type="default" shape="round" icon={<BranchesOutlined />} />
            </Popover>
          )}
        </div>
      }
      headStyle={{textAlign: 'center', padding: '0 5'}}
      bodyStyle={{textAlign: 'center'}}>
      <Descriptions bordered layout={'horizontal'} column={1} size={'small'}>
        <Descriptions.Item label="Departure Time">
          {departureTime ? DateTime.fromJSDate(departureTime).toFormat('hh:mm a') : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Arrival Time">
          {arrivalTime ? DateTime.fromJSDate(arrivalTime).toFormat('hh:mm a') : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Total Ticket Price">
          <b>{price}/=</b>
        </Descriptions.Item>
      </Descriptions>
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
