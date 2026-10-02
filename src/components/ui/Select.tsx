import type { ReactNode } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  indicatorClassName?: string;
};

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  renderValue?: (option: SelectOption | undefined) => ReactNode;
};

export function Select({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
  className = "w-auto",
  triggerClassName = "",
  disabled = false,
  renderValue,
}: SelectProps) {
  return (
    <div className={className}>
      <SelectPrimitive.Root
        value={value}
        items={options}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue);
        }}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel}
          className={`inline-flex h-9 min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 ${triggerClassName}`}
        >
          <SelectPrimitive.Value placeholder={placeholder} className="truncate">
            {(selectedValue) => {
              const selectedOption = options.find(
                (option) => option.value === selectedValue,
              );
              return renderValue
                ? renderValue(selectedOption)
                : (selectedOption?.label ?? placeholder);
            }}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className="shrink-0 text-muted-foreground">
            <ChevronDown className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            className="z-100 outline-none"
            sideOffset={6}
          >
            <SelectPrimitive.Popup className="max-h-[min(20rem,var(--available-height))] min-w-(--anchor-width) overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
              <SelectPrimitive.List>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex min-h-9 cursor-default select-none items-center rounded-sm py-1.5 pl-2.5 pr-8 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                  >
                    {option.indicatorClassName && (
                      <span
                        aria-hidden="true"
                        className={`mr-2 size-2 shrink-0 rounded-full ${option.indicatorClassName}`}
                      />
                    )}
                    <SelectPrimitive.ItemText>
                      {option.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                      <Check className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
