import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.locale('es');
dayjs.extend(relativeTime);

export const formatDate = (date: string | Date) => dayjs(date).format('DD/MM/YYYY');
export const formatDateTime = (date: string | Date) => dayjs(date).format('DD/MM/YYYY HH:mm');
export const formatRelative = (date: string | Date) => dayjs(date).fromNow();
export const formatTime = (date: string | Date) => dayjs(date).format('HH:mm');
