import { memo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import { NavSectionHorizontal } from 'src/components/nav-section';
//
import { HEADER } from '../config-layout';
import { useNavData } from '../sports/sports-navigation';
import { HeaderShadow } from '../_common';

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const { user } = useMockedUser();

  const navData = useNavData();

  return (
    <AppBar
      component="nav"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
        bgcolor: '#1A1D29',
        boxShadow: '0px 1px 0px 0px #000000',
      }}
    >
      <Toolbar
        sx={{
          bgcolor: '#1A1D29',
        }}
      >
        <NavSectionHorizontal
          data={navData}
          config={{
            currentRole: user?.role || 'admin',
          }}
        />
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
