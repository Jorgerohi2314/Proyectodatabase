"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { NATIONALITIES, searchNationalities } from "@/lib/data/nationalities"

interface NationalityComboboxProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function NationalityCombobox({ value, onChange, className }: NationalityComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const results = React.useMemo(() => searchNationalities(query), [query])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value || "Selecciona una nacionalidad..."}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0" align="start">
        <Command filter={() => 1}>
          <CommandInput
            placeholder="Escribe para filtrar..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {results.length === 0 ? (
              <CommandEmpty>No se ha encontrado ninguna nacionalidad.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}