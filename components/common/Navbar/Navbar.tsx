import { useRouter } from 'next/router';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import style from './Navbar.module.css';

const MyNavbar = () => {
    const router = useRouter();
    const handleGoToHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/');
    };
    const handleGoToSearchClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/search');
    };
    return (
        <Navbar bg="dark" expand="lg" variant="dark" className={style.navbar}>
            <Navbar.Brand href="/">fluid</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="#" onClick={handleGoToHomeClick}>Home</Nav.Link>
                    <Nav.Link href="#" onClick={handleGoToSearchClick}>Search</Nav.Link>
                    <Nav.Link href="/api/feed" target="_blank">RSS</Nav.Link>
                    <Nav.Link href="https://github.com/kadoshita/fluid" target="_blank">GitHub</Nav.Link>
                    <Nav.Link href="https://twitter.com/lz650sss" target="_blank">Twitter</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MyNavbar;