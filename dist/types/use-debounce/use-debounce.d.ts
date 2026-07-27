import { Controller } from '@hotwired/stimulus';
export interface DebounceOptions {
    wait?: number;
    name?: string;
    leading?: boolean;
    trailing?: boolean;
}
export declare const debounce: (fn: Function, wait?: number, { leading, trailing }?: Pick<DebounceOptions, "leading" | "trailing">) => (this: any) => any;
export declare const useDebounce: (composableController: Controller, options?: DebounceOptions) => void;
