import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES, type LanguageCode } from '@/lib/languages'

type LanguageDirectionSelectProps = {
  value: LanguageCode
  ariaLabel: string
  itemPrefix: string
  onValueChange: (value: LanguageCode | null) => void
}

export function LanguageDirectionSelect({
  value,
  ariaLabel,
  itemPrefix,
  onValueChange,
}: LanguageDirectionSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className="mode-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={`${itemPrefix}-${language}`} value={language}>
            {language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
