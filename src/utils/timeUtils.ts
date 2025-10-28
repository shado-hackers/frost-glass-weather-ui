export const formatToISTTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + istOffset);
  
  // Format as 12-hour with AM/PM
  let hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
};

export const formatToIST = (dateString: string): { day: string; time: string } => {
  const date = new Date(dateString);
  
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + istOffset);
  
  const day = istTime.toLocaleDateString('en-US', { weekday: 'short' });
  const time = formatToISTTime(dateString);
  
  return { day, time };
};

// Format local time with full date and weekday
export const formatLocalDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${weekday}, ${month} ${day} • ${hours}:${minutesStr} ${ampm}`;
};
