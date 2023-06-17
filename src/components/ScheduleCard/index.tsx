import React from 'react';
import {ArrowRightOutlined, UnorderedListOutlined, BranchesOutlined} from '@ant-design/icons';
import {Button, Card, Descriptions, Popover} from 'antd';
import {DateTime} from 'luxon';

type Props = {
  departureCity: string;
  arrivalCity: string;
  departureTime?: Date;
  arrivalTime?: Date;
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
  price,
  busId,
  buttonLoading,
  onBusDetailsButtonClick,
  popoverContent,
}: Props) => {
  return (
    <Card
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
          <div>
            {departureCity} &nbsp; <ArrowRightOutlined /> &nbsp; {arrivalCity}{' '}
          </div>
          &nbsp; &nbsp;
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
        <Descriptions.Item label="Ticket Price">
          <b>{price}</b>
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
