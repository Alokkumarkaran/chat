import dayjs from 'dayjs';

export const formatTime = (ts) => dayjs(ts).format('hh:mm A');
