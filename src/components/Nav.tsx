import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Box, BoxProps, Flex, Stack, TextProps, useDisclosure } from '@chakra-ui/react';
import { User } from 'features/types';
import { history } from 'helpers';
import React from 'react';
import { FcAlarmClock } from 'react-icons/fc';
import { Link, NavLink } from 'react-router-dom';

type NavProps = {
    authUser?: User;
    showAdmin: boolean;
    logOut: () => void;
}

type LinkProps = {
    to: string;
    label: string;
}

const userLinks: LinkProps[] = [
    { label: 'Profil', to: 'account/profile' },
    { label: 'Orte', to: 'locations' },
    { label: 'Tätigkeiten', to: 'tasks' },
    { label: 'Buchungen', to: 'schedules' }
];

const adminLinks: LinkProps[] = [
    { label: 'Admin', to: 'admin' }
]

export const Nav: React.FC<NavProps> = (props): JSX.Element => {
    const { authUser, showAdmin, logOut } = props;
    const { isOpen, onToggle } = useDisclosure();

    if (history.location && history.location.pathname === '/404')
        return <></>;

    return (
        <NavBarContainer>
            <Logo w='100px' />
            <MenuToggle onToggle={onToggle} isOpen={isOpen} />
            <MenuLinks
                authUser={authUser}
                isOpen={isOpen}
                showAdmin={showAdmin}
                logOut={logOut}
            />
        </NavBarContainer>
    )
}

const NavBarContainer: React.FC<{ children: React.ReactElement | React.ReactElement[] }> = (props): JSX.Element => (
    <Flex
        id='navBarContainer'
        as='nav'
        align='center'
        justify='space-between'
        wrap='wrap'
        w='100%'
        p={4}
        bg={['primary.500', 'primary.500', 'whiteAlpha.900', 'whiteAlpha.900']}
        color={['white', 'white', 'primary.700', 'primary.700']}
        boxShadow='md'
    >
        {props.children}
    </Flex>
);

const Logo: React.FC<BoxProps> = (props): JSX.Element => (
    <Box {...props}>
        <Link to='/'>
            <FcAlarmClock fontSize='1.5rem' />
        </Link>
    </Box>
);

const MenuToggle: React.FC<{ onToggle: () => void, isOpen: boolean }> = (props): JSX.Element => {
    const { onToggle, isOpen } = props;

    return (
        <Box display={{ base: 'block', md: 'none' }} onClick={onToggle}>
            {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </Box>
    )
};

type MenuLinksProps = {
    authUser?: User;
    isOpen: boolean;
    showAdmin: boolean;
    logOut: () => void;
}

const MenuLinks: React.FC<MenuLinksProps> = (props): JSX.Element => {
    const { authUser, isOpen, showAdmin, logOut } = props;

    return (
        <Box
            display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
            flexBasis={{ base: '100%', md: 'auto' }}
        >
            <Stack
                direction={['column', 'column', 'row', 'row']}
                spacing={8}
                align='center'
                justify={['center', 'center', 'flex-end', 'flex-end']}
                pt={[4, 4, 0, 0]}
            >
                {(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') && (
                    <MenuItem to='playground'>Spielwiese</MenuItem>
                )}
                {authUser && userLinks.map(({ label, to }) => (
                    <MenuItem key={to} to={to}>{label}</MenuItem>
                ))}
                {showAdmin && adminLinks.map(({ label, to }) => (
                    <MenuItem key={to} to={to}>{label}</MenuItem>
                ))}
                {authUser ? (
                    <Box display='block' onClick={logOut}>Abmelden</Box>
                ) : (
                    <MenuItem to='/account/login'>Anmelden</MenuItem>
                )}
            </Stack>
        </Box>
    )
};

interface MenuItemProps extends TextProps {
    children: string;
    to: string;
}

const MenuItem: React.FC<MenuItemProps> = (props): JSX.Element => (
    <NavLink
        to={props.to}
        style={({ isActive }) => {
            return {
                display: 'block',
                fontWeight: isActive ? 'bold' : ''
            }
        }}
    >
        {props.children}
    </NavLink>
)