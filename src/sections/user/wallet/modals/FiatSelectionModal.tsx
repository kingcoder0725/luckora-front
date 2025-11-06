import React, { useEffect, useState, forwardRef } from 'react';
import { Box, Button, Card, CardContent, CardHeader, IconButton, MenuItem, Select, Stack, TextField, Typography, Divider, Modal, SelectChangeEvent } from '@mui/material'; // Объединены импорты
import { CurrencyPropsFiat } from 'src/types';
import useApi from 'src/hooks/use-api';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'notistack';
import { API_URL } from 'src/config-global';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

interface FiatSelectionModalProps {
  onClose: () => void;
  currencies: CurrencyPropsFiat[];
}

const countries = [
  { name: 'Austria', code: 'at', currencies: ['EUR'] },                //   -
  { name: 'Belgium', code: 'be', currencies: ['EUR'] },                //    -
  { name: 'Bulgaria', code: 'bg', currencies: ['EUR'] },               //    -
  { name: 'Croatia', code: 'hr', currencies: ['EUR'] },                //    -
  { name: 'Cyprus', code: 'cy', currencies: ['EUR'] },                  //   -
  { name: 'Czech Republic', code: 'cz', currencies: ['EUR'] },          //    -
  { name: 'Denmark', code: 'dk', currencies: ['EUR'] },                 //     -
  { name: 'Estonia', code: 'ee', currencies: ['EUR'] },                 //     -
  { name: 'Finland', code: 'fi', currencies: ['EUR'] },                 //    -
  { name: 'France', code: 'fr', currencies: ['EUR'] },                  //    -
  { name: 'Germany', code: 'de', currencies: ['EUR'] },                  //     -
  { name: 'Greece', code: 'gr', currencies: ['EUR'] },                    //   -
  { name: 'Hungary', code: 'hu', currencies: ['EUR'] },                   //    -
  { name: 'Ireland', code: 'ie', currencies: ['EUR'] },                   //    -
  { name: 'Italy', code: 'it', currencies: ['EUR'] },                    //     -
  { name: 'Latvia', code: 'lv', currencies: ['EUR'] },                   //   -
  { name: 'Lithuania', code: 'lt', currencies: ['EUR'] },               //     -
  { name: 'Luxembourg', code: 'lu', currencies: ['EUR'] },              //      -
  { name: 'Malta', code: 'mt', currencies: ['EUR'] },                   //      -
  { name: 'Netherlands', code: 'nl', currencies: ['EUR'] },             //     -
  { name: 'Portugal', code: 'pt', currencies: ['EUR'] },                //     -
  { name: 'Romania', code: 'ro', currencies: ['EUR'] },                 //      -
  { name: 'Slovakia', code: 'sk', currencies: ['EUR'] },                //     -
  { name: 'Slovenia', code: 'si', currencies: ['EUR'] },               //    -
  { name: 'Spain', code: 'es', currencies: ['EUR'] },                 //    -
  { name: 'Sweden', code: 'se', currencies: ['SEK'] },                //   -
  { name: 'Norway', code: 'no', currencies: ['NOK'] },
  { name: 'Poland', code: 'pl', currencies: ['PLN'] },                 //  -
  { name: 'Switzerland', code: 'ch', currencies: ['CHF'] },
  { name: 'United Kingdom', code: 'gb', currencies: ['GBP'] },          //  -

  // North America
  { name: 'Canada', code: 'ca', currencies: ['CAD'] },               //     -
  { name: 'United States', code: 'us', currencies: ['USD'] },        //     -
  { name: 'Mexico', code: 'mx', currencies: ['MXN'] },               //     -
  { name: 'Guatemala', code: 'gt', currencies: ['GTQ'] },            //     -
  { name: 'Belize', code: 'bz', currencies: ['BZD'] },              //     -
  { name: 'Honduras', code: 'hn', currencies: ['HNL'] },            //     -
  { name: 'El Salvador', code: 'sv', currencies: ['USD'] },         //     -
  { name: 'Nicaragua', code: 'ni', currencies: ['NIO'] },           //     -
  { name: 'Costa Rica', code: 'cr', currencies: ['CRC'] },         //     -
  { name: 'Panama', code: 'pa', currencies: ['PAB'] },             //     -

  // South America
  { name: 'Argentina', code: 'ar', currencies: ['ARS'] },         //    -
  { name: 'Bolivia', code: 'bo', currencies: ['BOB'] },           //    -
  { name: 'Brazil', code: 'br', currencies: ['BRL'] },           //     -
  { name: 'Chile', code: 'cl', currencies: ['CLP'] },             //    -
  { name: 'Colombia', code: 'co', currencies: ['COP'] },          //    -
  { name: 'Ecuador', code: 'ec', currencies: ['USD'] },           //    -
  { name: 'Guyana', code: 'gy', currencies: ['GYD'] },            //    -
  { name: 'Paraguay', code: 'py', currencies: ['PYG'] },           //   -
  { name: 'Peru', code: 'pe', currencies: ['SOL'] },            // -
  { name: 'Suriname', code: 'sr', currencies: ['SRD'] },          //   -
  { name: 'Uruguay', code: 'uy', currencies: ['UYU'] },           //   -
  { name: 'Venezuela', code: 've', currencies: ['VEF'] },          //   -

  // Asia
  { name: 'Afghanistan', code: 'af', currencies: ['AFN'] },
  { name: 'Armenia', code: 'am', currencies: ['AMD'] },
  { name: 'Azerbaijan', code: 'az', currencies: ['AZN'] },
  { name: 'Bahrain', code: 'bh', currencies: ['BHD'] },
  { name: 'Bangladesh', code: 'bd', currencies: ['BDT'] },
  { name: 'Bhutan', code: 'bt', currencies: ['BTN'] },
  { name: 'Brunei', code: 'bn', currencies: ['BND'] },
  { name: 'Cambodia', code: 'kh', currencies: ['KHR'] },
  { name: 'China', code: 'cn', currencies: ['CNY'] },                  //   -
  { name: 'Georgia', code: 'ge', currencies: ['GEL'] },
  { name: 'India', code: 'in', currencies: ['INR'] },                   //  -
  { name: 'Indonesia', code: 'id', currencies: ['IDR'] },               //  -
  { name: 'Iran', code: 'ir', currencies: ['IRR'] },
  { name: 'Iraq', code: 'iq', currencies: ['IQD'] },
  { name: 'Israel', code: 'il', currencies: ['ILS'] },
  { name: 'Japan', code: 'jp', currencies: ['JPY'] },                   //  -
  { name: 'Jordan', code: 'jo', currencies: ['JOD'] },
  { name: 'Kazakhstan', code: 'kz', currencies: ['KZT'] },
  { name: 'Kuwait', code: 'kw', currencies: ['KWD'] },
  { name: 'Kyrgyzstan', code: 'kg', currencies: ['KGS'] },
  { name: 'Laos', code: 'la', currencies: ['LAK'] },
  { name: 'Lebanon', code: 'lb', currencies: ['LBP'] },
  { name: 'Malaysia', code: 'my', currencies: ['MYR'] },
  { name: 'Maldives', code: 'mv', currencies: ['MVR'] },
  { name: 'Mongolia', code: 'mn', currencies: ['MNT'] },
  { name: 'Myanmar', code: 'mm', currencies: ['MMK'] },
  { name: 'Nepal', code: 'np', currencies: ['NPR'] },
  { name: 'Oman', code: 'om', currencies: ['OMR'] },
  { name: 'Pakistan', code: 'pk', currencies: ['PKR'] },
  { name: 'Philippines', code: 'ph', currencies: ['PHP'] },
  { name: 'Qatar', code: 'qa', currencies: ['QAR'] },
  { name: 'Saudi Arabia', code: 'sa', currencies: ['SAR'] },
  { name: 'Singapore', code: 'sg', currencies: ['SGD'] },
  { name: 'South Korea', code: 'kr', currencies: ['KRW'] },                    //   -
  { name: 'Sri Lanka', code: 'lk', currencies: ['LKR'] },
  { name: 'Syria', code: 'sy', currencies: ['SYP'] },
  { name: 'Taiwan', code: 'tw', currencies: ['TWD'] },
  { name: 'Tajikistan', code: 'tj', currencies: ['TJS'] },
  { name: 'Thailand', code: 'th', currencies: ['THB'] },
  { name: 'Timor-Leste', code: 'tl', currencies: ['USD'] },
  { name: 'Turkey', code: 'tr', currencies: ['TRY'] },
  { name: 'Turkmenistan', code: 'tm', currencies: ['TMT'] },
  { name: 'United Arab Emirates', code: 'ae', currencies: ['AED'] },
  { name: 'Uzbekistan', code: 'uz', currencies: ['UZS'] },
  { name: 'Vietnam', code: 'vn', currencies: ['VND'] },
  { name: 'Yemen', code: 'ye', currencies: ['YER'] },

  // Africa
  { name: 'Algeria', code: 'dz', currencies: ['DZD'] },
  { name: 'Angola', code: 'ao', currencies: ['AOA'] },
  { name: 'Benin', code: 'bj', currencies: ['XOF'] },
  { name: 'Botswana', code: 'bw', currencies: ['BWP'] },
  { name: 'Burkina Faso', code: 'bf', currencies: ['XOF'] },
  { name: 'Burundi', code: 'bi', currencies: ['BIF'] },
  { name: 'Cabo Verde', code: 'cv', currencies: ['CVE'] },
  { name: 'Cameroon', code: 'cm', currencies: ['XAF'] },
  { name: 'Central African Republic', code: 'cf', currencies: ['XAF'] },
  { name: 'Chad', code: 'td', currencies: ['XAF'] },
  { name: 'Comoros', code: 'km', currencies: ['KMF'] },
  { name: 'Congo, Democratic Republic of the', code: 'cd', currencies: ['CDF'] },
  { name: 'Congo, Republic of the', code: 'cg', currencies: ['XAF'] },
  { name: 'Djibouti', code: 'dj', currencies: ['DJF'] },
  { name: 'Egypt', code: 'eg', currencies: ['EGP'] },
  { name: 'Equatorial Guinea', code: 'gq', currencies: ['XAF'] },
  { name: 'Eritrea', code: 'er', currencies: ['ERN'] },
  { name: 'Eswatini', code: 'sz', currencies: ['SZL'] },
  { name: 'Ethiopia', code: 'et', currencies: ['ETB'] },
  { name: 'Gabon', code: 'ga', currencies: ['XAF'] },
  { name: 'Gambia', code: 'gm', currencies: ['GMD'] },
  { name: 'Ghana', code: 'gh', currencies: ['GHS'] },
  { name: 'Guinea', code: 'gn', currencies: ['GNF'] },
  { name: 'Guinea-Bissau', code: 'gw', currencies: ['XOF'] },
  { name: 'Ivory Coast', code: 'ci', currencies: ['XOF'] },
  { name: 'Kenya', code: 'ke', currencies: ['KES'] },
  { name: 'Lesotho', code: 'ls', currencies: ['LSL'] },
  { name: 'Liberia', code: 'lr', currencies: ['LRD'] },
  { name: 'Libya', code: 'ly', currencies: ['LYD'] },
  { name: 'Madagascar', code: 'mg', currencies: ['MGA'] },
  { name: 'Malawi', code: 'mw', currencies: ['MWK'] },
  { name: 'Mali', code: 'ml', currencies: ['XOF'] },
  { name: 'Mauritania', code: 'mr', currencies: ['MRU'] },
  { name: 'Mauritius', code: 'mu', currencies: ['MUR'] },
  { name: 'Morocco', code: 'ma', currencies: ['MAD'] },
  { name: 'Mozambique', code: 'mz', currencies: ['MZN'] },
  { name: 'Namibia', code: 'na', currencies: ['NAD'] },
  { name: 'Niger', code: 'ne', currencies: ['XOF'] },
  { name: 'Nigeria', code: 'ng', currencies: ['NGN'] },
  { name: 'Rwanda', code: 'rw', currencies: ['RWF'] },
  { name: 'Sao Tome and Principe', code: 'st', currencies: ['STN'] },
  { name: 'Senegal', code: 'sn', currencies: ['XOF'] },
  { name: 'Seychelles', code: 'sc', currencies: ['SCR'] },
  { name: 'Sierra Leone', code: 'sl', currencies: ['SLL'] },
  { name: 'Somalia', code: 'so', currencies: ['SOS'] },
  { name: 'South Africa', code: 'za', currencies: ['ZAR'] },
  { name: 'South Sudan', code: 'ss', currencies: ['SSP'] },
  { name: 'Sudan', code: 'sd', currencies: ['SDG'] },
  { name: 'Tanzania', code: 'tz', currencies: ['TZS'] },
  { name: 'Togo', code: 'tg', currencies: ['XOF'] },
  { name: 'Tunisia', code: 'tn', currencies: ['TND'] },
  { name: 'Uganda', code: 'ug', currencies: ['UGX'] },
  { name: 'Zambia', code: 'zm', currencies: ['ZMW'] },
  { name: 'Zimbabwe', code: 'zw', currencies: ['ZWL'] },

  // Oceania
  { name: 'Australia', code: 'au', currencies: ['AUD'] },
  { name: 'Fiji', code: 'fj', currencies: ['FJD'] },
  { name: 'Kiribati', code: 'ki', currencies: ['AUD'] },
  { name: 'Marshall Islands', code: 'mh', currencies: ['USD'] },
  { name: 'Micronesia', code: 'fm', currencies: ['USD'] },
  { name: 'Nauru', code: 'nr', currencies: ['AUD'] },
  { name: 'New Zealand', code: 'nz', currencies: ['NZD'] },
  { name: 'Palau', code: 'pw', currencies: ['USD'] },
  { name: 'Papua New Guinea', code: 'pg', currencies: ['PGK'] },
  { name: 'Samoa', code: 'ws', currencies: ['WST'] },
  { name: 'Solomon Islands', code: 'sb', currencies: ['SBD'] },
  { name: 'Tonga', code: 'to', currencies: ['TOP'] },
  { name: 'Tuvalu', code: 'tv', currencies: ['AUD'] },
  { name: 'Vanuatu', code: 'vu', currencies: ['VUV'] },

  // Others
  { name: 'Others', code: 'o', currencies: ['USD'] },
]

interface FiatModalProps {
  url: string;
  onClose: () => void;
  enqueueSnackbar: (message: string, options?: { variant: string }) => void;
}

const FiatModal = forwardRef<HTMLDivElement, FiatModalProps>(
  ({ url, onClose, enqueueSnackbar }, ref) => {

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== API_URL) return;

        if (event.data && typeof event.data === 'object' && event.data.status) {
          onClose();
          enqueueSnackbar('Please refresh the page to see the payment status.', { variant: 'info' });
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [onClose, enqueueSnackbar]);

    return (
      <Card
        ref={ref}
        sx={{
          position: 'absolute',
          width: { xs: 1, lg: 480 },
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // bgcolor: '#264026',
        }}
        tabIndex={-1}
        
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
        <CardContent sx={{ p: 0, height: { xs: "88vh", sm: 620 }, overflow: "hidden"}}>
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
  }
);

FiatModal.displayName = 'FiatModal';

const FiatSelectionModal = forwardRef(({ onClose, currencies }: FiatSelectionModalProps, ref: React.Ref<HTMLDivElement>) => {
  const { depositFiatQuikly } = useApi();
  const modal = useBoolean();
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setURL] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>('o');
  const [filteredCurrencies, setFilteredCurrencies] = useState<CurrencyPropsFiat[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyPropsFiat | null>(null);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((store: RootState) => store.auth.user);

  useEffect(() => {
    const userCountryName = user?.country_reg?.toLowerCase();

    const countryData = countries.find(c => c.name.toLowerCase() === userCountryName);
    console.log("User country name:", userCountryName);
    console.log("Matched country data:", countryData);

    if (countryData) {
      setSelectedCountry(countryData.code);
      const availableCurrencies = currencies.filter((currency: CurrencyPropsFiat) => currency.countries.includes(countryData.name));
      setFilteredCurrencies(availableCurrencies);
      setSelectedCurrency(availableCurrencies[0] || null);
    } else {
      setSelectedCountry('o');
      setFilteredCurrencies([]);
      setSelectedCurrency(null);
    }
  }, [currencies, user.country_reg]);

  const handleCountryChange = (event: SelectChangeEvent<string>) => { // Обновлено
    const newCountryCode = event.target.value as string;
    if (newCountryCode !== selectedCountry) {
      enqueueSnackbar('Please change your country in your account settings.', { variant: 'error' });
      return;
    }
    setSelectedCountry(newCountryCode);
  };

  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateAmount = (amount: string) => /^[0-9]+(\.[0-9]{1,2})?$/.test(amount);

  const handleFiatPayment = async () => {
    if (!validateName(customerName)) {
      enqueueSnackbar('Name contains invalid characters. Only letters are allowed.', { variant: 'error' });
      return;
    }

    if (!validateEmail(customerEmail)) {
      enqueueSnackbar('Invalid email address.', { variant: 'error' });
      return;
    }

    if (!validateAmount(amountValue.toString())) {
      enqueueSnackbar('Amount must be a valid number.', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_email: customerEmail,
        currency_code: selectedCurrency?.code || 'USD',
        amount: amountValue.toString()
      };

      const methods = await depositFiatQuikly(payload);
      if (methods) {

        setURL(methods.payment_url || "");
        setOrderId(methods.order_id || "");
        modal.onTrue();
      } else {
        console.error('No payment methods returned');
      }
    } catch (error) {
      console.error('Error handling fiat payment:', error.response ? error.response.data : error.message);
    }
    setLoading(false);
  };

  return (
    <div ref={ref} tabIndex={-1}>
      <Card
        sx={{
          position: 'absolute',
          width: { xs: 280, lg: 350 },
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // bgcolor: "#264026"
        }}
      >
       <CardHeader
  title="Fiat Payment Options"
  action={
    <IconButton onClick={onClose}>
      <Iconify icon="mdi:close" sx={{ color: '#FFFFFF' }} />
    </IconButton>
  }
  sx={{
    py: 2,
    // bgcolor: '#264026', 
    color: '#FFFFFF', 
  }}
/>
<CardContent sx={{ mb: 2, pt: 0}}>
          <Stack gap={3}>
            <Box>
              <Typography>Customer Name</Typography>
              <TextField
                fullWidth
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Box>
            <Box>
              <Typography>Customer Email</Typography>
              <TextField
                fullWidth
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </Box>
            <Box>
              <Typography>Select Country</Typography>
              <Select
                fullWidth
                value={selectedCountry}
                onChange={handleCountryChange} 
                disabled 
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            {filteredCurrencies.length > 0 && (
              <Box>
                <Typography>Select Currency</Typography>
                <Select
                  fullWidth
                  value={selectedCurrency?._id || ''}
                  onChange={(e) => {
                    const selected = filteredCurrencies.find(c => c._id === e.target.value);
                    setSelectedCurrency(selected || null);
                  }}
                >
                  {filteredCurrencies.map((currency) => (
                    <MenuItem key={currency._id} value={currency._id}>
                      {currency.code}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}
            {selectedCurrency && (
              <Box>
                <Typography>Enter Amount</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={amountValue}
                  onChange={(e) => setAmountValue(Number(e.target.value))}
                />
              </Box>
            )}
            <Button
              variant="contained"
              onClick={handleFiatPayment}
              disabled={loading}
              fullWidth
            >
              Deposit
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Modal open={modal.value} onClose={modal.onFalse}>
        <FiatModal
          url={url}
          onClose={() => {
            modal.onFalse();
            onClose();
          }}
          enqueueSnackbar={enqueueSnackbar}
        />
      </Modal>
    </div>
  );
});

export default FiatSelectionModal;