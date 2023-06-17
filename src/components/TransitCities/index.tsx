import {Timeline} from 'antd';

type Props = {
  transits: {city: string; time: string}[];
  boldCities?: string[];
};

const TransitCities = ({transits}: Props) => {
  return (
    <div style={{border: '', width: 250}}>
      <Timeline mode="right">
        {transits.map((t, index) => (
          <Timeline.Item key={index} label={t.time}>
            {t.city}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default TransitCities;
