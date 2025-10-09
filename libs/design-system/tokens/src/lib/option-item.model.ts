export type Value = number | string | boolean;

export interface OptionItem {
  value: Value;
  label: string;
  icon?: Icon;
}

export interface Icon {
  src: string;
  cssClass: string;
}
