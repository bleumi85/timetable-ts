import React from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    color?: string;
    onChange?: (newColor: string) => void;
    style?: React.CSSProperties;
}

export const ColorPicker: React.FC<ColorPickerProps> = (props): JSX.Element => {
    const { color, onChange, style } = props;

    return (
        <HexColorPicker
            style={style}
            color={color}
            onChange={onChange}
        />
    )
}