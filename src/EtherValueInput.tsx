import { formatValue, parseValue } from '@theorderbookdex/abi2ts-lib';
import { useEffect, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

type EtherValueInputProps = Omit<FormControlProps, 'value' | 'onChange' | 'type'> & {
  value: bigint;
  min?: bigint;
  max?: bigint;
  step?: bigint;
  onChange(value: bigint): void;
};

export default function EtherValueInput({ value, min, max, step, onChange, onBlur, ...props }: EtherValueInputProps) {
  const [ internalValue, setInternalValue ] = useState(formatValue(value));

  useEffect(() => {
    if (value !== parseValue(internalValue || 0)) {
      setInternalValue(formatValue(value));
    }
  }, [ internalValue, value ]);

  return (
    <Form.Control {...props} type="number"
      min={min === undefined ? undefined : formatValue(min)}
      max={max === undefined ? undefined : formatValue(max)}
      step={step === undefined ? undefined : formatValue(step)}
      value={internalValue}
      onChange={event => {
        try {
          onChange(parseValue(event.target.value || 0));
          setInternalValue(event.target.value);
        } catch {}
      }}
      onBlur={event => {
        setInternalValue(formatValue(value));
        onBlur?.(event);
      }}
    />
  );
}
