import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box
} from '@mui/material';

const OPERATORS = {
    eq: '=',
    ne: '≠',
    gt: '>',
    lt: '<',
    gte: '≥',
    lte: '≤'
};

const FilterField = ({ label, field, value, operator, type, options, onChange }) => {
    const handleValueChange = (e) => {
        let newValue = e.target.value;
        
        // Для числовых полей преобразуем пустую строку в null
        if (type === 'number' && newValue === '') {
            newValue = null;
        }
        
        onChange(field, 'value', newValue);
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <FormControl sx={{ minWidth: 80 }}>
                <InputLabel>Оператор</InputLabel>
                <Select
                    value={operator}
                    onChange={(e) => onChange(field, 'operator', e.target.value)}
                    label="Оператор"
                    size="small"
                >
                    {Object.entries(OPERATORS).map(([op, symbol]) => (
                        <MenuItem key={op} value={op}>{symbol}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {options ? (
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={value || ''}
                        onChange={handleValueChange}
                        label={label}
                        size="small"
                    >
                        <MenuItem value="">Не выбрано</MenuItem>
                        {options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <TextField
                    label={label}
                    value={value || ''}
                    onChange={handleValueChange}
                    type={type || 'text'}
                    size="small"
                    sx={{ minWidth: 200 }}
                    InputLabelProps={type === 'datetime-local' ? { shrink: true } : undefined}
                />
            )}
        </Box>
    );
};

export default FilterField; 