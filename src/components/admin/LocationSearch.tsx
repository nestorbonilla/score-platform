'use client';

import { useState, useEffect, FunctionComponent, useCallback } from 'react';
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
import { fetchGooglePlacesData } from '@/app/actions/googleMaps';

interface LocationSearchProps {
  onSelect: (data: {
    name: string;
    physicalAddress: string;
    score: string;
    reviewCount: string;
  }) => void;
}

const LocationSearch: FunctionComponent<LocationSearchProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await fetchGooglePlacesData(inputValue, 'autocomplete');
      if ('error' in data) {
        throw new Error(data.error);
      }
      setSuggestions(data.predictions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [inputValue]);

  const fetchDetails = async (placeId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchGooglePlacesData(placeId, 'details');
      if ('error' in data) {
        throw new Error(data.error);
      }

      if (!data.result || data.status !== 'OK') {
        console.error('Unexpected API response or status not OK:', data);
        setSelectedPlaceDetails(null);
        return;
      }

      setSelectedPlaceDetails(data.result);
      console.log("data result: ", data.result);
      const attestationData = {
        name: data.result.name || "",
        physicalAddress: data.result.formatted_address || "",
        score: data.result.rating ? data.result.rating.toString() : "0",
        reviewCount: data.result.user_ratings_total ? data.result.user_ratings_total.toString() : "0"
      };
      
      onSelect(attestationData);
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
  }, [inputValue, fetchSuggestions]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full sm:w-64 justify-between"
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
            {value && <p className="text-sm text-gray-500">{value.split(' - ')[1]}</p>} 
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;