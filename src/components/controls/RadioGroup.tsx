import { Box, Flex, FormControl, FormLabel, RadioGroup, RadioGroupProps, Stack, StackDirection, useRadio, useRadioGroup } from '@chakra-ui/react';
import { RadioOption } from 'features/types';
import React from 'react';

interface RadioCardProps extends Partial<RadioGroupProps> {
    name: string;
    label?: string;
    error?: string | boolean;
    direction?: StackDirection;
    options?: RadioOption[];
}

export const RadioCard: React.FC<RadioCardProps> = (props): JSX.Element => {
    const { name, error, label, direction, options = [], value, onChange } = props;

    const { getRootProps, getRadioProps } = useRadioGroup({
        name,
        value,
        onChange
    });

    const group = getRootProps();

    return (
        <FormControl isInvalid={!!error}>
            {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <RadioGroup id={name} name={name} value={value} onChange={onChange}>
                <Stack direction={direction} {...group}>
                    {options.map(({ id, title }) => {
                        const radio = getRadioProps({ value: id });
                        return (
                            <RadioCardHelper key={id} {...radio}>
                                {title}
                            </RadioCardHelper>
                        )
                    })}
                </Stack>
            </RadioGroup>
        </FormControl>
    )
}

const RadioCardHelper = (props: any): JSX.Element => {
    const { getInputProps, getCheckboxProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as='label'>
            <input {...input} />
            <Flex
                {...checkbox}
                alignItems='center'
                cursor='pointer'
                borderWidth='1px'
                borderRadius='md'
                boxShadow='md'
                _checked={{
                    bg: 'secondary.500',
                    color: 'white',
                    borderColor: 'secondary.500'
                }}
                h={10}
                px={5}
            >
                {props.children}
            </Flex>
        </Box>
    )
}