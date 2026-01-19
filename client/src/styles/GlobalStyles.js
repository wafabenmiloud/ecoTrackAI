import { styled } from '@mui/material/styles';

export const AppContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: (props) => props.theme.palette.background.default,
  color: (props) => props.theme.palette.text.primary,
});

export const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  marginLeft: 240,
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
  },
}));

export const ContentWrapper = styled('div')({
  maxWidth: 1200,
  margin: '0 auto',
  width: '100%',
});
