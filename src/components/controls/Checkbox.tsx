import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { CheckboxProps as CuiCheckboxProps, Flex, FormControl, FormLabel, IconButton } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import React from 'react';

interface CheckboxProps extends Partial<CuiCheckboxProps> {
    name: string;
    label?: string;
    checked: boolean;
    align?: 'left' | 'center' | 'right'
}

export const Checkbox: React.FC<CheckboxProps> = (props): JSX.Element => {
    const { name, label, checked, align = 'left' } = props;
    const myFlex =
        align === 'left' ? 'flex-start'
            : align === 'right' ? 'flex-end'
                : align;

    const { setFieldValue } = useFormikContext();

    return (
        <FormControl>
            {label && <FormLabel htmlFor={name} textAlign={align}>{label}</FormLabel>}
            <Flex justifyContent={myFlex}>
                {checked ? (
                    <IconButton
                        aria-label='checked'
                        colorScheme='green'
                        icon={<CheckIcon />}
                        onClick={() => setFieldValue(name, false)}
                    />
                ) : (
                    <IconButton
                        aria-label='unchecked'
                        colorScheme='red'
                        icon={<CloseIcon />}
                        onClick={() => setFieldValue(name, true)}
                    />
                )}
            </Flex>
        </FormControl>
    )
}