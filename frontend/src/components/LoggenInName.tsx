function LoggedInName()
{
    function doLogout(event:any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
    <div id="loggedInDiv" className="flex">
        <div><span id="magic-collectors"><h2>Magic Collectors</h2></span></div>
        <div className="flex">
            <span id="userName"><h2>Logged In As John Doe</h2></span>
            <button type="button" id="logoutButton" className="buttons"
            onClick={doLogout}> Log Out </button>
        </div>
    </div>
    );
};

export default LoggedInName;