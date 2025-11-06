import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function LiveSupport() {
  const { t } = useLocales();

  return (
    <Stack spacing={3}>
      <Typography
        variant="h3"
        sx={{
          color: '#FFE71A',
          fontFamily: '"FONTSPRING DEMO - Blunt Con It", "Impact", sans-serif',
          fontWeight: '400 !important',
          fontStyle: 'italic !important',
          transform: 'skew(-5deg)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 2,
        }}
      >
        Live Support
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#fff',
          fontFamily: '"Geogrotesque Cyr", sans-serif',
          fontSize: 16,
          lineHeight: 1.6,
          mb: 3,
        }}
      >
        Live chat support will be available here in the future. Please use other support options for now.
      </Typography>

      <Box
        sx={{
          bgcolor: 'rgba(255, 231, 26, 0.1)',
          border: '1px solid #FFE71A',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#FFE71A',
            fontFamily: '"FONTSPRING DEMO - Blunt Con It", "Impact", sans-serif',
            fontWeight: '400 !important',
            fontStyle: 'italic !important',
            transform: 'skew(-5deg)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: 18,
          }}
        >
          Coming Soon
        </Typography>
      </Box>
    </Stack>
  );
}