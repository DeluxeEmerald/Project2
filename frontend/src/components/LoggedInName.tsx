import {useState, useEffect} from 'react';
import { clearToken, retrieveUserID } from '../tokenStorage';

function LoggedInName()
{
    const [loginName, setLoginName] = useState("");

    useEffect(() => {
        const raw = retrieveUserID();
        if (raw) {
            try {
                setLoginName(JSON.parse(raw).name || '');
            } catch {
                setLoginName('');
            }
        }
    }, []);

    

    function doLogout(event:any) : void
    {
        event.preventDefault();
        clearToken();
        localStorage.removeItem('user_id');
        window.location.href = '/';
    };

    const initials = loginName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

    return(
    <div id="loggedInDiv" className='dashboard-shell'>
        <div className='dashboard-copy'>
            <h2>Welcome back</h2>
            <p>Move through packs, inventory, and decks from one cleaner workspace.</p>
        </div>
        <div className='profile-shell'>
            <div className='profile-badge'>{initials || 'MC'}</div>
            <div className='profile-text'>
                <span>Logged in as</span>
                <strong id="userName">{loginName || 'Magic Collector'}</strong>
            </div>
            <button type="button" id="logoutButton" className='secondary-button'
            onClick={doLogout}>Log Out</button>
        </div>
    </div>
    );
};

export default LoggedInName;