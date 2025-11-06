import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useLocales } from 'src/locales';
// types
import { ICasinoTableFilters, ICasinoTableFilterValue } from 'src/types';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: ICasinoTableFilters;
  onFilters: (name: string, value: ICasinoTableFilterValue) => void;
  //
  categoryOptions: string[];
};

export default function HistoryTableToolbar({
  filters,
  onFilters,
  //
  categoryOptions,
}: Props) {
  const { t } = useLocales();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCategory = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'category',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={3}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 3,
          bgcolor: '#2B2F3D',
          borderBottom: '1px solid #3A3F50'
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 220 },
          }}
        >
          <InputLabel sx={{ color: '#FFE71A', fontWeight: 600 }}>{t("category")}</InputLabel>

          <Select
            multiple
            value={filters.category}
            onChange={handleFilterCategory}
            input={<OutlinedInput label="Category" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{
              bgcolor: '#1A1D29',
              color: '#FFFFFF',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3A3F50',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFE71A',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFE71A',
                borderWidth: '2px'
              },
              '& .MuiSelect-icon': {
                color: '#FFE71A'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#2B2F3D',
                  border: '1px solid #3A3F50',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  '& .MuiMenuItem-root': {
                    color: '#FFFFFF',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(255, 231, 26, 0.1)',
                      color: '#FFE71A'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255, 231, 26, 0.2)',
                      color: '#FFE71A',
                      '&:hover': {
                        bgcolor: 'rgba(255, 231, 26, 0.3)'
                      }
                    },
                  },
                  '& .MuiCheckbox-root': {
                    color: '#FFE71A',
                    '&.Mui-checked': {
                      color: '#FFE71A'
                    }
                  },
                },
              },
            }}
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.category.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder={`${t("search")}...`}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1A1D29',
                color: '#FFFFFF',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: '#3A3F50',
                },
                '&:hover fieldset': {
                  borderColor: '#FFE71A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFE71A',
                  borderWidth: '2px'
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify 
                    icon="eva:search-fill" 
                    sx={{ 
                      color: '#FFE71A',
                      width: 20,
                      height: 20
                    }} 
                  />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

    </>
  );
}
