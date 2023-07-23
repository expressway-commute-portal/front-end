import { Dayjs } from "dayjs";

export const getFormattedTimeFromDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour12: true,
    minute: "2-digit",
    hour: "2-digit"
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

export const getFirstLetters = (str: string) => {
  const words = str.split(" ");
  return words.map(word => word[0]).join("");
};

// format mobile no to xx-xxx-xxxx
export const formatMobileNo = (mobileNo: string) => {
  const mobileNoArr = `${mobileNo}`.split("");
  mobileNoArr.splice(2, 0, "-");
  mobileNoArr.splice(6, 0, " ");
  return mobileNoArr.join("");
};
