import {useState, useEffect} from 'react';
<<<<<<< HEAD
import { clearToken, retrieveUserID } from '../tokenStorage';
=======
import { retrieveUserID ,clearToken } from '../tokenStorage';
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c

function LoggedInName()
{
    const [loginName, setLoginName] = useState("");

    useEffect(() => {
<<<<<<< HEAD
        const raw = retrieveUserID();
        if (raw) {
            try {
                setLoginName(JSON.parse(raw).name || '');
            } catch {
                setLoginName('');
            }
        }
=======
        const ret = retrieveUserID();
        let res = JSON.parse(ret);
        setLoginName(res.name);
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
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
<<<<<<< HEAD
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
=======
    <div id="loggedInDiv" className="flex text-gray-50 font-grover">
        <div className="top-heading padding:10px">Magic Collectors</div>
        <div className="flex">
            <span className="top-heading padding:10px" 
            id="userName">Logged In As {loginName}</span>
            <button className="bg-main hover:bg-wood hover:text-black w-32 h-13 m-0 p-0 border-2 border-black"
            onClick={doLogout}> Log Out </button>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
        </div>
    </div>
    );
};

export default LoggedInName;