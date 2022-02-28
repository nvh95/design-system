import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Clock from '@strapi/icons/Clock';
import styled from 'styled-components';
import { sizes } from '../themes/sizes';
import { Option } from '../Select';
import { useId } from '../helpers/useId';

import { Box } from '../Box';
import { FieldInput } from '../Field';
import { Popover } from '../Popover';
import { SelectList } from '../Select/SelectList';
import { KeyboardKeys } from '../helpers/keyboardKeys';

const TimeIconWrapper = styled.div`
  display: flex;
  align-items: center;
  svg {
    height: 1rem;
    width: 1rem;
  }

  svg path {
    fill: ${({ theme }) => theme.colors.neutral500};
  }
`;

function generateSelectValues(step, hours) {
  const hoursCount = 24;
  const times = [];
  let min = 0;

  for (let i = 0; i < hoursCount; i++) {
    min = 0;

    if ((hours && i === hours) || !hours) {
      while (min < 60) {
        times.push(`${i < 10 ? '0' + i : i}:${min < 10 ? '0' + min : min}`);

        min += step;
      }
    }
  }

  return times;
}

export const TimePicker = ({
  disabled,
  error,
  hint,
  id,
  onClear,
  onChange,
  onError,
  value,
  clearLabel,
  label,
  step,
  size,
  ...props
}) => {
  const generatedId = useId('timepicker', id);
  const containerRef = useRef(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [times, setTimes] = useState(generateSelectValues(step));
  const [minutes, setMinutes] = useState(null);
  const [hours, setHours] = useState(null);

  useEffect(() => {
    const newTimes = generateSelectValues(step, hours, minutes);
    setTimes(newTimes);
  }, [hours]);

  function handleEscape() {
    setPopoverVisible(false);
  }

  function onReachEnd() {
    setPopoverVisible(false);
  }

  function handleOnBlur() {
    if (hours && hours < 23 && minutes && minutes < 59) {
      const paddedHours = `${hours}`;
      const paddedMinutes = `${minutes}`;
      const value = `${paddedHours}:${paddedMinutes}`;

      onChange(value);
    } else {
      onError(new Error('Invalid value'));
    }
  }

  function handleOnChange(target) {
    const { value } = target;

    if (value.length === 0) {
      onClear();
    }

    const [rawHours, rawMinutes] = value.split(':');

    const hours = parseInt(rawHours, 10) || 0;
    const minutes = parseInt(rawMinutes, 10) || 0;

    setMinutes(minutes);
    setHours(hours);
  }

  function handleKeyDown(e) {
    if (disabled) return;

    switch (e.key) {
      case KeyboardKeys.DOWN: {
        e.preventDefault();
        setPopoverVisible(true);
        break;
      }

      case KeyboardKeys.UP: {
        e.preventDefault();
        setPopoverVisible(true);
        break;
      }

      default:
        break;
    }
  }

  function handleOptionKeyDown(event, time) {
    if (event.key === KeyboardKeys.SPACE || event.key === KeyboardKeys.ENTER) {
      handleOptionSelect(time);
    }
  }

  function handleOptionSelect(time) {
    onChange(time);
    setPopoverVisible(false);
  }

  return (
    <Box ref={containerRef}>
      <FieldInput
        id={generatedId}
        label={label}
        placeholder="--:--"
        startAction={
          <TimeIconWrapper>
            <Clock />
          </TimeIconWrapper>
        }
        value={value}
        onFocus={() => setPopoverVisible(true)}
        onChange={({ target }) => handleOnChange(target)}
        onBlur={() => handleOnBlur()}
        onKeyDown={handleKeyDown}
        onClear={onClear}
        error={error}
      />

      {popoverVisible && (
        <Popover
          source={containerRef}
          spacing={4}
          fullWidth
          intersectionId={`time-picker-list-${generatedId}`}
          onReachEnd={onReachEnd}
        >
          <SelectList selectId={generatedId} labelledBy={generatedId}>
            {times.map((time) => (
              <Option
                value={time}
                key={time}
                onKeyDown={(event) => handleOptionKeyDown(event, time)}
                onClick={() => handleOptionSelect(time)}
                onEscape={() => setPopoverVisible(false)}
              >
                {time}
              </Option>
            ))}
          </SelectList>
        </Popover>
      )}
    </Box>
  );
};

TimePicker.defaultProps = {
  disabled: false,
  error: undefined,
  hint: undefined,
  id: undefined,
  label: undefined,
  onClear: undefined,
  size: 'M',
  step: 15,
  value: undefined,
};

TimePicker.propTypes = {
  clearLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  size: PropTypes.oneOf(Object.keys(sizes.input)),
  step: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    PropTypes.string,
    PropTypes.number,
  ]),
};
