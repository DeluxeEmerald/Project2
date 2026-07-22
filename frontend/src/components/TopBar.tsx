import { useLocation, useNavigate } from 'react-router-dom';

function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();

    function toPacks() {
        navigate('/packs');
    }
    function toInventory() {
        navigate('/inventory');
    }
    function toDecks() {
        navigate('/decks');
    }

    function navClass(path: string): string {
        return location.pathname === path ? 'nav-button nav-button-active' : 'nav-button';
    }

    return (
        <div id='topBarDiv' className='topbar-shell'>
            <div className='topbar-brand'>
                <strong>Collection Tools</strong>
                <span>Switch contexts without losing your place.</span>
            </div>
            <div className='topbar-nav'>
                <button className={navClass('/packs')} onClick={() => toPacks()}>Packs</button>
                <button className={navClass('/inventory')} onClick={() => toInventory()}>Inventory</button>
                <button className={navClass('/decks')} onClick={() => toDecks()}>Decks</button>
            </div>
        </div>
    );
}

export default TopBar;