import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function NavbarComponent() {
    const { t } = useTranslation();

    return (
        <Navbar expand="md" bg="dark" variant="dark">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" href="/">
                    {t('brand')}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls={'offCanvas'} />
                <Navbar.Offcanvas id={`offCanvas`} aria-labelledby={'offCanvasNavbarLabelExpand'} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title id={'offCanvasNavbarLabelExpand'}>{t('brand')}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-end flex-grow-1 pe-3">
                            <Nav.Link as={Link} to="/" href="/">
                                {t('route.home.title')}
                            </Nav.Link>
                            <Nav.Link as={Link} to="/tp01" href="/tp01">
                                {t('route.tp01.title')}
                            </Nav.Link>
                            <Nav.Link as={Link} to="/tp02" href="/tp02">
                                {t('route.tp02.title')}
                            </Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
