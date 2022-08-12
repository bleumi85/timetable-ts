import { FormControl, FormErrorMessage, FormLabel, Select as CuiSelect, SelectProps as CuiSelectProps } from '@chakra-ui/react';
import { SelectOption } from 'features/types';
import React from 'react';

interface SelectProps extends Partial<CuiSelectProps> {
    name: string;
    label?: string;
    error?: string | boolean;
    options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = (props): JSX.Element => {
    const { name, label, error, options = [], placeholder = 'keine Auswahl', ...rest } = props;

    return (
        <FormControl isInvalid={!!error}>
            {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <CuiSelect
                id={name}
                name={name}
                placeholder={placeholder}
                {...rest}
            >
                {options.map(({ id, title }) => (
                    <option key={id} value={id}>{title}</option>
                ))}
            </CuiSelect>
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    )
}