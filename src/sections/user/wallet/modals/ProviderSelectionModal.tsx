import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardContent, CardHeader, IconButton, MenuItem, Select, Stack, Typography, Modal, Divider } from '@mui/material';
import Iconify from 'src/components/iconify';
import useApi from 'src/hooks/use-api';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

interface ProviderSelectionModalProps {
  onClose: () => void;
  onFiat: () => void;
  onTrio: () => void;
}

const latinAmericanCountries = [
  'mexico', 'guatemala', 'belize', 'honduras', 'el salvador', 'nicaragua', 'costa rica', 'Panama',
  'argentina', 'bolivia', 'chile', 'colombia', 'ecuador', 'guyana', 'paraguay', 'peru', 'suriname', 'uruguay', 'venezuela'
];

const ProviderSelectionModal = forwardRef(({ onClose, onFiat, onTrio }: ProviderSelectionModalProps, ref: React.Ref<HTMLDivElement>) => {
  const { get_fiatNow } = useApi();
  const modal = useBoolean();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setURL] = useState<string>("");

  const userCountryCode = useSelector((store: RootState) => store.auth.user?.country_reg?.toLowerCase() || 'o');

  // Логи для отладки
  useEffect(() => {
    console.log("User country code from profile:", userCountryCode);

    const isLatinAmerican = latinAmericanCountries.includes(userCountryCode);
    console.log("Is user from Latin America:", isLatinAmerican);

    if (isLatinAmerican) {
      console.log("Adding QuikiPay to available providers.");
    }
    if (userCountryCode === 'br') {
      console.log("User is from Brazil, adding Trio to available providers.");
    }
  }, [userCountryCode]);

  const handleFiatPayment = async () => {
    if (selectedProvider === 'Kado') {
      const res = await get_fiatNow();
      setLoading(false);
      if (!res?.data) return;
      setURL(res.data);
      modal.onTrue();
    } else if (selectedProvider === 'QuikiPay') {
      onFiat();
    } else if (selectedProvider === 'Trio') {
      onTrio();
    }
  };

  const availableProviders = ['Kado'];
  if (latinAmericanCountries.includes(userCountryCode)) {
    availableProviders.push('QuikiPay');
  }
  if (userCountryCode === 'brazil') {
    availableProviders.push('Trio');
  }

  return (
    <div ref={ref} tabIndex={-1}>
      <Card
        sx={{
          position: 'absolute',
          width: { xs: 280, lg: 350 },
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CardHeader
          title="Select Provider"
          action={
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          }
          sx={{ py: 2 }}
        />
        <CardContent sx={{ mb: 2, pt: 0 }}>
          <Stack gap={3}>
            <Box>
              <Typography>Select Provider</Typography>
              <Select
                fullWidth
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {availableProviders.map(provider => (
                  <MenuItem key={provider} value={provider}>{provider}</MenuItem>
                ))}
              </Select>
            </Box>
            <Button
              variant="contained"
              onClick={handleFiatPayment}
              disabled={loading}
              fullWidth
            >
              Continue
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Modal open={modal.value} onClose={modal.onFalse}>
        <FiatModal
          url={url}
          onClose={modal.onFalse}
        />
      </Modal>
    </div>
  );
});

export default ProviderSelectionModal;

type AProps = {
  url: string;
  onClose: () => void;
}

const FiatModal = ({ url, onClose }: AProps) => (
  <Card
    sx={{
      position: 'absolute',
      width: { xs: 1, lg: 480 },
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}
  >
    <CardHeader
      title="Fiat Payment"
      action={
        <IconButton onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      }
      sx={{ py: 2 }}
    />
    <Divider />
    <CardContent sx={{ p: `0 !important`, height: { xs: "88vh", sm: 620 }, overflow: "hidden" }}>
      <Box
        component="iframe"
        src={url}
        sx={{
          width: { xs: 1, sm: 480 },
          height: { xs: 1, sm: 630 },
          border: 0
        }}
      />
    </CardContent>
  </Card>
);
