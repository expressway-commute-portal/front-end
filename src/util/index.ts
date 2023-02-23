import {Dayjs} from 'dayjs';

export const getFormattedTimeFromDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour12: true,
    minute: '2-digit',
    hour: '2-digit',
  }).format(date);
};

// compares two times
export const timeOnlyCompare = (date1: Dayjs, date2: Dayjs) => {
  if (date1.hour() === date2.hour() && date1.minute() === date2.minute()) {
    return 0;
  }
  if (date1.hour() > date2.hour()) {
    return 1;
  }
  if (date1.hour() === date2.hour() && date1.minute() > date2.minute()) {
    return 1;
  }
  return -1;
};
