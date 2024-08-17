"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
import '@reach/combobox/styles.css';

const PlaceAutocomplete: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (inputValue === '') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${inputValue}&key=`
        );
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [inputValue]);

  return (
    <Combobox onSelect={(address) => console.log(address)}>
      <ComboboxInput 
      className='black'
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Busca un lugar..."
      />
      {suggestions.length > 0 && (
        <ComboboxPopover>
          <ComboboxList>
            {suggestions.map((suggestion) => (
              <ComboboxOption
                key={suggestion.place_id}
                value={`${suggestion.structured_formatting.main_text} - ${suggestion.structured_formatting.secondary_text}`}
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      )}
    </Combobox>
  );
};

export default PlaceAutocomplete;
