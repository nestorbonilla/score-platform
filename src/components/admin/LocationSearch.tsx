'use client';

import * as React from "react";
import { useState, useEffect, FunctionComponent } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LocationSearch: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/googleMaps?param=${inputValue}&paramType=autocomplete`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSuggestions(data.predictions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchDetails = async (placeId: string) => {
    setIsLoading(true); 
    try {
      const response = await fetch(`/api/googleMaps?param=${placeId}&paramType=details`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (!data.result || data.status !== 'OK') {
        console.error('Unexpected API response or status not OK:', data);
        setSelectedPlaceDetails(null);
        // Optionally, show an error message to the user
        return;
      }

      setSelectedPlaceDetails(data.result);
    } catch (error) {
      console.error('Error fetching place details:', error);
      setSelectedPlaceDetails(null); 
    } finally {
      setIsLoading(false);
    }
  }

  const handlePlaceSelect = async (selectedValue: string) => {
    setOpen(false);
    setValue(selectedValue);

    const selectedSuggestion = suggestions.find((suggestion) =>
      `${suggestion.structured_formatting.main_text} - ${suggestion.structured_formatting.secondary_text}` === selectedValue
    );

    if (selectedSuggestion) {
      await fetchDetails(selectedSuggestion.place_id)
    }
  };

  useEffect(() => {
    if (inputValue === '') {
      setSuggestions([]);
      return;
    }

    fetchSuggestions();
  }, [inputValue]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full sm:w-auto justify-between"
          >
            {value
              ? suggestions.find((suggestion) =>
                  `${suggestion.structured_formatting.main_text} - ${suggestion.structured_formatting.secondary_text}` === value
                )?.structured_formatting.main_text
              : "Search for a place..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search address..." value={inputValue} onValueChange={setInputValue} />
            <CommandList>
              <CommandEmpty>No place found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.place_id}
                    value={`${suggestion.structured_formatting.main_text} - ${suggestion.structured_formatting.secondary_text}`}
                    onSelect={handlePlaceSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === `${suggestion.structured_formatting.main_text} - ${suggestion.structured_formatting.secondary_text}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {suggestion.structured_formatting.main_text}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isLoading && <p>Loading...</p>}
      {!isLoading && selectedPlaceDetails && (
        <Card className="mt-4 w-full sm:w-96">
          <CardHeader>
            <CardTitle>
              {value ? value.split(' - ')[0] : "Place Details"}
            </CardTitle> 
          </CardHeader>
          <CardContent>
            {value && <p className="text-sm text-gray-500">{value.split(' - ')[1]}</p>} 
            {selectedPlaceDetails.business_status === 'OPERATIONAL' && (
              <>
                <p>Business Status: Operational</p>
                <p>Rating: {selectedPlaceDetails.rating || "N/A"}</p>
                <p>Number of Reviews: {selectedPlaceDetails.user_ratings_total || 0}</p>
              </>
            )}
            {selectedPlaceDetails.business_status !== 'OPERATIONAL' && (
              <p>Business Status: {selectedPlaceDetails.business_status || "Unknown"}</p>
            )}            
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;