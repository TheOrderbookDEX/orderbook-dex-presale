import { formatValue } from '@frugal-wizard/abi2ts-lib';

export function formatTokens(value: bigint): string {
  return separateThousands(removeDecimals(formatValue(value)));
}

export function formatEth(value: bigint): string {
  return separateThousands(truncateDecimals(formatValue(value), 3));
}

function removeDecimals(numstr: string): string {
  return numstr.replace(/\..*/, '');
}

function truncateDecimals(numstr: string, decimals: number): string {
  return numstr.replace(new RegExp(`(?<=\\..{${decimals}}).*$`), '');
}

function separateThousands(numstr: string): string {
  return numstr.replace(/(?<=^\d+)(?=(\d{3})+(\.|$))|(?<=\.(\d{3})+)(?=\d)/g, ',');
}
