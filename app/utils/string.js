import moment from 'moment';

export const decimalToHex = nbr => {
  if (nbr) {
    return `0x${nbr.toString(16)}`;
  }
  return null;
};

export const chainNameFromDecimalId = chainIdAsDecimal => {
  const chainIdAsHex = decimalToHex(chainIdAsDecimal);
  const chainName = chainNameFromHexId(chainIdAsHex);
  return chainName;
};

export const chainNameFromHexId = chainIdAsHex => {
  if (chainIdAsHex === '0x1') {
    return 'mainnet';
  }
  if (chainIdAsHex === '0x3') {
    return 'ropsten';
  }
  if (chainIdAsHex === '0x2a') {
    return 'kovan';
  }
};

export const roundFloat = (val, digits) => {
  if (Number.isNaN(val)) {
    return '0.00';
  }
  return parseFloat(val)
    .toFixed(digits)
    .toString();
};

export const balanceTransform = (val, token) => {
  if (Number.isNaN(val)) {
    return null;
  }

  let decimals;
  if (!token) {
    decimals = 18;
  } else {
    decimals = token.decimals;
  }

  const newVal = val / 10 ** decimals;
  return newVal;
};

export const getFormattedDateTime = (unixTimestamp, customFormat) => {
  const newTimestamp = castTimestamp(unixTimestamp);
  return moment(newTimestamp).format(customFormat || 'MMM DD h:mm A');
};

export const dateTransformShort = unixTimestamp =>
  getFormattedDateTime(unixTimestamp, 'MMMM DD');

const castTimestamp = unixTimestamp => {
  let newTimestamp = unixTimestamp;
  if (typeof unixTimestamp === 'string') {
    newTimestamp = parseInt(unixTimestamp, 10);
  }
  const timestampAsString = newTimestamp.toString();
  const lengthOfTimestamp = timestampAsString.length;
  if (lengthOfTimestamp === 10) {
    newTimestamp *= 1000;
  }
  return newTimestamp;
};

export const currencyTransform = val => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
  const newVal = formatter.format(val);
  return newVal;
};

export const dateTransform = unixTimestamp =>
  getFormattedDateTime(unixTimestamp);

export const relativeDateTransform = unixTimestamp => {
  const newTimestamp = castTimestamp(unixTimestamp);
  moment.relativeTimeThreshold('h', 24);
  return moment(newTimestamp).fromNow();
};

export const relativeDateTransformShort = unixTimestamp => {
  const relativeText = relativeDateTransform(unixTimestamp);
  const dateText = dateTransformShort(unixTimestamp);
  return `${relativeText} (${dateText})`;
};

export const relativeDateTransformLong = unixTimestamp => {
  const relativeText = relativeDateTransform(unixTimestamp);
  const dateText = dateTransform(unixTimestamp);
  return `${dateText} (${relativeText})`;
};
