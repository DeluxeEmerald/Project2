import React, {useState, useEffect} from 'react';

function LoggedInName()
{
    const [loginName, setLoginName] = useState("");

    useEffect(() => {
        const raw = localStorage.getItem('user_data');
        if (raw) {
            setLoginName(JSON.parse(raw).username);
        }
    }, []);

    function doLogout(event:any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
    <div id="loggedInDiv" className="flex">
        <div className="top-heading irish-grover-regular padding:10px">Magic Collectors</div>
        <div className="flex">
            <span className="top-heading irish-grover-regular padding:10px" id="userName">Logged In As {loginName}</span>
            <button type="button" id="logoutButton" className="buttons"
            onClick={doLogout}> Log Out </button>
        </div>
    </div>
    );
};

export default LoggedInName;