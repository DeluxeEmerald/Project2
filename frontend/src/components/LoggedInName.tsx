import {useState, useEffect} from 'react';
import { retrieveUserID ,clearToken } from '../tokenStorage';

function LoggedInName()
{
    const [loginName, setLoginName] = useState("");

    useEffect(() => {
        const ret = retrieveUserID();
        let res = JSON.parse(ret);
        setLoginName(res.name);
    }, []);

    

    function doLogout(event:any) : void
    {
        event.preventDefault();
        clearToken();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
    <div id="loggedInDiv" className="flex text-gray-50 font-grover">
        <div className="top-heading padding:10px">Magic Collectors</div>
        <div className="flex">
            <span className="top-heading padding:10px" 
            id="userName">Logged In As {loginName}</span>
            <button type="button" id="logoutButton" className="buttons"
            onClick={doLogout}> Log Out </button>
        </div>
    </div>
    );
};

export default LoggedInName;