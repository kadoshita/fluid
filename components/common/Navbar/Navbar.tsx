import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';

const MyNavbar = () => {
    return (
        <Navbar bg="dark" expand="lg" variant="dark">
            <Navbar.Brand href="/">fluid</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="https://github.com/kadoshita/fluid">GitHub</Nav.Link>
                    <Nav.Link href="https://twitter.com/lz650sss">Twitter</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MyNavbar;