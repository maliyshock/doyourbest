import { Select as SelectPrimitive } from '@base-ui/react/select'
import type {
  SelectItem as SelectItemPrimitive,
  SelectPopup as SelectPopupPrimitive,
  SelectRoot as SelectRootPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

function Select<Value>(props: SelectRootPrimitive.Props<Value>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectValue({
  className,
  ...props
}: SelectValuePrimitive.Props & { className?: string }) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('truncate', className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerPrimitive.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-13 min-w-[96px] items-center justify-between gap-3 rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon" className="shrink-0 text-muted-foreground">
        <ChevronDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: SelectPopupPrimitive.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner align="start" sideOffset={6}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'z-50 min-w-[var(--anchor-width)] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-80 overflow-y-auto">{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectItemPrimitive.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex cursor-default items-center rounded-lg py-2 pr-8 pl-3 text-sm outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[selected]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center justify-center text-primary">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
