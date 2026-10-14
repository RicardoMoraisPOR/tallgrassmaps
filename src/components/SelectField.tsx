type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

export const SelectField = ({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) => (
  <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
