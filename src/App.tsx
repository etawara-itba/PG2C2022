import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/navbar.component';
import Home from './pages/home.page';
import Tp01 from './pages/tp01.page';
import Tp02 from './pages/tp02.page';
import NoMatch from './pages/noMatch.page';
import './i18n';

const App = () => (
    <HashRouter>
        <NavbarComponent />
        <Routes>
            <Route path="" element={<Home />} />
            <Route path="/tp01" element={<Tp01 />} />
            <Route path="/tp02" element={<Tp02 />} />
            <Route path="*" element={<NoMatch />} />
        </Routes>
    </HashRouter>
);

export default App;
