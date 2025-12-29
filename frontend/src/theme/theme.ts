import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    colors: {
        brand: {
            50: '#e3f2fd',
            100: '#bbdefb',
            200: '#90caf9',
            300: '#64b5f6',
            400: '#42a5f5',
            500: '#2196f3',
            600: '#1e88e5',
            700: '#1976d2',
            800: '#1565c0',
            900: '#0d47a1',
        },
        success: {
            50: '#e8f5e9',
            100: '#c8e6c9',
            200: '#a5d6a7',
            300: '#81c784',
            400: '#66bb6a',
            500: '#4caf50',
            600: '#43a047',
            700: '#388e3c',
            800: '#2e7d32',
            900: '#1b5e20',
        },
        warning: {
            50: '#fff3e0',
            100: '#ffe0b2',
            200: '#ffcc80',
            300: '#ffb74d',
            400: '#ffa726',
            500: '#ff9800',
            600: '#fb8c00',
            700: '#f57c00',
            800: '#ef6c00',
            900: '#e65100',
        },
        danger: {
            50: '#ffebee',
            100: '#ffcdd2',
            200: '#ef9a9a',
            300: '#e57373',
            400: '#ef5350',
            500: '#f44336',
            600: '#e53935',
            700: '#d32f2f',
            800: '#c62828',
            900: '#b71c1c',
        },
    },
    fonts: {
        heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
        body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    },
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
            variants: {
                solid: (props: any) => ({
                    bg: `${props.colorScheme}.500`,
                    color: 'white',
                    _hover: {
                        bg: `${props.colorScheme}.600`,
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                    },
                    _active: {
                        bg: `${props.colorScheme}.700`,
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s',
                }),
            },
        },
        Card: {
            baseStyle: {
                container: {
                    bg: 'white',
                    borderRadius: 'lg',
                    boxShadow: 'md',
                    _hover: {
                        boxShadow: 'lg',
                    },
                    transition: 'box-shadow 0.2s',
                },
            },
        },
        Slider: {
            baseStyle: {
                thumb: {
                    _focus: {
                        boxShadow: 'outline',
                    },
                },
            },
        },
    },
});

export default theme;
