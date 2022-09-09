import { CalendarIcon } from '@chakra-ui/icons';
import { FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import de from 'date-fns/locale/de';
import { FormikErrors } from 'formik';
import React, { forwardRef } from 'react';
import ReactDatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import './index.scss';

registerLocale('de', de);

const customDateInput = ({ value, onClick, onChange }: any, ref: any) => (
    <Input
        autoComplete='off'
        value={value}
        ref={ref}
        onClick={onClick}
        onChange={onChange}
    />
)

const CustomInput = forwardRef(customDateInput);

interface DatePickerProps extends Partial<ReactDatePickerProps> {
    name: string;
    label?: string;
    onChange: (newDate: Date | null) => void;
    error?: FormikErrors<Date>
}

export const DatePicker: React.FC<DatePickerProps> = (props): JSX.Element => {
    const { name, label, error, showPopperArrow = false, onChange, ...rest } = props;

    let json = JSON.stringify(error);
    let errMsg = json?.replace(/"/g, "");

    return (
        <FormControl isInvalid={!!error}>
            {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <InputGroup /* className='dark-theme' */>
                <ReactDatePicker
                    id={name}
                    name={name}
                    onChange={onChange}
                    showPopperArrow={showPopperArrow}
                    timeInputLabel="Zeit:"
                    showTimeInput
                    className='react-datepicker__input-text'
                    locale='de'
                    dateFormat='EEEE d. MMMM yyyy HH:mm'
                    customInput={<CustomInput />}
                    shouldCloseOnSelect={false}
                    {...rest}
                />
                <InputRightElement color='gray.500' children={<CalendarIcon fontSize='sm' />} />
            </InputGroup>
            {error && (
                <FormErrorMessage>{errMsg}</FormErrorMessage>
            )}
        </FormControl>
    )
}
