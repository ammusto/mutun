import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactSlider from 'react-slider';
import { useSearch } from '../contexts/SearchContext';
import { useMetadata } from '../contexts/metadataContext';
import debounce from 'lodash/debounce';
import './DateRangeSlider.css';

const DateRangeSlider: React.FC = () => {
  const { dateRange, setDateRange } = useSearch();
  const { dateRangeCache, isLoading } = useMetadata();
  const [localRange, setLocalRange] = useState<[number, number]>([0, 2000]);
  const [minInput, setMinInput] = useState<string>(''); 
  const [maxInput, setMaxInput] = useState<string>('');

  const sliderProps = useMemo(() => ({
    min: dateRangeCache?.min || 0,
    max: dateRangeCache?.max || 2000,
  }), [dateRangeCache]);

  useEffect(() => {
    if (dateRangeCache && !isLoading) {
      const newRange: [number, number] = [dateRangeCache.min, dateRangeCache.max];
      setLocalRange(newRange);
      setMinInput(newRange[0].toString());
      setMaxInput(newRange[1].toString());

      setDateRange({
        min: dateRangeCache.min,
        max: dateRangeCache.max,
        current: newRange,
      });
    }
  }, [dateRangeCache, isLoading, setDateRange]);

  useEffect(() => {
    if (dateRange) {
      setLocalRange(dateRange.current);
      setMinInput(dateRange.current[0].toString());
      setMaxInput(dateRange.current[1].toString());
    }
  }, [dateRange]);

  const debouncedSetDateRange = useMemo(
    () => debounce((newRange: [number, number]) => {
      setDateRange({
        min: sliderProps.min,
        max: sliderProps.max,
        current: newRange,
      });
    }, 300),
    [setDateRange, sliderProps.min, sliderProps.max]
  );

  const handleChange = useCallback((newRange: [number, number]) => {
    setLocalRange(newRange);
    setMinInput(newRange[0].toString());
    setMaxInput(newRange[1].toString());
    debouncedSetDateRange(newRange);
  }, [debouncedSetDateRange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    if (name === "minInput") {
      setMinInput(value);
    } else if (name === "maxInput") {
      setMaxInput(value);
    }
  }, []);

const handleBlur = useCallback(() => {
    let newMin = parseInt(minInput, 10);
    let newMax = parseInt(maxInput, 10);
    newMin = isNaN(newMin) ? sliderProps.min : Math.max(newMin, sliderProps.min);
    newMax = isNaN(newMax) ? sliderProps.max : Math.min(newMax, sliderProps.max);

    if (newMax < newMin) {
      newMax = newMin;
    }

    const newRange: [number, number] = [newMin, newMax];
    setLocalRange(newRange);
    setMinInput(newMin.toString());
    setMaxInput(newMax.toString());
    setDateRange({
      min: sliderProps.min,
      max: sliderProps.max,
      current: newRange,
    });
  }, [minInput, maxInput, sliderProps.min, sliderProps.max, setDateRange]);

  return (
    <div className="date-slider-container">
      <div className='center'>
        <strong>Filter by Death Date</strong>
      </div>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        value={localRange}
        onChange={handleChange}
        min={sliderProps.min}
        max={sliderProps.max}
        pearling
        minDistance={10}
      />
      <div className="input-container">
        <input
          type="number"
          name="minInput"
          value={minInput}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-left"
        />
        <input
          type="number"
          name="maxInput"
          value={maxInput}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-right"
        />
      </div>
    </div>
  );
};

export default React.memo(DateRangeSlider);
