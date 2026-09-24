import { useState } from 'react';
import SideMenu from './sideMenu';
import Header from './header';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AiOutlinePlus } from 'react-icons/ai';
import Footer from './footer';
import { toggleForm } from '../Redux/Modals';

export default function MainLayout({
  children,
  pageName,
  linkto,
  hasAddButton,
  isShowing,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sideBarVisible, setSideBarVisible] = useState(false);

  const toggleMenu = () => {
    setSideBarVisible((prev) => !prev);
  };

  const handleAddClick = () => {
    if (linkto) {
      return navigate(linkto);
    } else {
      dispatch(toggleForm());
    }
  };

  return (
    <div>
      <style>{`
        .mainwrapper .MuiTableCell-head,
        .mainwrapper .MuiTableCell-head * { font-size: 11px !important; }
        .mainwrapper .tabletopheader,
        .mainwrapper .tabletopheader * { font-size: 11px !important; }
      `}</style>
      <aside className={`sidebarmenu ${sideBarVisible ? 'hide' : ''}`}>
        <SideMenu />
      </aside>
      <main className={`mainwrapper ${sideBarVisible ? 'hide' : ''}`}>
        <Header hideSideBar={toggleMenu} pageName={pageName} isShowing={isShowing} />
        <div className="wrapper">
          {hasAddButton && (
            <Button
              className="commonBtn addFormButton"
              size="sm"
              onClick={handleAddClick}
            >
              Add <AiOutlinePlus />
            </Button>
          )}
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
