import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FormControl, FormErrorMessage, FormLabel, IconButton, Input as CuiInput, InputGroup, InputLeftElement, InputProps as CuiInputProps, InputRightElement, useDisclosure } from '@chakra-ui/react';
import React from 'react';

interface InputProps extends Partial<CuiInputProps> {
    name: string;
    label?: string;
    password?: boolean;
    error?: any;
    icon?: React.ReactElement;
}

export const Input: React.FC<InputProps> = (props): JSX.Element => {
    const { name, label, value, error, password = false, onChange, icon, ...rest } = props;

    const { isOpen: showPassword, onToggle } = useDisclosure();

    return (
        <FormControl isInvalid={!!error}>
            {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <InputGroup>
                {icon && <InputLeftElement
                    pointerEvents='none'
                    children={icon}
                />}
                <CuiInput
                    id={name}
                    name={name}
                    value={value}
                    type={password && !showPassword ? 'password' : 'text'}
                    onChange={onChange}
                    autoComplete={password ? 'current-password' : undefined}
                    {...rest}
                />
                {password && <InputRightElement>
                    <IconButton aria-label='show password' bg='transparent' onClick={onToggle}>
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </IconButton>
                </InputRightElement>}
            </InputGroup>
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    )
}